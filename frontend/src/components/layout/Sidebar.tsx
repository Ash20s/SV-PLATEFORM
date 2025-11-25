import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Home, Trophy, Users, Swords, BarChart3, Briefcase, Calendar, CalendarPlus, ShieldCheck, User } from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  const isOrganizer = user?.role === 'organizer' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/scrims', icon: Swords, label: 'Scrims' },
    { path: '/tournaments', icon: Trophy, label: 'Tournaments' },
    { path: '/leaderboard', icon: BarChart3, label: 'Leaderboard' },
    { path: '/teams', icon: Users, label: 'Teams' },
    { path: '/mercato', icon: Briefcase, label: 'Recruitment' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-20 bg-[hsla(256,33%,6%,1)] border-r border-[hsla(255,32%,10%,1)] flex flex-col items-center py-6 z-50">
      {/* Logo en haut */}
      <Link to="/" className="mb-12 group">
        <div className="w-12 h-12 bg-primary clip-corner-sm flex items-center justify-center transform transition-transform group-hover:scale-110 shadow-lg shadow-primary/30">
          <span className="text-2xl font-bold text-white">SV</span>
        </div>
      </Link>

      {/* Navigation principale */}
      <nav className="flex-1 flex flex-col items-center gap-4 w-full px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                w-14 h-14 clip-corner-sm flex items-center justify-center
                transition-all duration-200 relative group
                ${isActive(item.path) 
                  ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5 hover:border hover:border-primary/20'
                }
              `}
              title={item.label}
            >
              <Icon size={24} />
              
              {/* Tooltip */}
              <div className="absolute left-full ml-4 px-3 py-2 bg-card border border-border rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                <span className="text-sm font-semibold">{item.label}</span>
              </div>
            </Link>
          );
        })}

        {/* Organizer button */}
        {isOrganizer && (
          <Link
            to="/organizer"
            className={`
              w-14 h-14 clip-corner-sm flex items-center justify-center
              transition-all duration-200 relative group mt-4
              ${isActive('/organizer') 
                ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/50 border-2 border-yellow-500' 
                : 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 border-2 border-transparent hover:border-yellow-500/30'
              }
            `}
            title="Organizer"
          >
            <CalendarPlus size={24} />
            
            <div className="absolute left-full ml-4 px-3 py-2 bg-card border border-border rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
              <span className="text-sm font-semibold">Organizer</span>
            </div>
          </Link>
        )}

        {/* Admin button */}
        {isAdmin && (
          <Link
            to="/admin"
            className={`
              w-14 h-14 clip-corner-sm flex items-center justify-center
              transition-all duration-200 relative group
              ${isActive('/admin') 
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/50 border-2 border-red-500' 
                : 'text-red-400 hover:text-red-300 hover:bg-red-500/10 border-2 border-transparent hover:border-red-500/30'
              }
            `}
            title="Admin"
          >
            <ShieldCheck size={24} />
            
            <div className="absolute left-full ml-4 px-3 py-2 bg-card border border-border rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
              <span className="text-sm font-semibold">Admin</span>
            </div>
          </Link>
        )}
      </nav>

      {/* Profile en bas */}
      <div className="mt-auto">
        {isAuthenticated ? (
          <Link
            to="/profile"
            className={`
              w-14 h-14 clip-corner-sm flex items-center justify-center
              transition-all duration-200 relative group
              ${isActive('/profile') 
                ? 'bg-primary text-white shadow-lg shadow-primary/50 border-2 border-primary' 
                : 'text-gray-400 hover:text-white hover:bg-white/5 border-2 border-transparent hover:border-primary/30'
              }
            `}
            title="Profile"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <User size={24} />
            )}
            
            <div className="absolute left-full ml-4 px-3 py-2 bg-card border border-border rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
              <span className="text-sm font-semibold">Profile</span>
            </div>
          </Link>
        ) : (
          <Link
            to="/login"
            className="w-14 h-14 clip-corner-sm flex items-center justify-center bg-primary text-white hover:bg-primary/80 transition-all relative group shadow-lg shadow-primary/50 border-2 border-primary"
            title="Login"
          >
            <User size={24} />
            
            <div className="absolute left-full ml-4 px-3 py-2 bg-card border border-border rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
              <span className="text-sm font-semibold">Login</span>
            </div>
          </Link>
        )}
      </div>
    </aside>
  );
}

