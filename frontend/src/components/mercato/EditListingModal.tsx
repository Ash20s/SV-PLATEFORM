import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Save, Trash2, Lock, RefreshCw } from 'lucide-react';
import api from '@/services/api';

interface EditListingModalProps {
  listing: any;
  onClose: () => void;
}

export default function EditListingModal({ listing, onClose }: EditListingModalProps) {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: listing.title || '',
    description: listing.description || '',
    requirements: listing.requirements || '',
    roles: listing.roles || [],
    region: listing.region || 'EU',
    availability: listing.availability || '',
    contact:
      typeof listing.contact === 'string'
        ? listing.contact
        : listing.contact?.discord || '',
  });

  const [isClosing, setIsClosing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.put(`/listings/${listing._id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      onClose();
    },
  });

  const closeMutation = useMutation({
    mutationFn: async () => {
      const res = await api.patch(`/listings/${listing._id}/close`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      onClose();
    },
    onSettled: () => setIsClosing(false),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/listings/${listing._id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      onClose();
    },
    onSettled: () => setIsDeleting(false),
  });

  useEffect(() => {
    setFormData({
      title: listing.title || '',
      description: listing.description || '',
      requirements: listing.requirements || '',
      roles: listing.roles || [],
      region: listing.region || 'EU',
      availability: listing.availability || '',
      contact:
        typeof listing.contact === 'string'
          ? listing.contact
          : listing.contact?.discord || '',
    });
  }, [listing]);

  const toggleRole = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r: string) => r !== role)
        : [...prev.roles, role],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      ...formData,
      contact: { discord: formData.contact },
    });
  };

  const roleOptions = [
    'Fighters',
    'Initiators',
    'Frontliners',
    'Protectors',
    'Controllers',
    'Flex',
    'IGL',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur">
      <div className="w-full max-w-3xl overflow-hidden rounded-lg border border-border bg-background shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-2xl font-bold">Manage Listing</h2>
            <p className="text-xs text-muted-foreground">
              Update or retire your announcement from the marketplace
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-2 text-muted-foreground transition hover:bg-accent"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full rounded border border-border bg-background px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Region</label>
              <select
                value={formData.region}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, region: e.target.value }))
                }
                className="w-full rounded border border-border bg-background px-3 py-2"
              >
                <option value="EU">EU</option>
                <option value="NA">NA</option>
                <option value="AS">AS</option>
                <option value="OCE">OCE</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={4}
              className="w-full rounded border border-border bg-background px-3 py-2 resize-none"
              required
            />
          </div>

  <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Requirements / Experience</label>
              <input
                type="text"
                value={formData.requirements}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, requirements: e.target.value }))
                }
                className="w-full rounded border border-border bg-background px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Availability</label>
              <input
                type="text"
                value={formData.availability}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, availability: e.target.value }))
                }
                className="w-full rounded border border-border bg-background px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Roles</label>
            <div className="flex flex-wrap gap-2">
              {roleOptions.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    formData.roles.includes(role)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Contact (Discord, Twitter, etc.)
            </label>
            <input
              type="text"
              value={formData.contact}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, contact: e.target.value }))
              }
              className="w-full rounded border border-border bg-background px-3 py-2"
              required
            />
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-4 md:flex-row">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded bg-primary px-4 py-2 font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
            >
              <Save size={16} />
              {updateMutation.isPending ? 'Saving...' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsClosing(true);
                closeMutation.mutate();
              }}
              disabled={isClosing || closeMutation.isPending}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded border border-muted-foreground px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted/20 disabled:opacity-60"
            >
              <Lock size={16} />
              {isClosing ? 'Closing...' : 'Mark as filled'}
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm('Delete this listing permanently?')) {
                  setIsDeleting(true);
                  deleteMutation.mutate();
                }
              }}
              disabled={isDeleting || deleteMutation.isPending}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded border border-destructive px-4 py-2 text-sm font-semibold text-destructive transition hover:bg-destructive/10 disabled:opacity-60"
            >
              <Trash2 size={16} />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


