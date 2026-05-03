'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useWorkspaceStore } from '@/store';
import api from '@/lib/api';
import { Workspace } from '@fredo-cloud/types';
import { Plus, LogOut, Briefcase, Users, Calendar, ChevronRight, Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WorkspacesPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading } = useAuthStore();
  const { setCurrentWorkspace, setWorkspaces } = useWorkspaceStore();
  const [workspacesList, setWorkspacesList] = useState<Workspace[]>([]);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    // Wait for auth to be checked before proceeding
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchWorkspaces();
  }, [isAuthenticated, router, isLoading]);

  const fetchWorkspaces = async () => {
    try {
      const response = await api.get('/api/workspaces');
      setWorkspacesList(response.data || []);
      setWorkspaces(response.data || []);
      setIsLoadingWorkspaces(false);
    } catch (error) {
      console.error('Failed to fetch workspaces:', error);
      toast.error('Failed to load workspaces');
      setIsLoadingWorkspaces(false);
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Workspace name is required');
      return;
    }

    setIsCreating(true);
    try {
      const response = await api.post('/api/workspaces', {
        name: formData.name,
        description: formData.description,
      });

      toast.success('Workspace created successfully!');
      setShowCreateModal(false);
      setFormData({ name: '', description: '' });
      
      // Add new workspace to list
      const updatedWorkspaces = [...workspacesList, response.data];
      setWorkspacesList(updatedWorkspaces);
      setWorkspaces(updatedWorkspaces);
      
      // Switch to new workspace
      setCurrentWorkspace(response.data);
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create workspace');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectWorkspace = (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
    router.push('/dashboard');
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isLoadingWorkspaces) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-400 border-t-white"></div>
          <p className="mt-4 text-blue-200 font-medium">Loading workspaces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        {/* Header with Logo and User Info */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg blur opacity-75"></div>
              <div className="relative bg-slate-900 rounded-lg p-3">
                <Briefcase className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-200 via-blue-300 to-blue-400 bg-clip-text text-transparent">
                Fredo Cloud
              </h1>
              <p className="text-blue-200 font-medium mt-1">Workspace Management</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="group flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-red-500/50 hover:-translate-y-0.5"
          >
            <LogOut size={20} className="group-hover:rotate-180 transition-transform duration-300" />
            Logout
          </button>
        </div>

        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome back, <span className="text-blue-300">{user?.firstName}</span>! 👋
          </h2>
          <p className="text-blue-200 text-lg">
            {workspacesList.length === 0
              ? 'Create your first workspace to get started'
              : `You have ${workspacesList.length} workspace${workspacesList.length > 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Workspaces Grid */}
        {workspacesList.length === 0 ? (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-blue-500/30 rounded-2xl shadow-2xl p-16 text-center">
            <div className="mb-6 inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-400/30">
              <Plus className="w-12 h-12 text-blue-300" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
              No workspaces yet
            </h2>
            <p className="text-blue-200 mb-8 text-lg max-w-md mx-auto">
              Create your first workspace to unlock powerful collaboration tools and start managing your team's goals
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/50 hover:-translate-y-1"
            >
              <Plus size={20} />
              Create Workspace
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {workspacesList.map((workspace, index) => (
                <button
                  key={workspace.id}
                  onClick={() => handleSelectWorkspace(workspace)}
                  className="group relative h-full overflow-hidden rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  {/* Background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 border border-blue-500/20 group-hover:border-blue-400/50 transition-colors"></div>

                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/10 group-hover:to-blue-700/10 transition-all duration-300"></div>

                  {/* Glow effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-transparent to-transparent blur-xl"></div>
                  </div>

                  {/* Content */}
                  <div className="relative p-8 h-full flex flex-col z-10">
                    {/* Icon and title */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="mt-1 p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 group-hover:from-blue-500/40 group-hover:to-blue-600/40 transition-colors">
                          <Briefcase className="w-6 h-6 text-blue-300" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white truncate group-hover:text-blue-300 transition-colors">
                            {workspace.name}
                          </h3>
                          {workspace.description && (
                            <p className="text-blue-200/70 text-sm mt-1 line-clamp-2 group-hover:text-blue-200 transition-colors">
                              {workspace.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-3 mb-6 flex-1">
                      <div className="flex items-center gap-2 text-blue-200/60 text-sm group-hover:text-blue-200 transition-colors">
                        <Calendar size={16} />
                        <span>Created {new Date(workspace.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Footer - Click indicator */}
                    <div className="flex items-center justify-between pt-6 border-t border-blue-500/10 group-hover:border-blue-500/30 transition-colors">
                      <span className="text-xs text-blue-300/60 group-hover:text-blue-300 transition-colors font-medium">
                        Click to enter
                      </span>
                      <ChevronRight className="w-5 h-5 text-blue-300/60 group-hover:text-blue-300 transition-all duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Create new workspace CTA */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowCreateModal(true)}
                className="group flex items-center gap-3 px-8 py-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-2 border-dashed border-blue-400/50 hover:border-blue-400 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-blue-600/20 text-blue-300 font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
              >
                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                Create New Workspace
              </button>
            </div>
          </>
        )}

        {/* Create Workspace Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-blue-500/30 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in-95 duration-300">
              <h2 className="text-2xl font-bold text-white mb-6">Create New Workspace</h2>
              
              <form onSubmit={handleCreateWorkspace} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Workspace Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Marketing Team"
                    className="w-full px-4 py-2 bg-slate-700/50 border border-blue-400/30 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your workspace..."
                    rows={3}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-blue-400/30 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-blue-300 font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreating ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

