import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Store,
  LogOut,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  Search,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import { MOCK_APPLICATIONS, BusinessApplication } from '../../data/mockApplications';

export default function AdminBusinessesPage() {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<BusinessApplication[]>(
    MOCK_APPLICATIONS.filter((a) => a.status === 'verified')
  );
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<BusinessApplication | null>(null);

  const isAuth = localStorage.getItem('kumpuni_admin');
  if (!isAuth) {
    navigate('/admin');
    return null;
  }

  const filtered = businesses.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.email.toLowerCase().includes(q) ||
      b.city.toLowerCase().includes(q)
    );
  });

  const updateBusiness = (updated: BusinessApplication) => {
    setBusinesses((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    setEditing(null);
  };

  const deleteBusiness = (id: string) => {
    setBusinesses((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#E5E7EB] hidden md:flex flex-col">
        <div className="p-6 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#6DBE75] rounded-lg flex items-center justify-center">
              <Store size={18} className="text-white" />
            </div>
            <span className="font-bold text-[#1F2937]">Kumpuni Admin</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" onClick={() => navigate('/admin/dashboard')} />
          <SidebarItem icon={ClipboardList} label="Applications" onClick={() => navigate('/admin/applications')} />
          <SidebarItem icon={Store} label="Businesses" active count={businesses.length} onClick={() => navigate('/admin/businesses')} />
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
              <h1 className="text-2xl font-bold text-[#1F2937]">Verified Businesses</h1>
              <p className="text-sm text-[#6B7280] mt-1">Manage active business listings</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search businesses..."
                  className="pl-9 pr-4 py-2 bg-white border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6DBE75]/30 w-48"
                />
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((biz) => (
              <div key={biz.id} className="bg-white border border-[#E5E7EB] rounded-2xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-[#E8F5E9] rounded-xl flex items-center justify-center text-lg font-bold text-[#2E7D32]">
                    {biz.name[0]}
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setEditing(biz)}
                      className="p-2 text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F3F4F6] rounded-lg transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => deleteBusiness(biz.id)}
                      className="p-2 text-[#6B7280] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-[#1F2937] mb-1">{biz.name}</h3>
                <span className="inline-block bg-[#E8F5E9] text-[#2E7D32] text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
                  {biz.category}
                </span>

                <div className="space-y-1.5 text-sm text-[#6B7280]">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} />
                    {biz.city}, {biz.country}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone size={14} />
                    {biz.phone}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail size={14} />
                    {biz.email}
                  </div>
                </div>

                <a
                  href={biz.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[#6DBE75] hover:underline text-sm mt-3 font-medium"
                >
                  <ExternalLink size={14} />
                  Open in Google Maps
                </a>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-[#9CA3AF]">No verified businesses found</div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#1F2937]">Edit Business</h2>
              <button onClick={() => setEditing(null)} className="text-[#9CA3AF] hover:text-[#1F2937]">
                <X size={22} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateBusiness(editing);
              }}
              className="p-6 space-y-4"
            >
              <Field label="Business Name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
              <Field label="Category" value={editing.category} onChange={(v) => setEditing({ ...editing, category: v })} />
              <Field label="Address" value={editing.address} onChange={(v) => setEditing({ ...editing, address: v })} />
              <Field label="City" value={editing.city} onChange={(v) => setEditing({ ...editing, city: v })} />
              <Field label="Country" value={editing.country} onChange={(v) => setEditing({ ...editing, country: v })} />
              <Field label="Phone" value={editing.phone} onChange={(v) => setEditing({ ...editing, phone: v })} />
              <Field label="Email" value={editing.email} onChange={(v) => setEditing({ ...editing, email: v })} />
              <Field label="Google Maps URL" value={editing.googleMapsUrl} onChange={(v) => setEditing({ ...editing, googleMapsUrl: v })} />
              <Field label="Latitude" value={String(editing.lat)} onChange={(v) => setEditing({ ...editing, lat: parseFloat(v) || 0 })} />
              <Field label="Longitude" value={String(editing.lng)} onChange={(v) => setEditing({ ...editing, lng: parseFloat(v) || 0 })} />

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-[#6DBE75] hover:bg-[#5CAE65] text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="flex-1 bg-white border border-[#E5E7EB] text-[#374151] font-semibold py-2.5 rounded-xl text-sm hover:bg-[#F9FAFB] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#374151] mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6DBE75]/30 focus:border-[#6DBE75]"
      />
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
