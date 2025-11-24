import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useI18n } from '@/i18n/i18n';
import { Trophy, Users, Swords, BarChart3, Briefcase, CalendarPlus, ShieldCheck, LogIn, MessageSquare } from 'lucide-react';
import ProfileMenu from '@/components/profile/ProfileMenu';

export default function Navbar() {
  const { isAuthenticated, user } = useAuthStore();
  const { t } = useI18n();
  const isOrganizer = user?.role === 'organizer' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  return (
    <nav className="bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-primary">
            SUPERVIVE
          </Link>

          <div className="flex items-center gap-6">
            <Link to="/teams" className="flex items-center gap-2 hover:text-primary">
              <Users size={18} />
              <span>{t('nav.teams')}</span>
            </Link>
            <Link to="/scrims" className="flex items-center gap-2 hover:text-primary">
              <Swords size={18} />
              <span>{t('nav.scrims')}</span>
            </Link>
            <Link to="/tournaments" className="flex items-center gap-2 hover:text-primary">
              <Trophy size={18} />
              <span>{t('nav.tournaments')}</span>
            </Link>
            {!isAuthenticated && (
              <Link to="/stats" className="flex items-center gap-2 hover:text-primary">
                <BarChart3 size={18} />
                <span>{t('nav.stats')}</span>
              </Link>
            )}
            <Link to="/mercato" className="flex items-center gap-2 hover:text-primary">
              <Briefcase size={18} />
              <span>{t('nav.mercato')}</span>
            </Link>
            <Link to="/community" className="flex items-center gap-2 hover:text-primary">
              <MessageSquare size={18} />
              <span>{t('nav.community')}</span>
            </Link>
            
            {isOrganizer && (
              <Link to="/organizer" className="flex items-center gap-2 hover:text-primary text-yellow-500">
                <CalendarPlus size={18} />
                <span>{t('nav.organizer')}</span>
              </Link>
            )}
            
            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-2 hover:text-primary text-red-500">
                <ShieldCheck size={18} />
                <span>{t('nav.admin')}</span>
              </Link>
            )}
            
            {/* Bouton Login / Menu Profil - En haut à droite */}
            <div className="ml-auto">
              {isAuthenticated ? (
                <ProfileMenu />
              ) : (
                <Link 
                  to="/login" 
                  className="flex items-center gap-2 hover:bg-primary/90 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
                >
                  <LogIn size={18} />
                  <span>{t('nav.login')}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
