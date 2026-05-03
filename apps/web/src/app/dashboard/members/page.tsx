'use client';

import { useEffect, useState } from 'react';
import { useAuthStore, useWorkspaceStore } from '@/store';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { UserPlus, Mail, Shield, Trash2, Crown } from 'lucide-react';

interface Member {
  id: string;
  userId: string;
  role: 'ADMIN' | 'MEMBER';
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

interface Invitation {
  id: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt: string;
}

export default function MembersPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    if (!currentWorkspace) {
      router.push('/workspaces');
      return;
    }

    fetchMembers();
    fetchInvitations();
  }, [currentWorkspace, router]);

  const fetchMembers = async () => {
    try {
      const response = await api.get(`/api/workspaces/${currentWorkspace?.id}/members`);
      setMembers(response.data || []);
    } catch (error: any) {
      // Don't show error for 403 (access denied) - just show empty state
      if (error.response?.status !== 403) {
        toast.error('Failed to load members');
      }
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInvitations = async () => {
    try {
      const response = await api.get(`/api/workspaces/${currentWorkspace?.id}/invite`);
      setInvitations(response.data || []);
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);

    try {
      await api.post(`/api/workspaces/${currentWorkspace?.id}/invite`, {
        email: inviteEmail,
        role: inviteRole,
      });
      
      toast.success('Invitation sent successfully');
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('MEMBER');
      fetchInvitations();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      await api.delete(`/api/workspaces/${currentWorkspace?.id}/members/${memberId}`);
      toast.success('Member removed successfully');
      fetchMembers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to remove member');
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await api.delete(`/api/workspaces/${currentWorkspace?.id}/invite/${invitationId}`);
      toast.success('Invitation canceled');
      fetchInvitations();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cancel invitation');
    }
  };

  const isAdmin = members.find((m) => m.user.id === user?.id)?.role === 'ADMIN';

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Team Members</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage workspace members and invitations
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <UserPlus size={18} />
            Invite Member
          </button>
        )}
      </div>

      {/* Members List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Active Members ({members.length})</h2>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {members.map((member) => (
            <div key={member.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <div className="flex items-center gap-4">
                {member.user.avatarUrl ? (
                  <img
                    src={member.user.avatarUrl}
                    alt={member.user.firstName}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                      {member.user.firstName[0]}{member.user.lastName[0]}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {member.user.firstName} {member.user.lastName}
                    </p>
                    {member.role === 'ADMIN' && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                        <Crown size={12} />
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{member.user.email}</p>
                </div>
              </div>

              {isAdmin && member.user.id !== user?.id && (
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pending Invitations */}
      {isAdmin && invitations.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pending Invitations ({invitations.filter((i) => i.status === 'PENDING').length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {invitations
              .filter((inv) => inv.status === 'PENDING')
              .map((invitation) => (
                <div key={invitation.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <Mail size={20} className="text-gray-500 dark:text-gray-400" />
                    </div>

                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{invitation.email}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Invited as {invitation.role} • {new Date(invitation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCancelInvitation(invitation.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Invite Team Member</h3>
            </div>

            <form onSubmit={handleInviteMember} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'ADMIN' | 'MEMBER')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Admins can invite members and manage workspace settings
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isInviting ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
