'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useWorkspaceStore } from '@/store';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { getSocket } from '@/lib/socket';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (currentWorkspace) {
      const socket = getSocket();
      if (socket) {
        socket.emit('join:workspace', currentWorkspace.id);
        return () => {
          socket.emit('leave:workspace', currentWorkspace.id);
        };
      }
    }
  }, [currentWorkspace]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
