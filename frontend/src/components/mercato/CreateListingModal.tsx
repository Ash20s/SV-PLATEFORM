import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, UserPlus, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';

interface CreateListingModalProps {
  onClose: () => void;
}

export default function CreateListingModal({ onClose }: CreateListingModalProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [listingType, setListingType] = useState<'lft' | 'lfp'>('lft');
  
  const [formData, setFormData] = useState({
    type: 'lft',
    role: '',
    region: 'EU',
    description: '',
    experience: '',
    availability: '',
    languages: '',
    contact: ''
  });

  // Auto-detect listing type based on user's team status
  useEffect(() => {
    // Si l'utilisateur a une équipe (est capitaine), proposer LFP par défaut
    // Sinon LFT
    // Pour l'instant on garde LFT par défaut
  }, [user]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/listings', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      onClose();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const listingData = {
      ...formData,
      type: listingType,
      languages: formData.languages ? formData.languages.split(',').map(l => l.trim()) : []
    };
    
    createMutation.mutate(listingData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background">
          <h2 className="text-2xl font-bold">Create Listing</h2>
          <button onClick={onClose} className="hover:bg-accent p-2 rounded">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Listing Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">Listing Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setListingType('lft')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  listingType === 'lft'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-border hover:border-blue-500/50'
                }`}
              >
                <UserPlus className={`mx-auto mb-2 ${listingType === 'lft' ? 'text-blue-500' : 'text-muted-foreground'}`} size={32} />
                <p className="font-bold mb-1">LFT - Looking For Team</p>
                <p className="text-xs text-muted-foreground">You're a player looking for a team</p>
              </button>

              <button
                type="button"
                onClick={() => setListingType('lfp')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  listingType === 'lfp'
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-border hover:border-green-500/50'
                }`}
              >
                <Users className={`mx-auto mb-2 ${listingType === 'lfp' ? 'text-green-500' : 'text-muted-foreground'}`} size={32} />
                <p className="font-bold mb-1">LFP - Looking For Players</p>
                <p className="text-xs text-muted-foreground">Your team is recruiting players</p>
              </button>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {listingType === 'lft' ? 'Your Main Role' : 'Role Needed'}
            </label>
            <select
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full bg-card border border-border rounded px-3 py-2"
            >
              <option value="">Select a role</option>
              <option value="Fighters">Fighters</option>
              <option value="Initiators">Initiators</option>
              <option value="Frontliners">Frontliners</option>
              <option value="Protectors">Protectors</option>
              <option value="Controllers">Controllers</option>
              <option value="Flex">Flex (Multiple roles)</option>
              <option value="IGL">IGL (In-Game Leader)</option>
            </select>
          </div>

          {/* Region */}
          <div>
            <label className="block text-sm font-medium mb-2">Region</label>
            <select
              required
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className="w-full bg-card border border-border rounded px-3 py-2"
            >
              <option value="EU">EU - Europe</option>
              <option value="NA">NA - North America</option>
              <option value="AS">AS - Asia</option>
              <option value="OCE">OCE - Oceania</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder={
                listingType === 'lft'
                  ? 'Tell teams about yourself, your playstyle, achievements...'
                  : 'Describe your team, goals, and what you\'re looking for...'
              }
              className="w-full bg-card border border-border rounded px-3 py-2 resize-none"
            />
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Experience Level
            </label>
            <select
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              className="w-full bg-card border border-border rounded px-3 py-2"
            >
              <option value="">Select experience</option>
              <option value="Beginner">Beginner (New to competitive)</option>
              <option value="Intermediate">Intermediate (Some tournaments)</option>
              <option value="Advanced">Advanced (Regular competitor)</option>
              <option value="Professional">Professional (Tier 1/2 experience)</option>
            </select>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Availability
            </label>
            <input
              type="text"
              value={formData.availability}
              onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
              placeholder="e.g., Weekdays 18:00-23:00 CET, Weekends flexible"
              className="w-full bg-card border border-border rounded px-3 py-2"
            />
          </div>

          {/* Languages */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Languages (comma separated)
            </label>
            <input
              type="text"
              value={formData.languages}
              onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
              placeholder="e.g., English, French, Spanish"
              className="w-full bg-card border border-border rounded px-3 py-2"
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Contact (Discord, Twitter, etc.)
            </label>
            <input
              required
              type="text"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              placeholder="e.g., Discord: YourName#1234"
              className="w-full bg-card border border-border rounded px-3 py-2"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Listing'}
            </button>
          </div>

          {createMutation.isError && (
            <p className="text-red-500 text-sm text-center">
              Error creating listing. Please try again.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
