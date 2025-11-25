import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useI18n } from '@/i18n/i18n';
import { Trophy, Users, Swords, BarChart3, Briefcase, Calendar, CalendarPlus, ShieldCheck, LogIn, MessageSquare } from 'lucide-react';
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

          <div className="flex items-center gap-8">
            <Link to="/" className="text-sm font-semibold hover:text-primary transition-colors uppercase tracking-wide">
              HOME
            </Link>
            <Link to="/scrims" className="text-sm font-semibold hover:text-primary transition-colors uppercase tracking-wide">
              SCRIMS
            </Link>
            <Link to="/tournaments" className="text-sm font-semibold hover:text-primary transition-colors uppercase tracking-wide">
              TOURNAMENTS
            </Link>
            <Link to="/leaderboard" className="text-sm font-semibold hover:text-primary transition-colors uppercase tracking-wide">
              LEADERBOARD
            </Link>
            <Link to="/teams" className="text-sm font-semibold hover:text-primary transition-colors uppercase tracking-wide">
              TEAMS
            </Link>
            <Link to="/mercato" className="text-sm font-semibold hover:text-primary transition-colors uppercase tracking-wide">
              RECRUITMENT
            </Link>
            <Link to="/calendar" className="text-sm font-semibold hover:text-primary transition-colors uppercase tracking-wide">
              CALENDAR
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
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-6 py-2 rounded-lg font-bold transition-all uppercase tracking-wide text-sm"
                >
                  LOGIN
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
