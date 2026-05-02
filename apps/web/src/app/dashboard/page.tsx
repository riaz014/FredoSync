'use client';

import { useEffect, useState } from 'react';
import { useWorkspaceStore } from '@/store';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { AnalyticsData } from '@fredo-cloud/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Target, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const setCurrentWorkspace = useWorkspaceStore((state) => state.setCurrentWorkspace);
  const setWorkspaces = useWorkspaceStore((state) => state.setWorkspaces);
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWorkspaceAndAnalytics = async () => {
      try {
        // If no current workspace, fetch all and select the first one
        if (!currentWorkspace) {
          const workspacesResponse = await api.get('/api/workspaces');
          const workspaces = workspacesResponse.data || [];
          setWorkspaces(workspaces);

          if (workspaces.length === 0) {
            router.push('/workspaces');
            return;
          }

          setCurrentWorkspace(workspaces[0]);
        }

        // Fetch analytics for the workspace
        const workspace = currentWorkspace || (await api.get('/api/workspaces')).data[0];
        if (workspace) {
          const response = await api.get(`/api/analytics/${workspace.id}`);
          setAnalytics(response.data);
        }
      } catch (error) {
        console.error('Failed to load workspace or analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkspaceAndAnalytics();
  }, [currentWorkspace, router, setCurrentWorkspace, setWorkspaces]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  if (!currentWorkspace) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{currentWorkspace.name}</p>
      </div>

      {analytics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={<Target className="w-6 h-6" />}
              label="Total Goals"
              value={analytics.totalGoals}
              color="blue"
            />
            <StatCard
              icon={<CheckCircle className="w-6 h-6" />}
              label="Completed This Week"
              value={analytics.completedThisWeek}
              color="green"
            />
            <StatCard
              icon={<Clock className="w-6 h-6" />}
              label="In Progress"
              value={analytics.inProgressGoals}
              color="yellow"
            />
            <StatCard
              icon={<AlertCircle className="w-6 h-6" />}
              label="Overdue"
              value={analytics.overdueCount}
              color="red"
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Weekly Completion Trend
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.weeklyProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Goal Completion Rate
              </h2>
              <div className="flex items-center justify-center h-40">
                <div className="text-center">
                  <div className="text-5xl font-bold text-blue-600">{analytics.completionRate}%</div>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Overall Completion</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/dashboard/goals')}
                  className="w-full text-left px-4 py-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                >
                  <div className="font-medium text-blue-900 dark:text-blue-100">Create New Goal</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Start tracking a new objective</div>
                </button>
                <button
                  onClick={() => router.push('/dashboard/action-items')}
                  className="w-full text-left px-4 py-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                >
                  <div className="font-medium text-green-900 dark:text-green-100">Add Action Item</div>
                  <div className="text-sm text-green-600 dark:text-green-400">Create a new task</div>
                </button>
                <button
                  onClick={() => router.push('/dashboard/announcements')}
                  className="w-full text-left px-4 py-3 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                >
                  <div className="font-medium text-purple-900 dark:text-purple-100">Post Announcement</div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">Share updates with your team</div>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
