import { ChangeEvent, useEffect, useState } from 'react';
import {
  ExternalLink,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import {
  BusinessApplication,
  BusinessCategory,
  createBusinessListing,
  deleteBusinessListing,
  fetchVerifiedBusinesses,
  updateBusinessListing,
  uploadAdminImage,
} from '../../data/businesses';
import { useRequireAdmin } from '../../lib/adminAuth';
import { safeHttpUrl, safeImageUrl } from '../../lib/safeUrl';
import { supabase } from '../../lib/supabase';
import { AdminLayout } from './AdminLayout';

const CATEGORIES: BusinessCategory[] = [
  'Home', 'Plumbing', 'Electronics', 'Car', 'Appliances', 'HVAC',
];

const EMPTY: Omit<BusinessApplication, 'id' | 'submittedAt'> = {
  name: '',
  category: 'Home',
  address: '',
  city: '',
  country: 'Philippines',
  phone: '',
  email: '',
  description: '',
  googleMapsUrl: '',
  lat: 14.5995,
  lng: 120.9842,
  logoUrl: '',
  imageUrl: '',
  hours: '',
  isPremium: false,
  rating: 5.0,
  reviews: 0,
  status: 'verified',
};

type EditState = BusinessApplication | (Omit<BusinessApplication, 'id' | 'submittedAt'> & { id?: undefined });

export default function AdminBusinessesPage() {
  const { ready } = useRequireAdmin();
  const [businesses, setBusinesses] = useState<BusinessApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<EditState | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<'logoUrl' | 'imageUrl' | null>(null);
  const [sortCol, setSortCol] = useState<'name' | 'category' | 'city' | 'rating' | 'submittedAt'>('submittedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const reload = async () => {
    setLoading(true);
    const data = await fetchVerifiedBusinesses();
    setBusinesses(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!ready) return;
    reload();
    const channel = supabase
      .channel('admin:businesses')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'businesses' }, reload)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [ready]);

  if (!ready) return null;

  const handleSort = (col: typeof sortCol) => {
    if (sortCol === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortCol(col); setSortDir('asc'); }
  };

  const sorted = [...businesses]
    .filter((b) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        b.name.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q) ||
        b.country.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let av: string | number = '';
      let bv: string | number = '';
      if (sortCol === 'name') { av = a.name; bv = b.name; }
      else if (sortCol === 'category') { av = a.category; bv = b.category; }
      else if (sortCol === 'city') { av = a.city; bv = b.city; }
      else if (sortCol === 'rating') { av = a.rating ?? 0; bv = b.rating ?? 0; }
      else { av = a.submittedAt; bv = b.submittedAt; }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const saveBusiness = async (data: EditState) => {
    setSaving(true);
    setError('');
    try {
      if (!data.id) {
        await createBusinessListing(data as Parameters<typeof createBusinessListing>[0]);
      } else {
        await updateBusinessListing(data.id, data as BusinessApplication);
      }
      await reload();
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const removeBusiness = async (id: string) => {
    if (!window.confirm('Delete this business? This cannot be undone.')) return;
    setError('');
    try {
      await deleteBusinessListing(id);
      setBusinesses((prev) => prev.filter((b) => b.id !== id));
      if ((editing as BusinessApplication)?.id === id) setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const onImageUpload = async (field: 'logoUrl' | 'imageUrl', e: ChangeEvent<HTMLInputElement>) => {
    if (!editing) return;
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadingField(field);
    setError('');
    try {
      const url = await uploadAdminImage(file, field === 'logoUrl' ? 'logo' : 'highlight');
      setEditing({ ...editing, [field]: url });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingField(null);
    }
  };

  const openCreate = () => {
    setIsNew(true);
    setEditing({ ...EMPTY });
    setError('');
  };

  const SortTh = ({ col, label }: { col: typeof sortCol; label: string }) => (
    <th
      onClick={() => handleSort(col)}
      className="text-left font-semibold text-[#374151] px-3 py-3 whitespace-nowrap cursor-pointer select-none hover:bg-[#F0FDF4] transition-colors"
    >
      {label}
      {sortCol === col && (
        <span className="ml-1 text-[#6DBE75]">{sortDir === 'asc' ? '▲' : '▼'}</span>
      )}
    </th>
  );

  return (
    <AdminLayout active="businesses" businessCount={businesses.length}>
      <div className="p-4 lg:p-8 max-w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1F2937]">Verified Businesses</h1>
            <p className="text-sm text-[#6B7280] mt-1">
              {businesses.length} listing{businesses.length !== 1 ? 's' : ''} — manage active businesses
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="pl-9 pr-4 py-2 bg-white border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6DBE75]/30 w-48"
              />
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-[#6DBE75] hover:bg-[#5CAE65] text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
            >
              <Plus size={15} /> Add Business
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
        )}

        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#F9FAFB] border-b-2 border-[#E5E7EB]">
                  <th className="text-center font-semibold text-[#374151] px-3 py-3 w-10">#</th>
                  <th className="text-left font-semibold text-[#374151] px-3 py-3 w-10">Logo</th>
                  <SortTh col="name" label="Business Name" />
                  <SortTh col="category" label="Category" />
                  <th className="text-left font-semibold text-[#374151] px-3 py-3 whitespace-nowrap">Address</th>
                  <SortTh col="city" label="City" />
                  <th className="text-left font-semibold text-[#374151] px-3 py-3 whitespace-nowrap">Country</th>
                  <th className="text-left font-semibold text-[#374151] px-3 py-3 whitespace-nowrap">Phone</th>
                  <th className="text-left font-semibold text-[#374151] px-3 py-3 whitespace-nowrap">Email</th>
                  <th className="text-left font-semibold text-[#374151] px-3 py-3 whitespace-nowrap">Lat</th>
                  <th className="text-left font-semibold text-[#374151] px-3 py-3 whitespace-nowrap">Lng</th>
                  <th className="text-left font-semibold text-[#374151] px-3 py-3 whitespace-nowrap">Hours</th>
                  <SortTh col="rating" label="Rating" />
                  <th className="text-left font-semibold text-[#374151] px-3 py-3 whitespace-nowrap">Reviews</th>
                  <th className="text-left font-semibold text-[#374151] px-3 py-3 whitespace-nowrap">Premium</th>
                  <th className="text-left font-semibold text-[#374151] px-3 py-3 whitespace-nowrap">Map</th>
                  <th className="text-left font-semibold text-[#374151] px-3 py-3 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((biz, idx) => (
                  <tr
                    key={biz.id}
                    className={`border-b border-[#F3F4F6] hover:bg-[#F0FDF4] transition-colors align-middle ${idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}`}
                  >
                    <td className="px-3 py-2 text-center text-xs text-[#9CA3AF] font-mono">{idx + 1}</td>
                    <td className="px-3 py-2">
                      {safeImageUrl(biz.logoUrl) ? (
                        <img src={safeImageUrl(biz.logoUrl)!} alt={biz.name} className="w-9 h-9 rounded-lg object-contain border border-[#E5E7EB] bg-white" />
                      ) : (
                        <div className="w-9 h-9 bg-[#E8F5E9] rounded-lg flex items-center justify-center text-xs font-bold text-[#2E7D32]">
                          {biz.name[0]}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 min-w-[160px]">
                      <div className="font-semibold text-[#1F2937] truncate max-w-[180px]">{biz.name}</div>
                    </td>
                    <td className="px-3 py-2">
                      <span className="bg-[#E8F5E9] text-[#2E7D32] text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">{biz.category}</span>
                    </td>
                    <td className="px-3 py-2 text-xs text-[#6B7280] max-w-[160px]">
                      <span className="truncate block">{biz.address || '—'}</span>
                    </td>
                    <td className="px-3 py-2 text-xs text-[#374151] whitespace-nowrap">{biz.city || '—'}</td>
                    <td className="px-3 py-2 text-xs text-[#374151] whitespace-nowrap">{biz.country || '—'}</td>
                    <td className="px-3 py-2 text-xs text-[#374151] whitespace-nowrap font-mono">{biz.phone || '—'}</td>
                    <td className="px-3 py-2 text-xs text-[#374151]">
                      <span className="truncate block max-w-[160px]">{biz.email || '—'}</span>
                    </td>
                    <td className="px-3 py-2 text-xs text-[#6B7280] font-mono whitespace-nowrap">{biz.lat?.toFixed(5) ?? '—'}</td>
                    <td className="px-3 py-2 text-xs text-[#6B7280] font-mono whitespace-nowrap">{biz.lng?.toFixed(5) ?? '—'}</td>
                    <td className="px-3 py-2 text-xs text-[#6B7280] whitespace-nowrap">{biz.hours || '—'}</td>
                    <td className="px-3 py-2">
                      <span className="flex items-center gap-0.5 text-[#F59E0B] font-semibold text-xs">
                        <Star size={12} fill="#F59E0B" />
                        {biz.rating?.toFixed(1) ?? '5.0'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-[#374151] text-center">{biz.reviews ?? 0}</td>
                    <td className="px-3 py-2 text-center">
                      {biz.isPremium
                        ? <span className="bg-[#FFF8E1] text-[#F57F17] text-xs font-semibold px-2 py-0.5 rounded-full">Yes</span>
                        : <span className="text-[#D1D5DB] text-xs">No</span>}
                    </td>
                    <td className="px-3 py-2">
                      {(() => {
                        const safe = safeHttpUrl(biz.googleMapsUrl);
                        return safe
                          ? <a href={safe} target="_blank" rel="noopener noreferrer" className="text-[#6DBE75] hover:text-[#5CAE65]"><ExternalLink size={15} /></a>
                          : <span className="text-[#D1D5DB]">—</span>;
                      })()}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setIsNew(false); setEditing(biz); setError(''); }}
                          className="p-1.5 text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F3F4F6] rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => removeBusiness(biz.id)}
                          className="p-1.5 text-[#6B7280] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && sorted.length === 0 && (
            <div className="text-center py-16 text-[#9CA3AF]">
              {search ? 'No businesses match your search' : 'No verified businesses yet'}
            </div>
          )}
          {loading && <div className="text-center py-16 text-[#9CA3AF]">Loading…</div>}
        </div>

        {!loading && (
          <p className="mt-3 text-xs text-[#9CA3AF]">Showing {sorted.length} of {businesses.length} businesses</p>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-[#1F2937]">
                {isNew ? 'Add New Business' : `Edit — ${(editing as BusinessApplication).name ?? ''}`}
              </h2>
              <button onClick={() => setEditing(null)} className="text-[#9CA3AF] hover:text-[#1F2937] p-1 rounded-lg hover:bg-[#F3F4F6] transition-colors">
                <X size={22} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); saveBusiness(editing); }} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Business Name *" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1">Category *</label>
                  <select
                    value={editing.category}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value as BusinessCategory })}
                    className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6DBE75]/30"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <Field label="Address" value={editing.address} onChange={(v) => setEditing({ ...editing, address: v })} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="City" value={editing.city} onChange={(v) => setEditing({ ...editing, city: v })} />
                <Field label="Country" value={editing.country} onChange={(v) => setEditing({ ...editing, country: v })} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Phone" value={editing.phone} onChange={(v) => setEditing({ ...editing, phone: v })} />
                <Field label="Email" value={editing.email} onChange={(v) => setEditing({ ...editing, email: v })} />
              </div>

              <Field label="Description" value={editing.description} onChange={(v) => setEditing({ ...editing, description: v })} multiline />
              <Field label="Google Maps Link" value={editing.googleMapsUrl} onChange={(v) => setEditing({ ...editing, googleMapsUrl: v })} />

              <div className="p-4 bg-[#F0FDF4] rounded-xl border border-[#BBF7D0]">
                <p className="text-xs font-semibold text-[#2E7D32] uppercase tracking-wider mb-3">📍 Coordinates</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#374151] mb-1">Latitude</label>
                    <input
                      type="number" step="any" min="-90" max="90"
                      value={editing.lat ?? ''}
                      onChange={(e) => setEditing({ ...editing, lat: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#6DBE75]/30"
                      placeholder="e.g. 14.5995"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#374151] mb-1">Longitude</label>
                    <input
                      type="number" step="any" min="-180" max="180"
                      value={editing.lng ?? ''}
                      onChange={(e) => setEditing({ ...editing, lng: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#6DBE75]/30"
                      placeholder="e.g. 120.9842"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Business Hours" value={editing.hours ?? ''} onChange={(v) => setEditing({ ...editing, hours: v })} placeholder="e.g. Mon-Sat 8am-6pm" />
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1">Status</label>
                  <select
                    value={editing.status ?? 'verified'}
                    onChange={(e) => setEditing({ ...editing, status: e.target.value as BusinessApplication['status'] })}
                    className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6DBE75]/30"
                  >
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1">Rating (0–5)</label>
                  <input
                    type="number" step="0.1" min="0" max="5"
                    value={editing.rating ?? 5}
                    onChange={(e) => setEditing({ ...editing, rating: parseFloat(e.target.value) || 5 })}
                    className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6DBE75]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1">Reviews Count</label>
                  <input
                    type="number" min="0"
                    value={editing.reviews ?? 0}
                    onChange={(e) => setEditing({ ...editing, reviews: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6DBE75]/30"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-[#374151] cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!editing.isPremium}
                  onChange={(e) => setEditing({ ...editing, isPremium: e.target.checked })}
                  className="accent-[#6DBE75] w-4 h-4"
                />
                <span className="font-medium">Premium / Highlighted listing</span>
              </label>

              <div className="border-t border-[#E5E7EB] pt-4 space-y-4">
                <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Images</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Field label="Logo URL" value={editing.logoUrl ?? ''} onChange={(v) => setEditing({ ...editing, logoUrl: v })} placeholder="https://..." />
                    <label className="mt-2 block text-xs font-medium text-[#6B7280]">Or upload:</label>
                    <input type="file" accept="image/*" disabled={uploadingField !== null} onChange={(e) => onImageUpload('logoUrl', e)} className="mt-1 w-full border border-dashed border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#6B7280]" />
                    {uploadingField === 'logoUrl' && <p className="text-xs text-[#6B7280] mt-1">Uploading…</p>}
                    {editing.logoUrl && safeImageUrl(editing.logoUrl) && (
                      <img src={safeImageUrl(editing.logoUrl)!} alt="Logo" className="mt-2 w-20 h-20 rounded-xl object-contain border border-[#E5E7EB] bg-white" />
                    )}
                  </div>
                  <div>
                    <Field label="Highlight Picture URL" value={editing.imageUrl ?? ''} onChange={(v) => setEditing({ ...editing, imageUrl: v })} placeholder="https://..." />
                    <label className="mt-2 block text-xs font-medium text-[#6B7280]">Or upload:</label>
                    <input type="file" accept="image/*" disabled={uploadingField !== null} onChange={(e) => onImageUpload('imageUrl', e)} className="mt-1 w-full border border-dashed border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#6B7280]" />
                    {uploadingField === 'imageUrl' && <p className="text-xs text-[#6B7280] mt-1">Uploading…</p>}
                    {editing.imageUrl && safeImageUrl(editing.imageUrl) && (
                      <img src={safeImageUrl(editing.imageUrl)!} alt="Highlight" className="mt-2 w-full h-28 rounded-xl object-cover border border-[#E5E7EB]" />
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3 sticky bottom-0 bg-white pb-1">
                <button
                  type="submit"
                  disabled={saving || uploadingField !== null}
                  className="flex-1 bg-[#6DBE75] hover:bg-[#5CAE65] text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60"
                >
                  {saving ? 'Saving…' : isNew ? 'Create Business' : 'Save Changes'}
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
    </AdminLayout>
  );
}

function Field({
  label, value, onChange, multiline, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#374151] mb-1">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} placeholder={placeholder}
          className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6DBE75]/30 focus:border-[#6DBE75] resize-none" />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6DBE75]/30 focus:border-[#6DBE75]" />
      )}
    </div>
  );
}
