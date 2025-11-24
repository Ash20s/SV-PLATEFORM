import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, Save, Upload, X } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../stores/authStore';

const API_URL = 'http://localhost:5000/api';

interface ProfileEditorProps {
  user: any;
  userId: string;
}

export default function ProfileEditor({ user, userId }: ProfileEditorProps) {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
    profile: {
      bio: user.profile?.bio || '',
      country: user.profile?.country || '',
      pronouns: user.profile?.pronouns || '',
      favoriteHunter: user.profile?.favoriteHunter || '',
      socials: {
        twitter: user.profile?.socials?.twitter || '',
        discord: user.profile?.socials?.discord || '',
        twitch: user.profile?.socials?.twitch || '',
        youtube: user.profile?.socials?.youtube || '',
      }
    },
  });
  
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.put(`${API_URL}/profile`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      alert('Profile updated successfully!');
    }
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await axios.post(`${API_URL}/profile/avatar`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    },
    onSuccess: async () => {
      // Petit délai pour s'assurer que le fichier est bien écrit
      await new Promise(resolve => setTimeout(resolve, 500));
      await queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      setAvatarFile(null);
      setAvatarPreview(null);
      alert('Avatar uploaded successfully!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Upload failed');
    }
  });

  const uploadBannerMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('banner', file);
      
      const response = await axios.post(`${API_URL}/profile/banner`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    },
    onSuccess: async () => {
      // Petit délai pour s'assurer que le fichier est bien écrit
      await new Promise(resolve => setTimeout(resolve, 500));
      await queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      setBannerFile(null);
      setBannerPreview(null);
      alert('Banner uploaded successfully!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Upload failed');
    }
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validation
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Format non autorisé. Utilisez JPEG, PNG ou WebP');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5 MB
        alert('Fichier trop volumineux. Taille maximale : 5 MB');
        return;
      }
      
      setAvatarFile(file);
      
      // Prévisualisation
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validation
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Format non autorisé. Utilisez JPEG, PNG ou WebP');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5 MB
        alert('Fichier trop volumineux. Taille maximale : 5 MB');
        return;
      }
      
      setBannerFile(file);
      
      // Prévisualisation
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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


  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      {/* Avatar Upload */}
      <div className="card-game p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Camera className="w-5 h-5 text-primary" />
          Avatar
        </h3>
        
        <div className="flex items-center gap-6">
          {/* Preview */}
          <div className="w-32 h-32 rounded-full bg-gray-800 border-2 border-primary/50 overflow-hidden flex items-center justify-center">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
            ) : user.profile?.avatar ? (
              <img src={`http://localhost:5000${user.profile.avatar}`} alt="Current avatar" className="w-full h-full object-cover" />
            ) : (
              <Camera className="w-12 h-12 text-gray-600" />
            )}
          </div>
          
          {/* Upload Controls */}
          <div className="flex-1">
            <input
              type="file"
              id="avatar-upload"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <label
              htmlFor="avatar-upload"
              className="btn-secondary inline-flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Choose Avatar
            </label>
            
            {avatarFile && (
              <div className="mt-3 flex items-center gap-3">
                <span className="text-sm text-gray-400">{avatarFile.name}</span>
                <button
                  onClick={() => uploadAvatarMutation.mutate(avatarFile)}
                  disabled={uploadAvatarMutation.isPending}
                  className="btn-primary text-sm px-3 py-1"
                >
                  {uploadAvatarMutation.isPending ? 'Uploading...' : 'Upload'}
                </button>
                <button
                  onClick={() => {
                    setAvatarFile(null);
                    setAvatarPreview(null);
                  }}
                  className="text-red-500 hover:text-red-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-2">
              JPEG, PNG ou WebP • Max 5 MB
            </p>
          </div>
        </div>
      </div>

      {/* Banner Upload */}
      <div className="card-game p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Camera className="w-5 h-5 text-primary" />
          Banner
        </h3>
        
        <div className="space-y-4">
          {/* Preview */}
          <div className="w-full h-48 rounded-lg bg-gray-800 border-2 border-primary/50 overflow-hidden flex items-center justify-center">
            {bannerPreview ? (
              <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover" />
            ) : user.profile?.banner ? (
              <img src={`http://localhost:5000${user.profile.banner}`} alt="Current banner" className="w-full h-full object-cover" />
            ) : (
              <Camera className="w-12 h-12 text-gray-600" />
            )}
          </div>
          
          {/* Upload Controls */}
          <div>
            <input
              type="file"
              id="banner-upload"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleBannerChange}
              className="hidden"
            />
            <label
              htmlFor="banner-upload"
              className="btn-secondary inline-flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Choose Banner
            </label>
            
            {bannerFile && (
              <div className="mt-3 flex items-center gap-3">
                <span className="text-sm text-gray-400">{bannerFile.name}</span>
                <button
                  onClick={() => uploadBannerMutation.mutate(bannerFile)}
                  disabled={uploadBannerMutation.isPending}
                  className="btn-primary text-sm px-3 py-1"
                >
                  {uploadBannerMutation.isPending ? 'Uploading...' : 'Upload'}
                </button>
                <button
                  onClick={() => {
                    setBannerFile(null);
                    setBannerPreview(null);
                  }}
                  className="text-red-500 hover:text-red-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-2">
              JPEG, PNG ou WebP • Max 5 MB • Dimensions recommandées : 1920x480
            </p>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="card-game p-6">
        <label className="block text-sm font-semibold mb-2">Bio</label>
        <textarea
          value={formData.profile.bio}
          onChange={(e) => handleInputChange('profile.bio', e.target.value)}
          maxLength={500}
          rows={4}
          className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          placeholder="Tell us about yourself..."
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.profile.bio.length}/500 characters
        </p>
      </div>

      {/* Personal Info */}
      <div className="card-game p-6">
        <h3 className="text-xl font-bold mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Country</label>
            <input
              type="text"
              value={formData.profile.country}
              onChange={(e) => handleInputChange('profile.country', e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="FR, US, etc."
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2">Pronouns</label>
            <input
              type="text"
              value={formData.profile.pronouns}
              onChange={(e) => handleInputChange('profile.pronouns', e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="he/him, she/her, they/them"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-2">Favorite Hunter</label>
            <input
              type="text"
              value={formData.profile.favoriteHunter}
              onChange={(e) => handleInputChange('profile.favoriteHunter', e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="The Wraith, The Seer, etc."
            />
          </div>
        </div>
      </div>

      {/* Socials */}
      <div className="card-game p-6">
        <h3 className="text-xl font-bold mb-4">Social Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Twitter</label>
            <input
              type="text"
              value={formData.profile.socials.twitter}
              onChange={(e) => handleInputChange('profile.socials.twitter', e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="@username"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2">Discord</label>
            <input
              type="text"
              value={formData.profile.socials.discord}
              onChange={(e) => handleInputChange('profile.socials.discord', e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="username#1234"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2">Twitch</label>
            <input
              type="text"
              value={formData.profile.socials.twitch}
              onChange={(e) => handleInputChange('profile.socials.twitch', e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="username"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2">YouTube</label>
            <input
              type="text"
              value={formData.profile.socials.youtube}
              onChange={(e) => handleInputChange('profile.socials.youtube', e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="@channel"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={updateProfileMutation.isPending}
        className="btn-primary w-full md:w-auto flex items-center justify-center gap-2"
      >
        <Save className="w-5 h-5" />
        {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}
