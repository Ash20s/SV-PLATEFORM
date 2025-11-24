import { X } from 'lucide-react';
import CreateTeamForm from './CreateTeamForm';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { useI18n } from '@/i18n/i18n';

interface CreateTeamModalProps {
  onClose: () => void;
}

export default function CreateTeamModal({ onClose }: CreateTeamModalProps) {
  const { isAuthenticated, setUser, token } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useI18n();

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-card border border-border rounded-xl shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{t('teams.create')}</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                {t('team.create.must.login')}
              </p>
              <button
                onClick={() => {
                  onClose();
                  navigate('/login');
                }}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold hover:bg-primary/90"
              >
                {t('nav.login')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Créer votre équipe</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Remplissez les informations pour créer votre équipe
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <CreateTeamForm
            onCreated={async () => {
              // Recharger les données utilisateur pour obtenir le teamId mis à jour
              if (isAuthenticated && token) {
                try {
                  const userData = await authService.getCurrentUser();
                  setUser(userData.user);
                  // Invalider le cache pour forcer le rechargement
                  queryClient.invalidateQueries({ queryKey: ['user-teams'] });
                  queryClient.invalidateQueries({ queryKey: ['teams'] });
                } catch (error) {
                  console.error('Error reloading user data:', error);
                }
              }
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}

