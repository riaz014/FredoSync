'use client';

import { useAuthStore, useWorkspaceStore } from '@/store';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Search, Moon, Sun, Grid3x3 } from 'lucide-react';
import { useTheme } from 'next-themes';
import api from '@/lib/api';
import { Workspace } from '@fredo-cloud/types';

export function Header() {
  const user = useAuthStore((state) => state.user);
  const { currentWorkspace, setCurrentWorkspace, workspaces, setWorkspaces } = useWorkspaceStore();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const response = await api.get('/api/workspaces');
        setWorkspaces(response.data);
        if (response.data.length > 0 && !currentWorkspace) {
          setCurrentWorkspace(response.data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch workspaces:', error);
      }
    };

    fetchWorkspaces();
  }, [currentWorkspace, setCurrentWorkspace, setWorkspaces]);

  const handleWorkspaceChange = async (workspace: { id: string; name: string }) => {
    if (workspace.id === currentWorkspace?.id) return;
    
    setIsSwitching(true);
    try {
      const selectedWorkspace = workspaces.find((w) => w.id === workspace.id);
      if (selectedWorkspace) {
        setCurrentWorkspace(selectedWorkspace);
        // Smooth transition with loading state
        setTimeout(() => {
          router.push('/dashboard');
          setIsSwitching(false);
        }, 300);
      }
    } catch (error) {
      console.error('Failed to switch workspace:', error);
      setIsSwitching(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-all duration-300">
      <div className={`flex items-center justify-between ${isSwitching ? 'opacity-70' : 'opacity-100'} transition-opacity duration-300`}>
        <div className="flex items-center gap-4 flex-1">
          <div className="relative">
            <select
              value={currentWorkspace?.id || ''}
              onChange={(e) => {
                const workspace = workspaces.find((w) => w.id === e.target.value);
                if (workspace) handleWorkspaceChange(workspace);
              }}
              disabled={isSwitching}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {workspaces.map((workspace) => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </option>
              ))}
            </select>
            {isSwitching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
              </div>
            )}
          </div>

          <button
            onClick={() => router.push('/workspaces')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-300 dark:border-gray-600"
            title="Manage workspaces"
          >
            <Grid3x3 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search... (Ctrl+K)"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button
            onClick={() => router.push('/dashboard/notifications')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
            title="View notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <button
            onClick={() => router.push('/dashboard/profile')}
            className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors"
          >
            {user && (
              <>
                {user.avatarUrl && (
                  <img
                    src={user.avatarUrl}
                    alt={user.firstName}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
