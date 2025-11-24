import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, Settings, Trophy, Calendar } from 'lucide-react';
import axios from 'axios';
import ProfileEditor from '../components/profile/ProfileEditor';
import { useAuthStore } from '../stores/authStore';
import { useI18n } from '../i18n/i18n';

const API_URL = 'http://localhost:5000/api';

export default function ProfilePage() {
  const { t } = useI18n();
  const [isEditing, setIsEditing] = useState(false);
  const { user: currentUser, token } = useAuthStore();

  const { data: user, isLoading } = useQuery({
    queryKey: ['profile', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) throw new Error('Not authenticated');
      const response = await axios.get(`${API_URL}/profile/user/${currentUser.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    enabled: !!currentUser?.id
  });

  if (isLoading) {
    return <div className="text-center py-8">{t('profile.loading')}</div>;
  }

  if (!user) {
    return <div className="text-center py-8">{t('profile.not.found')}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <User className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-gradient-primary">{t('profile.title')}</h1>
        </div>
        
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={isEditing ? 'btn-secondary' : 'btn-primary'}
        >
          <Settings className="w-5 h-5 mr-2" />
          {isEditing ? t('profile.view') : t('profile.edit')}
        </button>
      </div>

      {isEditing ? (
        <ProfileEditor user={user} userId={currentUser?.id || ''} />
      ) : (
        <div className="space-y-6">
          {/* Profile Banner & Avatar */}
          <div className="card-game overflow-hidden">
            <div 
              className="h-48 bg-gradient-to-r from-primary/20 to-accent/20"
              style={user.profile?.banner ? { backgroundImage: `url(http://localhost:5000${user.profile.banner})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
            />
            
            <div className="p-6 -mt-16 relative">
              <div 
                className="w-32 h-32 rounded-full bg-background border-4 border-primary/50 overflow-hidden"
                style={user.profile?.avatar ? { backgroundImage: `url(http://localhost:5000${user.profile.avatar})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
              >
                {!user.profile?.avatar && (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800 text-4xl font-bold text-primary">
                    {user.username[0].toUpperCase()}
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <h2 className="text-2xl font-bold">{user.username}</h2>
                {user.profile?.pronouns && (
                  <p className="text-sm text-gray-400 mt-1">{user.profile.pronouns}</p>
                )}
              </div>
              
              {user.profile?.bio && (
                <p className="mt-4 text-gray-300">{user.profile.bio}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="stat-card">
              <Trophy className="w-6 h-6 text-primary mb-2" />
              <p className="text-2xl font-bold">{user.stats?.wins || 0}</p>
              <p className="text-sm text-gray-400">{t('profile.wins')}</p>
            </div>
            
            <div className="stat-card">
              <Calendar className="w-6 h-6 text-accent mb-2" />
              <p className="text-2xl font-bold">{user.stats?.matchesPlayed || 0}</p>
              <p className="text-sm text-gray-400">{t('profile.matches.played')}</p>
            </div>
            
            <div className="stat-card">
              <User className="w-6 h-6 text-primary mb-2" />
              <p className="text-2xl font-bold">{user.stats?.kills || 0}</p>
              <p className="text-sm text-gray-400">{t('profile.total.kills')}</p>
            </div>
            
            <div className="stat-card">
              <Trophy className="w-6 h-6 text-accent mb-2" />
              <p className="text-2xl font-bold">
                {user.stats?.matchesPlayed > 0 && user.stats?.deaths > 0
                  ? ((user.stats.kills / user.stats.deaths) || 0).toFixed(2)
                  : '0.00'
                }
              </p>
              <p className="text-sm text-gray-400">{t('profile.kd.ratio')}</p>
            </div>
          </div>

          {/* Game Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {user.profile?.favoriteHunter && (
              <div className="card-game p-6">
                <h3 className="text-xl font-bold text-gradient-primary mb-4">{t('profile.favorite.hunter')}</h3>
                <p className="text-2xl font-bold text-accent">{user.profile.favoriteHunter}</p>
              </div>
            )}
            
            {user.profile?.country && (
              <div className="card-game p-6">
                <h3 className="text-xl font-bold text-gradient-primary mb-4">{t('common.country')}</h3>
                <p className="text-2xl font-bold">{user.profile.country}</p>
              </div>
            )}
          </div>

          {/* Socials */}
          {(user.profile?.socials?.twitter || user.profile?.socials?.discord || user.profile?.socials?.twitch || user.profile?.socials?.youtube) && (
            <div className="card-game p-6">
              <h3 className="text-xl font-bold text-gradient-primary mb-4">{t('profile.social.links')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {user.profile.socials.twitter && (
                  <a href={`https://twitter.com/${user.profile.socials.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent transition-colors">
                    Twitter: {user.profile.socials.twitter}
                  </a>
                )}
                {user.profile.socials.discord && (
                  <p className="text-gray-300">Discord: {user.profile.socials.discord}</p>
                )}
                {user.profile.socials.twitch && (
                  <a href={`https://twitch.tv/${user.profile.socials.twitch}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent transition-colors">
                    Twitch: {user.profile.socials.twitch}
                  </a>
                )}
                {user.profile.socials.youtube && (
                  <a href={`https://youtube.com/@${user.profile.socials.youtube}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent transition-colors">
                    YouTube: {user.profile.socials.youtube}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Team */}
          {user.teamId && (
            <div className="card-game p-6">
              <h3 className="text-xl font-bold text-gradient-primary mb-4">Team</h3>
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-full"
                  style={{
                    backgroundColor: user.teamId.secondaryColor || '#19F9A9',
                    borderColor: user.teamId.primaryColor || '#00FFC6',
                    borderWidth: '2px'
                  }}
                >
                  {user.teamId.logo ? (
                    <img src={user.teamId.logo} alt={user.teamId.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-xl" style={{ color: user.teamId.primaryColor || '#00FFC6' }}>
                      {user.teamId.tag}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xl font-bold">{user.teamId.name}</p>
                  <p className="text-sm text-gray-400">{user.teamId.tag}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
