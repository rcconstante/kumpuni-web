import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Store,
  Settings,
  CheckCircle,
  XCircle,
  LogOut,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  Search,
} from 'lucide-react';
import { MOCK_APPLICATIONS, BusinessApplication } from '../../data/mockApplications';

export default function AdminApplicationsPage() {
  const navigate = useNavigate();
  const [apps, setApps] = useState<BusinessApplication[]>(MOCK_APPLICATIONS);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<BusinessApplication | null>(null);

  const isAuth = localStorage.getItem('kumpuni_admin');
  if (!isAuth) {
    navigate('/admin');
    return null;
  }

  const filtered = apps.filter((a) => {
    if (filter !== 'all' && a.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const updateStatus = (id: string, status: 'verified' | 'rejected') => {
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    if (selected?.id === id) setSelected(null);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#E5E7EB] hidden md:flex flex-col">
        <div className="p-6 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Kumpuni" className="w-9 h-9 rounded-lg" />
            <span className="font-bold text-[#1F2937]">Kumpuni Admin</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" onClick={() => navigate('/admin/dashboard')} />
          <SidebarItem icon={ClipboardList} label="Applications" active count={apps.filter(a => a.status === 'pending').length} onClick={() => navigate('/admin/applications')} />
          <SidebarItem icon={Store} label="Businesses" onClick={() => navigate('/admin/businesses')} />
          <SidebarItem icon={Settings} label="Settings" onClick={() => navigate('/admin/settings')} />
        </nav>
        <div className="p-4 border-t border-[#E5E7EB]">
          <button
            onClick={() => { localStorage.removeItem('kumpuni_admin'); navigate('/admin'); }}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-[#6B7280] hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[#1F2937]">Business Applications</h1>
              <p className="text-sm text-[#6B7280] mt-1">Review and verify submitted businesses</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="pl-9 pr-4 py-2 bg-white border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6DBE75]/30 w-48"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 bg-white border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6DBE75]/30"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                    <th className="text-left font-semibold text-[#374151] px-6 py-4">Business</th>
                    <th className="text-left font-semibold text-[#374151] px-6 py-4">Category</th>
                    <th className="text-left font-semibold text-[#374151] px-6 py-4">Location</th>
                    <th className="text-left font-semibold text-[#374151] px-6 py-4">Contact</th>
                    <th className="text-left font-semibold text-[#374151] px-6 py-4">Status</th>
                    <th className="text-left font-semibold text-[#374151] px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((app) => (
                    <tr key={app.id} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {app.imageUrl ? (
                            <img
                              src={app.imageUrl}
                              alt={app.name}
                              className="w-10 h-10 rounded-lg object-cover border border-[#E5E7EB]"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-[#E8F5E9] rounded-lg flex items-center justify-center text-sm font-bold text-[#2E7D32]">
                              {app.name[0]}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-[#1F2937]">{app.name}</div>
                            <div className="text-xs text-[#9CA3AF]">{app.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-[#E8F5E9] text-[#2E7D32] text-xs font-semibold px-2.5 py-1 rounded-full">
                          {app.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-[#6B7280]">
                          <MapPin size={14} />
                          {app.city}, {app.country}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-[#6B7280]">
                          <div className="flex items-center gap-1.5">
                            <Phone size={13} />
                            <span className="text-xs">{app.phone}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Mail size={13} />
                            <span className="text-xs">{app.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelected(app)}
                            className="text-[#6B7280] hover:text-[#1F2937] px-3 py-1.5 rounded-lg hover:bg-[#F3F4F6] text-xs font-medium transition-colors"
                          >
                            View
                          </button>
                          {app.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateStatus(app.id, 'verified')}
                                className="text-green-700 hover:bg-green-50 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                              >
                                <CheckCircle size={14} className="inline mr-1" />
                                Verify
                              </button>
                              <button
                                onClick={() => updateStatus(app.id, 'rejected')}
                                className="text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                              >
                                <XCircle size={14} className="inline mr-1" />
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-[#9CA3AF]">No applications found</div>
            )}
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-[#E5E7EB]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#1F2937]">{selected.name}</h2>
                <button onClick={() => setSelected(null)} className="text-[#9CA3AF] hover:text-[#1F2937]">
                  <XCircle size={22} />
                </button>
              </div>
              <p className="text-sm text-[#6B7280] mt-1">{selected.id}</p>
            </div>
            <div className="p-6 space-y-5">
              <DetailRow label="Category" value={selected.category} />
              <DetailRow label="Address" value={selected.address} />
              <DetailRow label="City" value={`${selected.city}, ${selected.country}`} />
              <DetailRow label="Phone" value={selected.phone} />
              <DetailRow label="Email" value={selected.email} />
              <DetailRow label="Description" value={selected.description} />
              {selected.imageUrl && (
                <div>
                  <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Business Image</span>
                  <img
                    src={selected.imageUrl}
                    alt={selected.name}
                    className="mt-2 w-full h-44 rounded-xl object-cover border border-[#E5E7EB]"
                  />
                </div>
              )}
              <div>
                <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Google Maps</span>
                <a
                  href={selected.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[#6DBE75] hover:underline mt-1 text-sm"
                >
                  <ExternalLink size={14} />
                  Open in Google Maps
                </a>
              </div>
              <DetailRow label="Coordinates" value={`${selected.lat}, ${selected.lng}`} />
              <DetailRow label="Submitted" value={new Date(selected.submittedAt).toLocaleDateString()} />

              <div className="pt-4 border-t border-[#E5E7EB]">
                <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider block mb-3">Actions</span>
                <div className="flex gap-3">
                  {selected.status !== 'verified' && (
                    <button
                      onClick={() => updateStatus(selected.id, 'verified')}
                      className="flex-1 bg-[#6DBE75] hover:bg-[#5CAE65] text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
                    >
                      <CheckCircle size={16} className="inline mr-1.5" />
                      Verify Business
                    </button>
                  )}
                  {selected.status !== 'rejected' && (
                    <button
                      onClick={() => updateStatus(selected.id, 'rejected')}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 font-semibold py-2.5 rounded-xl text-sm transition-colors border border-red-200"
                    >
                      <XCircle size={16} className="inline mr-1.5" />
                      Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-[#FFF8E1] text-[#F57F17]',
    verified: 'bg-[#E8F5E9] text-[#2E7D32]',
    rejected: 'bg-[#FCE4EC] text-[#C62828]',
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">{label}</span>
      <p className="text-sm text-[#1F2937] mt-1 font-medium">{value}</p>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, active, count, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-[#6DBE75]/10 text-[#6DBE75]'
          : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#374151]'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} />
        {label}
      </div>
      {count !== undefined && count > 0 && (
        <span className="bg-[#6DBE75] text-white text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>
      )}
    </button>
  );
}
