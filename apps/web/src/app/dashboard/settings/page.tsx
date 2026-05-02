'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useWorkspaceStore } from '@/store';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Save, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { currentWorkspace, setCurrentWorkspace } = useWorkspaceStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [members, setMembers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: currentWorkspace?.name || '',
    description: currentWorkspace?.description || '',
  });

  useEffect(() => {
    if (!currentWorkspace) {
      router.push('/workspaces');
      return;
    }

    setFormData({
      name: currentWorkspace.name,
      description: currentWorkspace.description || '',
    });

    fetchMembers();
  }, [currentWorkspace, router]);

  const fetchMembers = async () => {
    try {
      const response = await api.get(`/api/workspaces/${currentWorkspace?.id}/members`);
      setMembers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    }
  };

  const isAdmin = members.find((m) => m.user.id === user?.id)?.role === 'ADMIN';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdmin) {
      toast.error('Only admins can update workspace settings');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.put(`/api/workspaces/${currentWorkspace?.id}`, formData);
      setCurrentWorkspace(response.data);
      toast.success('Workspace updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update workspace');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!isAdmin) {
      toast.error('Only admins can delete the workspace');
      return;
    }

    const confirmMessage = `Are you sure you want to delete "${currentWorkspace?.name}"? This action cannot be undone and will delete all goals, action items, and announcements.`;
    
    if (!confirm(confirmMessage)) return;

    const finalConfirm = prompt(`Type "${currentWorkspace?.name}" to confirm deletion:`);
    if (finalConfirm !== currentWorkspace?.name) {
      toast.error('Workspace name does not match');
      return;
    }

    setIsDeleting(true);

    try {
      await api.delete(`/api/workspaces/${currentWorkspace?.id}`);
      toast.success('Workspace deleted successfully');
      router.push('/workspaces');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete workspace');
      setIsDeleting(false);
    }
  };

  if (!currentWorkspace) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Workspace Settings</h1>

      {/* General Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">General Settings</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Workspace Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={!isAdmin}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your workspace..."
              disabled={!isAdmin}
            />
          </div>

          {isAdmin && (
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <Save size={18} />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {!isAdmin && (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              Only workspace admins can update settings
            </p>
          )}
        </form>
      </div>

      {/* Workspace Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Workspace Information</h2>
        
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Created</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {currentWorkspace.createdAt ? new Date(currentWorkspace.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Members</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {members.length} member{members.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex justify-between py-2">
            <span className="text-gray-600 dark:text-gray-400">Your Role</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {isAdmin ? 'Admin' : 'Member'}
            </span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      {isAdmin && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-200 dark:border-red-800 p-6">
          <h2 className="text-xl font-semibold text-red-900 dark:text-red-300 mb-4">Danger Zone</h2>
          <p className="text-red-700 dark:text-red-400 mb-4">
            Deleting a workspace is permanent and cannot be undone. All goals, action items, announcements, and data will be permanently deleted.
          </p>
          <button
            onClick={handleDeleteWorkspace}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <Trash2 size={18} />
            {isDeleting ? 'Deleting...' : 'Delete Workspace'}
          </button>
        </div>
      )}
    </div>
  );
}
