'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
  profiles: {
    id: string;
    full_name: string;
    role: 'admin' | 'instructor' | 'client' | 'student';
    avatar_url?: string;
    phone?: string;
    status: 'active' | 'inactive' | 'suspended';
  };
  students?: {
    id: string;
    name: string;
    date_of_birth?: string;
    phone?: string;
    emergency_contact?: any;
    course_enrollments: {
      id: string;
      status: string;
      enrolled_at: string;
      progress_percentage: number;
      course: {
        id: string;
        title: string;
        price: number;
      };
    }[];
  };
  clients?: {
    id: string;
    full_name: string;
    phone?: string;
    date_of_birth?: string;
    bookings: {
      id: string;
      status: string;
      appointment_date: string;
      total_amount: number;
    }[];
  };
}

interface UserStats {
  totalUsers: number;
  activeStudents: number;
  activeClients: number;
  adminUsers: number;
  newThisMonth: number;
  suspendedUsers: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeStudents: 0,
    activeClients: 0,
    adminUsers: 0,
    newThisMonth: 0,
    suspendedUsers: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'instructor' | 'client' | 'student'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'last_active'>('newest');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleOptions = [
    { value: 'all', label: 'All Roles', count: 0 },
    { value: 'student', label: 'Students', count: 0 },
    { value: 'client', label: 'Clients', count: 0 },
    { value: 'instructor', label: 'Instructors', count: 0 },
    { value: 'admin', label: 'Admins', count: 0 }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status', count: 0 },
    { value: 'active', label: 'Active', count: 0 },
    { value: 'inactive', label: 'Inactive', count: 0 },
    { value: 'suspended', label: 'Suspended', count: 0 }
  ];

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, searchQuery, roleFilter, statusFilter, sortBy]);

  const checkAdminAccess = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        router.push('/auth/signin');
        return;
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        router.push('/portal');
        return;
      }

      fetchUsers();
    } catch (error) {
      console.error('Error checking admin access:', error);
      router.push('/portal');
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Fetch users with profiles and related data
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select(`
          *,
          students (
            *,
            course_enrollments (
              *,
              courses (
                id,
                title,
                price
              )
            )
          ),
          clients (
            *,
            bookings (
              id,
              status,
              appointment_date,
              total_amount
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (usersError) {
        throw usersError;
      }

      // Transform data to match User interface
      const transformedUsers = usersData?.map(profile => ({
        id: profile.id,
        email: profile.email || '',
        created_at: profile.created_at,
        last_sign_in_at: profile.last_sign_in_at,
        email_confirmed_at: profile.email_confirmed_at,
        profiles: {
          id: profile.id,
          full_name: profile.full_name,
          role: profile.role,
          avatar_url: profile.avatar_url,
          phone: profile.phone,
          status: profile.status || 'active'
        },
        students: profile.students?.[0] || null,
        clients: profile.clients?.[0] || null
      })) || [];

      setUsers(transformedUsers as User[]);

      // Calculate stats
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const newStats: UserStats = {
        totalUsers: transformedUsers.length,
        activeStudents: transformedUsers.filter(u => u.profiles.role === 'student' && u.profiles.status === 'active').length,
        activeClients: transformedUsers.filter(u => u.profiles.role === 'client' && u.profiles.status === 'active').length,
        adminUsers: transformedUsers.filter(u => u.profiles.role === 'admin').length,
        newThisMonth: transformedUsers.filter(u => new Date(u.created_at) >= thisMonth).length,
        suspendedUsers: transformedUsers.filter(u => u.profiles.status === 'suspended').length
      };

      setStats(newStats);

    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortUsers = () => {
    let filtered = users;

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.profiles.role === roleFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.profiles.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.profiles.full_name?.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.profiles.phone?.toLowerCase().includes(query)
      );
    }

    // Sort users
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'name':
        filtered.sort((a, b) => (a.profiles.full_name || '').localeCompare(b.profiles.full_name || ''));
        break;
      case 'last_active':
        filtered.sort((a, b) => {
          const aTime = a.last_sign_in_at ? new Date(a.last_sign_in_at).getTime() : 0;
          const bTime = b.last_sign_in_at ? new Date(b.last_sign_in_at).getTime() : 0;
          return bTime - aTime;
        });
        break;
    }

    setFilteredUsers(filtered);
  };

  const updateUserStatus = async (userId: string, status: 'active' | 'inactive' | 'suspended') => {
    try {
      setUpdating(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(user =>
        user.id === userId 
          ? { ...user, profiles: { ...user.profiles, status } }
          : user
      ));

    } catch (err) {
      console.error('Error updating user status:', err);
      setError('Failed to update user status');
    } finally {
      setUpdating(false);
    }
  };

  const updateUserRole = async (userId: string, role: 'admin' | 'instructor' | 'client' | 'student') => {
    try {
      setUpdating(true);

      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(user =>
        user.id === userId 
          ? { ...user, profiles: { ...user.profiles, role } }
          : user
      ));

    } catch (err) {
      console.error('Error updating user role:', err);
      setError('Failed to update user role');
    } finally {
      setUpdating(false);
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'suspend' | 'delete') => {
    if (selectedUsers.size === 0) return;

    const userIds = Array.from(selectedUsers);
    
    try {
      setUpdating(true);

      if (action === 'delete') {
        if (!confirm(`Are you sure you want to delete ${userIds.length} users? This action cannot be undone.`)) {
          return;
        }

        // Note: In a real application, you might want to soft delete or archive users
        // rather than hard delete, especially if they have associated data
        const { error } = await supabase
          .from('profiles')
          .delete()
          .in('id', userIds);

        if (error) throw error;

        setUsers(prev => prev.filter(user => !userIds.includes(user.id)));
      } else {
        const status = action === 'activate' ? 'active' : action === 'deactivate' ? 'inactive' : 'suspended';
        
        const { error } = await supabase
          .from('profiles')
          .update({ status })
          .in('id', userIds);

        if (error) throw error;

        setUsers(prev => prev.map(user =>
          userIds.includes(user.id) 
            ? { ...user, profiles: { ...user.profiles, status } }
            : user
        ));
      }

      setSelectedUsers(new Set());
      setShowBulkActions(false);

    } catch (err) {
      console.error('Error performing bulk action:', err);
      setError('Failed to perform bulk action');
    } finally {
      setUpdating(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const selectAllUsers = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(user => user.id)));
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'instructor':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      case 'client':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Update role and status options with counts
  const updatedRoleOptions = roleOptions.map(option => ({
    ...option,
    count: option.value === 'all' 
      ? users.length
      : users.filter(user => user.profiles.role === option.value).length
  }));

  const updatedStatusOptions = statusOptions.map(option => ({
    ...option,
    count: option.value === 'all' 
      ? users.length
      : users.filter(user => user.profiles.status === option.value).length
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-1">Manage all platform users, roles, and permissions</p>
            </div>
            
            {selectedUsers.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{selectedUsers.size} selected</span>
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Bulk Actions
                </button>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
              <div className="text-xs text-blue-600">Total Users</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.activeStudents}</div>
              <div className="text-xs text-green-600">Students</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.activeClients}</div>
              <div className="text-xs text-purple-600">Clients</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.adminUsers}</div>
              <div className="text-xs text-red-600">Admins</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.newThisMonth}</div>
              <div className="text-xs text-yellow-600">New This Month</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.suspendedUsers}</div>
              <div className="text-xs text-gray-600">Suspended</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Role Filter */}
            <div className="flex flex-wrap gap-2">
              {updatedRoleOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setRoleFilter(option.value as any)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                    roleFilter === option.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label} {option.count > 0 && `(${option.count})`}
                </button>
              ))}
            </div>

            <div className="flex gap-4 flex-1 lg:justify-end">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {updatedStatusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label} {option.count > 0 && `(${option.count})`}
                  </option>
                ))}
              </select>

              {/* Search */}
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 flex-1 lg:max-w-sm"
              />

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name A-Z</option>
                <option value="last_active">Last Active</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions Menu */}
          {showBulkActions && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Bulk Actions:</span>
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                >
                  Deactivate
                </button>
                <button
                  onClick={() => handleBulkAction('suspend')}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Suspend
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 bg-red-700 text-white text-sm rounded hover:bg-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-600 mr-2">⚠️</div>
              <p className="text-red-800">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Users Table */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'No users found'
                : 'No users yet'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Users will appear here as they sign up.'
              }
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Select All */}
            <div className="px-6 py-4 border-b">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                  onChange={selectAllUsers}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm font-medium text-gray-700">
                  Select All ({filteredUsers.length} users)
                </span>
              </label>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Active
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr 
                      key={user.id}
                      className={`hover:bg-gray-50 ${selectedUsers.has(user.id) ? 'bg-purple-50' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedUsers.has(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mr-4"
                          />
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                              {user.profiles.avatar_url ? (
                                <img
                                  src={user.profiles.avatar_url}
                                  alt={user.profiles.full_name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-purple-600 font-semibold text-sm">
                                  {user.profiles.full_name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.profiles.full_name || 'No name'}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                              {user.profiles.phone && (
                                <div className="text-xs text-gray-400">{user.profiles.phone}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.profiles.role)}`}>
                          {user.profiles.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.profiles.status)}`}>
                          {user.profiles.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(user.created_at), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.last_sign_in_at 
                          ? format(new Date(user.last_sign_in_at), 'MMM d, yyyy')
                          : 'Never'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.profiles.role === 'student' && user.students && (
                          <div className="text-xs">
                            <div className="text-gray-900 font-medium">
                              {user.students.course_enrollments?.length || 0} courses
                            </div>
                            <div className="text-gray-500">
                              Avg: {user.students.course_enrollments?.length 
                                ? Math.round(user.students.course_enrollments.reduce((sum, e) => sum + e.progress_percentage, 0) / user.students.course_enrollments.length)
                                : 0
                              }% progress
                            </div>
                          </div>
                        )}
                        {user.profiles.role === 'client' && user.clients && (
                          <div className="text-xs">
                            <div className="text-gray-900 font-medium">
                              {user.clients.bookings?.length || 0} bookings
                            </div>
                            <div className="text-gray-500">
                              ${user.clients.bookings?.reduce((sum, b) => sum + b.total_amount, 0).toLocaleString() || 0} spent
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            View
                          </button>
                          
                          {user.profiles.status === 'active' ? (
                            <button
                              onClick={() => updateUserStatus(user.id, 'suspended')}
                              className="text-red-600 hover:text-red-900"
                              disabled={updating}
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => updateUserStatus(user.id, 'active')}
                              className="text-green-600 hover:text-green-900"
                              disabled={updating}
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* User Detail Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-gray-900">User Details</h2>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* User Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <p className="text-sm text-gray-900">{selectedUser.profiles.full_name || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="text-sm text-gray-900">{selectedUser.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <p className="text-sm text-gray-900">{selectedUser.profiles.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <select
                          value={selectedUser.profiles.role}
                          onChange={(e) => updateUserRole(selectedUser.id, e.target.value as any)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          disabled={updating}
                        >
                          <option value="student">Student</option>
                          <option value="client">Client</option>
                          <option value="instructor">Instructor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                          value={selectedUser.profiles.status}
                          onChange={(e) => updateUserStatus(selectedUser.id, e.target.value as any)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          disabled={updating}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Account Details</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Joined</label>
                        <p className="text-sm text-gray-900">{format(new Date(selectedUser.created_at), 'MMM d, yyyy h:mm a')}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Last Sign In</label>
                        <p className="text-sm text-gray-900">
                          {selectedUser.last_sign_in_at 
                            ? format(new Date(selectedUser.last_sign_in_at), 'MMM d, yyyy h:mm a')
                            : 'Never'
                          }
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email Verified</label>
                        <p className="text-sm text-gray-900">
                          {selectedUser.email_confirmed_at ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Student-specific data */}
                {selectedUser.profiles.role === 'student' && selectedUser.students && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Student Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Enrolled Courses</label>
                          <p className="text-2xl font-bold text-purple-600">{selectedUser.students.course_enrollments?.length || 0}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Avg Progress</label>
                          <p className="text-2xl font-bold text-green-600">
                            {selectedUser.students.course_enrollments?.length 
                              ? Math.round(selectedUser.students.course_enrollments.reduce((sum, e) => sum + e.progress_percentage, 0) / selectedUser.students.course_enrollments.length)
                              : 0
                            }%
                          </p>
                        </div>
                      </div>
                      
                      {selectedUser.students.course_enrollments && selectedUser.students.course_enrollments.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Course Enrollments</h4>
                          <div className="space-y-2">
                            {selectedUser.students.course_enrollments.map((enrollment) => (
                              <div key={enrollment.id} className="flex items-center justify-between p-2 bg-white rounded">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{enrollment.course.title}</p>
                                  <p className="text-xs text-gray-500">Enrolled {format(new Date(enrollment.enrolled_at), 'MMM d, yyyy')}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-gray-900">{enrollment.progress_percentage}%</p>
                                  <p className="text-xs text-gray-500">${enrollment.course.price}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Client-specific data */}
                {selectedUser.profiles.role === 'client' && selectedUser.clients && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Client Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Total Bookings</label>
                          <p className="text-2xl font-bold text-purple-600">{selectedUser.clients.bookings?.length || 0}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Total Spent</label>
                          <p className="text-2xl font-bold text-green-600">
                            ${selectedUser.clients.bookings?.reduce((sum, b) => sum + b.total_amount, 0).toLocaleString() || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
