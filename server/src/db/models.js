const mongoose = require('mongoose');

const CustomerCrmSchema = new mongoose.Schema({
  customerId: { type: String, required: true, unique: true, index: true },
  tags: { type: [String], default: [] },
  owner: { type: String, default: 'Unassigned' },
  preferredContact: { type: String, default: 'Email' },
  notes: { type: String, default: '' },
}, { timestamps: true });

const InteractionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  customerId: { type: String, required: true, index: true },
  type: { type: String, enum: ['call', 'email', 'meeting', 'note'], default: 'note' },
  summary: { type: String, required: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
});

const FollowupSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  customerId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  dueDate: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending', index: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
  completedAt: { type: String, default: null },
});

const CustomerCrm = mongoose.models.CustomerCrm || mongoose.model('CustomerCrm', CustomerCrmSchema);
const Interaction = mongoose.models.Interaction || mongoose.model('Interaction', InteractionSchema);
const Followup = mongoose.models.Followup || mongoose.model('Followup', FollowupSchema);

module.exports = {
  CustomerCrm,
  Interaction,
  Followup,
};
