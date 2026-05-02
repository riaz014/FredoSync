'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useWorkspaceStore, useAuthStore } from '@/store';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Plus,
  Target,
  Calendar,
  User,
  CheckCircle2,
  Circle,
  MessageSquare,
  Save,
  X,
} from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description?: string;
  workspaceId: string;
  ownerId: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
  };
  milestones?: Milestone[];
  actionItems?: ActionItem[];
  progressUpdates?: ProgressUpdate[];
}

interface Milestone {
  id: string;
  title: string;
  description?: string;
  goalId: string;
  progressPercent: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface ActionItem {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface ProgressUpdate {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
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

export default function GoalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const goalId = params.id as string;
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const user = useAuthStore((state) => state.user);

  const [goal, setGoal] = useState<Goal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);

  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    ownerId: '',
    status: 'NOT_STARTED' as Goal['status'],
    dueDate: '',
  });

  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [milestoneFormData, setMilestoneFormData] = useState({
    title: '',
    description: '',
    progressPercent: 0,
    dueDate: '',
  });

  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressContent, setProgressContent] = useState('');

  useEffect(() => {
    if (!currentWorkspace) {
      router.push('/workspaces');
      return;
    }

    fetchGoal();
    fetchMembers();
  }, [currentWorkspace, goalId, router]);

  const fetchGoal = async () => {
    try {
      const response = await api.get(`/api/goals/${goalId}`);
      setGoal(response.data);
      setEditFormData({
        title: response.data.title,
        description: response.data.description || '',
        ownerId: response.data.ownerId,
        status: response.data.status,
        dueDate: response.data.dueDate
          ? new Date(response.data.dueDate).toISOString().split('T')[0]
          : '',
      });
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('Goal not found');
        router.push('/dashboard/goals');
      } else {
        toast.error('Failed to fetch goal details');
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

  const handleUpdateGoal = async () => {
    try {
      await api.put(`/api/goals/${goalId}`, {
        ...editFormData,
        dueDate: editFormData.dueDate || undefined,
      });
      toast.success('Goal updated successfully');
      setIsEditing(false);
      fetchGoal();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update goal');
    }
  };

  const handleDeleteGoal = async () => {
    if (!confirm('Are you sure you want to delete this goal? All milestones and progress updates will also be deleted.')) {
      return;
    }

    try {
      await api.delete(`/api/goals/${goalId}`);
      toast.success('Goal deleted successfully');
      router.push('/dashboard/goals');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete goal');
    }
  };

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post('/api/milestones', {
        ...milestoneFormData,
        goalId,
        dueDate: milestoneFormData.dueDate || undefined,
      });
      toast.success('Milestone created successfully');
      setShowMilestoneModal(false);
      setMilestoneFormData({
        title: '',
        description: '',
        progressPercent: 0,
        dueDate: '',
      });
      fetchGoal();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create milestone');
    }
  };

  const handleUpdateMilestoneProgress = async (milestoneId: string, progress: number) => {
    try {
      await api.put(`/api/milestones/${milestoneId}`, { progressPercent: progress });
      toast.success('Milestone progress updated');
      fetchGoal();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update progress');
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!confirm('Are you sure you want to delete this milestone?')) return;

    try {
      await api.delete(`/api/milestones/${milestoneId}`);
      toast.success('Milestone deleted successfully');
      fetchGoal();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete milestone');
    }
  };

  const handleAddProgressUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post(`/api/goals/${goalId}/updates`, { content: progressContent });
      toast.success('Progress update added');
      setShowProgressModal(false);
      setProgressContent('');
      fetchGoal();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add progress update');
    }
  };

  const getStatusColor = (status: Goal['status']) => {
    const colors = {
      NOT_STARTED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      ON_HOLD: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    };
    return colors[status];
  };

  const getActionItemStatusColor = (status: ActionItem['status']) => {
    const colors = {
      TODO: 'bg-gray-100 text-gray-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      DONE: 'bg-green-100 text-green-800',
    };
    return colors[status];
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading goal...</div>;
  }

  if (!goal) {
    return <div className="flex items-center justify-center h-full">Goal not found</div>;
  }

  const overallProgress =
    goal.milestones && goal.milestones.length > 0
      ? Math.round(
          goal.milestones.reduce((acc, m) => acc + m.progressPercent, 0) / goal.milestones.length
        )
      : 0;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard/goals')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Goal Details</h1>
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
            onClick={handleDeleteGoal}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Goal Info */}
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
                Description
              </label>
              <textarea
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Owner
                </label>
                <select
                  value={editFormData.ownerId}
                  onChange={(e) => setEditFormData({ ...editFormData, ownerId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {members.map((member) => (
                    <option key={member.user.id} value={member.user.id}>
                      {member.user.firstName} {member.user.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as Goal['status'] })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ON_HOLD">On Hold</option>
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
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateGoal}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{goal.title}</h2>
                {goal.description && (
                  <p className="text-gray-600 dark:text-gray-400">{goal.description}</p>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(goal.status)}`}>
                {goal.status.replace('_', ' ')}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              {goal.owner && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Owner: {goal.owner.firstName} {goal.owner.lastName}</span>
                </div>
              )}
              {goal.dueDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Due: {new Date(goal.dueDate).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>Progress: {overallProgress}%</span>
              </div>
            </div>

            <div className="mt-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Milestones */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Milestones</h3>
          <button
            onClick={() => setShowMilestoneModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Milestone
          </button>
        </div>

        <div className="space-y-4">
          {goal.milestones && goal.milestones.length > 0 ? (
            goal.milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{milestone.title}</h4>
                    {milestone.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {milestone.description}
                      </p>
                    )}
                    {milestone.dueDate && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-2">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(milestone.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteMilestone(milestone.id)}
                    className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {milestone.progressPercent}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={milestone.progressPercent}
                    onChange={(e) =>
                      handleUpdateMilestoneProgress(milestone.id, parseInt(e.target.value))
                    }
                    className="w-full"
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No milestones yet. Add your first milestone to track progress.
            </div>
          )}
        </div>
      </div>

      {/* Action Items */}
      {goal.actionItems && goal.actionItems.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Linked Action Items
          </h3>
          <div className="space-y-2">
            {goal.actionItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                onClick={() => router.push('/dashboard/action-items')}
              >
                <div className="flex items-center gap-3 flex-1">
                  {item.status === 'DONE' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
                    {item.assignee && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Assigned to: {item.assignee.firstName} {item.assignee.lastName}
                      </p>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getActionItemStatusColor(item.status)}`}>
                  {item.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Updates */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Progress Updates</h3>
          <button
            onClick={() => setShowProgressModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Update
          </button>
        </div>

        <div className="space-y-4">
          {goal.progressUpdates && goal.progressUpdates.length > 0 ? (
            goal.progressUpdates.map((update) => (
              <div
                key={update.id}
                className="flex gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                {update.user.avatarUrl ? (
                  <img
                    src={update.user.avatarUrl}
                    alt={update.user.firstName}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                      {update.user.firstName[0]}{update.user.lastName[0]}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {update.user.firstName} {update.user.lastName}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(update.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{update.content}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No progress updates yet. Share an update to keep your team informed.
            </div>
          )}
        </div>
      </div>

      {/* Add Milestone Modal */}
      {showMilestoneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Milestone</h3>
              <button
                onClick={() => setShowMilestoneModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMilestone} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={milestoneFormData.title}
                  onChange={(e) => setMilestoneFormData({ ...milestoneFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={milestoneFormData.description}
                  onChange={(e) =>
                    setMilestoneFormData({ ...milestoneFormData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Initial Progress (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={milestoneFormData.progressPercent}
                  onChange={(e) =>
                    setMilestoneFormData({ ...milestoneFormData, progressPercent: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={milestoneFormData.dueDate}
                  onChange={(e) => setMilestoneFormData({ ...milestoneFormData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowMilestoneModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Progress Update Modal */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Progress Update</h3>
              <button
                onClick={() => setShowProgressModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProgressUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Update *
                </label>
                <textarea
                  value={progressContent}
                  onChange={(e) => setProgressContent(e.target.value)}
                  placeholder="Share your progress, achievements, or blockers..."
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowProgressModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Post Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
