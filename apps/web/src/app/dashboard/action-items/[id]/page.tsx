'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useWorkspaceStore } from '@/store';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Edit2, Trash2, Save, X } from 'lucide-react';

interface ActionItem {
  id: string;
  title: string;
  description?: string;
  workspaceId: string;
  goalId?: string;
  assigneeId?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  createdAt: string;
  goal?: {
    id: string;
    title: string;
  };
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface WorkspaceMember {
  id: string;
  userId: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface Goal {
  id: string;
  title: string;
}

export default function ActionItemDetailPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);

  const [item, setItem] = useState<ActionItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    assigneeId: '',
    goalId: '',
    priority: 'MEDIUM' as const,
    status: 'TODO' as const,
    dueDate: '',
  });

  useEffect(() => {
    if (!currentWorkspace) {
      router.push('/workspaces');
      return;
    }

    fetchItem();
    fetchMembers();
    fetchGoals();
  }, [currentWorkspace, itemId, router]);

  const fetchItem = async () => {
    try {
      const response = await api.get(`/api/action-items/${itemId}`);
      setItem(response.data);
      setEditFormData({
        title: response.data.title,
        description: response.data.description || '',
        assigneeId: response.data.assigneeId || '',
        goalId: response.data.goalId || '',
        priority: response.data.priority,
        status: response.data.status,
        dueDate: response.data.dueDate
          ? new Date(response.data.dueDate).toISOString().split('T')[0]
          : '',
      });
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('Action item not found');
        router.push('/dashboard/action-items');
      } else {
        toast.error('Failed to load action item');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await api.get(`/api/workspaces/${currentWorkspace!.id}/members`);
      setMembers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    }
  };

  const fetchGoals = async () => {
    try {
      const response = await api.get(`/api/goals/workspace/${currentWorkspace!.id}`);
      setGoals(response.data || []);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    }
  };

  const handleUpdate = async () => {
    setIsSaving(true);

    try {
      await api.put(`/api/action-items/${itemId}`, {
        ...editFormData,
        assigneeId: editFormData.assigneeId || undefined,
        goalId: editFormData.goalId || undefined,
        dueDate: editFormData.dueDate || undefined,
      });

      toast.success('Action item updated successfully');
      setIsEditing(false);
      fetchItem();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update action item');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this action item?')) return;

    try {
      await api.delete(`/api/action-items/${itemId}`);
      toast.success('Action item deleted successfully');
      router.push('/dashboard/action-items');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete action item');
    }
  };

  const getPriorityColor = (priority: ActionItem['priority']) => {
    const colors = {
      LOW: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      MEDIUM: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      URGENT: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return colors[priority];
  };

  const getStatusColor = (status: ActionItem['status']) => {
    const colors = {
      TODO: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      DONE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    };
    return colors[status];
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading action item...</div>;
  }

  if (!item) {
    return <div className="flex items-center justify-center h-full">Action item not found</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/action-items')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Action Item</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
          <div className="space-y-6">
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
                Description
              </label>
              <textarea
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assign To
                </label>
                <select
                  value={editFormData.assigneeId}
                  onChange={(e) => setEditFormData({ ...editFormData, assigneeId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Unassigned</option>
                  {members.map((member) => (
                    <option key={member.user.id} value={member.user.id}>
                      {member.user.firstName} {member.user.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Link to Goal
                </label>
                <select
                  value={editFormData.goalId}
                  onChange={(e) => setEditFormData({ ...editFormData, goalId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">No Goal</option>
                  {goals.map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={editFormData.priority}
                  onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={editFormData.dueDate}
                  onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
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
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h2>
              {item.description && (
                <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}>
                  {item.status.replace('_', ' ')}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Priority</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(item.priority)}`}>
                  {item.priority}
                </span>
              </div>
            </div>

            {item.assignee && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Assigned To</p>
                <p className="text-gray-900 dark:text-white">
                  {item.assignee.firstName} {item.assignee.lastName}
                </p>
              </div>
            )}

            {item.goal && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Linked Goal</p>
                <button
                  onClick={() => router.push(`/dashboard/goals/${item.goal!.id}`)}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  {item.goal.title}
                </button>
              </div>
            )}

            {item.dueDate && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Due Date</p>
                <p className="text-gray-900 dark:text-white">
                  {new Date(item.dueDate).toLocaleDateString()}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Created</p>
              <p className="text-gray-900 dark:text-white">
                {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
