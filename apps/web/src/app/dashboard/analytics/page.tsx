'use client';

import { useEffect, useState } from 'react';
import { useWorkspaceStore } from '@/store';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp, Target, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface AnalyticsData {
  totalGoals: number;
  completedThisWeek: number;
  inProgressGoals: number;
  overdueActionItems: number;
  weeklyProgress: {
    week: string;
    completed: number;
    created: number;
  }[];
  completionRate: number;
}

export default function AnalyticsPage() {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentWorkspace) {
      router.push('/workspaces');
      return;
    }

    fetchAnalytics();
  }, [currentWorkspace, router]);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get(`/api/analytics/${currentWorkspace!.id}`);
      setData(response.data);
    } catch (error) {
      toast.error('Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const exportCSV = async () => {
    try {
      const response = await api.get(`/api/analytics/${currentWorkspace!.id}/export`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Analytics exported successfully');
    } catch (error) {
      toast.error('Failed to export analytics');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading analytics...</div>;
  }

  if (!data) {
    return <div className="flex items-center justify-center h-full">No data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Workspace performance insights</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Goals</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {data.totalGoals}
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Completed This Week
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {data.completedThisWeek}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                In Progress
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {data.inProgressGoals}
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {data.overdueActionItems}
              </p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Weekly Progress
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data.weeklyProgress}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="week"
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Legend />
            <Bar dataKey="completed" fill="#10B981" name="Completed" radius={[8, 8, 0, 0]} />
            <Bar dataKey="created" fill="#3B82F6" name="Created" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Goal Completion Rate
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-green-600 h-full flex items-center justify-center text-white text-sm font-medium transition-all duration-500"
              style={{ width: `${data.completionRate}%` }}
            >
              {data.completionRate > 10 && `${data.completionRate}%`}
            </div>
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {data.completionRate}%
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {data.completedThisWeek} of {data.totalGoals} goals completed this week
        </p>
      </div>
    </div>
  );
}
