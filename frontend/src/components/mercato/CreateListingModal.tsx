import { useState } from 'react';
import { X, Loader } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';

interface CreateListingModalProps {
  onClose: () => void;
}

export default function CreateListingModal({ onClose }: CreateListingModalProps) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    type: 'LFT' as 'LFT' | 'LFP',
    title: '',
    description: '',
    tier: 'Any',
    region: 'Any',
    roles: [] as string[],
    availability: '',
    contact: {
      discord: '',
      twitter: '',
      other: ''
    },
    playerStats: {
      experience: 'Intermediate'
    },
    playersNeeded: 1
  });

  const [error, setError] = useState('');

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('http://localhost:5000/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create listing');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      onClose();
    },
    onError: (error: Error) => {
      setError(error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    
    if (formData.type === 'LFP' && !user?.teamId) {
      setError('You need to be in a team to post a LFP ad');
      return;
    }
    
    createMutation.mutate(formData);
  };

  const roleOptions = ['Hunter', 'Flex', 'Support', 'Tank', 'DPS', 'Any'];
  
  const toggleRole = (role: string) => {
    if (formData.roles.includes(role)) {
      setFormData({ ...formData, roles: formData.roles.filter(r => r !== role) });
    } else {
      setFormData({ ...formData, roles: [...formData.roles, role] });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold">Post Recruitment Ad</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-semibold mb-2">Ad Type *</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'LFT' })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.type === 'LFT'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-border hover:border-blue-500/50'
                }`}
              >
                <p className="font-bold text-lg mb-1">LFT</p>
                <p className="text-xs text-muted-foreground">I'm looking for a team</p>
              </button>
              
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'LFP' })}
                disabled={!user?.teamId}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.type === 'LFP'
                    ? 'border-[#00FFE5] bg-[#00FFE5]/10'
                    : 'border-border hover:border-[#00FFE5]/50'
                } ${!user?.teamId ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <p className="font-bold text-lg mb-1">LFP</p>
                <p className="text-xs text-muted-foreground">
                  {user?.teamId ? 'My team is looking for players' : 'Requires team membership'}
                </p>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., T1 Hunter LFT for competitive play"
              className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe yourself, your playstyle, achievements, and what you're looking for..."
              rows={4}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.description.length}/1000
            </p>
          </div>

          {/* Tier & Region */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Tier</label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2"
              >
                <option value="Any">Any</option>
                <option value="Tier 1">Tier 1</option>
                <option value="Tier 2">Tier 2</option>
                <option value="Both">Both</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">Region</label>
              <select
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2"
              >
                <option value="Any">Any</option>
                <option value="EU">EU</option>
                <option value="NA">NA</option>
                <option value="AS">AS</option>
                <option value="OCE">OCE</option>
                <option value="SA">SA</option>
              </select>
            </div>
          </div>

          {/* Roles */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              {formData.type === 'LFT' ? 'My Roles' : 'Looking For Roles'}
            </label>
            <div className="flex flex-wrap gap-2">
              {roleOptions.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    formData.roles.includes(role)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background border border-border hover:border-primary'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Players Needed (LFP only) */}
          {formData.type === 'LFP' && (
            <div>
              <label className="block text-sm font-semibold mb-2">Players Needed</label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.playersNeeded}
                onChange={(e) => setFormData({ ...formData, playersNeeded: parseInt(e.target.value) })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2"
              />
            </div>
          )}

          {/* Experience (LFT only) */}
          {formData.type === 'LFT' && (
            <div>
              <label className="block text-sm font-semibold mb-2">Experience Level</label>
              <select
                value={formData.playerStats.experience}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  playerStats: { ...formData.playerStats, experience: e.target.value }
                })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Pro">Pro</option>
              </select>
            </div>
          )}

          {/* Availability */}
          <div>
            <label className="block text-sm font-semibold mb-2">Availability (Optional)</label>
            <input
              type="text"
              value={formData.availability}
              onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
              placeholder="e.g., Weekdays 6-10 PM EST, Weekends flexible"
              className="w-full bg-background border border-border rounded-lg px-4 py-2"
              maxLength={200}
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-semibold mb-2">Contact Info (Optional)</label>
            <div className="space-y-2">
              <input
                type="text"
                value={formData.contact.discord}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  contact: { ...formData.contact, discord: e.target.value }
                })}
                placeholder="Discord: username#1234"
                className="w-full bg-background border border-border rounded-lg px-4 py-2"
              />
              <input
                type="text"
                value={formData.contact.twitter}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  contact: { ...formData.contact, twitter: e.target.value }
                })}
                placeholder="Twitter: @username"
                className="w-full bg-background border border-border rounded-lg px-4 py-2"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-secondary/80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {createMutation.isPending ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  Posting Ad...
                </>
              ) : (
                'Post Ad'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
