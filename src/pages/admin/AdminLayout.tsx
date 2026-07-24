import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, Users, FileSignature, Coins, Landmark, FileBarChart, Settings, Mail, ArrowDownCircle, ArrowUpCircle, User, Menu, X } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(res => res.json()).then(data => {
      if (!data.user || data.user.role === 'MEMBER') {
        navigate('/login');
      } else {
        setUser(data.user);
      }
    }).catch(() => navigate('/login'));
  }, [navigate]);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portal: 'ADMIN' })
    });
    toast.success('Signed out');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Applications', path: '/admin/applications', icon: FileSignature },
    { name: 'Members', path: '/admin/members', icon: Users },
    { name: 'Contributions', path: '/admin/contributions', icon: Coins },
    { name: 'Deposits', path: '/admin/deposits', icon: ArrowDownCircle },
    { name: 'Withdrawals', path: '/admin/withdrawals', icon: ArrowUpCircle },
    { name: 'Loans', path: '/admin/loans', icon: Landmark },
    { name: 'Reports', path: '/admin/reports', icon: FileBarChart },
    { name: 'Outbox', path: '/admin/outbox', icon: Mail },
    { name: 'Profile', path: '/admin/profile', icon: User },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  if (!user) return <div className="min-h-screen flex items-center justify-center bg-ink-100">Loading...</div>;

  const currentNav = navItems.find(i => location.pathname.startsWith(i.path))?.name || 'Dashboard';

  return (
    <div className="min-h-screen flex bg-ink-100 text-ink-950 font-sans relative">
      {/* Sidebar Desktop */}
      <aside className="w-64 bg-seed-950 text-white hidden md:flex flex-col flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-seed-800">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-ivory-50 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-seed-950"></div>
            </div>
            <span className="font-semibold tracking-tight">SeedCoop Admin</span>
          </Link>
        </div>
        
        <div className="p-4 border-b border-seed-800">
          <div className="font-medium text-sm text-seed-100 truncate">{user.email}</div>
          <div className="text-xs text-gold-500 font-mono mt-1">{user.role}</div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link key={item.name} to={item.path} className={`flex items-center gap-3 px-3 py-2 rounded-[6px] text-sm font-medium transition-colors ${isActive ? 'bg-seed-800 text-white' : 'text-seed-200 hover:bg-seed-900 hover:text-white'}`}>
                <item.icon className={`w-4 h-4 ${isActive ? 'text-gold-500' : 'text-seed-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-seed-800">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2 rounded-[6px] text-sm font-medium text-seed-200 hover:bg-seed-900 transition-colors">
            <LogOut className="w-4 h-4 text-seed-400" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)} 
          className="fixed inset-0 bg-seed-950/60 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <aside className={`fixed top-0 bottom-0 left-0 w-72 bg-seed-950 text-white z-50 transform transition-transform duration-200 ease-in-out md:hidden flex flex-col ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-seed-800">
          <Link to="/admin/dashboard" className="flex items-center gap-2" onClick={() => setIsMobileOpen(false)}>
            <div className="w-6 h-6 rounded-full bg-ivory-50 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-seed-950"></div>
            </div>
            <span className="font-semibold tracking-tight text-white">SeedCoop Admin</span>
          </Link>
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 text-seed-300 hover:text-white rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-4 border-b border-seed-800 bg-seed-900/50">
          <div className="font-medium text-sm text-seed-100 truncate">{user.email}</div>
          <div className="text-xs text-gold-500 font-mono mt-0.5">{user.role}</div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link 
                key={item.name} 
                to={item.path} 
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-sm font-medium transition-colors ${isActive ? 'bg-seed-800 text-white' : 'text-seed-200 hover:bg-seed-900 hover:text-white'}`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-gold-500' : 'text-seed-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-seed-800 bg-seed-900/50">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-[6px] text-sm font-medium text-seed-200 hover:bg-seed-900 transition-colors">
            <LogOut className="w-5 h-5 text-seed-400" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-ink-200 flex items-center justify-between px-4 sm:px-6 shadow-xs sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="p-2 text-ink-600 hover:text-seed-950 md:hidden rounded-lg hover:bg-ink-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="font-semibold text-lg text-seed-950">{currentNav}</h2>
          </div>
          
          <div className="flex items-center gap-3">
            <Link 
              to="/admin/profile" 
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-seed-50 hover:bg-seed-100 text-seed-900 text-xs font-medium border border-seed-200/50 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-seed-700" />
              <span className="hidden sm:inline">Admin Profile</span>
            </Link>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet context={{ user }} />
        </div>
      </main>
    </div>
  );
}
