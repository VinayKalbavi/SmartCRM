import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarCheck2, Plus, Download, CheckCircle2, 
  X, User, ArrowUpRight 
} from 'lucide-react';
import { getFollowups, updateFollowup, createFollowup, getCustomers } from '../services/api';
import toast from 'react-hot-toast';

export default function Followups() {
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [customers, setCustomers] = useState([]);

  // Modal for new follow-up
  const [modalOpen, setModalOpen] = useState(false);
  const [newCustId, setNewCustId] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchFollowupsList = async () => {
    try {
      setLoading(true);
      const res = await getFollowups({ status: filter === 'all' ? undefined : filter });
      setFollowups(res);
    } catch (err) {
      toast.error('Failed to load follow-ups');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomersForPicker = async () => {
    try {
      const res = await getCustomers({ limit: 100 });
      setCustomers(res.customers || []);
      if (res.customers?.length > 0 && !newCustId) {
        setNewCustId(String(res.customers[0].id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFollowupsList();
  }, [filter]);

  useEffect(() => {
    loadCustomersForPicker();
  }, []);

  const handleToggleStatus = async (item) => {
    const nextStatus = item.status === 'completed' ? 'pending' : 'completed';
    try {
      await updateFollowup(item.id, { status: nextStatus });
      toast.success(`Task marked as ${nextStatus}!`);
      fetchFollowupsList();
    } catch (err) {
      toast.error('Failed to update follow-up status');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCustId) {
      toast.error('Please enter a title and select a customer');
      return;
    }
    try {
      setCreating(true);
      const due = newDueDate ? new Date(newDueDate).toISOString() : new Date(Date.now() + 3 * 86400000).toISOString();
      await createFollowup({
        customerId: newCustId,
        title: newTitle.trim(),
        dueDate: due,
        status: 'pending',
      });
      toast.success('Follow-up created successfully!');
      setModalOpen(false);
      setNewTitle('');
      setNewDueDate('');
      fetchFollowupsList();
    } catch (err) {
      toast.error('Failed to create follow-up');
    } finally {
      setCreating(false);
    }
  };

  const filterTabs = [
    { id: 'all', label: 'All Tasks' },
    { id: 'pending', label: 'Pending' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'completed', label: 'Completed' },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight text-white uppercase">
            Your Day's Tasks
          </h1>
          <p className="text-xs sm:text-sm text-[#8A8A8A] mt-1 font-normal">
            Scheduled outreach, client meetings, and urgent follow-ups
          </p>
        </div>

        {/* Action Buttons: Pill styled */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <a
            href="/api/export/followups.csv"
            download="followups.csv"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full pill-dark-sheen text-white font-semibold text-xs transition-all"
          >
            <Download className="w-4 h-4 text-[#8A8A8A]" />
            <span>Export CSV</span>
          </a>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full lime-btn-glow font-bold text-xs tracking-wide transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Pill Filter Tabs with Top Lighting */}
      <div className="flex items-center gap-2 p-1.5 pill-dark-sheen rounded-full w-fit text-xs font-semibold overflow-x-auto max-w-full">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-1.5 rounded-full transition-all whitespace-nowrap text-xs ${
              filter === tab.id
                ? 'lime-btn-glow font-bold'
                : 'text-[#8A8A8A] hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Follow-ups Card / Table Container with Studio Bevel Lighting */}
      <div className="p-5 sm:p-6 rounded-[28px] card-sheen overflow-hidden">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-[#22242B] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : followups.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full pill-dark-sheen text-[#8A8A8A] flex items-center justify-center mx-auto">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">No tasks in this view</h3>
            <p className="text-xs text-[#8A8A8A] max-w-sm mx-auto">
              You are all caught up! Click "New Task" to schedule client outreach.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead>
                <tr className="border-b border-[#262730] text-[#8A8A8A] font-semibold">
                  <th className="pb-3 pl-2 w-10">Done</th>
                  <th className="pb-3">Task Title</th>
                  <th className="pb-3">Lead / Client</th>
                  <th className="pb-3">Due Date</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#24252D] font-medium">
                {followups.map((item, idx) => {
                  // In the reference image, the first active task gets glowing accent
                  const isHighlighted = idx === 0 && item.status !== 'completed';

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-[#20222A]/70 transition-colors rounded-xl ${
                        isHighlighted ? 'bg-[#B8F55A]/[0.06]' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 pl-2">
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                            item.status === 'completed'
                              ? 'lime-btn-glow shadow-sm'
                              : 'circle-btn-sheen text-transparent hover:text-[#B8F55A]'
                          }`}
                          title={item.status === 'completed' ? 'Reopen' : 'Complete'}
                        >
                          <CheckCircle2 className="w-4 h-4 fill-current" />
                        </button>
                      </td>

                      {/* Title */}
                      <td className="py-3.5 font-bold text-white max-w-[220px] truncate text-sm">
                        <span className={item.status === 'completed' ? 'line-through text-[#666666]' : 'drop-shadow-sm'}>
                          {item.title}
                        </span>
                        {isHighlighted && (
                          <span className="ml-2 text-[10px] font-bold text-black lime-btn-glow px-2.5 py-0.5 rounded-full uppercase">
                            Next Up
                          </span>
                        )}
                      </td>

                      {/* Customer link */}
                      <td className="py-3.5">
                        <Link
                          to={`/customers/${item.customerId}`}
                          className="font-semibold text-[#EDEDED] hover:text-[#B8F55A] flex items-center gap-1.5 truncate max-w-[160px]"
                        >
                          <User className="w-3.5 h-3.5 text-[#B8F55A] shrink-0" />
                          <span className="truncate">{item.customerName}</span>
                        </Link>
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 whitespace-nowrap">
                        <span
                          className={`font-semibold ${
                            item.isOverdue
                              ? 'text-rose-400'
                              : item.status === 'completed'
                              ? 'text-[#666666]'
                              : 'text-white'
                          }`}
                        >
                          {new Date(item.dueDate).toLocaleDateString()}
                        </span>
                        {item.isOverdue && (
                          <span className="ml-2 text-[10px] font-bold uppercase text-rose-300 bg-rose-500/15 border border-rose-500/20 px-2 py-0.5 rounded-full">
                            Overdue
                          </span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold capitalize tracking-wide ${
                            item.status === 'completed'
                              ? 'bg-[#B8F55A]/15 text-[#B8F55A] border border-[#B8F55A]/30 shadow-[inset_0_1px_0_rgba(184,245,90,0.2)]'
                              : item.isOverdue
                              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-[inset_0_1px_0_rgba(244,63,94,0.2)]'
                              : 'pill-dark-sheen text-white'
                          }`}
                        >
                          {item.isOverdue ? 'Overdue' : item.status}
                        </span>
                      </td>

                      {/* Action Pill Button */}
                      <td className="py-3.5 text-right pr-2 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className={`px-3.5 py-1.5 rounded-full font-bold text-xs transition-all ${
                            item.status === 'completed'
                              ? 'pill-dark-sheen text-[#8A8A8A] hover:text-white'
                              : 'white-btn-glow'
                          }`}
                        >
                          {item.status === 'completed' ? 'Reopen' : 'Complete'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Follow-up Modal (Dark kit style with specular lighting) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg card-sheen rounded-[28px] p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#262730] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full lime-btn-glow text-black">
                  <CalendarCheck2 className="w-5 h-5 stroke-[2.5]" />
                </div>
                <h2 className="text-lg font-light text-white uppercase tracking-tight">Create New Task</h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-[#8A8A8A] hover:text-white rounded-full pill-dark-sheen"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#8A8A8A] block mb-1">Select Lead / Customer</label>
                <select
                  value={newCustId}
                  onChange={(e) => setNewCustId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full input-sheen text-xs font-medium text-white outline-none focus:border-[#B8F55A]"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#17181D]">
                      {c.fullName} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#8A8A8A] block mb-1">Task Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Schedule discovery call"
                  className="w-full px-4 py-2.5 rounded-full input-sheen text-xs font-medium text-white placeholder-[#666] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#8A8A8A] block mb-1">Due Date</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full input-sheen text-xs font-medium text-white outline-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-full pill-dark-sheen text-white font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2.5 rounded-full lime-btn-glow font-bold text-xs transition-colors"
                >
                  {creating ? 'Saving...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
