'use client';

import { useEffect, useState } from 'react';
import { useWorkspaceStore, useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Goal, GoalStatus } from '@fredo-cloud/types';
import { Plus, Target, Calendar, User, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface WorkspaceMember {
  id: string;
  userId: string;
  role: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

export default function GoalsPage() {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ownerId: '',
    status: 'NOT_STARTED' as GoalStatus,
    dueDate: '',
  });

  useEffect(() => {
    if (!currentWorkspace) {
      router.push('/workspaces');
      return;
    }

    fetchGoals();
    fetchMembers();
  }, [currentWorkspace, router]);

  const fetchGoals = async () => {
    try {
      const response = await api.get(`/api/goals/workspace/${currentWorkspace!.id}`);
      setGoals(response.data);
    } catch (error: any) {
      // Don't show error for 403 (access denied) - just show empty state
      if (error.response?.status !== 403) {
        toast.error('Failed to fetch goals');
      }
      setGoals([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await api.get(`/api/workspaces/${currentWorkspace!.id}/members`);
      setMembers(response.data || []);
      if (response.data.length > 0 && !formData.ownerId) {
        setFormData((prev) => ({ ...prev, ownerId: user?.id || response.data[0].user.id }));
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post('/api/goals', {
        ...formData,
        workspaceId: currentWorkspace!.id,
        dueDate: formData.dueDate || undefined,
      });
      
      toast.success('Goal created successfully');
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        ownerId: user?.id || members[0]?.user.id || '',
        status: 'NOT_STARTED',
        dueDate: '',
      });
      fetchGoals();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: GoalStatus) => {
    const colors = {
      NOT_STARTED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      ON_HOLD: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    };
    return colors[status];
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading goals...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Goals</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track your team's objectives</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Goal
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goals.map((goal) => (
          <div
            key={goal.id}
            onClick={() => router.push(`/dashboard/goals/${goal.id}`)}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {goal.title}
                </h3>
                {goal.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                    {goal.description}
                  </p>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                {goal.status.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              {goal.owner && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{goal.owner.firstName} {goal.owner.lastName}</span>
                </div>
              )}
              {goal.dueDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(goal.dueDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {goal.milestones && goal.milestones.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {goal.milestones.length} milestone{goal.milestones.length !== 1 ? 's' : ''}
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    {Math.round(
                      goal.milestones.reduce((acc, m) => acc + m.progressPercent, 0) /
                        goal.milestones.length
                    )}
                    % complete
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}

        {goals.length === 0 && (
          <div className="col-span-2 text-center py-12">
            <Target className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No goals yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first goal to start tracking progress
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Goal
            </button>
          </div>
        )}
      </div>

      {/* Create Goal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Goal</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter goal title"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the goal and its objectives..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Owner *
                  </label>
                  <select
                    value={formData.ownerId}
                    onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select owner</option>
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
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as GoalStatus })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ON_HOLD">On Hold</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
