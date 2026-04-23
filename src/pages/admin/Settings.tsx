import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Store,
  Settings,
  LogOut,
  Save,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import {
  getBusinessApplications,
  getVerifiedBusinessListings,
} from '../../data/mockApplications';

type AdminCredentials = {
  email: string;
  password: string;
};

type AdminPreferences = {
  notifyPending: boolean;
  weeklyDigest: boolean;
};

const CREDENTIALS_KEY = 'kumpuni_admin_credentials';
const PREFERENCES_KEY = 'kumpuni_admin_preferences';

function getCredentials(): AdminCredentials {
  try {
    const stored = localStorage.getItem(CREDENTIALS_KEY);
    if (!stored) {
      return { email: 'admin@kumpuni.com', password: 'admin123' };
    }
    const parsed = JSON.parse(stored) as Partial<AdminCredentials>;
    return {
      email: parsed.email || 'admin@kumpuni.com',
      password: parsed.password || 'admin123',
    };
  } catch {
    return { email: 'admin@kumpuni.com', password: 'admin123' };
  }
}

function getPreferences(): AdminPreferences {
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (!stored) {
      return { notifyPending: true, weeklyDigest: false };
    }
    const parsed = JSON.parse(stored) as Partial<AdminPreferences>;
    return {
      notifyPending: parsed.notifyPending ?? true,
      weeklyDigest: parsed.weeklyDigest ?? false,
    };
  } catch {
    return { notifyPending: true, weeklyDigest: false };
  }
}

export default function AdminSettingsPage() {
  const navigate = useNavigate();

  const session = localStorage.getItem('kumpuni_admin');
  if (!session) {
    navigate('/admin');
    return null;
  }

  const [creds, setCreds] = useState<AdminCredentials>(() => getCredentials());
  const [prefs, setPrefs] = useState<AdminPreferences>(() => getPreferences());

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const pendingCount = getBusinessApplications().filter(
    (application) => application.status === 'pending'
  ).length;
  const verifiedCount = getVerifiedBusinessListings().length;

  const savePreferences = () => {
    setError('');
    setSuccess('');
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
    setSuccess('Settings saved.');
  };

  const changePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (currentPassword !== creds.password) {
      setError('Current password is incorrect.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    const updated = { ...creds, password: newPassword };
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(updated));
    setCreds(updated);

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSuccess('Password updated successfully.');
  };

  const logout = () => {
    localStorage.removeItem('kumpuni_admin');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex">
      <aside className="w-64 bg-white border-r border-[#E5E7EB] hidden md:flex flex-col">
        <div className="p-6 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Kumpuni" className="w-9 h-9 rounded-lg" />
            <span className="font-bold text-[#1F2937]">Kumpuni Admin</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" onClick={() => navigate('/admin/dashboard')} />
          <SidebarItem
            icon={ClipboardList}
            label="Applications"
            count={pendingCount}
            onClick={() => navigate('/admin/applications')}
          />
          <SidebarItem
            icon={Store}
            label="Businesses"
            count={verifiedCount}
            onClick={() => navigate('/admin/businesses')}
          />
          <SidebarItem icon={Settings} label="Settings" active onClick={() => navigate('/admin/settings')} />
        </nav>
        <div className="p-4 border-t border-[#E5E7EB]">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-[#6B7280] hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1">
        <div className="p-6 lg:p-10 max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-[#1F2937] mb-2">Settings</h1>
          <p className="text-sm text-[#6B7280] mb-8">Manage admin account and security settings.</p>

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-5 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <section className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck size={18} className="text-[#6DBE75]" />
                <h2 className="font-bold text-[#1F2937]">Account</h2>
              </div>
              <label className="block text-sm font-semibold text-[#374151] mb-1.5">Admin Email</label>
              <input
                type="email"
                value={creds.email}
                disabled
                className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#6B7280]"
              />
              <p className="text-xs text-[#9CA3AF] mt-2">
                This demo uses a single admin account.
              </p>
            </section>

            <section className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Save size={18} className="text-[#6DBE75]" />
                <h2 className="font-bold text-[#1F2937]">Preferences</h2>
              </div>

              <label className="flex items-start gap-3 mb-4">
                <input
                  type="checkbox"
                  checked={prefs.notifyPending}
                  onChange={(e) => setPrefs((prev) => ({ ...prev, notifyPending: e.target.checked }))}
                  className="mt-1"
                />
                <div>
                  <p className="text-sm font-semibold text-[#1F2937]">Pending review alerts</p>
                  <p className="text-xs text-[#6B7280]">Show a badge whenever a business needs review.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 mb-5">
                <input
                  type="checkbox"
                  checked={prefs.weeklyDigest}
                  onChange={(e) => setPrefs((prev) => ({ ...prev, weeklyDigest: e.target.checked }))}
                  className="mt-1"
                />
                <div>
                  <p className="text-sm font-semibold text-[#1F2937]">Weekly digest</p>
                  <p className="text-xs text-[#6B7280]">Receive weekly summary insights for your listings.</p>
                </div>
              </label>

              <button
                type="button"
                onClick={savePreferences}
                className="w-full bg-[#6DBE75] hover:bg-[#5CAE65] text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
              >
                Save Preferences
              </button>
            </section>
          </div>

          <section className="bg-white border border-[#E5E7EB] rounded-2xl p-6 mt-5">
            <div className="flex items-center gap-2 mb-4">
              <Lock size={18} className="text-[#6DBE75]" />
              <h2 className="font-bold text-[#1F2937]">Change Password</h2>
            </div>

            <form onSubmit={changePassword} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <PasswordField
                label="Current Password"
                value={currentPassword}
                onChange={setCurrentPassword}
                visible={showCurrent}
                setVisible={setShowCurrent}
              />
              <PasswordField
                label="New Password"
                value={newPassword}
                onChange={setNewPassword}
                visible={showNew}
                setVisible={setShowNew}
              />
              <PasswordField
                label="Confirm Password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                visible={showConfirm}
                setVisible={setShowConfirm}
              />

              <button
                type="submit"
                className="md:col-span-3 w-full md:w-auto bg-[#1F2937] hover:bg-black text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
              >
                Update Password
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  visible,
  setVisible,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  setVisible: (next: boolean) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#374151] mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#6DBE75]/30 focus:border-[#6DBE75]"
          required
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151]"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
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
