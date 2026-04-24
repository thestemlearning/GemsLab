import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Gem, LogOut, Plus, Search, FileText, LayoutDashboard, Database } from 'lucide-react';
import { cn } from '../lib/utils';

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (!user) return null;

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/new-report', label: 'New Report', icon: Plus },
    { to: '/reports', label: 'All Reports', icon: FileText },
    { to: '/reprint', label: 'Reprint Module', icon: Search },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Database size={18} className="text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight uppercase">Gems Lab</span>
      </div>
      
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link 
                key={item.to}
                to={item.to} 
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                  isActive 
                    ? "bg-emerald-600 text-white" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold uppercase border-2 border-emerald-500">
            {profile?.email?.substring(0, 2).toUpperCase() || '??'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">{profile?.email}</p>
            <p className="text-xs text-slate-500 capitalize">{profile?.role} Account</p>
          </div>
        </div>
        <button 
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-900/10 rounded-md transition-colors text-sm font-medium"
        >
          <LogOut size={16} />
          Logout System
        </button>
      </div>
    </aside>
  );
}
