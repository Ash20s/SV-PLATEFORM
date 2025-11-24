import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Trophy, Swords, Calendar } from 'lucide-react';
import CreateTournamentModal from '@/components/organizer/CreateTournamentModal';
import CreateScrimModal from '@/components/organizer/CreateScrimModal';
import { useI18n } from '@/i18n/i18n';

export default function Organizer() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [showTournamentModal, setShowTournamentModal] = useState(false);
  const [showScrimModal, setShowScrimModal] = useState(false);

  // Vérifier que l'utilisateur est organizer ou admin
  if (user?.role !== 'organizer' && user?.role !== 'admin') {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-4">{t('organizer.access.denied')}</h1>
        <p className="text-muted-foreground">
          {t('organizer.access.denied.desc')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t('organizer.dashboard')}</h1>
        <p className="text-muted-foreground">
          {t('organizer.dashboard.desc')}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => setShowTournamentModal(true)}
          className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-2 border-yellow-500/20 hover:border-yellow-500/50 rounded-lg p-8 text-left transition-all group"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-yellow-500/10 p-4 rounded-lg group-hover:bg-yellow-500/20 transition-colors">
              <Trophy size={32} className="text-yellow-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{t('organizer.create.tournament')}</h2>
              <p className="text-muted-foreground">{t('organizer.create.tournament.desc')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-yellow-500 font-semibold">
            <Plus size={20} />
            <span>{t('organizer.new.tournament')}</span>
          </div>
        </button>

        <button
          onClick={() => setShowScrimModal(true)}
          className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-2 border-blue-500/20 hover:border-blue-500/50 rounded-lg p-8 text-left transition-all group"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-500/10 p-4 rounded-lg group-hover:bg-blue-500/20 transition-colors">
              <Swords size={32} className="text-blue-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{t('organizer.create.scrim')}</h2>
              <p className="text-muted-foreground">{t('organizer.create.scrim.desc')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-blue-500 font-semibold">
            <Plus size={20} />
            <span>{t('organizer.new.scrim')}</span>
          </div>
        </button>
      </div>

      {/* My Events */}
      <section>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Calendar size={24} />
          {t('organizer.my.events')}
        </h2>
        <div className="bg-card p-6 rounded-lg border border-border">
          <p className="text-muted-foreground text-center py-8">
            {t('organizer.events.empty')}
          </p>
        </div>
      </section>

      {/* Modals */}
      {showTournamentModal && (
        <CreateTournamentModal onClose={() => setShowTournamentModal(false)} />
      )}
      {showScrimModal && (
        <CreateScrimModal onClose={() => setShowScrimModal(false)} />
      )}
    </div>
  );
}
