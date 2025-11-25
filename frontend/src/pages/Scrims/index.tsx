import { useQuery } from '@tanstack/react-query';
import { Swords, Calendar, Users, Filter, Clock, ChevronDown, ChevronUp, UserPlus, CheckCircle2, XCircle, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useI18n } from '@/i18n/i18n';
import { useAuthStore } from '@/stores/authStore';
import { useAuth } from '@/hooks/useAuth';
import { useConfirmScrim } from '@/hooks/useScrims';
import { Link } from 'react-router-dom';
import CreateScrimModal from '@/components/organizer/CreateScrimModal';

export default function Scrims() {
  const { t } = useI18n();
  const { user: authUser } = useAuth();
  const { user, isAuthenticated } = useAuthStore();
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [expandedScrim, setExpandedScrim] = useState<string | null>(null);
  const [registeringScrim, setRegisteringScrim] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreateScrimModal, setShowCreateScrimModal] = useState(false);
  
  const confirmMutation = useConfirmScrim();
  
  // Vérification robuste du rôle - vérifier aussi localStorage au cas où
  const getStoredUserRole = () => {
    try {
      const stored = localStorage.getItem('auth_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed?.role;
      }
    } catch (e) {
      return null;
    }
    return null;
  };
  
  // Utiliser authUser de useAuth() pour être cohérent avec Organizer
  const currentUser = authUser || user;
  const userRole = currentUser?.role || getStoredUserRole();
  // Vérification stricte avec logs pour debug
  const isOrganizer = userRole === 'organizer';
  const isAdmin = userRole === 'admin';
  const isOrganizerOrAdmin = isOrganizer || isAdmin;
  
  // Debug: vérifier le user et le rôle
  useEffect(() => {
    const storedUserStr = localStorage.getItem('auth_user');
    const storedUser = storedUserStr ? JSON.parse(storedUserStr) : null;
    
    console.log('=== SCRIMS DEBUG ===');
    console.log('authUser:', authUser);
    console.log('user (store):', user);
    console.log('currentUser:', currentUser);
    console.log('User role:', userRole);
    console.log('Stored user:', storedUser);
    console.log('Stored user role:', storedUser?.role);
    console.log('isOrganizer:', isOrganizer);
    console.log('isAdmin:', isAdmin);
    console.log('isOrganizerOrAdmin:', isOrganizerOrAdmin);
    console.log('Role check organizer (strict):', userRole === 'organizer');
    console.log('Role check admin (strict):', userRole === 'admin');
    console.log('Type of role:', typeof userRole);
    console.log('Role value:', JSON.stringify(userRole));
    console.log('====================');
  }, [authUser, user, currentUser, userRole, isOrganizer, isAdmin, isOrganizerOrAdmin]);

  const { data: scrimsData, isLoading, error: fetchError } = useQuery({
    queryKey: ['scrims', 'all'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5000/api/scrims?limit=50');
      if (!res.ok) throw new Error('Failed to fetch scrims');
      return res.json();
    },
    retry: 1
  });

  const scrims = scrimsData?.scrims || [];
  
  // Filter by tier
  const filteredScrims = tierFilter === 'all' 
    ? scrims 
    : scrims.filter((s: any) => s.tier === tierFilter || s.tier === 'Both');

  const handleConfirmScrim = async (scrimId: string) => {
    setError(null);
    setSuccess(null);
    setRegisteringScrim(scrimId);

    // Vérifications côté client
    if (!isAuthenticated) {
      setError(t('scrim.register.must.login'));
      setRegisteringScrim(null);
      return;
    }

    if (!user?.teamId) {
      setError(t('scrim.register.must.have.team'));
      setRegisteringScrim(null);
      return;
    }

    try {
      await confirmMutation.mutateAsync(scrimId);
      setSuccess(t('scrim.register.success'));
      // Invalider la query pour rafraîchir les données
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setError(err?.response?.data?.message || t('scrim.register.error'));
    } finally {
      setRegisteringScrim(null);
    }
  };

  const isScrimRegistered = (scrim: any) => {
    return scrim.participants?.some(
      (p: any) => (p.team?._id === user?.teamId || p.team === user?.teamId) && p.status === 'confirmed'
    ) || false;
  };

  const canRegisterScrim = (scrim: any) => {
    return (
      isAuthenticated &&
      user?.teamId &&
      (scrim.status === 'open' || scrim.status === 'pending') &&
      !isScrimRegistered(scrim) &&
      (scrim.participants?.filter((p: any) => p.status === 'confirmed').length || 0) < (scrim.maxTeams || 0)
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Swords className="text-primary" size={32} />
          <h1 className="text-3xl font-bold">{t('scrims.title')}</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Bouton créer scrim (visible uniquement pour organizer/admin) */}
          {isOrganizerOrAdmin && (
            <button
              onClick={() => setShowCreateScrimModal(true)}
              className="bg-blue-500/10 border-2 border-blue-500/20 text-blue-500 px-4 py-2 rounded-lg font-semibold hover:bg-blue-500/20 hover:border-blue-500/50 transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              {t('organizer.create.scrim')}
            </button>
          )}
          
          {/* Tier Filter */}
          <div className="flex items-center gap-2">
            <Filter size={18} />
            <select 
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-card border border-border rounded px-3 py-2 text-sm"
            >
              <option value="all">{t('common.tier.all')}</option>
              <option value="Tier 1">{t('common.tier.1')}</option>
              <option value="Tier 2">{t('common.tier.2')}</option>
              <option value="Both">{t('common.tier.both')}</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">{t('common.loading.scrims')}</p>
        </div>
      )}

      {fetchError && (
        <div className="text-center py-12">
          <Swords className="mx-auto text-red-500 mb-4" size={48} />
          <p className="text-red-500 text-lg mb-2">Error loading scrims</p>
          <p className="text-muted-foreground text-sm">
            {fetchError instanceof Error ? fetchError.message : 'Unknown error occurred'}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 group/scrims">
        {filteredScrims.map((scrim: any) => (
          <div
            key={scrim._id}
            className="bg-card p-6 rounded-lg border border-primary/20 hover:border-primary transition-all group/card
                       group-has-[.group\/card:hover]/scrims:opacity-40 hover:!opacity-100"
          >
            {/* Organizer */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t('scrims.organized.by')}</p>
                <h3 className="font-bold text-lg">{scrim.organizer?.username || t('scrims.unknown.organizer')}</h3>
                {scrim.organizer?.profile?.avatar && (
                  <p className="text-xs text-muted-foreground">{t('scrims.organizer')}</p>
                )}
              </div>
              
              {scrim.tier && (
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  scrim.tier === 'Tier 1' 
                    ? 'bg-purple-500/10 text-purple-500' 
                    : scrim.tier === 'Tier 2'
                    ? 'bg-blue-500/10 text-blue-500'
                    : 'bg-gray-500/10 text-gray-400'
                }`}>
                  {scrim.tier}
                </span>
              )}
            </div>

            {/* Date & Time */}
            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar size={16} />
                <span>{new Date(scrim.date).toLocaleDateString()}</span>
              </div>
              
              {scrim.time && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock size={16} />
                  <span>{scrim.time}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-muted-foreground">
                <Users size={16} />
                <span className="font-semibold text-foreground">
                  {scrim.participants?.filter((p: any) => p.status === 'confirmed').length || 0} / {scrim.maxTeams}
                </span>
                <span className="text-xs">{t('scrims.teams.confirmed')}</span>
              </div>

              {scrim.region && (
                <div className="text-muted-foreground">
                  📍 {scrim.region}
                </div>
              )}
            </div>

            {/* Number of Games */}
            {scrim.numberOfGames && (
              <div className="text-sm text-muted-foreground mb-4">
                🎮 {scrim.numberOfGames} game{scrim.numberOfGames > 1 ? 's' : ''}
              </div>
            )}

            {/* Notes */}
            {scrim.notes && (
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {scrim.notes}
                </p>
              </div>
            )}

            {/* Participants List */}
            {scrim.participants && scrim.participants.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <button
                  onClick={() => setExpandedScrim(expandedScrim === scrim._id ? null : scrim._id)}
                  className="flex items-center justify-between w-full text-sm font-semibold mb-2 hover:text-primary transition-colors"
                >
                  <span>{t('scrims.registered.teams')} ({scrim.participants.filter((p: any) => p.status === 'confirmed').length})</span>
                  {expandedScrim === scrim._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                
                {expandedScrim === scrim._id && (
                  <div className="space-y-1 mt-2">
                    {scrim.participants
                      .filter((p: any) => p.status === 'confirmed')
                      .map((participant: any, idx: number) => (
                        <div 
                          key={participant.team?._id || idx}
                          className="flex items-center gap-2 text-sm py-1 px-2 rounded hover:bg-accent/50"
                        >
                          <span className="text-muted-foreground">#{idx + 1}</span>
                          <span className="font-medium">{participant.team?.name || t('common.unknown.team')}</span>
                          {participant.team?.tag && (
                            <span className="text-xs text-muted-foreground">[{participant.team.tag}]</span>
                          )}
                        </div>
                      ))}
                    {scrim.participants.filter((p: any) => p.status === 'confirmed').length === 0 && (
                      <p className="text-xs text-muted-foreground italic">{t('scrims.no.confirmed.teams')}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Registration Button */}
            <div className="mt-4 space-y-2">
              {canRegisterScrim(scrim) && (
                <button
                  onClick={() => handleConfirmScrim(scrim._id)}
                  disabled={confirmMutation.isPending || registeringScrim === scrim._id}
                  className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <UserPlus size={16} />
                  {confirmMutation.isPending && registeringScrim === scrim._id 
                    ? t('scrim.register.registering') 
                    : t('scrim.register.button')}
                </button>
              )}

              {isScrimRegistered(scrim) && (
                <div className="flex items-center justify-center gap-2 text-green-500 px-4 py-2 bg-green-500/10 rounded-lg text-sm">
                  <CheckCircle2 size={16} />
                  <span className="font-semibold">{t('scrim.register.already.registered')}</span>
                </div>
              )}

              {!isAuthenticated && scrim.status === 'open' && (
                <div className="text-center text-xs text-muted-foreground">
                  <p className="mb-1">{t('scrim.register.must.login')}</p>
                  <Link to="/login" className="text-primary hover:underline">
                    {t('nav.login')}
                  </Link>
                </div>
              )}

              {isAuthenticated && !user?.teamId && scrim.status === 'open' && (
                <div className="text-center text-xs text-muted-foreground">
                  <p className="mb-1">{t('scrim.register.must.have.team')}</p>
                  <Link to="/teams" className="text-primary hover:underline">
                    {t('scrim.register.create.team')}
                  </Link>
                </div>
              )}

              {scrim.status !== 'open' && scrim.status !== 'pending' && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground px-4 py-2 bg-muted rounded-lg text-sm">
                  <XCircle size={16} />
                  <span>{t('scrim.register.closed')}</span>
                </div>
              )}

              {(scrim.participants?.filter((p: any) => p.status === 'confirmed').length || 0) >= (scrim.maxTeams || 0) && 
               scrim.status === 'open' && 
               !isScrimRegistered(scrim) && (
                <div className="flex items-center justify-center gap-2 text-red-500 px-4 py-2 bg-red-500/10 rounded-lg text-sm">
                  <XCircle size={16} />
                  <span>{t('scrim.register.full')}</span>
                </div>
              )}

              {/* Status */}
              <div>
                <span className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                  scrim.status === 'open' 
                    ? 'bg-green-500/10 text-green-500'
                    : scrim.status === 'pending'
                    ? 'bg-[#FFB800] text-black'
                    : scrim.status === 'ongoing'
                    ? 'bg-yellow-500/10 text-yellow-500'
                    : scrim.status === 'full'
                    ? 'bg-red-500/10 text-red-500'
                    : 'bg-gray-500/10 text-gray-400'
                }`}>
                  {scrim.status === 'open' ? '🔓 Open' : 
                   scrim.status === 'pending' ? '⏳ Pending' :
                   scrim.status === 'full' ? '🔒 Full' :
                   scrim.status === 'ongoing' ? '▶️ Ongoing' :
                   scrim.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredScrims.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Swords className="mx-auto text-muted-foreground mb-4" size={48} />
          <p className="text-muted-foreground text-lg">
            {tierFilter === 'all' 
              ? t('scrims.none')
              : t('scrims.none.filtered').replace('{tier}', tierFilter)}
          </p>
        </div>
      )}

      {/* Global Error/Success Messages */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <XCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-4 hover:opacity-70">×</button>
        </div>
      )}

      {success && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <CheckCircle2 size={20} />
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="ml-4 hover:opacity-70">×</button>
        </div>
      )}

      {/* Modal de création de scrim */}
      {showCreateScrimModal && (
        <CreateScrimModal onClose={() => setShowCreateScrimModal(false)} />
      )}
    </div>
  );
}
