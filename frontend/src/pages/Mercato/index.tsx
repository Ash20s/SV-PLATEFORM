import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { UserPlus, Users, Filter, Plus, MessageCircle, Eye, Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import CreateListingModal from '@/components/mercato/CreateListingModal';
import { useAuthStore } from '@/stores/authStore';

interface Listing {
  _id: string;
  type: 'LFT' | 'LFP';
  title: string;
  description: string;
  tier: string;
  region: string;
  roles: string[];
  availability?: string;
  author: {
    _id: string;
    username: string;
    avatar?: string;
  };
  team?: {
    _id: string;
    name: string;
    tag: string;
    logo?: string;
  };
  playerStats?: {
    mmr?: number;
    rank?: string;
    experience?: string;
  };
  playersNeeded?: number;
  views: number;
  responses: any[];
  status: 'active' | 'closed' | 'expired';
  createdAt: string;
}

export default function Mercato() {
  const { isAuthenticated } = useAuthStore();
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('Any');
  const [regionFilter, setRegionFilter] = useState<string>('Any');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: listingsData, isLoading } = useQuery({
    queryKey: ['listings', typeFilter, tierFilter, regionFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (tierFilter !== 'Any') params.append('tier', tierFilter);
      if (regionFilter !== 'Any') params.append('region', regionFilter);
      
      const res = await fetch(`http://localhost:5000/api/listings?${params}`);
      if (!res.ok) throw new Error('Failed to fetch listings');
      return res.json();
    }
  });

  const listings: Listing[] = listingsData?.listings || [];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">🔥 RECRUITMENT</h1>
            <p className="text-muted-foreground">Find your dream team or the perfect teammates</p>
          </div>
          
          {isAuthenticated && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all hover:scale-105"
            >
              <Plus size={20} />
              Post Ad
            </button>
          )}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <Users className="text-blue-500" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold">{listings.filter(l => l.type === 'LFT').length}</p>
                <p className="text-sm text-muted-foreground">Players Looking For Team</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#00FFE5]/10 p-3 rounded-lg">
                <UserPlus className="text-[#00FFE5]" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold">{listings.filter(l => l.type === 'LFP').length}</p>
                <p className="text-sm text-muted-foreground">Teams Looking For Players</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-lg">
                <MessageCircle className="text-primary" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold">{listings.reduce((sum, l) => sum + l.responses.length, 0)}</p>
                <p className="text-sm text-muted-foreground">Active Conversations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-muted-foreground" />
              <span className="text-sm font-semibold">Filters:</span>
            </div>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-background border border-border rounded px-3 py-2 text-sm"
            >
              <option value="all">All Types</option>
              <option value="LFT">LFT (Looking For Team)</option>
              <option value="LFP">LFP (Looking For Players)</option>
            </select>
            
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-background border border-border rounded px-3 py-2 text-sm"
            >
              <option value="Any">Any Tier</option>
              <option value="Tier 1">Tier 1</option>
              <option value="Tier 2">Tier 2</option>
              <option value="Both">Both</option>
            </select>
            
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="bg-background border border-border rounded px-3 py-2 text-sm"
            >
              <option value="Any">Any Region</option>
              <option value="EU">EU</option>
              <option value="NA">NA</option>
              <option value="AS">AS</option>
              <option value="OCE">OCE</option>
              <option value="SA">SA</option>
            </select>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading recruitment ads...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <Users className="mx-auto text-muted-foreground mb-4" size={48} />
          <p className="text-muted-foreground text-lg mb-2">No recruitment ads found</p>
          <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters or be the first to post!</p>
          {isAuthenticated && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-semibold"
            >
              Post First Ad
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {listings.map((listing) => (
            <div
              key={listing._id}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all hover:shadow-lg group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {listing.author.avatar ? (
                    <img 
                      src={listing.author.avatar} 
                      alt={listing.author.username}
                      className="w-12 h-12 rounded-full border-2 border-border"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users size={24} className="text-primary" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                      {listing.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      by {listing.author.username}
                      {listing.team && ` • ${listing.team.tag}`}
                    </p>
                  </div>
                </div>
                
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  listing.type === 'LFT' 
                    ? 'bg-blue-500/10 text-blue-500 border border-blue-500' 
                    : 'bg-[#00FFE5]/10 text-[#00FFE5] border border-[#00FFE5]'
                }`}>
                  {listing.type}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {listing.description}
              </p>

              {/* Tags & Info */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded text-xs font-semibold">
                  {listing.tier}
                </span>
                <span className="bg-[#00D4FF]/10 text-[#00D4FF] px-3 py-1 rounded text-xs font-semibold flex items-center gap-1">
                  <MapPin size={12} />
                  {listing.region}
                </span>
                {listing.roles.map((role) => (
                  <span key={role} className="bg-card-foreground/5 text-foreground px-3 py-1 rounded text-xs">
                    {role}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Eye size={14} />
                    {listing.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle size={14} />
                    {listing.responses.length}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                {listing.type === 'LFP' && listing.playersNeeded && (
                  <span className="text-primary font-semibold">
                    {listing.playersNeeded} player{listing.playersNeeded > 1 ? 's' : ''} needed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Listing Modal */}
      {showCreateModal && (
        <CreateListingModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
