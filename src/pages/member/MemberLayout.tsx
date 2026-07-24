import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Home, PieChart, CreditCard, FileText, Bell, User, ArrowDownCircle, ArrowUpCircle, Menu, X } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

export function MemberLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [member, setMember] = useState<any>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(res => res.json()).then(data => {
      if (!data.member) {
        navigate('/login');
      } else {
        setMember(data.member);
      }
    }).catch(() => navigate('/login'));
  }, [navigate]);

  // Close mobile sidebar on navigation
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portal: 'MEMBER' })
    });
    toast.success('Signed out');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/member/dashboard', icon: Home },
    { name: 'Contributions', path: '/member/contributions', icon: PieChart },
    { name: 'Deposits', path: '/member/deposits', icon: ArrowDownCircle },
    { name: 'Withdrawals', path: '/member/withdrawals', icon: ArrowUpCircle },
    { name: 'Loans', path: '/member/loans', icon: CreditCard },
    { name: 'Statements', path: '/member/statements', icon: FileText },
    { name: 'Notifications', path: '/member/notifications', icon: Bell },
    { name: 'Profile', path: '/member/profile', icon: User },
  ];

  if (!member) return <div className="min-h-screen flex items-center justify-center bg-ivory-50">Loading...</div>;

  return (
    <div className="min-h-screen flex bg-ivory-50 text-ink-950 font-sans relative">
      {/* Sidebar Desktop */}
      <aside className="w-64 bg-white border-r border-ink-200 hidden md:flex flex-col flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-ink-200">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-seed-800 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-ivory-50"></div>
            </div>
            <span className="font-semibold tracking-tight text-seed-950">SeedCoop Member</span>
          </Link>
        </div>
        
        <div className="p-4 border-b border-ink-200 bg-seed-50/50">
          <div className="font-medium text-seed-950">{member.firstName} {member.lastName}</div>
          <div className="text-xs text-ink-600 font-mono mt-0.5">Member ID: {member.membershipNumber}</div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link key={item.name} to={item.path} className={`flex items-center gap-3 px-3 py-2 rounded-[8px] text-sm font-medium transition-colors ${isActive ? 'bg-seed-50 text-seed-800' : 'text-ink-600 hover:bg-ink-50 hover:text-ink-950'}`}>
                <item.icon className={`w-4 h-4 ${isActive ? 'text-seed-600' : 'text-ink-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-ink-200">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2 rounded-[8px] text-sm font-medium text-ink-600 hover:bg-ink-50 transition-colors">
            <LogOut className="w-4 h-4 text-ink-400" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)} 
          className="fixed inset-0 bg-seed-950/50 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside className={`fixed top-0 bottom-0 left-0 w-72 bg-white z-50 transform transition-transform duration-200 ease-in-out md:hidden flex flex-col border-r border-ink-200 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-ink-200 bg-ivory-50">
          <Link to="/" className="flex items-center gap-2" onClick={() => setIsMobileOpen(false)}>
            <div className="w-6 h-6 rounded-full bg-seed-800 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-ivory-50"></div>
            </div>
            <span className="font-semibold tracking-tight text-seed-950">SeedCoop</span>
          </Link>
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 text-ink-500 hover:text-ink-950 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-4 border-b border-ink-200 bg-seed-50/60">
          <div className="font-medium text-seed-950">{member.firstName} {member.lastName}</div>
          <div className="text-xs text-ink-600 font-mono mt-0.5">Member ID: {member.membershipNumber}</div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link 
                key={item.name} 
                to={item.path} 
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm font-medium transition-colors ${isActive ? 'bg-seed-50 text-seed-800' : 'text-ink-600 hover:bg-ink-50 hover:text-ink-950'}`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-seed-600' : 'text-ink-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-ink-200 bg-ivory-50">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-[8px] text-sm font-medium text-ink-600 hover:bg-ink-100 transition-colors">
            <LogOut className="w-5 h-5 text-ink-400" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-ink-200 flex items-center justify-between px-4 sm:px-6 md:hidden sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="p-2 text-ink-700 hover:text-seed-950 rounded-lg hover:bg-ink-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-semibold text-seed-950">SeedCoop</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-seed-800 bg-seed-50 px-2.5 py-1 rounded-full border border-seed-200/50">
              {member.firstName} {member.lastName}
            </span>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet context={{ member, refreshMember: () => {
            fetch('/api/auth/me').then(res => res.json()).then(data => { if (data.member) setMember(data.member); });
          } }} />
        </div>
      </main>
    </div>
  );
}
