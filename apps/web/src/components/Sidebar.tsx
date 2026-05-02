'use client';

import { useWorkspaceStore, useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, 
  Target, 
  CheckSquare, 
  Megaphone, 
  Settings, 
  Users,
  BarChart3,
  FileText,
  LogOut
} from 'lucide-react';

export function Sidebar() {
  const router = useRouter();
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/dashboard/goals', icon: Target, label: 'Goals' },
    { href: '/dashboard/action-items', icon: CheckSquare, label: 'Action Items' },
    { href: '/dashboard/announcements', icon: Megaphone, label: 'Announcements' },
    { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
    { href: '/dashboard/members', icon: Users, label: 'Members' },
    { href: '/dashboard/audit-logs', icon: FileText, label: 'Audit Logs' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Fredo Cloud</h1>
        {currentWorkspace && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
            {currentWorkspace.name}
          </p>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
