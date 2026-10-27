import React from 'react';
import {
  Navigation,
  Bus,
  Clock,
  BarChart3,
  Shield,
  User,
  LogOut,
  Sparkles
} from 'lucide-react';

const Navbar = ({
  activeTab,
  setActiveTab,
  user,
  onOpenAuth,
  onLogout
}) => {
  const navTabs = [
    { id: 'planner', label: 'Route Planner', icon: Navigation },
    { id: 'tracking', label: 'Live Tracking', icon: Bus, badge: 'Live' },
    { id: 'scheduling', label: 'Bus Scheduling', icon: Clock, badge: 'New' },
    { id: 'analytics', label: 'Demand Analytics', icon: BarChart3 },
    { id: 'admin', label: 'Admin Center', icon: Shield, adminBadge: true }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-lg text-slate-900">
                  TRANSIT<span className="text-blue-600">.AI</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
                  MERN
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Intelligent Public Transport Optimization
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/80">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-white text-blue-600 shadow-xs border border-slate-200/90 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>

                  {tab.badge === 'Live' && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse">
                      Live
                    </span>
                  )}
                  {tab.badge === 'New' && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                      New
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Auth & System Status */}
          <div className="flex items-center gap-3">
            {/* System Online Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Online</span>
            </div>

            {/* Auth Profile / Login */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-2xl px-2.5 py-1 shadow-2xs">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs text-white ${
                    user.role === 'admin' ? 'bg-amber-600' : 'bg-blue-600'
                  }`}>
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[100px]">{user.name}</p>
                    <span className={`text-[10px] font-bold uppercase ${
                      user.role === 'admin' ? 'text-amber-700' : 'text-blue-600'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In </span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-between overflow-x-auto py-2 border-t border-slate-200 no-scrollbar gap-1.5">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
                  isActive ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
