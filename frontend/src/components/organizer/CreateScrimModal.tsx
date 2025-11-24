import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Calendar, Users, Swords, MapPin } from 'lucide-react';
import api from '@/services/api';

interface CreateScrimModalProps {
  onClose: () => void;
}

export default function CreateScrimModal({ onClose }: CreateScrimModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    date: '',
    tier: 'Both' as 'Tier 1' | 'Tier 2' | 'Both',
    region: 'EU',
    gameMode: 'Squad' as 'Trio' | 'Squad',
    maxTeams: 10,
    numberOfGames: 3,
    description: ''
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/scrims', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scrims'] });
      queryClient.invalidateQueries({ queryKey: ['scrims', 'upcoming'] });
      onClose();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert datetime-local to date and time
    const dateTime = new Date(formData.date);
    const date = dateTime.toISOString().split('T')[0];
    const time = dateTime.toTimeString().slice(0, 5); // HH:MM format
    
    const payload = {
      date: dateTime.toISOString(), // Send full ISO date
      time: time,
      region: formData.region,
      tier: formData.tier,
      gameMode: formData.gameMode,
      numberOfGames: formData.numberOfGames,
      maxTeams: formData.maxTeams,
      notes: formData.description, // Map description to notes
    };
    
    createMutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-lg max-w-xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Swords className="text-blue-500" size={24} />
            <h2 className="text-2xl font-bold">Create Scrim Session</h2>
          </div>
          <button onClick={onClose} className="hover:bg-accent p-2 rounded">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Date & Time */}
          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
              <Calendar size={16} />
              Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Schedule when the scrim session will start
            </p>
          </div>

          {/* Region, Tier & Game Mode */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <MapPin size={16} />
                Region *
              </label>
              <select
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="EU">Europe</option>
                <option value="NA">North America</option>
                <option value="ASIA">Asia</option>
                <option value="OCE">Oceania</option>
                <option value="SA">South America</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Tier Level *
              </label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value as 'Tier 1' | 'Tier 2' | 'Both' })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Tier 1">Tier 1 (Top Level)</option>
                <option value="Tier 2">Tier 2 (Intermediate)</option>
                <option value="Both">Both Tiers</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Game Mode *
              </label>
              <select
                value={formData.gameMode}
                onChange={(e) => {
                  const newMode = e.target.value as 'Trio' | 'Squad';
                  const newMaxTeams = newMode === 'Trio' ? 12 : 10;
                  setFormData({ ...formData, gameMode: newMode, maxTeams: newMaxTeams });
                }}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Trio">Trio (3 players, max 12 teams)</option>
                <option value="Squad">Squad (4 players, max 10 teams)</option>
              </select>
            </div>
          </div>

          {/* Max Teams */}
          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
              <Users size={16} />
              Maximum Teams per Lobby *
            </label>
            <input
              type="number"
              required
              value={formData.maxTeams}
              onChange={(e) => setFormData({ ...formData, maxTeams: parseInt(e.target.value) })}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              min="2"
              max={formData.gameMode === 'Trio' ? 12 : 10}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.gameMode === 'Trio' 
                ? `Maximum teams per lobby/game (max 12 for Trio mode). Each of the ${formData.numberOfGames} game(s) will have up to ${formData.maxTeams} teams.`
                : `Maximum teams per lobby/game (max 10 for Squad mode). Each of the ${formData.numberOfGames} game(s) will have up to ${formData.maxTeams} teams.`}
            </p>
          </div>

          {/* Number of Games */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Number of Games *
            </label>
            <input
              type="number"
              required
              value={formData.numberOfGames}
              onChange={(e) => setFormData({ ...formData, numberOfGames: parseInt(e.target.value) })}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              min="1"
              max="10"
            />
            <p className="text-xs text-muted-foreground mt-1">
              How many games will be played in this session
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Description / Rules
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
              placeholder="Add any specific rules, requirements, or information about this scrim session..."
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h3 className="font-semibold mb-2 text-blue-500">How it works</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Teams can confirm their participation after you create the scrim</p>
              <p>• You'll be the host and can update results after each game</p>
              <p>• Final standings will be calculated based on placement + kills</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-secondary/90"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Scrim'}
            </button>
          </div>

          {createMutation.isError && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
              Error creating scrim. Please try again.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
