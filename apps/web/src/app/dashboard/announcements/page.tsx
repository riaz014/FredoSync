'use client';

import { useEffect, useState } from 'react';
import { useWorkspaceStore } from '@/store';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Announcement } from '@fredo-cloud/types';
import { Plus, Megaphone, Pin, ThumbsUp, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AnnouncementsPage() {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentWorkspace) {
      router.push('/workspaces');
      return;
    }

    fetchAnnouncements();
  }, [currentWorkspace, router]);

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get(`/api/announcements/workspace/${currentWorkspace!.id}`);
      setAnnouncements(response.data);
    } catch (error: any) {
      // Don't show error for 403 (access denied) - just show empty state
      if (error.response?.status !== 403) {
        toast.error('Failed to fetch announcements');
      }
      setAnnouncements([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addReaction = async (announcementId: string, emoji: string) => {
    try {
      await api.post('/api/reactions', { announcementId, emoji });
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to add reaction');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading announcements...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Announcements</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Team updates and news</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/announcements/new')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Announcement
        </button>
      </div>

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {announcement.isPinned && (
                    <Pin className="w-4 h-4 text-blue-600" />
                  )}
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {announcement.title}
                  </h3>
                </div>
                <div
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: announcement.content }}
                />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => addReaction(announcement.id, '👍')}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{announcement.reactions?.length || 0}</span>
              </button>
              <button
                onClick={() => router.push(`/dashboard/announcements/${announcement.id}`)}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{announcement.comments?.length || 0}</span>
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
                {new Date(announcement.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}

        {announcements.length === 0 && (
          <div className="text-center py-12">
            <Megaphone className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No announcements yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Be the first to share an update with your team
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
