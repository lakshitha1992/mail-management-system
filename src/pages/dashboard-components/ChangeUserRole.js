import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ROLES = [
  { value: 'superadmin', label: 'Super Admin', color: 'bg-purple-100 text-purple-800' },
  { value: 'admin', label: 'Administrator', color: 'bg-red-100 text-red-800' },
  { value: 'moderator', label: 'Moderator', color: 'bg-blue-100 text-blue-800' },
  { value: 'user', label: 'User', color: 'bg-gray-100 text-gray-800' }
];

const PAGE_SIZE = 20;

export default function ChangeUserRole() {
  const [users, setUsers] = useState(() => {
    try {
      const raw = localStorage.getItem('users');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  const [username, setUsername] = useState('');
  const [role, setRole] = useState('user');
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  useEffect(() => {
    try { 
      localStorage.setItem('users', JSON.stringify(users)); 
    } catch (e) {}
    try { 
      window.dispatchEvent(new Event('userListChanged')); 
    } catch (e) {}
  }, [users]);

  const { theme } = useTheme();

  const addUser = (e) => {
    e.preventDefault();
    const name = username.trim();
    if (!name) {
      showNotification('Please enter a username', 'error');
      return;
    }
    
    if (users.some(u => u.username.toLowerCase() === name.toLowerCase())) {
      showNotification('User already exists!', 'error');
      return;
    }

    const newUser = {
      id: Date.now(),
      username: name,
      role,
      createdAt: new Date().toISOString()
    };
    
    setUsers(prev => [newUser, ...prev]);
    setUsername('');
    setRole('user');
    setPage(1);
    showNotification(`User "${name}" added successfully as ${role}`);
  };

  const updateRole = (id, newRole, username) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
    showNotification(`Role updated to ${newRole} for ${username}`);
  };

  const removeUser = (id, username) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      setUsers(prev => prev.filter(u => u.id !== id));
      showNotification(`User "${username}" deleted successfully`);
    }
  };

  const bulkRoleUpdate = (newRole) => {
    if (selectedUsers.length === 0) {
      showNotification('Please select users first', 'error');
      return;
    }
    
    setUsers(prev => 
      prev.map(u => selectedUsers.includes(u.id) ? { ...u, role: newRole } : u)
    );
    setSelectedUsers([]);
    showNotification(`Updated ${selectedUsers.length} users to ${newRole}`);
  };

  const [selectedUsers, setSelectedUsers] = useState([]);

  const toggleUserSelection = (id) => {
    setSelectedUsers(prev => 
      prev.includes(id) ? prev.filter(userId => userId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filtered.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filtered.map(u => u.id));
    }
  };

  const filtered = useMemo(() => {
    let result = users;
    
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      result = result.filter(u => u.username.toLowerCase().includes(q));
    }
    
    if (selectedRole !== 'all') {
      result = result.filter(u => u.role === selectedRole);
    }
    
    return result;
  }, [users, searchTerm, selectedRole]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  
  useEffect(() => { 
    if (page > totalPages) setPage(totalPages); 
  }, [totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const getRoleColor = (roleValue) => {
    return ROLES.find(r => r.value === roleValue)?.color || 'bg-gray-100 text-gray-800';
  };

  const getRoleLabel = (roleValue) => {
    return ROLES.find(r => r.value === roleValue)?.label || roleValue;
  };

  return (
    <div className="mx-auto w-full lg:w-[90vw] max-w-full p-4">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-300 ${
          notification.type === 'error' 
            ? 'bg-red-500 text-white' 
            : 'bg-green-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="rounded-2xl shadow-xl overflow-hidden" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
        {/* Header */}
        <div className={`p-6 ${theme.header} ${theme.text}`}>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="mt-1" style={{ color: 'var(--muted)' }}>Manage user roles and permissions</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Add User Form */}
          <div className="rounded-xl p-6 shadow-sm" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--card-text)' }}>Add New User</h3>
            <form onSubmit={addUser} className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Username</label>
                <input
                  className="w-full px-4 py-3 rounded-lg border transition-all"
                  style={{ borderColor: 'var(--border)', background: 'var(--card-bg)', color: 'var(--card-text)' }}
                  placeholder="Enter username..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Initial Role</label>
                <select 
                  className="px-4 py-3 rounded-lg border transition-all"
                  style={{ borderColor: 'var(--border)', background: 'var(--card-bg)', color: 'var(--card-text)' }}
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                >
                  {ROLES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              
              <button 
                type="submit" 
                className="px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg"
                style={{ background: 'var(--btn-bg)', color: 'var(--btn-text)' }}
              >
                <span className="flex items-center gap-2">
                  <PlusIcon className="w-4 h-4" />
                  Add User
                </span>
              </button>
            </form>
          </div>

          {/* Filters & Bulk Actions */}
          <div className="rounded-xl p-6 shadow-sm" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end justify-between">
              <div className="flex flex-col lg:flex-row gap-4 flex-1">
                <div className="space-y-2">
                  <label className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Search Users</label>
                  <input
                    className="px-4 py-3 rounded-lg border transition-all w-full lg:w-64"
                    style={{ borderColor: 'var(--border)', background: 'var(--card-bg)', color: 'var(--card-text)' }}
                    placeholder="Search by username..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Filter by Role</label>
                  <select 
                    className="px-4 py-3 rounded-lg border transition-all"
                    style={{ borderColor: 'var(--border)', background: 'var(--card-bg)', color: 'var(--card-text)' }}
                    value={selectedRole} 
                    onChange={(e) => { setSelectedRole(e.target.value); setPage(1); }}
                  >
                    <option value="all">All Roles</option>
                    {ROLES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedUsers.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Bulk Actions</label>
                  <div className="flex gap-2 flex-wrap">
                    {ROLES.map(r => (
                      <button
                        key={r.value}
                        onClick={() => bulkRoleUpdate(r.value)}
                        className="px-4 py-2 rounded-lg border transition-colors text-sm"
                        style={{ borderColor: 'var(--border)', background: 'transparent', color: 'var(--card-text)' }}
                      >
                        Set as {r.label}
                      </button>
                    ))}
                    <button
                      onClick={() => setSelectedUsers([])}
                      className="px-4 py-2 rounded-lg transition-colors text-sm"
                      style={{ background: 'var(--btn-bg)', color: 'var(--btn-text)' }}
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm" style={{ color: 'var(--muted)' }}>
                {filtered.length} user(s) found • {selectedUsers.length} selected
              </div>
              <div className="text-sm" style={{ color: 'var(--muted)' }}>
                Page {page} of {totalPages}
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-xl shadow-sm overflow-hidden" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead style={{ background: 'transparent', borderBottom: '1px solid var(--border)' }}>
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === filtered.length && filtered.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div style={{ color: 'var(--muted)' }}>
                          <UserIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p className="text-lg font-medium">No users found</p>
                          <p className="text-sm">Try adjusting your search or filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : pageItems.map((u, idx) => (
                    <tr 
                      key={u.id} 
                      className={`transition-colors ${selectedUsers.includes(u.id) ? 'bg-blue-50' : ''}`}>
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(u.id)}
                          onChange={() => toggleUserSelection(u.id)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center justify-center text-white text-sm font-medium">
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium" style={{ color: 'var(--card-text)' }}>{u.username}</div>
                            <div className="text-sm" style={{ color: 'var(--muted)' }}>
                              Joined {new Date(u.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={u.role} 
                          onChange={(e) => updateRole(u.id, e.target.value, u.username)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-indigo-500 ${getRoleColor(u.role)}`}
                          style={{ background: 'transparent', color: 'var(--card-text)' }}
                        >
                          {ROLES.map(r => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => removeUser(u.id, u.username)}
                          className="px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                          style={{ background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)' }}
                        >
                          <TrashIcon className="w-4 h-4" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {((page - 1) * PAGE_SIZE) + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} users
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setPage(1)} 
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <ChevronDoubleLeftIcon className="w-4 h-4" />
                  First
                </button>
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                  Previous
                </button>
                
                <div className="flex gap-1 mx-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = page <= 3 ? i + 1 : 
                                  page >= totalPages - 2 ? totalPages - 4 + i : 
                                  page - 2 + i;
                    return pageNum <= totalPages ? (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-lg border transition-colors ${
                          page === pageNum
                            ? 'bg-indigo-500 text-white border-indigo-500'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ) : null;
                  })}
                </div>
                
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  Next
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setPage(totalPages)} 
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  Last
                  <ChevronDoubleRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Icon components (you can replace these with your actual icon library)
const PlusIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const TrashIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const UserIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const ChevronLeftIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const ChevronDoubleLeftIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
  </svg>
);

const ChevronDoubleRightIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
  </svg>
);