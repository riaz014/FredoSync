'use client';

import { useEffect, useState } from 'react';
import { useWorkspaceStore } from '@/store';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { AuditLog } from '@fredo-cloud/types';
import { Download, Shield, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AuditLogsPage() {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    entity: '',
    action: '',
    userId: '',
  });

  useEffect(() => {
    if (!currentWorkspace) {
      router.push('/workspaces');
      return;
    }

    fetchLogs();
  }, [currentWorkspace, router]);

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.entity) params.append('entity', filters.entity);
      if (filters.action) params.append('action', filters.action);
      if (filters.userId) params.append('userId', filters.userId);

      const response = await api.get(
        `/api/audit-logs/${currentWorkspace!.id}?${params.toString()}`
      );
      setLogs(response.data);
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error('You do not have permission to view audit logs');
        router.push('/dashboard');
      } else {
        toast.error('Failed to fetch audit logs');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const exportCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.entity) params.append('entity', filters.entity);
      if (filters.action) params.append('action', filters.action);
      if (filters.userId) params.append('userId', filters.userId);

      const response = await api.get(
        `/api/audit-logs/${currentWorkspace!.id}/export?${params.toString()}`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Audit logs exported successfully');
    } catch (error) {
      toast.error('Failed to export audit logs');
    }
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      CREATE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      UPDATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      DELETE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      INVITE: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      REMOVE: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    };
    return colors[action] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading audit logs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Complete history of workspace changes
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Start Date"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="End Date"
          />
          <input
            type="text"
            value={filters.entity}
            onChange={(e) => setFilters({ ...filters, entity: e.target.value })}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Entity (e.g., Goal)"
          />
          <input
            type="text"
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Action (e.g., CREATE)"
          />
          <button
            onClick={fetchLogs}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Entity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Changes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {log.user.avatarUrl && (
                        <img
                          src={log.user.avatarUrl}
                          alt={log.user.firstName}
                          className="w-8 h-8 rounded-full mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {log.user.firstName} {log.user.lastName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {log.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{log.entityType}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                      {log.entityId.substring(0, 8)}...
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {log.changes ? (
                      <details className="text-sm text-gray-600 dark:text-gray-400">
                        <summary className="cursor-pointer hover:text-gray-900 dark:hover:text-white">
                          View changes
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-auto max-w-md">
                          {JSON.stringify(log.changes, null, 2)}
                        </pre>
                      </details>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">
                    {log.ipAddress || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {logs.length === 0 && (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No audit logs found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filters.startDate || filters.endDate || filters.entity || filters.action
                ? 'Try adjusting your filters'
                : 'Workspace activities will appear here'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
