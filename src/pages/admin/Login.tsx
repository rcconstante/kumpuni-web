import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';

type AdminCredentials = {
  email: string;
  password: string;
};

const CREDENTIALS_KEY = 'kumpuni_admin_credentials';

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

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const credentials = getCredentials();

    if (email === credentials.email && password === credentials.password) {
      setLoading(true);
      setTimeout(() => {
        localStorage.setItem('kumpuni_admin', JSON.stringify({ email, loggedInAt: Date.now() }));
        navigate('/admin/dashboard');
      }, 800);
    } else {
      setError(`Invalid credentials. Use ${credentials.email}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <img src="/logo.png" alt="Kumpuni" className="w-16 h-16 rounded-2xl mx-auto mb-5" />
          <h1 className="text-2xl font-bold text-[#1F2937]">Kumpuni Admin</h1>
          <p className="text-sm text-[#6B7280] mt-1">Business verification portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-[#374151] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@kumpuni.com"
              className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6DBE75]/30 focus:border-[#6DBE75]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#374151] mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-[#6DBE75]/30 focus:border-[#6DBE75]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151]"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6DBE75] hover:bg-[#5CAE65] text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={18} />
                Sign In
              </>
            )}
          </button>

          <p className="text-center text-xs text-[#9CA3AF]">
            Demo default: <span className="font-mono">admin@kumpuni.com</span> / <span className="font-mono">admin123</span>
          </p>
        </form>
      </div>
    </div>
  );
}
