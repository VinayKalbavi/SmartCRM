import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, Download, ArrowUpDown, ChevronLeft, ChevronRight, 
  User, ArrowUpRight 
} from 'lucide-react';
import { getCustomers } from '../services/api';
import { SegmentBadge, HealthScorePill } from '../components/HealthBadge';
import toast from 'react-hot-toast';

export default function Customers() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [segment, setSegment] = useState('all');
  const [sort, setSort] = useState('totalSpent_desc');
  const [loading, setLoading] = useState(true);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchCustomerList = async () => {
    try {
      setLoading(true);
      const res = await getCustomers({
        search: debouncedSearch,
        segment: segment === 'all' ? undefined : segment,
        sort,
        page,
        limit: 10,
      });
      setCustomers(res.customers || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerList();
  }, [debouncedSearch, segment, sort, page]);

  const segments = [
    { id: 'all', label: 'All Leads' },
    { id: 'VIP', label: 'VIP' },
    { id: 'Loyal', label: 'Loyal' },
    { id: 'Active', label: 'Active' },
    { id: 'New', label: 'New' },
    { id: 'At-Risk', label: 'At-Risk' },
    { id: 'Churned', label: 'Churned' },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight text-white uppercase">
            Leads & Customers
          </h1>
          <p className="text-xs sm:text-sm text-[#8A8A8A] mt-1 font-normal">
            Manage contact records, RFM health metrics, and lifecycle stages
          </p>
        </div>

        {/* Primary Action Button (White pill button with specular glow) */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <a
            href="/api/export/customers.csv"
            download="customers.csv"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full white-btn-glow font-bold text-xs tracking-wide transition-all"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* Filter and Search Bar Card with Studio Bevel Lighting */}
      <div className="p-5 sm:p-6 rounded-[28px] card-sheen space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Pill Search Input with Inset Depth */}
          <div className="relative flex-1 max-w-full md:max-w-md">
            <Search className="w-4 h-4 text-[#8A8A8A] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full input-sheen text-xs sm:text-sm text-white placeholder-[#666666] outline-none transition-all"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#8A8A8A] shrink-0" />
            <span className="text-xs font-semibold text-[#8A8A8A] shrink-0">Sort:</span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="px-3.5 py-2 rounded-full pill-dark-sheen text-xs font-semibold text-white outline-none focus:border-[#B8F55A]"
            >
              <option value="totalSpent_desc">Highest Spend (₹)</option>
              <option value="totalSpent_asc">Lowest Spend (₹)</option>
              <option value="orders_desc">Most Orders</option>
              <option value="orders_asc">Fewest Orders</option>
              <option value="health_desc">Health Score (High)</option>
              <option value="health_asc">Health Score (Low)</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
            </select>
          </div>
        </div>

        {/* Pill Filter Chips (Active chip is glowing Lime #B8F55A) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          {segments.map((seg) => (
            <button
              key={seg.id}
              onClick={() => {
                setSegment(seg.id);
                setPage(1);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 ${
                segment === seg.id
                  ? 'lime-btn-glow'
                  : 'pill-dark-sheen text-[#A0A0A0] hover:text-white'
              }`}
            >
              {seg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Lead Table Card with Studio Lighting */}
      <div className="p-5 sm:p-6 rounded-[28px] card-sheen overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider">
            Showing {customers.length} of {total} Records
          </span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-[#262626] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#262626] text-[#8A8A8A] flex items-center justify-center mx-auto">
              <User className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">No records found</h3>
            <p className="text-xs text-[#8A8A8A] max-w-sm mx-auto">
              Try adjusting your search query or segment filter.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSegment('all');
              }}
              className="px-4 py-2 rounded-full bg-[#B8F55A] text-black font-bold text-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead>
                <tr className="border-b border-[#2B2B2B] text-[#8A8A8A] font-semibold">
                  <th className="pb-3 pl-2">Lead / Customer</th>
                  <th className="pb-3">Location & Phone</th>
                  <th className="pb-3 text-center">Orders</th>
                  <th className="pb-3">Total Spend</th>
                  <th className="pb-3">Segment</th>
                  <th className="pb-3">Health & Priority</th>
                  <th className="pb-3 text-right pr-2">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#24252D] font-medium">
                {customers.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-[#20222A]/70 transition-colors rounded-xl group"
                  >
                    {/* Name & Avatar */}
                    <td className="py-3.5 pl-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.avatarUrl}
                          alt={c.fullName}
                          className="w-10 h-10 rounded-full object-cover bg-[#22242B] border border-white/10 shrink-0 shadow-sm"
                        />
                        <div className="truncate max-w-[150px] sm:max-w-[220px]">
                          <Link
                            to={`/customers/${c.id}`}
                            className="font-bold text-sm text-white group-hover:text-[#B8F55A] transition-colors block truncate"
                          >
                            {c.fullName}
                          </Link>
                          <span className="text-[11px] text-[#8A8A8A] block truncate">
                            {c.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Location & Phone */}
                    <td className="py-3.5 text-[#A0A0A0]">
                      <div className="truncate max-w-[130px] font-medium text-white">{c.city ? `${c.city}, ${c.state || 'IN'}` : 'India'}</div>
                      <span className="text-[11px] text-[#8A8A8A]">{c.phone || 'No phone'}</span>
                    </td>

                    {/* Orders count */}
                    <td className="py-3.5 text-center font-bold text-white">
                      <span className="px-2.5 py-1 rounded-full pill-dark-sheen text-white text-[11px]">
                        {c.ordersCount}
                      </span>
                    </td>

                    {/* Total Spend */}
                    <td className="py-3.5 font-bold text-white whitespace-nowrap text-sm drop-shadow-sm">
                      ₹{c.totalSpent.toLocaleString('en-IN')}
                    </td>

                    {/* Segment Badge */}
                    <td className="py-3.5 whitespace-nowrap">
                      <SegmentBadge segment={c.segment} />
                    </td>

                    {/* Health Score & Indicator Dots */}
                    <td className="py-3.5 whitespace-nowrap">
                      <HealthScorePill score={c.healthScore} />
                    </td>

                    {/* View Profile Action: Circular Arrow Button from reference UI */}
                    <td className="py-3.5 text-right pr-2 whitespace-nowrap">
                      <Link
                        to={`/customers/${c.id}`}
                        className="inline-flex w-8 h-8 rounded-full circle-btn-sheen items-center justify-center transition-all ml-auto"
                        title="View Lead Profile"
                      >
                        <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#262730] pt-5 mt-4 text-xs">
          <span className="text-[#8A8A8A]">
            Page {page} of {totalPages} ({total} total records)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-full pill-dark-sheen text-[#EDEDED] disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setPage(num)}
                className={`w-8 h-8 rounded-full font-bold text-xs transition-all ${
                  page === num
                    ? 'lime-btn-glow'
                    : 'pill-dark-sheen text-[#8A8A8A] hover:text-white'
                }`}
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-full pill-dark-sheen text-[#EDEDED] disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
