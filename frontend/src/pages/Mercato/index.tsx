import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { UserPlus, Users, Filter, Search, Calendar, Plus } from 'lucide-react';
import CreateListingModal from '@/components/mercato/CreateListingModal';
import { useI18n } from '@/i18n/i18n';

export default function Mercato() {
  const { t } = useI18n();
  const [typeFilter, setTypeFilter] = useState<string>('all'); // all, lft, lfp
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: listingsData, isLoading } = useQuery({
    queryKey: ['listings'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5000/api/listings');
      return res.json();
    }
  });

  const listings = listingsData?.listings || [];

  // Apply filters
  const filteredListings = listings.filter((listing: any) => {
    if (typeFilter !== 'all' && listing.type.toLowerCase() !== typeFilter.toLowerCase()) return false;
    if (regionFilter !== 'all' && listing.region !== regionFilter) return false;
    if (roleFilter !== 'all' && !listing.roles?.includes(roleFilter)) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Search className="text-primary" size={32} />
            <h1 className="text-3xl font-bold">{t('mercato.title')}</h1>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 flex items-center gap-2"
          >
            <Plus size={20} />
            {t('mercato.create.listing')}
          </button>
        </div>
        <p className="text-muted-foreground">
          {t('mercato.desc')}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-card p-6 rounded-lg border border-border mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} />
          <h2 className="font-semibold">{t('mercato.filters')}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Type Filter */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">{t('mercato.type')}</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-background border border-border rounded px-3 py-2"
            >
              <option value="all">{t('common.all')}</option>
              <option value="LFT">🔍 {t('mercato.lft')}</option>
              <option value="LFP">👥 {t('mercato.lfp')}</option>
            </select>
          </div>

          {/* Region Filter */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">{t('mercato.region')}</label>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="w-full bg-background border border-border rounded px-3 py-2"
            >
              <option value="all">{t('common.all')} {t('common.region')}s</option>
              <option value="EU">EU</option>
              <option value="NA">NA</option>
              <option value="AS">AS</option>
              <option value="OCE">OCE</option>
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">{t('mercato.role')}</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full bg-background border border-border rounded px-3 py-2"
            >
              <option value="all">{t('common.all')} {t('mercato.role')}s</option>
              <option value="Fighters">Fighters</option>
              <option value="Initiators">Initiators</option>
              <option value="Frontliners">Frontliners</option>
              <option value="Protectors">Protectors</option>
              <option value="Controllers">Controllers</option>
              <option value="Flex">Flex</option>
              <option value="IGL">IGL</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-muted-foreground">
          {filteredListings.length} {filteredListings.length === 1 ? t('mercato.listing') : t('mercato.listings')} {t('mercato.found')}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">{t('mercato.loading')}</p>
        </div>
      )}

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredListings.map((listing: any) => (
          <div
            key={listing._id}
            className="bg-card p-6 rounded-lg border border-border hover:border-primary/50 transition-all hover:shadow-lg"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                {listing.type === 'LFT' ? (
                  <UserPlus className="text-blue-500" size={24} />
                ) : (
                  <Users className="text-green-500" size={24} />
                )}
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  listing.type === 'LFT'
                    ? 'bg-blue-500/10 text-blue-500'
                    : 'bg-green-500/10 text-green-500'
                }`}>
                  {listing.type}
                </span>
              </div>

              {listing.region && (
                <span className="text-xs bg-muted px-2 py-1 rounded">
                  {listing.region}
                </span>
              )}
            </div>

            {/* Player/Team Info */}
            <div className="mb-4">
              {listing.type === 'LFT' ? (
                <>
                  <h3 className="font-bold text-lg mb-1">
                    {listing.author?.username || t('mercato.player')}
                  </h3>
                  {listing.author?.profile?.ign && (
                    <p className="text-sm text-muted-foreground">
                      {t('mercato.ign')}: {listing.author.profile.ign}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <h3 className="font-bold text-lg mb-1">
                    {listing.author?.username || t('common.team')}
                  </h3>
                </>
              )}
            </div>

            {/* Roles */}
            {listing.roles && listing.roles.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {listing.roles.map((role: string) => (
                  <span key={role} className="inline-block bg-primary/10 text-primary px-3 py-1 rounded text-sm font-semibold">
                    {role}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            {listing.description && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {listing.description}
              </p>
            )}

            {/* Experience & Availability */}
            <div className="space-y-2 text-sm">
              {listing.requirements && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>📊 {listing.requirements}</span>
                </div>
              )}
              
              {listing.availability && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar size={14} />
                  <span>{listing.availability}</span>
                </div>
              )}
            </div>

            {/* Contact */}
            {listing.contact && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">{t('mercato.contact')}</p>
                <p className="text-sm font-medium">
                  {typeof listing.contact === 'string' 
                    ? listing.contact 
                    : listing.contact.discord}
                </p>
              </div>
            )}

            {/* Posted Date */}
            {listing.createdAt && (
              <div className="mt-4 text-xs text-muted-foreground">
                {t('mercato.posted')} {new Date(listing.createdAt).toLocaleDateString()}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredListings.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Search className="mx-auto text-muted-foreground mb-4" size={48} />
          <p className="text-muted-foreground text-lg mb-2">{t('mercato.no.listings')}</p>
          <p className="text-sm text-muted-foreground">
            {t('mercato.no.listings.desc')}
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="mt-8 p-4 bg-card rounded-lg border border-border">
        <div className="flex items-center gap-6 justify-center text-sm">
          <div className="flex items-center gap-2">
            <UserPlus className="text-blue-500" size={16} />
            <span className="text-muted-foreground">{t('mercato.lft.desc')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="text-green-500" size={16} />
            <span className="text-muted-foreground">{t('mercato.lfp.desc')}</span>
          </div>
        </div>
      </div>

      {/* Create Listing Modal */}
      {showCreateModal && (
        <CreateListingModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
