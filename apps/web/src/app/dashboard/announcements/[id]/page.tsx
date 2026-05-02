'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore, useWorkspaceStore } from '@/store';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Edit2, Trash2, Save, X, Send, Pin, ThumbsUp } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  workspaceId: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
  reactions?: Reaction[];
}

interface Comment {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  user?: {
    firstName: string;
    lastName: string;
  };
}

export default function AnnouncementDetailPage() {
  const router = useRouter();
  const params = useParams();
  const announcementId = params.id as string;
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const user = useAuthStore((state) => state.user);

  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const [editFormData, setEditFormData] = useState({
    title: '',
    content: '',
  });

  useEffect(() => {
    if (!currentWorkspace) {
      router.push('/workspaces');
      return;
    }

    fetchAnnouncement();
  }, [currentWorkspace, announcementId, router]);

  const fetchAnnouncement = async () => {
    try {
      const response = await api.get(`/api/announcements/${announcementId}`);
      setAnnouncement(response.data);
      setEditFormData({
        title: response.data.title,
        content: response.data.content,
      });
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('Announcement not found');
        router.push('/dashboard/announcements');
      } else {
        toast.error('Failed to load announcement');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    setIsSaving(true);

    try {
      await api.put(`/api/announcements/${announcementId}`, editFormData);
      toast.success('Announcement updated successfully');
      setIsEditing(false);
      fetchAnnouncement();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update announcement');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      await api.delete(`/api/announcements/${announcementId}`);
      toast.success('Announcement deleted successfully');
      router.push('/dashboard/announcements');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete announcement');
    }
  };

  const handleTogglePin = async () => {
    try {
      await api.post(`/api/announcements/${announcementId}/pin`);
      toast.success(announcement?.isPinned ? 'Unpinned' : 'Pinned');
      fetchAnnouncement();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to toggle pin');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    setIsPosting(true);

    try {
      const response = await api.post('/api/comments', {
        content: commentContent,
        announcementId,
      });

      toast.success('Comment posted');
      setCommentContent('');
      
      // Add comment directly to state instead of full fetch
      if (announcement && response.data?.user) {
        setAnnouncement({
          ...announcement,
          comments: [...(announcement.comments || []), response.data],
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to post comment');
    } finally {
      setIsPosting(false);
    }
  };

  const handleAddReaction = async (emoji: string) => {
    try {
      await api.post('/api/reactions', {
        emoji,
        announcementId,
      });
      
      // Fetch updated announcement to get latest reactions
      fetchAnnouncement();
    } catch (error: any) {
      if (error.response?.status === 409) {
        // Duplicate - just refresh
        fetchAnnouncement();
      } else {
        toast.error(error.response?.data?.error || 'Failed to add reaction');
      }
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;

    try {
      await api.delete(`/api/comments/${commentId}`);
      toast.success('Comment deleted');
      
      // Remove comment from state
      if (announcement) {
        setAnnouncement({
          ...announcement,
          comments: (announcement.comments || []).filter((c) => c.id !== commentId),
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete comment');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading announcement...</div>;
  }

  if (!announcement) {
    return <div className="flex items-center justify-center h-full">Announcement not found</div>;
  }

  const reactionCounts = announcement.reactions?.reduce((acc: any, reaction) => {
    acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
    return acc;
  }, {});

  const userReactions = announcement.reactions?.filter((r) => r.userId === user?.id) || [];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/announcements')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Announcement</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePin}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={announcement.isPinned ? 'Unpin' : 'Pin'}
          >
            <Pin className={`w-5 h-5 ${announcement.isPinned ? 'text-blue-600' : 'text-gray-400'}`} />
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content
              </label>
              <textarea
                value={editFormData.content}
                onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{announcement.title}</h2>
            <div
              className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
              dangerouslySetInnerHTML={{ __html: announcement.content }}
            />

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(announcement.createdAt).toLocaleDateString()} •{' '}
                {new Date(announcement.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Reactions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {reactionCounts &&
            Object.entries(reactionCounts).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => handleAddReaction(emoji)}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  userReactions.some((r) => r.emoji === emoji)
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span>{emoji}</span>
                <span>{count}</span>
              </button>
            ))}
          <button
            onClick={() => handleAddReaction('👍')}
            className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <ThumbsUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Comments */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Comments ({announcement.comments?.length || 0})
        </h3>

        <div className="space-y-4 mb-6">
          {announcement.comments && announcement.comments.length > 0 ? (
            announcement.comments.map((comment) => (
              <div key={comment.id} className="flex gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                {comment.user.avatarUrl ? (
                  <img
                    src={comment.user.avatarUrl}
                    alt={comment.user.firstName}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                      {comment.user.firstName[0]}{comment.user.lastName[0]}
                    </span>
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {comment.user.firstName} {comment.user.lastName}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                </div>

                {comment.userId === user?.id && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No comments yet</p>
          )}
        </div>

        {/* Add Comment Form */}
        <form onSubmit={handleAddComment} className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex gap-3">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isPosting || !commentContent.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 h-fit"
            >
              <Send className="w-4 h-4" />
              {isPosting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
