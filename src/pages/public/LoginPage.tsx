import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('demo123');
  const [portal, setPortal] = useState<'MEMBER' | 'ADMIN' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const p = searchParams.get('portal');
    if (p === 'ADMIN' || p === 'MEMBER') {
      setPortal(p);
      setEmail(p === 'ADMIN' ? 'admin@seedcoop.demo' : 'john@seedcoop.demo');
    } else {
      setPortal(null);
    }
  }, [searchParams]);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    if (!portal) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, portal })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Login successful');
        navigate(portal === 'MEMBER' ? '/member/dashboard' : '/admin/dashboard');
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectPortal = (selected: 'MEMBER' | 'ADMIN') => {
    setSearchParams({ portal: selected });
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-ivory-50">
      <div className="max-w-md w-full bg-white rounded-[14px] shadow-sm border border-ink-200 p-8 space-y-8">
        {!portal ? (
          <>
            <div>
              <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-seed-950">
                Sign in to your account
              </h2>
              <p className="mt-2 text-center text-sm text-ink-600">
                Select a portal to continue.
              </p>
            </div>
            <div className="mt-8">
              <div className="grid grid-cols-1 gap-4">
                <button onClick={() => selectPortal('MEMBER')} className="w-full inline-flex justify-center py-4 px-4 border border-ink-200 rounded-[8px] shadow-sm bg-white text-sm font-medium text-ink-800 hover:bg-ink-50 transition-colors">
                  Continue as Member
                </button>
                <button onClick={() => selectPortal('ADMIN')} className="w-full inline-flex justify-center py-4 px-4 border border-ink-200 rounded-[8px] shadow-sm bg-white text-sm font-medium text-ink-800 hover:bg-ink-50 transition-colors">
                  Continue as Admin
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-seed-950">
                {portal === 'ADMIN' ? 'Admin Portal' : 'Member Portal'} Sign In
              </h2>
              <p className="mt-2 text-center text-sm text-ink-600">
                Sign in with demo credentials to continue.
              </p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email address</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border border-ink-200 rounded-[8px] focus:ring-2 focus:ring-seed-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 border border-ink-200 rounded-[8px] focus:ring-2 focus:ring-seed-500 outline-none" />
                </div>
              </div>

              <div>
                <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-[10px] shadow-sm text-sm font-medium text-white bg-seed-800 hover:bg-seed-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-seed-500 disabled:opacity-50 transition-colors">
                  Sign in
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
