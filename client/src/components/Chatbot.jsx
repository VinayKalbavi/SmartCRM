import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, MessageSquare, Send, X, Sparkles, 
  Trash2, Copy, Check, ChevronDown, HelpCircle, 
  ArrowUpRight, RefreshCw, Zap
} from 'lucide-react';
import { getDashboardSummary } from '../services/api';
import toast from 'react-hot-toast';

// Curated SmartCRM & WooCommerce Knowledge Base
const KNOWLEDGE_BASE = [
  {
    category: 'rfm',
    keywords: ['rfm', 'health', 'score', 'calculate', 'formula', 'metric'],
    question: 'How is the RFM Customer Health Score calculated?',
    answer: `The **SmartCRM Health Score (0–100)** uses a weighted **RFM (Recency, Frequency, Monetary)** model:

• **Recency (40% weight):** Measures days since the last purchase. Recent shoppers (< 30 days) score highest; decay begins past 60 days.
• **Frequency (30% weight):** Total verified completed orders. Repeat buyers receive accelerated scoring.
• **Monetary (30% weight):** Lifetime store expenditure normalized against your store's average order value (AOV).

A score of **80–100** marks VIP/Loyal buyers, while **< 40** flags At-Risk leads requiring win-back campaigns.`,
    suggestions: ['What do customer segments mean?', 'How to win back at-risk leads?', 'Store overview stats']
  },
  {
    category: 'segments',
    keywords: ['segment', 'vip', 'loyal', 'at-risk', 'churn', 'new', 'active', 'lifecycle'],
    question: 'What do the different customer segments mean?',
    answer: `SmartCRM automatically categorizes customers into 6 lifecycle stages:

👑 **VIP:** Top 10% spenders with high repeat frequency and health scores above 85.
💎 **Loyal:** Steady, reliable repeat buyers who consistently return.
🟢 **Active:** Shoppers who ordered recently and show steady engagement.
✨ **New:** First-time buyers whose first order occurred within the last 30 days.
⚠️ **At-Risk:** High historical spenders who haven't purchased in >60–90 days.
🛑 **Churned:** Customers with no orders or interactions for over 180 days.`,
    suggestions: ['How to win back at-risk leads?', 'Explain RFM score', 'WhatsApp message templates']
  },
  {
    category: 'winback',
    keywords: ['win-back', 'win back', 'at risk', 'retain', 're-engage', 'inactive', 'churn'],
    question: 'How do I win back an At-Risk customer?',
    answer: `To recover an **At-Risk customer** before they churn:

1. **Check Timeline:** Open their profile to see their favorite products and past spending tier.
2. **Generate Message:** Use the **Generate Message** button to create a personalized WhatsApp or email outreach with an exclusive VIP discount.
3. **Set a Follow-Up Task:** Schedule a reminder task for 48 hours to check if they opened your note or returned to the store.
4. **Offer Free Shipping or Gift:** High-value past buyers respond best to loyalty perks rather than generic marketing.`,
    suggestions: ['WhatsApp message templates', 'Customer Segments', 'How are tasks scheduled?']
  },
  {
    category: 'woo',
    keywords: ['woocommerce', 'sync', 'adapter', 'guest', 'api', 'mock', 'live', 'connect'],
    question: 'How does WooCommerce integration & sync work?',
    answer: `SmartCRM connects directly to the **WooCommerce REST API v3**:

• **Dual Adapter Architecture:** Works seamlessly in **Live Mode** (connected to your WordPress store) or **Mock Mode** (demonstration data).
• **Guest Order Linking:** Guest checkouts without registered WordPress accounts are automatically grouped and linked to customer profiles using their **Billing Email**.
• **In-Memory Caching:** Uses a 60-second TTL cache for blazing speed, with immediate invalidation whenever you click **Sync** in the top bar.`,
    suggestions: ['Where is CRM data saved?', 'Store overview stats', 'Explain RFM score']
  },
  {
    category: 'templates',
    keywords: ['template', 'whatsapp', 'email', 'message', 'copy', 'outreach', 'sms'],
    question: 'How do message templates work?',
    answer: `SmartCRM includes a built-in **Smart Template Engine**:

• **WhatsApp Direct Link:** Automatically creates a \`https://wa.me/...\` direct click-to-chat link with personalized customer names and order IDs.
• **Email Drafter:** Generates professional subject lines and contextual bodies for order thank-yous, win-back discounts, and feedback requests.
• **1-Click Copy:** Copies the message payload directly to your clipboard for instant pasting.`,
    suggestions: ['How to win back at-risk leads?', 'Customer Segments', 'How are tasks scheduled?']
  },
  {
    category: 'followups',
    keywords: ['followup', 'task', 'reminder', 'due', 'calendar', 'overdue', 'schedule'],
    question: 'How do follow-ups and day tasks work?',
    answer: `The **Your Day's Tasks** system keeps your outreach on track:

• **Task Creation:** Schedule tasks with specific due dates directly from the Tasks page or from any customer's profile.
• **Smart Suggestions:** The CRM automatically analyzes customer health and suggests high-priority tasks (e.g. VIP onboarding, win-back calls).
• **Overdue Alerts:** Tasks past their due date are prominently highlighted in rose-red with badges.
• **Quick Toggle:** Click the checkmark to mark tasks complete or reopen them anytime.`,
    suggestions: ['Store overview stats', 'Explain RFM score', 'Export data to CSV']
  },
  {
    category: 'database',
    keywords: ['database', 'mongo', 'mongodb', 'atlas', 'db.json', 'storage', 'persist', 'save'],
    question: 'Where is the CRM data stored?',
    answer: `SmartCRM uses a **Unified Repository Pattern**:

• **Cloud Database:** When \`MONGODB_URI\` is configured, all interactions, customer CRM tags, and follow-up tasks are persisted to **MongoDB Atlas (Mongoose 8)**.
• **Zero-Config Fallback:** If MongoDB is offline, it safely persists to a local JSON file store (\`server/data/db.json\`).
• **Data Durability:** All CRM notes, assignments, and tasks survive server restarts and browser reloads.`,
    suggestions: ['WooCommerce sync', 'Export data to CSV', 'Store overview stats']
  },
  {
    category: 'export',
    keywords: ['export', 'csv', 'download', 'excel', 'spreadsheet', 'data'],
    question: 'Can I export customer records and tasks to CSV?',
    answer: `Yes! SmartCRM offers real-time CSV streaming endpoints:

• **Customers Export:** Click **Export CSV** on the Customers page (\`/api/export/customers.csv\`) to download full customer records with health scores, spend totals, and tags.
• **Follow-ups Export:** Click **Export CSV** on the Follow-ups page (\`/api/export/followups.csv\`) to export all pending, overdue, and completed action tasks.`,
    suggestions: ['Customer Segments', 'Where is CRM data saved?', 'Store overview stats']
  }
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Hello! 👋 I'm **SmartCRM AI**, your eCommerce retention assistant.\n\nAsk me anything about **RFM Health Scores**, **Customer Segments**, **WooCommerce integration**, or **Win-back tactics**!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: ['Explain RFM score', 'Customer Segments', 'How to win back at-risk leads?', 'Store overview stats']
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Response copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'bot',
        text: `Chat cleared! How can I help you optimize your WooCommerce customer relationships today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: ['Explain RFM score', 'Customer Segments', 'Store overview stats']
      }
    ]);
  };

  // Find best matching answer from knowledge base or dynamic store stats
  const generateBotReply = async (query) => {
    const qLower = query.toLowerCase().trim();

    // Special Query: Store Overview Stats
    if (qLower.includes('store') || qLower.includes('stat') || qLower.includes('overview') || qLower.includes('revenue') || qLower.includes('sales')) {
      try {
        const summary = await getDashboardSummary();
        if (summary && summary.kpis) {
          const { totalSales, totalOrders, totalCustomers, pendingFollowups, overdueFollowups } = summary.kpis;
          return {
            text: `📊 **Live WooCommerce Store Snapshot:**\n\n• **Total Revenue:** ₹${Number(totalSales).toLocaleString('en-IN')}\n• **Total Orders:** ${totalOrders} transactions\n• **Customer Count:** ${totalCustomers} contacts\n• **Pending Tasks:** ${pendingFollowups} (${overdueFollowups} overdue)\n\nWould you like recommendations on boosting your repeat buyer rate?`,
            suggestions: ['How to win back at-risk leads?', 'Explain RFM score', 'Customer Segments']
          };
        }
      } catch (err) {
        // Fallback to standard answer if API is unavailable
      }
    }

    // Keyword matching score algorithm
    let bestMatch = null;
    let highestScore = 0;

    for (const item of KNOWLEDGE_BASE) {
      let score = 0;
      for (const kw of item.keywords) {
        if (qLower.includes(kw)) {
          score += 2;
        }
      }
      if (qLower.includes(item.category)) {
        score += 3;
      }
      if (score > highestScore) {
        highestScore = score;
        bestMatch = item;
      }
    }

    if (bestMatch && highestScore > 0) {
      return {
        text: bestMatch.answer,
        suggestions: bestMatch.suggestions
      };
    }

    // Smart default fallback with helpful suggestions
    return {
      text: `I specialize in **SmartCRM** retention topics! I can assist you with:\n\n• **RFM Scoring:** How customer health 0–100 is calculated.\n• **Lifecycle Segments:** VIP, Loyal, Active, New, At-Risk, and Churned.\n• **Win-Back Strategy:** Re-engaging past high-value buyers.\n• **WooCommerce Sync:** Guest order linking & REST API integration.\n• **Message Templates:** Generating personalized WhatsApp and Email drafts.\n\nTry clicking one of the suggested topics below:`,
      suggestions: ['Explain RFM score', 'Customer Segments', 'How to win back at-risk leads?', 'Store overview stats']
    };
  };

  const handleSendMessage = async (textToSend = input) => {
    const q = textToSend.trim();
    if (!q) return;

    const userMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Realistic typing delay for smooth user experience
    setTimeout(async () => {
      const reply = await generateBotReply(q);
      const botMessage = {
        id: 'bot_' + Date.now(),
        sender: 'bot',
        text: reply.text,
        suggestions: reply.suggestions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 450);
  };

  return (
    <>
      {/* Floating Chatbot Launcher Pill / Button */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full lime-btn-glow font-bold text-xs text-black shadow-2xl transition-all duration-300 hover:scale-105"
            title="Open SmartCRM Assistant"
          >
            <div className="relative">
              <Bot className="w-5 h-5 stroke-[2.5]" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-black border-2 border-[#B8F55A] animate-pulse" />
            </div>
            <span className="tracking-wide hidden sm:inline">Ask SmartCRM AI</span>
            <div className="w-6 h-6 rounded-full bg-black/15 flex items-center justify-center font-extrabold text-[10px]">
              AI
            </div>
          </button>
        ) : null}
      </div>

      {/* Floating Chat Drawer / Window with Studio Lighting */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[620px] h-[85vh] card-sheen rounded-[28px] overflow-hidden flex flex-col animate-fade-in shadow-2xl border border-white/15">
          {/* Header */}
          <div className="px-5 py-4 border-b border-white/[0.08] bg-[#141519]/90 backdrop-blur-md flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl lime-btn-glow flex items-center justify-center text-black shrink-0 shadow-md">
                <Bot className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white tracking-wide">SmartCRM Assistant</h3>
                  <span className="w-2 h-2 rounded-full bg-[#B8F55A] shadow-[0_0_8px_rgba(184,245,90,0.9)] animate-pulse" />
                </div>
                <p className="text-[10px] text-[#8A8A8A]">
                  AI eCommerce Retention Copilot
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleClearChat}
                className="p-1.5 text-[#8A8A8A] hover:text-rose-400 rounded-full pill-dark-sheen transition-colors"
                title="Clear conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-[#8A8A8A] hover:text-white rounded-full pill-dark-sheen transition-colors"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                >
                  <div
                    className={`max-w-[88%] p-3.5 rounded-[22px] transition-all relative leading-relaxed ${
                      isUser
                        ? 'lime-btn-glow text-black font-semibold rounded-tr-sm shadow-md'
                        : 'pill-dark-sheen text-[#EDEDED] rounded-tl-sm border border-white/10 shadow-lg'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans">
                      {m.text}
                    </div>

                    {!isUser && (
                      <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-[#8A8A8A]">
                        <span>{m.timestamp}</span>
                        <button
                          onClick={() => handleCopy(m.text, m.id)}
                          className="flex items-center gap-1 hover:text-[#B8F55A] transition-colors"
                          title="Copy response"
                        >
                          {copiedId === m.id ? (
                            <Check className="w-3 h-3 text-[#B8F55A]" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedId === m.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Suggestion Chips from bot */}
                  {!isUser && m.suggestions && m.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1 pl-1">
                      {m.suggestions.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(s)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full pill-dark-sheen text-[11px] font-semibold text-[#B8F55A] hover:border-[#B8F55A]/50 transition-all hover:scale-102"
                        >
                          <Sparkles className="w-3 h-3 shrink-0" />
                          <span>{s}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 pill-dark-sheen p-3 rounded-[20px] rounded-tl-sm w-fit">
                <span className="w-2 h-2 rounded-full bg-[#B8F55A] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#B8F55A] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#B8F55A] animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-[10px] text-[#8A8A8A] ml-1 font-medium">SmartCRM is analyzing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Pill Bar */}
          <div className="px-4 py-2 border-t border-white/[0.06] bg-[#121317] flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
            {[
              '🎯 Explain RFM score',
              '👥 Customer Segments',
              '⚡ Win-Back Strategy',
              '🔄 WooCommerce Sync',
              '📊 Store overview stats'
            ].map((quick, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(quick.replace(/^[^\s]+\s/, ''))}
                className="px-3 py-1 rounded-full pill-dark-sheen text-[10px] font-semibold text-[#A0A0A0] hover:text-[#B8F55A] whitespace-nowrap transition-colors shrink-0"
              >
                {quick}
              </button>
            ))}
          </div>

          {/* Chat Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 sm:p-4 bg-[#141519] border-t border-white/[0.08] flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about SmartCRM or WooCommerce..."
              className="flex-1 px-4 py-2.5 rounded-full input-sheen text-xs text-white placeholder-[#666666] outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-9 h-9 rounded-full lime-btn-glow flex items-center justify-center text-black shrink-0 disabled:opacity-40 transition-all hover:scale-105"
              title="Send message"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
