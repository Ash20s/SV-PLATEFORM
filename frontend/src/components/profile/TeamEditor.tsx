import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, Save, Users } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface TeamEditorProps {
  team: any;
  isCaptain: boolean;
}

export default function TeamEditor({ team, isCaptain }: TeamEditorProps) {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: team.name,
    tag: team.tag,
    description: team.description || '',
    primaryColor: team.primaryColor || '#00FFC6',
    secondaryColor: team.secondaryColor || '#19F9A9',
    tier: team.tier || 'Amateur',
    lookingForPlayers: team.lookingForPlayers || false,
    requiredRoles: team.requiredRoles || [],
    socials: {
      twitter: team.socials?.twitter || '',
      discord: team.socials?.discord || '',
      website: team.socials?.website || '',
      twitch: team.socials?.twitch || '',
      youtube: team.socials?.youtube || '',
    }
  });
  
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');

  const updateTeamMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/profile/team/${team._id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', team._id] });
      alert('Team profile updated successfully!');
    }
  });

  const handleInputChange = (field: string, value: any) => {
    const keys = field.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleRoleToggle = (role: string) => {
    setFormData(prev => ({
      ...prev,
      requiredRoles: prev.requiredRoles.includes(role)
        ? prev.requiredRoles.filter((r: string) => r !== role)
        : [...prev.requiredRoles, role]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCaptain) {
      updateTeamMutation.mutate(formData);
    }
  };

  if (!isCaptain) {
    return (
      <div className="card-game p-6 text-center">
        <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-400">Only the team captain can edit the team profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner & Logo Preview */}
      <div className="card-game overflow-hidden">
        <div 
          className="h-48 relative"
          style={{ 
            backgroundColor: formData.primaryColor,
            backgroundImage: team.banner ? `url(${team.banner})` : 'linear-gradient(135deg, ' + formData.primaryColor + ', ' + formData.secondaryColor + ')',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Camera className="w-8 h-8 text-white/60" />
          </div>
        </div>
        
        <div className="p-6 -mt-16">
          <div 
            className="w-32 h-32 rounded-full border-4 relative overflow-hidden"
            style={{ 
              borderColor: formData.primaryColor,
              backgroundColor: formData.secondaryColor,
              backgroundImage: team.logo ? `url(${team.logo})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {!team.logo && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold" style={{ color: formData.primaryColor }}>
                  {team.tag}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Upload URLs */}
        <div className="px-6 pb-6 space-y-4">
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Logo URL"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="input-game flex-1"
            />
            <button 
              onClick={() => {
                if (logoUrl.trim()) {
                  handleInputChange('logo', logoUrl);
                  setLogoUrl('');
                }
              }}
              className="btn-secondary px-4"
            >
              Set Logo
            </button>
          </div>
          
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Banner URL"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              className="input-game flex-1"
            />
            <button 
              onClick={() => {
                if (bannerUrl.trim()) {
                  handleInputChange('banner', bannerUrl);
                  setBannerUrl('');
                }
              }}
              className="btn-secondary px-4"
            >
              Set Banner
            </button>
          </div>
        </div>
      </div>

      {/* Team Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card-game p-6 space-y-4">
          <h3 className="text-xl font-bold text-gradient-primary">Team Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Team Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="input-game w-full"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Tag</label>
              <input
                type="text"
                value={formData.tag}
                onChange={(e) => handleInputChange('tag', e.target.value)}
                className="input-game w-full"
                maxLength={5}
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="input-game w-full"
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-gray-400 mt-1">{formData.description.length}/1000</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Tier</label>
            <select
              value={formData.tier}
              onChange={(e) => handleInputChange('tier', e.target.value)}
              className="input-game w-full"
            >
              <option value="Tier 1">Tier 1</option>
              <option value="Tier 2">Tier 2</option>
              <option value="Amateur">Amateur</option>
            </select>
          </div>
        </div>

        {/* Branding */}
        <div className="card-game p-6 space-y-4">
          <h3 className="text-xl font-bold text-gradient-primary">Team Colors</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Primary Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                  className="w-16 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                  className="input-game flex-1"
                  placeholder="#00FFC6"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Secondary Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                  className="w-16 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.secondaryColor}
                  onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                  className="input-game flex-1"
                  placeholder="#19F9A9"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recruitment */}
        <div className="card-game p-6 space-y-4">
          <h3 className="text-xl font-bold text-gradient-primary">Recruitment</h3>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.lookingForPlayers}
              onChange={(e) => handleInputChange('lookingForPlayers', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="font-medium">Looking for Players</span>
          </label>
          
          {formData.lookingForPlayers && (
            <div>
              <label className="block text-sm font-medium mb-2">Required Roles</label>
              <div className="flex flex-wrap gap-2">
                {['Hunter', 'Support', 'Tank', 'Flex'].map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleToggle(role)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      formData.requiredRoles.includes(role)
                        ? 'bg-primary text-background'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Socials */}
        <div className="card-game p-6 space-y-4">
          <h3 className="text-xl font-bold text-gradient-primary">Social Links</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Twitter</label>
              <input
                type="text"
                value={formData.socials.twitter}
                onChange={(e) => handleInputChange('socials.twitter', e.target.value)}
                placeholder="@teamname"
                className="input-game w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Discord</label>
              <input
                type="text"
                value={formData.socials.discord}
                onChange={(e) => handleInputChange('socials.discord', e.target.value)}
                placeholder="discord.gg/invite"
                className="input-game w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Website</label>
              <input
                type="url"
                value={formData.socials.website}
                onChange={(e) => handleInputChange('socials.website', e.target.value)}
                placeholder="https://team.gg"
                className="input-game w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Twitch</label>
              <input
                type="text"
                value={formData.socials.twitch}
                onChange={(e) => handleInputChange('socials.twitch', e.target.value)}
                placeholder="teamname"
                className="input-game w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">YouTube</label>
              <input
                type="text"
                value={formData.socials.youtube}
                onChange={(e) => handleInputChange('socials.youtube', e.target.value)}
                placeholder="channel"
                className="input-game w-full"
              />
            </div>
          </div>
        </div>

        <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
          <Save className="w-5 h-5" />
          Save Team Profile
        </button>
      </form>
    </div>
  );
}
