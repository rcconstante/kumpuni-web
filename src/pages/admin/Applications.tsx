import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle,
  ExternalLink,
  Image as ImageIcon,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react';
import {
  BusinessApplication,
  BusinessCategory,
  deleteBusinessListing,
  fetchBusinessApplications,
  getPaymentProofSignedUrl,
  updateApplicationData,
  updateBusinessApplicationStatus,
} from '../../data/businesses';
import { useRequireAdmin } from '../../lib/adminAuth';
import { safeHttpUrl } from '../../lib/safeUrl';
import { supabase } from '../../lib/supabase';
import { AdminLayout } from './AdminLayout';

type StatusFilter = 'all' | 'pending' | 'verified' | 'rejected';

export default function AdminApplicationsPage() {
  const { ready } = useRequireAdmin();
  const [apps, setApps] = useState<BusinessApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<BusinessApplication | null>(null);
  const [editing, setEditing] = useState<BusinessApplication | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const reload = async () => {
    setLoading(true);
    const data = await fetchBusinessApplications();
    setApps(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!ready) return;
    reload();
    const channel = supabase
      .channel('admin:applications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'businesses' },
        () => reload()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [ready]);

  const filtered = useMemo(() => {
    return apps.filter((a) => {
      if (filter !== 'all' && a.status !== filter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q)
      );
    });
  }, [apps, filter, search]);

  const updateStatus = async (id: string, status: 'verified' | 'rejected') => {
    setBusyId(id);
    setError('');
    try {
      const updated = await updateBusinessApplicationStatus(id, status);
      setApps((prev) => prev.map((a) => (a.id === id ? updated ?? a : a)));
      if (selected?.id === id && updated) setSelected(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  const deleteApp = async (id: string) => {
    if (!window.confirm('Delete this application? This cannot be undone.')) return;
    setError('');
    try {
      await deleteBusinessListing(id);
      setApps((prev) => prev.filter((a) => a.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const saveEdit = async (updated: BusinessApplication) => {
    setSaving(true);
    setError('');
    try {
      const result = await updateApplicationData(updated.id, updated);
      setApps((prev) => prev.map((a) => (a.id === updated.id ? result ?? a : a)));
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (!ready) return null;

  const pendingCount = apps.filter((a) => a.status === 'pending').length;
  const verifiedCount = apps.filter((a) => a.status === 'verified').length;

  return (
    <AdminLayout active="applications" pendingCount={pendingCount} businessCount={verifiedCount}>
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
              onChange={(e) => setFilter(e.target.value as StatusFilter)}
              className="px-3 py-2 bg-white border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6DBE75]/30"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  <th className="text-left font-semibold text-[#374151] px-6 py-4">Business</th>
                  <th className="text-left font-semibold text-[#374151] px-6 py-4">Highlight</th>
                  <th className="text-left font-semibold text-[#374151] px-6 py-4">Category</th>
                  <th className="text-left font-semibold text-[#374151] px-6 py-4">Location</th>
                  <th className="text-left font-semibold text-[#374151] px-6 py-4">Contact</th>
                  <th className="text-left font-semibold text-[#374151] px-6 py-4">Description</th>
                  <th className="text-left font-semibold text-[#374151] px-6 py-4">Payment</th>
                  <th className="text-left font-semibold text-[#374151] px-6 py-4">Submitted</th>
                  <th className="text-left font-semibold text-[#374151] px-6 py-4">Status</th>
                  <th className="text-left font-semibold text-[#374151] px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr key={app.id} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors align-top">
                    <td className="px-6 py-4 min-w-[220px]">
                      <div className="flex items-center gap-3">
                        {app.logoUrl ? (
                          <img
                            src={app.logoUrl}
                            alt={app.name}
                            className="w-11 h-11 rounded-lg object-contain border border-[#E5E7EB] bg-white"
                          />
                        ) : (
                          <div className="w-11 h-11 bg-[#E8F5E9] rounded-lg flex items-center justify-center text-sm font-bold text-[#2E7D32]">
                            {app.name[0]}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-[#1F2937]">{app.name}</div>
                          {(() => {
                            const safe = safeHttpUrl(app.googleMapsUrl);
                            return safe ? (
                              <a
                                href={safe}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[#6DBE75] hover:underline inline-flex items-center gap-1 mt-0.5"
                              >
                                <ExternalLink size={11} /> Map
                              </a>
                            ) : (
                              <span className="text-xs text-[#9CA3AF]">No map link</span>
                            );
                          })()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {app.imageUrl ? (
                        <img
                          src={app.imageUrl}
                          alt={`${app.name} highlight`}
                          className="w-20 h-14 rounded-lg object-cover border border-[#E5E7EB]"
                        />
                      ) : (
                        <div className="w-20 h-14 rounded-lg border border-dashed border-[#E5E7EB] flex items-center justify-center text-[#9CA3AF]">
                          <ImageIcon size={16} />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-[#E8F5E9] text-[#2E7D32] text-xs font-semibold px-2.5 py-1 rounded-full">
                        {app.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-[#6B7280]">
                        <MapPin size={14} />
                        <div>
                          <div className="text-sm">{app.city}, {app.country}</div>
                          <div className="text-xs text-[#9CA3AF]">{app.address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-[#6B7280]">
                        <div className="flex items-center gap-1.5">
                          <Phone size={13} />
                          <span className="text-xs">{app.phone || '—'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Mail size={13} />
                          <span className="text-xs">{app.email || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-[260px]">
                      <p className="text-xs text-[#6B7280] line-clamp-3">
                        {app.description || <span className="italic text-[#9CA3AF]">No description provided</span>}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <PaymentProofCell app={app} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-[#6B7280]">
                        {new Date(app.submittedAt).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-[#9CA3AF]">
                        {new Date(app.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 flex-wrap">
                        <button
                          onClick={() => setSelected(app)}
                          className="text-[#6B7280] hover:text-[#1F2937] px-2.5 py-1.5 rounded-lg hover:bg-[#F3F4F6] text-xs font-medium transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => { setEditing({ ...app }); setError(''); }}
                          className="p-1.5 text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F3F4F6] rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => deleteApp(app.id)}
                          className="p-1.5 text-[#6B7280] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                        {app.status !== 'verified' && (
                          <button
                            disabled={busyId === app.id}
                            onClick={() => updateStatus(app.id, 'verified')}
                            className="text-green-700 hover:bg-green-50 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                          >
                            <CheckCircle size={13} className="inline mr-0.5" />
                            Verify
                          </button>
                        )}
                        {app.status !== 'rejected' && (
                          <button
                            disabled={busyId === app.id}
                            onClick={() => updateStatus(app.id, 'rejected')}
                            className="text-red-700 hover:bg-red-50 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                          >
                            <XCircle size={13} className="inline mr-0.5" />
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && filtered.length === 0 && (
            <div className="text-center py-12 text-[#9CA3AF]">No applications found</div>
          )}
          {loading && (
            <div className="text-center py-12 text-[#9CA3AF]">Loading…</div>
          )}
        </div>
      </div>

      {selected && (
        <DetailModal
          app={selected}
          busy={busyId === selected.id}
          onClose={() => setSelected(null)}
          onUpdate={updateStatus}
        />
      )}

      {editing && (
        <EditModal
          app={editing}
          saving={saving}
          error={error}
          onChange={setEditing}
          onSave={() => saveEdit(editing)}
          onClose={() => { setEditing(null); setError(''); }}
        />
      )}
    </AdminLayout>
  );
}

const CATEGORIES: BusinessCategory[] = ['Home', 'Plumbing', 'Electronics', 'Car', 'Appliances', 'HVAC'];

function EditModal({
  app, saving, error, onChange, onSave, onClose,
}: {
  app: BusinessApplication;
  saving: boolean;
  error: string;
  onChange: (a: BusinessApplication) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const set = (patch: Partial<BusinessApplication>) => onChange({ ...app, ...patch });
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-[#1F2937]">Edit Application — {app.name}</h2>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#1F2937] p-1 rounded-lg hover:bg-[#F3F4F6]">
            <XCircle size={22} />
          </button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <EField label="Business Name *" value={app.name} onChange={(v) => set({ name: v })} />
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-1">Category</label>
              <select value={app.category} onChange={(e) => set({ category: e.target.value as BusinessCategory })}
                className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6DBE75]/30">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <EField label="Address" value={app.address} onChange={(v) => set({ address: v })} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <EField label="City" value={app.city} onChange={(v) => set({ city: v })} />
            <EField label="Country" value={app.country} onChange={(v) => set({ country: v })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <EField label="Phone" value={app.phone} onChange={(v) => set({ phone: v })} />
            <EField label="Email" value={app.email} onChange={(v) => set({ email: v })} />
          </div>
          <EField label="Description" value={app.description} onChange={(v) => set({ description: v })} multiline />
          <EField label="Google Maps Link" value={app.googleMapsUrl} onChange={(v) => set({ googleMapsUrl: v })} />

          <div className="p-4 bg-[#F0FDF4] rounded-xl border border-[#BBF7D0]">
            <p className="text-xs font-semibold text-[#2E7D32] uppercase tracking-wider mb-3">📍 Coordinates</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1">Latitude</label>
                <input type="number" step="any" min="-90" max="90" value={app.lat ?? ''}
                  onChange={(e) => set({ lat: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g. 14.5995"
                  className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#6DBE75]/30" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1">Longitude</label>
                <input type="number" step="any" min="-180" max="180" value={app.lng ?? ''}
                  onChange={(e) => set({ lng: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g. 120.9842"
                  className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#6DBE75]/30" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <EField label="Hours" value={app.hours ?? ''} onChange={(v) => set({ hours: v })} placeholder="e.g. Mon-Sat 8am-6pm" />
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-1">Status</label>
              <select value={app.status} onChange={(e) => set({ status: e.target.value as BusinessApplication['status'] })}
                className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6DBE75]/30">
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-[#374151] cursor-pointer">
            <input type="checkbox" checked={!!app.isPremium} onChange={(e) => set({ isPremium: e.target.checked })} className="accent-[#6DBE75] w-4 h-4" />
            <span className="font-medium">Premium / Highlighted listing</span>
          </label>

          <div className="pt-4 flex gap-3">
            <button type="submit" disabled={saving}
              className="flex-1 bg-[#6DBE75] hover:bg-[#5CAE65] text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 bg-white border border-[#E5E7EB] text-[#374151] font-semibold py-2.5 rounded-xl text-sm hover:bg-[#F9FAFB] transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EField({ label, value, onChange, multiline, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#374151] mb-1">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} placeholder={placeholder}
          className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6DBE75]/30 resize-none" />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6DBE75]/30" />
      )}
    </div>
  );
}

function DetailModal({
  app,
  busy,
  onClose,
  onUpdate,
}: {
  app: BusinessApplication;
  busy: boolean;
  onClose: () => void;
  onUpdate: (id: string, status: 'verified' | 'rejected') => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1F2937]">{app.name}</h2>
            <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#1F2937]">
              <XCircle size={22} />
            </button>
          </div>
          <p className="text-sm text-[#6B7280] mt-1 break-all">{app.id}</p>
        </div>
        <div className="p-6 space-y-5">
          <DetailRow label="Category" value={app.category} />
          <DetailRow label="Address" value={app.address || '—'} />
          <DetailRow label="City / Country" value={`${app.city || '—'}, ${app.country || '—'}`} />
          <DetailRow label="Phone" value={app.phone || '—'} />
          <DetailRow label="Email" value={app.email || '—'} />
          <DetailRow label="Description" value={app.description || '—'} />
          {app.logoUrl && (
            <ImageBlock label="Business Logo" src={app.logoUrl} aspect="contain" height="h-28 w-28" />
          )}
          {app.imageUrl && (
            <ImageBlock label="Highlight Picture" src={app.imageUrl} aspect="cover" height="h-44 w-full" />
          )}
          <div>
            <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Google Maps</span>
            {(() => {
              const safe = safeHttpUrl(app.googleMapsUrl);
              return safe ? (
                <a
                  href={safe}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[#6DBE75] hover:underline mt-1 text-sm break-all"
                >
                  <ExternalLink size={14} />
                  {safe}
                </a>
              ) : (
                <p className="text-sm text-[#9CA3AF] mt-1">No valid map link</p>
              );
            })()}
          </div>
          <DetailRow label="Coordinates" value={`${app.lat}, ${app.lng}`} />
          <DetailRow label="Submitted" value={new Date(app.submittedAt).toLocaleString()} />
          <DetailRow label="Payment Reference" value={app.paymentReference || '—'} />
          <PaymentProofViewer path={app.paymentProofPath} />

          <div className="pt-4 border-t border-[#E5E7EB]">
            <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider block mb-3">Actions</span>
            <div className="flex gap-3">
              {app.status !== 'verified' && (
                <button
                  disabled={busy}
                  onClick={() => onUpdate(app.id, 'verified')}
                  className="flex-1 bg-[#6DBE75] hover:bg-[#5CAE65] text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60"
                >
                  <CheckCircle size={16} className="inline mr-1.5" />
                  Verify Business
                </button>
              )}
              {app.status !== 'rejected' && (
                <button
                  disabled={busy}
                  onClick={() => onUpdate(app.id, 'rejected')}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 font-semibold py-2.5 rounded-xl text-sm transition-colors border border-red-200 disabled:opacity-60"
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
  );
}

function ImageBlock({ label, src, aspect, height }: { label: string; src: string; aspect: 'cover' | 'contain'; height: string }) {
  const safe = safeHttpUrl(src);
  if (!safe) return null;
  return (
    <div>
      <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">{label}</span>
      <img
        src={safe}
        alt={label}
        className={`mt-2 ${height} rounded-xl border border-[#E5E7EB] bg-white object-${aspect}`}
      />
    </div>
  );
}

function PaymentProofCell({ app }: { app: BusinessApplication }) {
  if (!app.paymentProofPath) {
    return <span className="text-xs text-[#9CA3AF]">—</span>;
  }
  return (
    <div className="text-xs text-[#374151]">
      <div className="font-medium">{app.paymentReference || 'Uploaded'}</div>
      <span className="text-[#9CA3AF]">View in detail</span>
    </div>
  );
}

function PaymentProofViewer({ path }: { path?: string }) {
  const [signed, setSigned] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (!path) {
      setSigned(null);
      return;
    }
    setLoading(true);
    setErr('');
    getPaymentProofSignedUrl(path, 120)
      .then((url) => {
        if (cancelled) return;
        if (!url) setErr('Could not load payment proof.');
        setSigned(url);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [path]);

  if (!path) return null;
  return (
    <div>
      <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Payment Proof</span>
      {loading && <p className="text-sm text-[#6B7280] mt-1">Loading…</p>}
      {err && <p className="text-sm text-red-600 mt-1">{err}</p>}
      {signed && /\.pdf(\?|$)/i.test(signed) ? (
        <a
          href={signed}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[#6DBE75] hover:underline mt-1 inline-flex items-center gap-1"
        >
          <ExternalLink size={14} /> Open PDF (link expires)
        </a>
      ) : signed ? (
        <img
          src={signed}
          alt="Payment proof"
          className="mt-2 max-h-72 w-full object-contain rounded-xl border border-[#E5E7EB] bg-white"
        />
      ) : null}
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
      <p className="text-sm text-[#1F2937] mt-1 font-medium whitespace-pre-wrap">{value}</p>
    </div>
  );
}
