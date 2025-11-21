import React, { useEffect, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

// Simple demo component to manage password reset requests stored in localStorage.
// Request shape: { id, username, email, reason, createdAt, handled: boolean }

export default function PasswordResetRequests() {
  const { theme } = useTheme();
  const [requests, setRequests] = useState(() => {
    try {
      const raw = localStorage.getItem('password_reset_requests');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  const [editing, setEditing] = useState(null); // { id, username, newPassword }
  const [filter, setFilter] = useState('');

  useEffect(() => {
    try { localStorage.setItem('password_reset_requests', JSON.stringify(requests)); } catch (e) {}
  }, [requests]);

  // helper to persist user password in localStorage.users
  const applyPasswordToUser = (username, newPassword) => {
    try {
      const raw = localStorage.getItem('users');
      const users = raw ? JSON.parse(raw) : [];
      const updated = users.map(u => u.username === username ? { ...u, password: newPassword } : u);
      localStorage.setItem('users', JSON.stringify(updated));
      // notify other components
      try { window.dispatchEvent(new Event('userListChanged')); } catch (e) {}
      try { window.dispatchEvent(new Event('userProfileChanged')); } catch (e) {}
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleReset = (req) => {
    setEditing({ id: req.id, username: req.username, newPassword: '' });
  };

  const confirmReset = () => {
    if (!editing || !editing.newPassword) return;
    const ok = applyPasswordToUser(editing.username, editing.newPassword);
    if (ok) {
      setRequests(prev => prev.map(r => r.id === editing.id ? { ...r, handled: true } : r));
      setEditing(null);
    } else {
      alert('Failed to apply password — check console.');
    }
  };

  const removeRequest = (id) => {
    if (!window.confirm('Remove this request?')) return;
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  const filtered = requests.filter(r => {
    const q = filter.trim().toLowerCase();
    if (!q) return true;
    return (r.username || '').toLowerCase().includes(q) || (r.email || '').toLowerCase().includes(q) || (r.reason || '').toLowerCase().includes(q);
  });

  return (
    <div className="mx-auto w-full lg:w-[80vw] max-w-full p-4">
      <div className="rounded-2xl shadow-xl overflow-hidden" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
        <div className={`p-6 ${theme.header} ${theme.text}`}>
          <h2 className="text-2xl font-bold">Password Reset Requests</h2>
          <p className="mt-1" style={{ color: 'var(--muted)' }}>Handle incoming password reset requests from users.</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <input
              placeholder="Filter by username, email or reason"
              className="px-3 py-2 rounded-lg border transition-all w-full"
              style={{ borderColor: 'var(--border)', background: 'var(--card-bg)', color: 'var(--card-text)' }}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <div className="text-sm" style={{ color: 'var(--muted)' }}>{filtered.length} request(s)</div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead style={{ borderBottom: '1px solid var(--border)' }}>
                <tr>
                  <th className="px-4 py-2 text-left" style={{ color: 'var(--muted)' }}>User</th>
                  <th className="px-4 py-2 text-left" style={{ color: 'var(--muted)' }}>Email</th>
                  <th className="px-4 py-2 text-left" style={{ color: 'var(--muted)' }}>Reason</th>
                  <th className="px-4 py-2 text-left" style={{ color: 'var(--muted)' }}>Requested</th>
                  <th className="px-4 py-2 text-left" style={{ color: 'var(--muted)' }}>Status</th>
                  <th className="px-4 py-2 text-left" style={{ color: 'var(--muted)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center" style={{ color: 'var(--muted)' }}>No requests found</td>
                  </tr>
                ) : filtered.map(r => (
                  <tr key={r.id} className={`transition-colors ${r.handled ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3" style={{ color: 'var(--card-text)' }}>{r.username}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--card-text)' }}>{r.email}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--muted)' }}>{r.reason || '—'}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--muted)' }}>{new Date(r.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3" style={{ color: r.handled ? 'var(--muted)' : 'var(--card-text)' }}>{r.handled ? 'Handled' : 'Pending'}</td>
                    <td className="px-4 py-3">
                      {!r.handled && (
                        <button onClick={() => handleReset(r)} className="px-3 py-1 rounded-lg mr-2" style={{ background: 'var(--btn-bg)', color: 'var(--btn-text)' }}>Reset</button>
                      )}
                      <button onClick={() => removeRequest(r.id)} className="px-3 py-1 rounded-lg border" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {editing && (
            <div className="bg-white rounded-lg p-4 shadow-sm" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
              <h3 className="font-semibold" style={{ color: 'var(--card-text)' }}>Reset password for {editing.username}</h3>
              <div className="mt-3 flex gap-2 items-center">
                <input type="password" placeholder="New password" value={editing.newPassword} onChange={(e) => setEditing({...editing, newPassword: e.target.value})} className="px-3 py-2 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--card-bg)', color: 'var(--card-text)' }} />
                <button onClick={confirmReset} className="px-3 py-2 rounded-lg" style={{ background: 'var(--btn-bg)', color: 'var(--btn-text)' }}>Apply</button>
                <button onClick={() => setEditing(null)} className="px-3 py-2 rounded-lg border" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
