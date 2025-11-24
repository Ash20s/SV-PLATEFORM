import { useQuery } from '@tanstack/react-query';
import { MessageSquare } from 'lucide-react';
import axios from 'axios';
import SocialFeed from '../components/social/SocialFeed';
import { useAuthStore } from '../stores/authStore';
import { useI18n } from '../i18n/i18n';

const API_URL = 'http://localhost:5000/api';

export default function CommunityPage() {
  const { t } = useI18n();
  const { user: currentUser, token } = useAuthStore();

  const { data: teams } = useQuery({
    queryKey: ['user-teams', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) throw new Error('Not authenticated');
      const response = await axios.get(`${API_URL}/teams`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter teams where user is captain (can post as team)
      return response.data.filter((team: any) => team.captain._id === currentUser.id || team.captain === currentUser.id);
    },
    enabled: !!currentUser?.id
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <MessageSquare className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold text-gradient-primary">{t('community.title')}</h1>
      </div>

      {/* Social Feed */}
      <SocialFeed userTeams={teams || []} currentUserId={currentUser?.id || ''} />
    </div>
  );
}
