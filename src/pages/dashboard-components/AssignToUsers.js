import React, { useEffect, useState } from "react";
import { useTheme } from '../../contexts/ThemeContext';

const FILES_KEY = "file_references_v1";
const ASSIGN_KEY = "file_assignments_v1";

const SAMPLE_USERS = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com" },
  { id: 2, name: "Bob Smith", email: "bob@example.com" },
  { id: 3, name: "Carlos Diaz", email: "carlos@example.com" },
  { id: 4, name: "Dana Lee", email: "dana@example.com" },
];

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error("readJSON", key, e);
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("writeJSON", key, e);
  }
}

export default function AssignToUsers() {
  const [fileRefs, setFileRefs] = useState(() => readJSON(FILES_KEY, []));
  const [assignments, setAssignments] = useState(() => readJSON(ASSIGN_KEY, []));
  const [users] = useState(SAMPLE_USERS);

  // UI state
  const [selectedRefId, setSelectedRefId] = useState("");
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRefModal, setShowRefModal] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [message, setMessage] = useState(null);

  useEffect(() => {
    function onStorage(e) {
      if (e.key === FILES_KEY) setFileRefs(readJSON(FILES_KEY, []));
      if (e.key === ASSIGN_KEY) setAssignments(readJSON(ASSIGN_KEY, []));
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => writeJSON(ASSIGN_KEY, assignments), [assignments]);

  useEffect(() => {
    // keep local copy in sync with fileRefs storage when component mounts
    setFileRefs(readJSON(FILES_KEY, []));
  }, []);

  function openRefPicker() {
    setShowRefModal(true);
  }

  function selectRef(id) {
    setSelectedRefId(id);
    // pre-load existing assignment
    const found = assignments.find(a => a.refId === id);
    setSelectedUserIds(new Set(found ? found.userIds : []));
    setShowRefModal(false);
  }

  function openUserPicker() {
    if (!selectedRefId) {
      setMessage("Please select a file reference first");
      setTimeout(() => setMessage(null), 2500);
      return;
    }
    setShowUserModal(true);
  }

  function toggleUser(id) {
    setSelectedUserIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function saveAssignment() {
    if (!selectedRefId) return;
    const userIds = Array.from(selectedUserIds);
    setAssignments(prev => {
      const next = prev.filter(p => p.refId !== selectedRefId);
      next.unshift({ refId: selectedRefId, userIds });
      return next;
    });
    // notify other tabs/components
    try { window.dispatchEvent(new Event('fileAssignmentsUpdated')); } catch (e) {}
    setShowUserModal(false);
    setMessage(`Saved ${userIds.length} user(s)`);
    setTimeout(() => setMessage(null), 2500);
  }

  function clearAssignmentFor(refId) {
    setAssignments(prev => prev.filter(p => p.refId !== refId));
    setMessage("Cleared assignments");
    setTimeout(() => setMessage(null), 1800);
  }

  function getRefById(id) {
    return fileRefs.find(f => f.id === id) || null;
  }

  function getUsersPreviewFor(refId) {
    const a = assignments.find(p => p.refId === refId);
    if (!a || !a.userIds || a.userIds.length === 0) return [];
    return a.userIds.map(uid => users.find(u => u.id === uid) || { id: uid, name: `User ${uid}` });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="w-full rounded-b-3xl p-6 mb-6" style={{ background: 'linear-gradient(90deg, var(--primary), rgba(0,0,0,0.05))' }}>
        <div className="mx-auto w-[80vw] max-w-full flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Assign File References</h2>
            <p className="text-sm text-white/90">Choose a file reference and assign users to it</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { setSelectedRefId(''); setSelectedUserIds(new Set()); }} className="bg-white/10 text-white px-3 py-2 rounded">Reset</button>
            <button onClick={() => { setSelectedRefId(''); setSelectedUserIds(new Set()); }} className="bg-white text-sm px-3 py-2 rounded themed-text">Clear</button>
          </div>
        </div>
      </div>

      <div className="flex-1 mx-auto w-[80vw] max-w-full px-4 mb-12">
        {message && <div className="mb-4 p-3 rounded-md bg-green-50 border border-green-200 text-green-800">{message}</div>}

        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
          <div className="p-6 rounded-2xl shadow-lg lg:col-span-1 flex flex-col" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--card-text)' }}>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--card-text)' }}>Selected Reference</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-sm font-medium themed-text mb-1">Reference</label>
                <div className="flex gap-2 items-center">
                  <select value={selectedRefId} onChange={(e) => selectRef(e.target.value)} className="themed-input w-full rounded px-3 py-2 text-sm">
                    <option value="">-- pick a reference --</option>
                    {fileRefs.map(fr => (
                      <option key={fr.id} value={fr.id}>{fr.fileRef} — {fr.meter}</option>
                    ))}
                  </select>
                  <button onClick={openRefPicker} className="px-3 py-2 rounded border text-sm">Search</button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium themed-text mb-1">Assigned Users</label>
                <div className="min-h-[60px] p-2 rounded border bg-white/5">
                  {selectedRefId ? (
                    <div className="flex gap-2 flex-wrap">
                      {getUsersPreviewFor(selectedRefId).length === 0 ? (
                        <span className="text-sm themed-muted">— none assigned —</span>
                      ) : getUsersPreviewFor(selectedRefId).map(u => (
                        <span key={u.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">{u.name.split(' ')[0]}</span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm themed-muted">Select a reference to see assignments</div>
                  )}
                </div>
              </div>

              <div className="mt-auto flex items-center gap-2">
                <button onClick={openUserPicker} className="themed-btn px-4 py-2 rounded">Add / Edit Users</button>
                <button onClick={() => { if (selectedRefId) clearAssignmentFor(selectedRefId); }} className="px-4 py-2 rounded border">Clear</button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 p-6 rounded-2xl shadow-lg h-full flex flex-col" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--card-text)' }}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold" style={{ color: 'var(--card-text)' }}>All References ({fileRefs.length})</h4>
              <div className="text-sm" style={{ color: 'var(--muted)' }}>Select a reference or open search</div>
            </div>

            <div className="flex-1 overflow-auto content-scrollbar">
              {fileRefs.length === 0 ? (
                <div className="h-full flex items-center justify-center themed-muted">
                  <div className="text-center">
                    <p className="text-base">No references found. Create references first.</p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-3">
                  {fileRefs.map(fr => (
                    <div key={fr.id} className={`p-4 rounded-lg border flex items-start justify-between hover:shadow transition-shadow ${selectedRefId === fr.id ? 'ring-2 ring-offset-2' : ''}`}>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-md flex items-center justify-center text-white font-semibold" style={{ background: 'var(--primary)' }}>{fr.fileRef.slice(-3)}</div>
                          <div>
                            <div className="font-semibold themed-text">{fr.fileRef}</div>
                            <div className="text-sm themed-muted">{fr.meter} — {fr.description}</div>
                          </div>
                        </div>
                        <div className="text-xs themed-muted">Created: {fr.createdAt ? new Date(fr.createdAt).toLocaleString() : '-'}</div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-2">
                          <button onClick={() => selectRef(fr.id)} className="text-sm px-3 py-1 bg-yellow-100 text-yellow-800 rounded">Select</button>
                          <button onClick={() => clearAssignmentFor(fr.id)} className="text-sm px-3 py-1 rounded border">Clear</button>
                        </div>
                        <div className="text-xs themed-muted">Assigned: {getUsersPreviewFor(fr.id).length}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reference Picker Modal */}
      {showRefModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowRefModal(false)} />
            <div className="relative w-full max-w-3xl mx-4 rounded-lg shadow-lg" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--card-text)' }}>
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold themed-text">Pick a reference</h3>
              <button onClick={() => setShowRefModal(false)} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>
            <div className="p-4 max-h-80 overflow-auto">
              {fileRefs.length === 0 ? (
                <div className="themed-muted">No references</div>
              ) : (
                <div className="grid gap-2">
                  {fileRefs.map(fr => (
                    <button key={fr.id} onClick={() => selectRef(fr.id)} className="text-left p-3 rounded hover:bg-gray-50 themed-input">{fr.fileRef} — {fr.meter} — {fr.description}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Picker Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowUserModal(false)} />
          <div className="relative w-full max-w-2xl mx-4 rounded-lg shadow-lg" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--card-text)' }}>
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold themed-text">Assign Users</h3>
              <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>
            <div className="p-4 max-h-80 overflow-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
              {users.map(u => (
                <label key={u.id} className="flex items-center gap-3 p-3 rounded-lg border hover:shadow-sm cursor-pointer themed-input">
                  <input type="checkbox" checked={selectedUserIds.has(u.id)} onChange={() => toggleUser(u.id)} className="w-4 h-4 text-indigo-600 rounded" />
                  <div>
                    <div className="text-sm font-medium themed-text">{u.name}</div>
                    <div className="text-xs themed-muted">{u.email}</div>
                  </div>
                </label>
              ))}
            </div>
            <div className="p-4 border-t flex items-center justify-between">
              <div className="text-sm themed-muted">{selectedUserIds.size} selected</div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowUserModal(false)} className="px-4 py-2 rounded-md bg-gray-100 text-sm text-gray-800 hover:bg-gray-200">Cancel</button>
                <button onClick={saveAssignment} className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
