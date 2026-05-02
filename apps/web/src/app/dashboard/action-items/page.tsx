'use client';

import { useEffect, useState } from 'react';
import { useWorkspaceStore } from '@/store';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ActionItem, ActionItemStatus, ActionItemPriority } from '@fredo-cloud/types';
import { Plus, CheckSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ActionItemsPage() {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const router = useRouter();
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'list' | 'kanban'>('list');

  useEffect(() => {
    if (!currentWorkspace) {
      router.push('/workspaces');
      return;
    }

    fetchActionItems();
  }, [currentWorkspace, router]);

  const fetchActionItems = async () => {
    try {
      const response = await api.get(`/api/action-items/workspace/${currentWorkspace!.id}`);
      setActionItems(response.data);
    } catch (error) {
      toast.error('Failed to fetch action items');
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: ActionItemPriority) => {
    const colors = {
      LOW: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      MEDIUM: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      URGENT: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return colors[priority];
  };

  const getStatusColor = (status: ActionItemStatus) => {
    const colors = {
      TODO: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      DONE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    };
    return colors[status];
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading action items...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Action Items</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track tasks and deliverables</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'list'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setView('kanban')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'kanban'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Kanban
            </button>
          </div>
          <button
            onClick={() => router.push('/dashboard/action-items/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Action Item
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Assignee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Due Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {actionItems.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => router.push(`/dashboard/action-items/${item.id}`)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.title}
                    </div>
                    {item.goal && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {item.goal.title}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.assignee ? (
                      <div className="flex items-center">
                        {item.assignee.avatarUrl && (
                          <img
                            src={item.assignee.avatarUrl}
                            alt={item.assignee.firstName}
                            className="w-6 h-6 rounded-full mr-2"
                          />
                        )}
                        <span className="text-sm text-gray-900 dark:text-white">
                          {item.assignee.firstName} {item.assignee.lastName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {item.dueDate
                      ? new Date(item.dueDate).toLocaleDateString()
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {actionItems.length === 0 && (
            <div className="text-center py-12">
              <CheckSquare className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No action items yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create your first action item to start tracking tasks
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {(['TODO', 'IN_PROGRESS', 'DONE'] as ActionItemStatus[]).map((status) => (
            <div key={status} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                {status.replace('_', ' ')}
              </h3>
              <div className="space-y-3">
                {actionItems
                  .filter((item) => item.status === status)
                  .map((item) => (
                    <div
                      key={item.id}
                      onClick={() => router.push(`/dashboard/action-items/${item.id}`)}
                      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        {item.title}
                      </h4>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                        {item.assignee && item.assignee.avatarUrl && (
                          <img
                            src={item.assignee.avatarUrl}
                            alt={item.assignee.firstName}
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
