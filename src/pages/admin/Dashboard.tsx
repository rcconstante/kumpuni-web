import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Store, Users, LogOut, Settings } from 'lucide-react';
import { MOCK_APPLICATIONS } from '../../data/mockApplications';

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  const isAuth = localStorage.getItem('kumpuni_admin');
  if (!isAuth) {
    navigate('/admin');
    return null;
  }

  const pending = MOCK_APPLICATIONS.filter((a) => a.status === 'pending');
  const verified = MOCK_APPLICATIONS.filter((a) => a.status === 'verified');
  const rejected = MOCK_APPLICATIONS.filter((a) => a.status === 'rejected');

  const logout = () => {
    localStorage.removeItem('kumpuni_admin');
    navigate('/admin');
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
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active onClick={() => navigate('/admin/dashboard')} />
          <SidebarItem icon={ClipboardList} label="Applications" count={pending.length} onClick={() => navigate('/admin/applications')} />
          <SidebarItem icon={Store} label="Businesses" count={verified.length} onClick={() => navigate('/admin/businesses')} />
          <SidebarItem icon={Settings} label="Settings" onClick={() => navigate('/admin/settings')} />
        </nav>
        <div className="p-4 border-t border-[#E5E7EB]">
          <button onClick={logout} className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-[#6B7280] hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-[#E5E7EB] p-4 flex items-center justify-between">
          <span className="font-bold text-[#1F2937]">Dashboard</span>
          <button onClick={logout} className="text-[#6B7280]">
            <LogOut size={20} />
          </button>
        </div>

        <div className="p-6 lg:p-10 max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-[#1F2937] mb-8">Dashboard Overview</h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            <StatCard label="Total Applications" value={MOCK_APPLICATIONS.length} color="bg-[#E8F5E9] text-[#2E7D32]" />
            <StatCard label="Pending Review" value={pending.length} color="bg-[#FFF8E1] text-[#F57F17]" />
            <StatCard label="Verified" value={verified.length} color="bg-[#E3F2FD] text-[#1565C0]" />
            <StatCard label="Rejected" value={rejected.length} color="bg-[#FCE4EC] text-[#C62828]" />
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <button
              onClick={() => navigate('/admin/applications')}
              className="bg-white border border-[#E5E7EB] rounded-2xl p-6 text-left hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <ClipboardList size={24} className="text-[#F57F17]" />
                <span className="text-sm font-semibold text-[#F57F17] bg-[#FFF8E1] px-2.5 py-1 rounded-full">
                  {pending.length} pending
                </span>
              </div>
              <h3 className="font-bold text-[#1F2937] text-lg">Review Applications</h3>
              <p className="text-sm text-[#6B7280] mt-1">Verify or reject new business submissions</p>
            </button>

            <button
              onClick={() => navigate('/admin/businesses')}
              className="bg-white border border-[#E5E7EB] rounded-2xl p-6 text-left hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <Store size={24} className="text-[#1565C0]" />
                <span className="text-sm font-semibold text-[#1565C0] bg-[#E3F2FD] px-2.5 py-1 rounded-full">
                  {verified.length} active
                </span>
              </div>
              <h3 className="font-bold text-[#1F2937] text-lg">Manage Businesses</h3>
              <p className="text-sm text-[#6B7280] mt-1">Edit, update, or remove verified listings</p>
            </button>
          </div>
        </div>
      </main>
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
        <span className="bg-[#6DBE75] text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </button>
  );
}

function StatCard({ label, value, color }: any) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
      <div className={`w-10 h-10 ${color.split(' ')[0]} rounded-xl flex items-center justify-center mb-3`}>
        <Users size={20} className={color.split(' ')[1]} />
      </div>
      <p className="text-3xl font-extrabold text-[#1F2937]">{value}</p>
      <p className="text-sm text-[#6B7280] mt-1">{label}</p>
    </div>
  );
}
