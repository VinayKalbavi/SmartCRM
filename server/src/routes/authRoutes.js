const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const config = require('../config');
const crmRepo = require('../db/crmRepository');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Helper to sanitize user object (never return passwordHash or googleId)
function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: String(user.id || user._id),
    name: user.name,
    email: user.email,
    picture: user.picture || null,
    hasPassword: Boolean(user.passwordHash),
    createdAt: user.createdAt,
  };
}

// Helper to generate JWT token (7d default, 30d if rememberMe)
function generateToken(user, rememberMe = false) {
  const expiresIn = rememberMe ? '30d' : '7d';
  return jwt.sign(
    { id: user.id || String(user._id), email: user.email },
    config.jwtSecret,
    { expiresIn }
  );
}

// 1. POST /api/auth/register
router.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters long' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await crmRepo.findUserByEmail(cleanEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await crmRepo.createUser({
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
    });

    const token = generateToken(user, false);
    return res.status(201).json({
      token,
      user: sanitizeUser(user),
      message: 'Account registered successfully',
    });
  } catch (err) {
    console.error('[Register Error]:', err);
    return res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

// 2. POST /api/auth/login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await crmRepo.findUserByEmail(cleanEmail);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Google-only account check
    if (!user.passwordHash) {
      return res.status(400).json({
        error: 'This account uses Google sign-in. Please continue with Google.',
      });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user, Boolean(rememberMe));
    return res.json({
      token,
      user: sanitizeUser(user),
      message: 'Logged in successfully',
    });
  } catch (err) {
    console.error('[Login Error]:', err);
    return res.status(500).json({ error: 'Login failed: ' + err.message });
  }
});

// 3. POST /api/auth/google
router.post('/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Google credential token is required' });
    }

    let payload;
    try {
      const client = new OAuth2Client(config.googleClientId);
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: config.googleClientId,
      });
      payload = ticket.getPayload();
    } catch (err) {
      console.warn('[Google Verify Warning]:', err.message);
      return res.status(401).json({
        error: 'Google authentication failed: ' + (err.message || 'Invalid credential token'),
      });
    }

    if (!payload || !payload.email_verified) {
      return res.status(400).json({ error: 'Google email address is not verified' });
    }

    const cleanEmail = payload.email.toLowerCase().trim();
    let user = await crmRepo.findUserByEmail(cleanEmail);

    if (user) {
      // Link googleId and picture if not already set
      user = await crmRepo.updateUser(user.id, {
        googleId: payload.sub,
        picture: payload.picture || user.picture,
      });
    } else {
      // Create new user without passwordHash
      user = await crmRepo.createUser({
        name: payload.name || cleanEmail.split('@')[0],
        email: cleanEmail,
        googleId: payload.sub,
        picture: payload.picture || null,
        passwordHash: null,
      });
    }

    const token = generateToken(user, true);
    return res.json({
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error('[Google Auth Error]:', err);
    return res.status(500).json({ error: 'Google login processing failed: ' + err.message });
  }
});

// 4. GET /api/auth/me (Protected)
router.get('/auth/me', authMiddleware, async (req, res) => {
  return res.json({
    user: sanitizeUser(req.user),
  });
});

// 5. PUT /api/auth/profile (Protected)
router.put('/auth/profile', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters long' });
    }

    const updated = await crmRepo.updateUser(req.user.id, {
      name: name.trim(),
    });

    return res.json({
      user: sanitizeUser(updated),
      message: 'Profile updated successfully',
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update profile: ' + err.message });
  }
});

// 6. PUT /api/auth/change-password (Protected)
router.put('/auth/change-password', authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ error: 'New passwords do not match' });
    }

    const hasExistingPassword = Boolean(req.user.passwordHash);

    // If user has an existing password, oldPassword is required and verified
    if (hasExistingPassword) {
      if (!oldPassword) {
        return res.status(400).json({ error: 'Current password is required' });
      }
      const validOld = await bcrypt.compare(oldPassword, req.user.passwordHash);
      if (!validOld) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
    }

    // Hash new password and save
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const updated = await crmRepo.updateUser(req.user.id, { passwordHash });

    return res.json({
      user: sanitizeUser(updated),
      message: hasExistingPassword ? 'Password changed successfully' : 'Password set successfully',
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update password: ' + err.message });
  }
});

// 7. POST /api/auth/forgot-password (Public)
router.post('/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await crmRepo.findUserByEmail(cleanEmail);

    if (!user) {
      // Don't leak whether email exists
      return res.json({
        message: 'If an account exists with this email, password reset instructions have been generated.',
      });
    }

    // Generate 15-minute token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await crmRepo.updateUser(user.id, {
      resetToken,
      resetTokenExpiry,
    });

    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
    console.log('\n===============================================================');
    console.log(` [AUTH] PASSWORD RESET LINK GENERATED FOR: ${user.email}`);
    console.log(` Reset URL: ${resetUrl}`);
    console.log(` Valid for 15 minutes (Expires: ${resetTokenExpiry.toLocaleTimeString()})`);
    console.log('===============================================================\n');

    return res.json({
      message: 'Password reset link generated. Check the server console for the reset link.',
      resetToken, // Included for seamless hackathon / developer testing
      resetUrl,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to process forgot password request: ' + err.message });
  }
});

// 8. POST /api/auth/reset-password (Public)
router.post('/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword, confirmNewPassword } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Reset token is required' });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const user = await crmRepo.findUserByResetToken(token);
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired password reset token' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await crmRepo.updateUser(user.id, {
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
    });

    return res.json({
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reset password: ' + err.message });
  }
});

module.exports = router;
