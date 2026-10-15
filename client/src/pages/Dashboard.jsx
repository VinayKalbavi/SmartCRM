import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, ShoppingBag, ArrowUpRight, ArrowRight, ShieldAlert, 
  CheckCircle2, Clock, Plus
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { getDashboardSummary, updateFollowup } from '../services/api';
import { OrderStatusBadge } from '../components/HealthBadge';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartView, setChartView] = useState('revenue');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await getDashboardSummary();
      setData(res);
    } catch (err) {
      toast.error('Failed to load dashboard data: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    const handleRefresh = () => fetchDashboard();
    window.addEventListener('smartcrm:refresh', handleRefresh);
    return () => window.removeEventListener('smartcrm:refresh', handleRefresh);
  }, []);

  const handleToggleFollowup = async (f) => {
    const newStatus = f.status === 'completed' ? 'pending' : 'completed';
    try {
      await updateFollowup(f.id, { status: newStatus });
      toast.success(`Follow-up marked as ${newStatus}!`);
      fetchDashboard();
    } catch (err) {
      toast.error('Could not update follow-up');
    }
  };

  if (loading && !data) {
    return (
      <div className="p-4 sm:p-6 md:p-8 space-y-6 animate-pulse max-w-7xl mx-auto w-full">
        <div className="h-10 bg-[#1F1F1F] rounded-full w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-36 bg-[#1F1F1F] rounded-[28px]" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-[#1F1F1F] rounded-[28px]" />
          <div className="h-80 bg-[#1F1F1F] rounded-[28px]" />
        </div>
      </div>
    );
  }

  const { kpis, recentOrders, pendingFollowups, salesOverTime, ordersByStatus, atRiskCustomers } = data;

  const STATUS_COLORS = {
    completed: '#B8F55A',
    processing: '#60a5fa',
    pending: '#fbbf24',
    cancelled: '#6b7280',
    refunded: '#f87171',
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full min-w-0">
      {/* Top Header matching reference "WORKSPACE" typography */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight text-white uppercase drop-shadow-sm">
              Workspace
            </h1>
            <span className="px-3 py-1 rounded-full pill-dark-sheen text-[11px] font-semibold text-[#B8F55A]">
              Live CRM
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#8A8A8A] mt-1 font-normal">
            Overview of store performance, customer health, and day's tasks.
          </p>
        </div>

        {/* Action Pills with Glowing Lime Lighting */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/customers"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full lime-btn-glow text-black font-bold text-xs tracking-wide transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>View Customers</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid with Studio Lighting, Reflections, and Neon Lime Highlight */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* Total Sales (Glowing Luminous Lime Card) */}
        <div className="relative overflow-hidden p-6 rounded-[28px] lime-card-glow cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-black/75">Total Revenue</span>
            <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center font-bold text-sm shadow-inner">
              ₹
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-light tracking-tight text-black drop-shadow-sm">
              ₹{kpis.totalSales.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-black/85">
              <span>WooCommerce Store Total</span>
            </div>
          </div>
        </div>

        {/* Total Orders with Specular Top Highlight */}
        <div className="p-6 rounded-[28px] card-sheen">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#8A8A8A]">Total Orders</span>
            <div className="w-8 h-8 rounded-full circle-btn-sheen flex items-center justify-center text-[#EDEDED]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-light tracking-tight text-white drop-shadow-md">
              {kpis.totalOrders}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-[#8A8A8A]">
              <span>Processed transactions</span>
            </div>
          </div>
        </div>

        {/* Total Customers */}
        <div className="p-6 rounded-[28px] card-sheen">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#8A8A8A]">Active Leads & Buyers</span>
            <div className="w-8 h-8 rounded-full circle-btn-sheen flex items-center justify-center text-[#EDEDED]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-light tracking-tight text-white drop-shadow-md">
              {kpis.totalCustomers}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-[#8A8A8A]">
              <span>Scored via RFM model</span>
            </div>
          </div>
        </div>

        {/* Pending Follow-ups */}
        <div className="p-6 rounded-[28px] card-sheen">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#8A8A8A]">Action Tasks</span>
            <div className="w-8 h-8 rounded-full circle-btn-sheen flex items-center justify-center text-[#B8F55A]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-light tracking-tight text-white flex items-baseline gap-2 drop-shadow-md">
              <span>{kpis.pendingFollowups}</span>
              {kpis.overdueFollowups > 0 && (
                <span className="text-[11px] font-bold text-rose-300 bg-rose-500/20 border border-rose-500/30 px-2.5 py-0.5 rounded-full shadow-sm">
                  {kpis.overdueFollowups} overdue
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-[#8A8A8A]">
              <span>Follow-ups due</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section with Sleek Dark Bevel Lighting */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
        {/* Left: Revenue Evolution Bar/Area Chart */}
        <div className="lg:col-span-2 p-6 rounded-[28px] card-sheen flex flex-col justify-between min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-base font-semibold text-white tracking-wide">Revenue & Sales Evolution</h2>
              <p className="text-xs text-[#8A8A8A]">Billing cycle distribution</p>
            </div>
            <div className="flex items-center gap-1 p-1 pill-dark-sheen rounded-full text-xs">
              <button
                onClick={() => setChartView('revenue')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  chartView === 'revenue'
                    ? 'lime-btn-glow text-black'
                    : 'text-[#8A8A8A] hover:text-white'
                }`}
              >
                Revenue (₹)
              </button>
              <button
                onClick={() => setChartView('orders')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  chartView === 'orders'
                    ? 'lime-btn-glow text-black'
                    : 'text-[#8A8A8A] hover:text-white'
                }`}
              >
                Orders Count
              </button>
            </div>
          </div>

          <div className="h-60 sm:h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              {chartView === 'revenue' ? (
                <BarChart data={salesOverTime} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <XAxis dataKey="period" stroke="#666666" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666666" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Revenue']}
                    contentStyle={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', color: '#fff', fontSize: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.8)' }}
                  />
                  <Bar dataKey="sales" fill="#B8F55A" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              ) : (
                <AreaChart data={salesOverTime} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#B8F55A" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#B8F55A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="period" stroke="#666666" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666666" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', color: '#fff', fontSize: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.8)' }} />
                  <Area type="monotone" dataKey="orders" stroke="#B8F55A" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOrders)" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Orders by Status Donut with Bevel Lighting */}
        <div className="p-6 rounded-[28px] card-sheen flex flex-col justify-between min-w-0">
          <div>
            <h2 className="text-base font-semibold text-white tracking-wide">Fulfillment Status</h2>
            <p className="text-xs text-[#8A8A8A]">Order breakdown</p>
          </div>

          <div className="h-48 sm:h-52 w-full my-auto flex items-center justify-center min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ordersByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {ordersByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#B8F55A'} stroke="#161616" strokeWidth={2.5} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', color: '#fff', fontSize: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.8)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend as pill chips */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {ordersByStatus.map((entry) => (
              <div key={entry.status} className="flex items-center gap-2 p-1.5 rounded-full pill-dark-sheen">
                <span className="w-2 h-2 rounded-full shrink-0 ml-1.5 shadow-sm" style={{ backgroundColor: STATUS_COLORS[entry.status] || '#B8F55A' }} />
                <span className="text-[#A0A0A0] capitalize truncate">{entry.name}</span>
                <span className="font-bold text-white ml-auto mr-1.5">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Row: Recent Orders Table + Your Day's Tasks (Highlighted Lime Lighting) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 p-6 rounded-[28px] card-sheen min-w-0">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-white">Recent WooCommerce Orders</h2>
              <p className="text-xs text-[#8A8A8A]">Live store checkout activity</p>
            </div>
            <Link
              to="/customers"
              className="text-xs font-semibold text-[#B8F55A] hover:underline flex items-center gap-1 shrink-0"
            >
              All orders <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead>
                <tr className="border-b border-[#262730] text-[#8A8A8A] font-semibold">
                  <th className="pb-3 pl-2">Order</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3 text-right pr-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#24252D] font-medium">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#20222A]/70 transition-colors rounded-xl">
                    <td className="py-3 pl-2 font-bold text-white">
                      {ord.number}
                    </td>
                    <td className="py-3">
                      <Link
                        to={`/customers/${ord.customerId}`}
                        className="text-[#EDEDED] hover:text-[#B8F55A] font-semibold truncate block max-w-[160px]"
                      >
                        {ord.customerName}
                      </Link>
                    </td>
                    <td className="py-3 text-[#8A8A8A] whitespace-nowrap">
                      {new Date(ord.dateCreated).toLocaleDateString()}
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

        {/* Right Column: "Your Day's Tasks" & "At-Risk Leads" */}
        <div className="space-y-6 min-w-0">
          {/* Your Day's Tasks Widget (Highlighted Lime Lighting from reference UI) */}
          <div className="p-6 rounded-[28px] card-sheen min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#B8F55A]" />
                Your Day's Tasks
              </h2>
              <Link to="/followups" className="text-xs font-semibold text-[#B8F55A] hover:underline">
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {pendingFollowups.length === 0 ? (
                <div className="text-xs text-[#8A8A8A] text-center py-6">All tasks completed!</div>
              ) : (
                pendingFollowups.slice(0, 3).map((f, idx) => {
                  const isHighlighted = idx === 0;

                  return (
                    <div
                      key={f.id}
                      className={`p-4 rounded-[22px] transition-all relative ${
                        isHighlighted
                          ? 'lime-card-glow text-black'
                          : f.isOverdue
                          ? 'pill-dark-sheen border border-rose-500/40 text-white'
                          : 'pill-dark-sheen text-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <Link
                            to={`/customers/${f.customerId}`}
                            className={`text-xs font-bold block truncate hover:underline ${
                              isHighlighted ? 'text-black font-extrabold' : 'text-white'
                            }`}
                          >
                            {f.title}
                          </Link>
                          <div className={`text-[11px] truncate ${isHighlighted ? 'text-black/80 font-medium' : 'text-[#8A8A8A]'}`}>
                            Lead: {f.customerName}
                          </div>
                        </div>

                        {/* Circular Action Button with Bevel */}
                        <button
                          onClick={() => handleToggleFollowup(f)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            isHighlighted
                              ? 'bg-black text-[#B8F55A] hover:bg-black/80 shadow-md'
                              : 'circle-btn-sheen text-[#A0A0A0]'
                          }`}
                          title="Complete Task"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/10 dark:border-white/10 text-[10px]">
                        <span className={isHighlighted ? 'text-black/75 font-semibold' : 'text-[#8A8A8A]'}>
                          Due: {new Date(f.dueDate).toLocaleDateString()}
                        </span>
                        {f.isOverdue && (
                          <span className="font-extrabold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-full uppercase">
                            Overdue
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* At-Risk Leads with Beveled Circular Arrow Buttons */}
          <div className="p-6 rounded-[28px] card-sheen min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                At-Risk Leads
              </h2>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/20">
                Win-Back
              </span>
            </div>

            <div className="space-y-3">
              {atRiskCustomers.slice(0, 3).map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-[22px] pill-dark-sheen flex items-center justify-between gap-3 hover:border-white/20 transition-all"
                >
                  <div className="truncate">
                    <Link
                      to={`/customers/${c.id}`}
                      className="text-xs font-bold text-white hover:text-[#B8F55A] block truncate"
                    >
                      {c.fullName}
                    </Link>
                    <div className="text-[11px] text-[#8A8A8A] truncate">
                      ₹{c.totalSpent.toLocaleString('en-IN')} • {c.daysSinceLastOrder || '0'}d inactive
                    </div>
                  </div>

                  {/* Circular Arrow Button with Bevel & Glow */}
                  <Link
                    to={`/customers/${c.id}`}
                    className="w-8 h-8 rounded-full circle-btn-sheen flex items-center justify-center shrink-0"
                    title="View Customer"
                  >
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
