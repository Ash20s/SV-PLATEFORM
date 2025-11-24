import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Users, Settings, Trophy, Award, Plus } from 'lucide-react';
import axios from 'axios';
import TeamEditor from '../components/profile/TeamEditor';
import { useAuthStore } from '../stores/authStore';
import CreateTeamModal from '../components/team/CreateTeamModal';
import { authService } from '../services/authService';
import { useI18n } from '../i18n/i18n';

const API_URL = 'http://localhost:5000/api';

export default function TeamManagementPage() {
  const { t } = useI18n();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const { user: currentUser, token, isAuthenticated, setUser } = useAuthStore();
  const queryClient = useQueryClient();

  // Recharger les données utilisateur si teamId est présent mais pas dans le store
  useEffect(() => {
    const reloadUser = async () => {
      if (isAuthenticated && token && (!currentUser?.teamId || !currentUser?.role)) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData.user);
        } catch (error) {
          console.error('Error reloading user data:', error);
        }
      }
    };
    reloadUser();
  }, [isAuthenticated, token, currentUser?.teamId, currentUser?.role, setUser]);

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['user-teams', currentUser?.id, currentUser?.teamId],
    queryFn: async () => {
      if (!currentUser?.id) throw new Error('Not authenticated');
      
      // Si l'utilisateur a un teamId, récupérer directement cette équipe
      if (currentUser.teamId) {
        try {
          const response = await axios.get(`${API_URL}/teams/${currentUser.teamId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          return [response.data.team];
        } catch (error) {
          console.error('Error fetching user team:', error);
        }
      }
      
      // Sinon, récupérer toutes les équipes et filtrer
      const response = await axios.get(`${API_URL}/teams`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const teamsData = response.data.teams || response.data.data || response.data || [];
      
      // Filter teams where user is captain or member
      return teamsData.filter((team: any) => {
        const captainId = team.captain?._id || team.captain;
        const isCaptain = captainId === currentUser.id || captainId?.toString() === currentUser.id?.toString();
        const isMember = team.roster?.some((member: any) => {
          const memberId = member.player?._id || member.player || member._id;
          return memberId === currentUser.id || memberId?.toString() === currentUser.id?.toString();
        });
        return isCaptain || isMember;
      });
    },
    enabled: !!currentUser?.id && !!token
  });

  const { data: selectedTeam, isLoading: teamLoading } = useQuery({
    queryKey: ['team', selectedTeamId],
    queryFn: async () => {
      if (!selectedTeamId) return null;
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/profile/team/${selectedTeamId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    enabled: !!selectedTeamId
  });

  if (teamsLoading) {
    return <div className="text-center py-8">{t('team.management.loading')}</div>;
  }

  if (!teams || teams.length === 0) {
    return (
      <div className="card-game p-12 text-center">
        <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-400 mb-4">{t('team.management.not.part')}</p>
        <div className="flex gap-4 justify-center flex-wrap">
          {isAuthenticated && !currentUser?.teamId && (
            <button
              onClick={() => setShowCreateTeamModal(true)}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              {t('teams.create')}
            </button>
          )}
          <a href="/teams" className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-secondary/90 transition-colors inline-flex items-center gap-2">
            <Users className="w-5 h-5" />
            {t('team.management.browse.teams')}
          </a>
        </div>

        {/* Modal de création d'équipe */}
        {showCreateTeamModal && (
          <CreateTeamModal
            onClose={() => setShowCreateTeamModal(false)}
          />
        )}
      </div>
    );
  }

  const currentTeam = selectedTeam || teams[0];
  const captainId = currentTeam?.captain?._id || currentTeam?.captain;
  const isCaptain = captainId?.toString() === currentUser?.id?.toString() || captainId === currentUser?.id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-gradient-primary">{t('team.management.title')}</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {isAuthenticated && !currentUser?.teamId && (
            <button
              onClick={() => setShowCreateTeamModal(true)}
              className="bg-accent text-accent-foreground px-6 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Créer mon équipe
            </button>
          )}
          {isCaptain && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={isEditing ? 'btn-secondary' : 'btn-primary'}
            >
              <Settings className="w-5 h-5 mr-2" />
              {isEditing ? t('team.management.view') : t('team.management.edit')}
            </button>
          )}
        </div>
      </div>

      {/* Team Selector */}
      {teams.length > 1 && (
        <div className="card-game p-4">
          <label className="block text-sm font-medium mb-2">{t('team.management.select.team')}</label>
          <select
            value={selectedTeamId || teams[0]._id}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="input-game w-full"
          >
            {teams.map((team: any) => (
              <option key={team._id} value={team._id}>
                {team.name} ({team.tag})
              </option>
            ))}
          </select>
        </div>
      )}

      {teamLoading ? (
        <div className="text-center py-8">Loading team...</div>
      ) : isEditing && isCaptain ? (
        <TeamEditor team={currentTeam} isCaptain={isCaptain} />
      ) : (
        <div className="space-y-6">
          {/* Team Banner & Logo */}
          <div className="card-game overflow-hidden">
            <div 
              className="h-48"
              style={{ 
                backgroundColor: currentTeam.primaryColor || '#00FFC6',
                backgroundImage: currentTeam.banner 
                  ? `url(${currentTeam.banner})` 
                  : `linear-gradient(135deg, ${currentTeam.primaryColor || '#00FFC6'}, ${currentTeam.secondaryColor || '#19F9A9'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            
            <div className="p-6 -mt-16 relative">
              <div 
                className="w-32 h-32 rounded-full border-4 overflow-hidden"
                style={{ 
                  borderColor: currentTeam.primaryColor || '#00FFC6',
                  backgroundColor: currentTeam.secondaryColor || '#19F9A9'
                }}
              >
                {currentTeam.logo ? (
                  <img src={currentTeam.logo} alt={currentTeam.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold" style={{ color: currentTeam.primaryColor || '#00FFC6' }}>
                    {currentTeam.tag}
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">{currentTeam.name}</h2>
                  <span className="badge-accent">{currentTeam.tag}</span>
                  {isCaptain && (
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-lg text-sm font-semibold">
                      👑 Captain
                    </span>
                  )}
                </div>
                <p className="text-gray-400">{currentTeam.tier || 'Amateur'}</p>
                {!isCaptain && (
                  <p className="text-sm text-muted-foreground mt-1">Member</p>
                )}
              </div>
              
              {currentTeam.description && (
                <p className="mt-4 text-gray-300">{currentTeam.description}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="stat-card">
              <Trophy className="w-6 h-6 text-primary mb-2" />
              <p className="text-2xl font-bold">{currentTeam.stats?.wins || 0}</p>
              <p className="text-sm text-gray-400">Wins</p>
            </div>
            
            <div className="stat-card">
              <Trophy className="w-6 h-6 text-accent mb-2" />
              <p className="text-2xl font-bold">{currentTeam.stats?.losses || 0}</p>
              <p className="text-sm text-gray-400">Losses</p>
            </div>
            
            <div className="stat-card">
              <Award className="w-6 h-6 text-primary mb-2" />
              <p className="text-2xl font-bold">{currentTeam.stats?.tournamentsWon || 0}</p>
              <p className="text-sm text-gray-400">Tournaments Won</p>
            </div>
            
            <div className="stat-card">
              <Award className="w-6 h-6 text-accent mb-2" />
              <p className="text-2xl font-bold">{currentTeam.stats?.elo || 1000}</p>
              <p className="text-sm text-gray-400">ELO Rating</p>
            </div>
          </div>

          {/* Roster */}
          <div className="card-game p-6">
            <h3 className="text-xl font-bold text-gradient-primary mb-4">Roster</h3>
            <div className="space-y-3">
              {currentTeam.roster && currentTeam.roster.map((member: any) => (
                <div key={member._id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <div 
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent overflow-hidden"
                    style={member.profile?.avatar ? { backgroundImage: `url(${member.profile.avatar})`, backgroundSize: 'cover' } : {}}
                  >
                    {!member.profile?.avatar && (
                      <div className="w-full h-full flex items-center justify-center text-background font-bold">
                        {member.username[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold">{member.username}</p>
                      {currentUser?.id === (member._id || member.player?._id) && (
                        <span className="px-2 py-0.5 bg-primary/20 text-primary rounded text-xs">
                          (You)
                        </span>
                      )}
                    </div>
                    {member._id === currentTeam.captain._id || member._id === currentTeam.captain || 
                     (currentTeam.captain?._id && member._id === currentTeam.captain._id) ? (
                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded text-xs font-semibold">
                        👑 Captain
                      </span>
                    ) : (
                      <p className="text-sm text-gray-400">Player</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          {currentTeam.achievements && currentTeam.achievements.length > 0 && (
            <div className="card-game p-6">
              <h3 className="text-xl font-bold text-gradient-primary mb-4">Achievements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentTeam.achievements.map((achievement: any, idx: number) => (
                  <div key={idx} className="p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Award className="w-8 h-8 text-primary flex-shrink-0" />
                      <div>
                        <p className="font-bold">{achievement.title}</p>
                        <p className="text-sm text-gray-400">{achievement.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(achievement.earnedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Socials */}
          {(currentTeam.socials?.twitter || currentTeam.socials?.discord || currentTeam.socials?.website || currentTeam.socials?.twitch || currentTeam.socials?.youtube) && (
            <div className="card-game p-6">
              <h3 className="text-xl font-bold text-gradient-primary mb-4">Social Links</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {currentTeam.socials.twitter && (
                  <a href={`https://twitter.com/${currentTeam.socials.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent transition-colors">
                    Twitter: {currentTeam.socials.twitter}
                  </a>
                )}
                {currentTeam.socials.discord && (
                  <a href={currentTeam.socials.discord} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent transition-colors">
                    Discord
                  </a>
                )}
                {currentTeam.socials.website && (
                  <a href={currentTeam.socials.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent transition-colors">
                    Website
                  </a>
                )}
                {currentTeam.socials.twitch && (
                  <a href={`https://twitch.tv/${currentTeam.socials.twitch}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent transition-colors">
                    Twitch: {currentTeam.socials.twitch}
                  </a>
                )}
                {currentTeam.socials.youtube && (
                  <a href={`https://youtube.com/@${currentTeam.socials.youtube}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent transition-colors">
                    YouTube: {currentTeam.socials.youtube}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Recruitment */}
          {currentTeam.lookingForPlayers && (
            <div className="card-game p-6 border-2 border-accent">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-accent" />
                <h3 className="text-xl font-bold text-accent">Recruiting Players!</h3>
              </div>
              {currentTeam.requiredRoles && currentTeam.requiredRoles.length > 0 && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">Looking for:</p>
                  <div className="flex flex-wrap gap-2">
                    {currentTeam.requiredRoles.map((role: string) => (
                      <span key={role} className="badge-accent">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal de création d'équipe */}
      {showCreateTeamModal && (
        <CreateTeamModal
          onClose={async () => {
            setShowCreateTeamModal(false);
            // Recharger les données utilisateur et invalider le cache
            if (isAuthenticated && token) {
              try {
                const userData = await authService.getCurrentUser();
                setUser(userData.user);
                queryClient.invalidateQueries({ queryKey: ['user-teams'] });
              } catch (error) {
                console.error('Error reloading user data:', error);
              }
            }
          }}
        />
      )}
    </div>
  );
}
