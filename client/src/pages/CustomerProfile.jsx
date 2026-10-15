import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Phone, MapPin, Tag, UserCheck, 
  Sparkles, Plus, CheckCircle2, ShoppingBag, 
  MessageSquare, Edit3, Save, PhoneCall, Calendar
} from 'lucide-react';
import { 
  getCustomer, updateCustomerCrm, addCustomerInteraction, 
  createFollowup, getMessageTemplates 
} from '../services/api';
import { SegmentBadge, OrderStatusBadge } from '../components/HealthBadge';
import MessageModal from '../components/MessageModal';
import toast from 'react-hot-toast';

export default function CustomerProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Editable CRM form state
  const [crmEditing, setCrmEditing] = useState(false);
  const [owner, setOwner] = useState('');
  const [preferredContact, setPreferredContact] = useState('');
  const [tagsString, setTagsString] = useState('');
  const [savingCrm, setSavingCrm] = useState(false);

  // New Interaction form state
  const [intType, setIntType] = useState('call');
  const [intSummary, setIntSummary] = useState('');
  const [submittingInt, setSubmittingInt] = useState(false);

  // New Follow-up form state
  const [folTitle, setFolTitle] = useState('');
  const [folDueDate, setFolDueDate] = useState('');
  const [submittingFol, setSubmittingFol] = useState(false);

  // Timeline filter
  const [timelineFilter, setTimelineFilter] = useState('all');

  // Message template modal
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageTemplates, setMessageTemplates] = useState(null);
  const [generatingMessage, setGeneratingMessage] = useState(false);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const data = await getCustomer(id);
      setProfile(data);
      setOwner(data.customer.owner || 'Unassigned');
      setPreferredContact(data.customer.preferredContact || 'Email');
      setTagsString((data.customer.tags || []).join(', '));
    } catch (err) {
      toast.error('Failed to load customer profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [id]);

  const handleSaveCrm = async (e) => {
    e.preventDefault();
    try {
      setSavingCrm(true);
      const parsedTags = tagsString.split(',').map(t => t.trim()).filter(Boolean);
      await updateCustomerCrm(id, {
        owner,
        preferredContact,
        tags: parsedTags,
      });
      toast.success('CRM profile updated!');
      setCrmEditing(false);
      fetchProfileData();
    } catch (err) {
      toast.error('Failed to update CRM data');
    } finally {
      setSavingCrm(false);
    }
  };

  const handleAddInteraction = async (e) => {
    e.preventDefault();
    if (!intSummary.trim()) {
      toast.error('Please enter interaction notes');
      return;
    }
    try {
      setSubmittingInt(true);
      await addCustomerInteraction(id, {
        type: intType,
        summary: intSummary.trim(),
      });
      toast.success('Interaction logged to timeline!');
      setIntSummary('');
      fetchProfileData();
    } catch (err) {
      toast.error('Failed to save interaction');
    } finally {
      setSubmittingInt(false);
    }
  };

  const handleAddFollowup = async (e) => {
    e.preventDefault();
    if (!folTitle.trim()) {
      toast.error('Please enter follow-up title');
      return;
    }
    try {
      setSubmittingFol(true);
      const due = folDueDate ? new Date(folDueDate).toISOString() : new Date(Date.now() + 3 * 86400000).toISOString();
      await createFollowup({
        customerId: id,
        title: folTitle.trim(),
        dueDate: due,
        status: 'pending',
      });
      toast.success('Follow-up scheduled!');
      setFolTitle('');
      setFolDueDate('');
      fetchProfileData();
    } catch (err) {
      toast.error('Failed to schedule follow-up');
    } finally {
      setSubmittingFol(false);
    }
  };

  const handleCreateSuggestedFollowup = async (suggestion) => {
    try {
      const days = suggestion.defaultDueDateDays || 2;
      const targetDue = new Date(Date.now() + days * 86400000).toISOString();
      await createFollowup({
        customerId: id,
        title: suggestion.title,
        dueDate: targetDue,
        status: 'pending',
      });
      toast.success(`Created suggested follow-up: "${suggestion.title}"`);
      fetchProfileData();
    } catch (err) {
      toast.error('Failed to create suggested follow-up');
    }
  };

  const handleGenerateMessage = async (orderId = null) => {
    try {
      setGeneratingMessage(true);
      const templates = await getMessageTemplates(id, orderId);
      setMessageTemplates(templates);
      setMessageModalOpen(true);
    } catch (err) {
      toast.error('Failed to generate templates');
    } finally {
      setGeneratingMessage(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="p-4 sm:p-6 md:p-8 space-y-6 animate-pulse max-w-7xl mx-auto w-full">
        <div className="h-6 bg-[#1F1F1F] rounded-full w-36" />
        <div className="h-44 bg-[#1F1F1F] rounded-[28px]" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-[#1F1F1F] rounded-[28px]" />
          <div className="h-80 bg-[#1F1F1F] rounded-[28px]" />
        </div>
      </div>
    );
  }

  const { customer, stats, orders, timeline, suggestions } = profile;

  const filteredTimeline = timeline.filter((item) => {
    if (timelineFilter === 'all') return true;
    return item.category === timelineFilter;
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full min-w-0">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/customers"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full pill-dark-sheen text-xs font-semibold text-[#8A8A8A] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Leads</span>
        </Link>
        <span className="text-[11px] text-[#8A8A8A]">ID: #{customer.id}</span>
      </div>

      {/* Hero Header Card with Studio Bevel Lighting */}
      <div className="p-6 sm:p-8 rounded-[28px] card-sheen">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Avatar & Info */}
          <div className="flex items-start sm:items-center gap-4 sm:gap-6">
            <img
              src={customer.avatarUrl}
              alt={customer.fullName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover bg-[#22242B] border-2 border-white/10 shrink-0 shadow-md"
            />
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-light tracking-tight text-white truncate drop-shadow-sm">
                  {customer.fullName}
                </h1>
                <SegmentBadge segment={customer.segment} />
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#8A8A8A]">
                <span className="flex items-center gap-1 truncate">
                  <Mail className="w-3.5 h-3.5 text-[#666666] shrink-0" />
                  <span className="truncate">{customer.email}</span>
                </span>
                <span className="flex items-center gap-1 shrink-0">
                  <Phone className="w-3.5 h-3.5 text-[#666666] shrink-0" />
                  {customer.phone || 'No phone'}
                </span>
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="w-3.5 h-3.5 text-[#666666] shrink-0" />
                  <span className="truncate">{customer.address || `${customer.city}, ${customer.state}`}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Health Score Circular Dial with Lime Glow Progress */}
          <div className="flex items-center justify-between sm:justify-start gap-4 pill-dark-sheen p-4 rounded-[22px] shadow-[0_0_24px_rgba(184,245,90,0.12)] shrink-0">
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#2B2D36]"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#B8F55A]"
                  strokeDasharray={`${customer.healthScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-light text-sm text-white drop-shadow-sm">
                {customer.healthScore}
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-white">Health Score</div>
              <div className="text-[11px] text-[#8A8A8A]">RFM + Activity</div>
            </div>
          </div>
        </div>

        {/* Stats Row - Very large light numbers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#262730]">
          <div>
            <div className="text-[11px] font-bold uppercase text-[#8A8A8A]">Total Spend</div>
            <div className="text-xl sm:text-2xl font-light text-white mt-1 drop-shadow-sm">
              ₹{stats.totalSpend.toLocaleString('en-IN')}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase text-[#8A8A8A]">Total Orders</div>
            <div className="text-xl sm:text-2xl font-light text-white mt-1 drop-shadow-sm">
              {stats.orderCount}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase text-[#8A8A8A]">Average Order Value</div>
            <div className="text-xl sm:text-2xl font-light text-white mt-1 drop-shadow-sm">
              ₹{stats.averageOrderValue.toLocaleString('en-IN')}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase text-[#8A8A8A]">Last Order</div>
            <div className="text-xl sm:text-2xl font-light text-white mt-1 drop-shadow-sm">
              {stats.lastOrderDate ? new Date(stats.lastOrderDate).toLocaleDateString() : 'None'}
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Next Actions Panel */}
      <div className="p-6 rounded-[28px] card-sheen">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#B8F55A] shrink-0" />
            <h2 className="text-base font-semibold text-white">Smart CRM Follow-up Suggestions</h2>
          </div>
          {/* Pill Action Button */}
          <button
            onClick={() => handleGenerateMessage()}
            disabled={generatingMessage}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-full lime-btn-glow font-bold text-xs transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Generate Message</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map((sugg) => (
            <div
              key={sugg.id}
              className="p-4 rounded-[22px] pill-dark-sheen flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-white truncate">{sugg.title}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                    sugg.priority === 'high' ? 'bg-rose-500/15 text-rose-300 border border-rose-500/20' : 'bg-[#B8F55A]/15 text-[#B8F55A] border border-[#B8F55A]/20'
                  }`}>
                    {sugg.priority}
                  </span>
                </div>
                <p className="text-xs text-[#8A8A8A] mt-1 leading-relaxed">
                  {sugg.reason}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 gap-2">
                <span className="text-[11px] text-[#B8F55A] font-semibold truncate">
                  Action: {sugg.suggestedAction}
                </span>
                <button
                  onClick={() => handleCreateSuggestedFollowup(sugg)}
                  className="px-3.5 py-1.5 rounded-full white-btn-glow text-xs font-bold shrink-0 transition-colors"
                >
                  Create Task
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Left Timeline & Orders, Right CRM Attributes & Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
        {/* Left: Customer 360 Timeline + Order History */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          {/* Customer 360 Timeline */}
          <div className="p-6 rounded-[28px] card-sheen min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-base font-semibold text-white">Customer 360 Timeline</h2>
                <p className="text-xs text-[#8A8A8A]">Chronological activity feed</p>
              </div>
              {/* Timeline Filter Chips */}
              <div className="flex items-center gap-1.5 p-1 pill-dark-sheen rounded-full text-xs font-semibold self-start sm:self-auto overflow-x-auto max-w-full">
                {['all', 'order', 'note', 'followup'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setTimelineFilter(cat)}
                    className={`px-3 py-1.5 rounded-full capitalize transition-all whitespace-nowrap text-xs ${
                      timelineFilter === cat
                        ? 'lime-btn-glow font-bold'
                        : 'text-[#8A8A8A] hover:text-white'
                    }`}
                  >
                    {cat === 'all' ? 'All' : `${cat}s`}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline Stream */}
            <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#282A33]">
              {filteredTimeline.length === 0 ? (
                <div className="text-xs text-[#8A8A8A] py-6 text-center">No activity matches this filter.</div>
              ) : (
                filteredTimeline.map((item) => (
                  <div key={item.id} className="relative group">
                    <div
                      className={`absolute -left-6 top-0 w-4 h-4 rounded-full border-2 border-[#17181D] flex items-center justify-center text-white ${
                        item.category === 'order'
                          ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]'
                          : item.category === 'note'
                          ? 'bg-[#B8F55A] shadow-[0_0_8px_rgba(184,245,90,0.7)]'
                          : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                      }`}
                    >
                      <div className="w-1.5 h-1.5 bg-black rounded-full" />
                    </div>

                    <div className="p-4 rounded-[20px] pill-dark-sheen hover:border-white/20 transition-all">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white truncate">{item.title}</span>
                        <span className="text-[10px] text-[#8A8A8A] whitespace-nowrap">
                          {new Date(item.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                      <p className="text-xs text-[#A0A0A0] mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Order History Table */}
          <div className="p-6 rounded-[28px] card-sheen min-w-0">
            <h2 className="text-base font-semibold text-white mb-4">
              Order History ({orders.length})
            </h2>
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead>
                  <tr className="border-b border-[#262730] text-[#8A8A8A] font-semibold">
                    <th className="pb-3 pl-2">Order</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Items</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3 text-right pr-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#24252D] font-medium">
                  {orders.map((ord, idx) => (
                    <tr
                      key={ord.id}
                      className="hover:bg-[#20222A]/70 transition-colors"
                    >
                      <td className="py-3 pl-2 font-bold text-white">
                        {ord.number}
                        {idx === 0 && (
                          <span className="ml-2 text-[10px] font-bold text-black lime-btn-glow px-2 py-0.5 rounded-full">
                            Latest
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-[#8A8A8A] whitespace-nowrap">{new Date(ord.dateCreated).toLocaleDateString()}</td>
                      <td className="py-3 text-[#A0A0A0] truncate max-w-[160px]">
                        {ord.lineItems.map((li) => `${li.quantity}x ${li.name}`).join(', ') || '1x Item'}
                      </td>
                      <td className="py-3 font-bold text-white whitespace-nowrap drop-shadow-sm">
                        ₹{ord.total.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 text-right pr-2">
                        <OrderStatusBadge status={ord.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: CRM Details + Forms */}
        <div className="space-y-6 min-w-0">
          {/* Editable CRM Info Card */}
          <div className="p-6 rounded-[28px] card-sheen min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white">CRM Attributes</h2>
              <button
                onClick={() => setCrmEditing(!crmEditing)}
                className="text-xs font-semibold text-[#B8F55A] hover:underline flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                {crmEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {crmEditing ? (
              <form onSubmit={handleSaveCrm} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-[#8A8A8A] block mb-1">Account Owner</label>
                  <select
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl input-sheen text-xs font-medium text-white outline-none focus:border-[#B8F55A]"
                  >
                    <option value="Priya Patel">Priya Patel</option>
                    <option value="Rahul Verma">Rahul Verma</option>
                    <option value="Ananya Iyer">Ananya Iyer</option>
                    <option value="Unassigned">Unassigned</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#8A8A8A] block mb-1">Preferred Channel</label>
                  <select
                    value={preferredContact}
                    onChange={(e) => setPreferredContact(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl input-sheen text-xs font-medium text-white outline-none focus:border-[#B8F55A]"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Phone">Phone</option>
                    <option value="Email">Email</option>
                    <option value="SMS">SMS</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#8A8A8A] block mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={tagsString}
                    onChange={(e) => setTagsString(e.target.value)}
                    placeholder="VIP, High Value"
                    className="w-full px-3 py-2 rounded-xl input-sheen text-xs font-medium text-white placeholder-[#666666] outline-none focus:border-[#B8F55A]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingCrm}
                  className="w-full py-2.5 rounded-full lime-btn-glow font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5 stroke-[2.5]" />
                  {savingCrm ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[#8A8A8A] block mb-1 text-[11px]">Account Owner:</span>
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <UserCheck className="w-4 h-4 text-[#B8F55A]" />
                    {customer.owner || 'Unassigned'}
                  </div>
                </div>

                <div>
                  <span className="text-[#8A8A8A] block mb-1 text-[11px]">Preferred Channel:</span>
                  <span className="px-3 py-1 rounded-full pill-dark-sheen font-semibold text-white inline-block">
                    {customer.preferredContact || 'Email'}
                  </span>
                </div>

                <div>
                  <span className="text-[#8A8A8A] block mb-1.5 text-[11px]">Assigned Tags:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(customer.tags || []).length === 0 ? (
                      <span className="text-[#666666] italic">No tags assigned</span>
                    ) : (
                      (customer.tags || []).map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-1 rounded-full pill-dark-sheen text-[#EDEDED] font-semibold text-[11px]"
                        >
                          #{t}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Interaction Form */}
          <div className="p-6 rounded-[28px] card-sheen min-w-0">
            <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-[#B8F55A]" />
              Log Interaction
            </h2>
            <form onSubmit={handleAddInteraction} className="space-y-3">
              <div className="grid grid-cols-4 gap-1 p-1 pill-dark-sheen rounded-full">
                {[
                  { id: 'call', label: 'Call' },
                  { id: 'email', label: 'Email' },
                  { id: 'meeting', label: 'Meet' },
                  { id: 'note', label: 'Note' },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setIntType(type.id)}
                    className={`py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                      intType === type.id
                        ? 'lime-btn-glow text-black'
                        : 'text-[#8A8A8A] hover:text-white'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
              <textarea
                value={intSummary}
                onChange={(e) => setIntSummary(e.target.value)}
                placeholder="Log discussion notes, agreements..."
                rows={3}
                className="w-full p-3 rounded-2xl input-sheen text-xs text-white placeholder-[#666666] outline-none"
              />
              <button
                type="submit"
                disabled={submittingInt}
                className="w-full py-2.5 rounded-full white-btn-glow font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                {submittingInt ? 'Saving...' : 'Add Note to Feed'}
              </button>
            </form>
          </div>

          {/* Quick Follow-up Form */}
          <div className="p-6 rounded-[28px] card-sheen min-w-0">
            <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#B8F55A]" />
              Schedule Follow-up
            </h2>
            <form onSubmit={handleAddFollowup} className="space-y-3">
              <input
                type="text"
                value={folTitle}
                onChange={(e) => setFolTitle(e.target.value)}
                placeholder="Task title (e.g. Call to finalize deal)"
                className="w-full px-3.5 py-2.5 rounded-full input-sheen text-xs text-white placeholder-[#666666] outline-none"
              />
              <input
                type="date"
                value={folDueDate}
                onChange={(e) => setFolDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-full input-sheen text-xs text-white outline-none"
              />
              <button
                type="submit"
                disabled={submittingFol}
                className="w-full py-2.5 rounded-full lime-btn-glow font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                {submittingFol ? 'Scheduling...' : 'Set Follow-up Task'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Message Modal */}
      <MessageModal
        isOpen={messageModalOpen}
        onClose={() => setMessageModalOpen(false)}
        templates={messageTemplates}
        customerPhone={customer.phone}
      />
    </div>
  );
}
