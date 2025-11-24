import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Settings, Users, LogOut, X, ChevronDown, BarChart3 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/i18n/i18n';

export default function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'team' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, user } = useAuthStore();
  const { logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveTab(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    setActiveTab(null);
    navigate('/');
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
        aria-label="Profile menu"
      >
        <div 
          className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold"
          style={
            user.profile?.avatar 
              ? { backgroundImage: `url(http://localhost:5000${user.profile.avatar})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : {}
          }
        >
          {!user.profile?.avatar && user.username[0].toUpperCase()}
        </div>
        <span className="font-semibold hidden md:inline">{user.username}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg"
                  style={
                    user.profile?.avatar 
                      ? { backgroundImage: `url(http://localhost:5000${user.profile.avatar})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                      : {}
                  }
                >
                  {!user.profile?.avatar && user.username[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-lg">{user.username}</p>
                  {user.teamId && (
                    <p className="text-sm text-muted-foreground">
                      {typeof user.teamId === 'object' && user.teamId !== null && 'name' in user.teamId 
                        ? `${t('menu.team.member')} ${(user.teamId as any).name}`
                        : t('team.management.member')}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setActiveTab(null);
                }}
                className="p-1 rounded-lg hover:bg-accent transition-colors"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="p-2">
            {activeTab === null ? (
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors text-left"
                >
                  <User size={20} className="text-primary" />
                  <div>
                    <p className="font-semibold">{t('menu.profile') || 'Mon Profil'}</p>
                    <p className="text-xs text-muted-foreground">{t('menu.profile.desc') || 'Voir et modifier mon profil'}</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('team')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors text-left"
                >
                  <Users size={20} className="text-accent" />
                  <div>
                    <p className="font-semibold">{t('menu.team') || 'Mon Équipe'}</p>
                    <p className="text-xs text-muted-foreground">{t('menu.team.desc') || 'Gérer mon équipe'}</p>
                  </div>
                </button>

                <Link
                  to="/stats"
                  onClick={() => {
                    setIsOpen(false);
                    setActiveTab(null);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors text-left"
                >
                  <BarChart3 size={20} className="text-blue-500" />
                  <div>
                    <p className="font-semibold">{t('menu.stats') || 'Mes Statistiques'}</p>
                    <p className="text-xs text-muted-foreground">{t('menu.stats.desc') || 'Voir mes stats et performances'}</p>
                  </div>
                </Link>

                <Link
                  to="/settings"
                  onClick={() => {
                    setIsOpen(false);
                    setActiveTab(null);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors text-left"
                >
                  <Settings size={20} className="text-muted-foreground" />
                  <div>
                    <p className="font-semibold">{t('settings.title')}</p>
                    <p className="text-xs text-muted-foreground">{t('menu.settings.desc') || 'Paramètres privés du compte'}</p>
                  </div>
                </Link>

                <div className="border-t border-border my-2" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/10 text-destructive transition-colors text-left"
                >
                  <LogOut size={20} />
                  <div>
                    <p className="font-semibold">{t('nav.logout')}</p>
                    <p className="text-xs text-muted-foreground">{t('menu.logout.desc') || 'Se déconnecter du compte'}</p>
                  </div>
                </button>
              </div>
            ) : activeTab === 'profile' ? (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => setActiveTab(null)}
                    className="p-1 rounded-lg hover:bg-accent transition-colors"
                    aria-label="Back"
                  >
                    <ChevronDown size={18} className="rotate-90" />
                  </button>
                  <h3 className="font-bold text-lg">{t('menu.profile') || 'Mon Profil'}</h3>
                </div>
                <div className="space-y-2">
                  <Link
                    to="/my-profile"
                    onClick={() => {
                      setIsOpen(false);
                      setActiveTab(null);
                    }}
                    className="block px-4 py-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <p className="font-semibold">{t('menu.view.profile') || 'Voir mon profil'}</p>
                    <p className="text-xs text-muted-foreground">{t('menu.view.profile.desc') || 'Consulter mes statistiques et informations'}</p>
                  </Link>
                  <Link
                    to="/stats"
                    onClick={() => {
                      setIsOpen(false);
                      setActiveTab(null);
                    }}
                    className="block px-4 py-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <p className="font-semibold">{t('menu.stats') || 'Mes Statistiques'}</p>
                    <p className="text-xs text-muted-foreground">{t('menu.stats.detailed') || 'Voir mes performances détaillées'}</p>
                  </Link>
                </div>
              </div>
            ) : activeTab === 'team' ? (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => setActiveTab(null)}
                    className="p-1 rounded-lg hover:bg-accent transition-colors"
                    aria-label="Back"
                  >
                    <ChevronDown size={18} className="rotate-90" />
                  </button>
                  <h3 className="font-bold text-lg">{t('menu.team') || 'Mon Équipe'}</h3>
                </div>
                <div className="space-y-2">
                  <Link
                    to="/my-team"
                    onClick={() => {
                      setIsOpen(false);
                      setActiveTab(null);
                    }}
                    className="block px-4 py-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <p className="font-semibold">{t('menu.team.manage') || 'Gérer mon équipe'}</p>
                    <p className="text-xs text-muted-foreground">{t('menu.team.manage.desc') || 'Modifier les paramètres de l\'équipe'}</p>
                  </Link>
                  <Link
                    to="/teams"
                    onClick={() => {
                      setIsOpen(false);
                      setActiveTab(null);
                    }}
                    className="block px-4 py-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <p className="font-semibold">{t('menu.team.view.all') || 'Voir toutes les équipes'}</p>
                    <p className="text-xs text-muted-foreground">{t('menu.team.view.all.desc') || 'Explorer les équipes disponibles'}</p>
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

