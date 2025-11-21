import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { FiTrash2, FiShare2, FiMail, FiStar, FiX, FiPaperclip } from 'react-icons/fi';

const DRAFTS_KEY = 'draft_mails_v1';
const SENT_KEY = 'sent_mails_v1';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.2
    }
  }
};

export default function Sent() {
  const { theme } = useTheme() || {};
  const [sent, setSent] = useState([]);
  const [viewModal, setViewModal] = useState(null);
  const [forwardModal, setForwardModal] = useState(null);
  const [forwardState, setForwardState] = useState({ toRecipients: [], remarks: '' });
  const [forwardRecipientInput, setForwardRecipientInput] = useState('');

  // Simple recipient suggestions used for the forwarding UI
  const recipientSuggestions = [
    'alice@example.com',
    'bob@example.com',
    'carol@example.com',
    'david@example.com'
  ];

  useEffect(() => {
    loadData();
    function onStorage(e) { if (e.key === SENT_KEY) loadData(); }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const [permissions, setPermissions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('permissions_map')) || {}; } catch (e) { return {}; }
  });

  useEffect(() => {
    function onPerms() {
      try { setPermissions(JSON.parse(localStorage.getItem('permissions_map')) || {}); } catch (e) { setPermissions({}); }
    }
    window.addEventListener('permissionsChanged', onPerms);
    return () => window.removeEventListener('permissionsChanged', onPerms);
  }, []);

  const role = (localStorage.getItem('current_role') || 'user');
  const canSentAll = !(permissions[role] && permissions[role]['sent-all'] === false);
  const canSentDrafts = !(permissions[role] && permissions[role]['sent-drafts'] === false);
  const canSentOutside = !(permissions[role] && permissions[role]['sent-outside'] === false);

  function loadData() {
    try { setSent(JSON.parse(localStorage.getItem(SENT_KEY)) || []); } catch { setSent([]); }
  }

  function toggleImportant(id) {
    try {
      const list = JSON.parse(localStorage.getItem(SENT_KEY)) || [];
      const next = list.map(i => i.id === id ? { ...i, important: !i.important } : i);
      localStorage.setItem(SENT_KEY, JSON.stringify(next));
      setSent(next);
    } catch (e) { console.error(e); }
  }

  function deleteSent(id) {
    try {
      const list = JSON.parse(localStorage.getItem(SENT_KEY)) || [];
      const next = list.filter(i => i.id !== id);
      localStorage.setItem(SENT_KEY, JSON.stringify(next));
      setSent(next);
    } catch (e) { console.error(e); }
  }

  function openForward(msg) {
    setForwardModal(msg);
    setForwardState({ toRecipients: [], remarks: '' });
  }

  function addRecipientToForward(recipient) {
    if (!recipient) return;
    setForwardState(s => {
      const list = s.toRecipients || [];
      if (list.includes(recipient)) return s;
      return { ...s, toRecipients: [...list, recipient] };
    });
    setForwardRecipientInput('');
  }

  function removeRecipientFromForward(idx) {
    setForwardState(s => ({ ...s, toRecipients: (s.toRecipients || []).filter((_,i)=>i!==idx) }));
  }

  function doForward() {
    if (!forwardModal) return;
    const payload = {
      id: Date.now().toString(),
      to: (forwardState.toRecipients || []).join(', '),
      description: forwardModal.content || forwardModal.description || '',
      originalId: forwardModal.id,
      remarks: forwardState.remarks,
      attachName: forwardModal.attachName || null,
      forwardedAt: new Date().toISOString(),
      _type: 'outside_forward'
    };
    try {
      const list = JSON.parse(localStorage.getItem(SENT_KEY)) || [];
      localStorage.setItem(SENT_KEY, JSON.stringify([payload, ...list]));
      setSent([payload, ...list]);
    } catch (e) { console.error(e); }
    setForwardModal(null);
    alert('Message forwarded and saved to sent mailbox');
  }

  // For Sent view we only show sent messages
  const totalCount = sent.length;

  if (!canSentAll && !canSentDrafts && !canSentOutside) {
    return (
      <div className="rounded-3xl p-6 shadow-lg border backdrop-blur-sm text-center" style={{ background: 'var(--card-bg)', color: 'var(--card-text)', borderColor: 'var(--border)' }}>
        <h3 className="text-lg font-bold">Access Denied</h3>
        <p className="text-sm opacity-70">You do not have permissions to view Sent messages.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="rounded-3xl p-6 shadow-lg border backdrop-blur-sm"
      style={{ 
        background: 'var(--card-bg)', 
        color: 'var(--card-text)', 
        borderColor: 'var(--border)',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02), rgba(255,255,255,0.02))'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <motion.h2 
            variants={itemVariants}
            className="text-2xl font-bold"
            style={{ color: 'var(--primary)' }}
          >
            Sent
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="text-sm opacity-70 mt-1"
          >
            Messages you have sent or forwarded
          </motion.p>
        </div>
        <motion.div 
          variants={itemVariants}
          className="flex gap-4 text-sm"
        >
          <div className="text-center">
            <div className="font-semibold text-lg">{totalCount}</div>
            <div className="opacity-60 text-xs">Sent</div>
          </div>
        </motion.div>
      </div>
      {/* (No tabs for Sent) */}

      {/* Message List */}
      <motion.div variants={containerVariants} className="space-y-3">
        {sent.length === 0 ? (
          <motion.div 
            variants={itemVariants}
            className="text-center py-12 rounded-2xl border-2 border-dashed opacity-60"
          >
            <FiMail className="mx-auto text-4xl mb-3" />
            <div className="font-medium">No sent messages</div>
            <div className="text-sm mt-1">Your Sent folder is empty</div>
          </motion.div>
        ) : (
          sent.map((message, index) => (
            <motion.div
              key={message.id}
              variants={itemVariants}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group p-4 rounded-xl border transition-all duration-300 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800"
              style={{ 
                borderColor: 'var(--border)',
                background: message.important 
                  ? 'linear-gradient(135deg, var(--card-bg) 0%, rgba(245, 158, 11, 0.1) 100%)' 
                  : 'var(--card-bg)'
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <button 
                      onClick={() => toggleImportant(message.id)} 
                      className="transition-transform hover:scale-110"
                    >
                      <FiStar 
                        className="transition-colors"
                        style={{ color: message.important ? 'var(--primary)' : 'var(--muted)' }}
                      />
                    </button>
                    
                    {/* Message Type Badge */}
                    <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'transparent', color: 'var(--muted)' }}>
                      {message._type || 'Sent'}
                    </span>

                    <div className="font-semibold truncate flex-1">
                      {message.to || '—'}
                    </div>
                  </div>

                  <div className="text-sm opacity-80 line-clamp-2 mb-2">
                    {message.content || message.description || 'No content'}
                  </div>

                  <div className="flex items-center gap-4 text-xs opacity-60">
                    {message.fileRef && (
                      <div className="flex items-center gap-1">
                        <FiPaperclip size={12} />
                        <span>Ref: {message.fileRef}</span>
                      </div>
                    )}
                    {message.referenceNo && (
                      <span>#{message.referenceNo}</span>
                    )}
                    {message.sentAt && (
                      <span>Sent: {new Date(message.sentAt).toLocaleDateString()}</span>
                    )}
                    {message.updatedAt && (
                      <span>Updated: {new Date(message.updatedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                  <div className="flex flex-col items-end gap-2 ml-4">
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {canSentOutside ? (
                      <>
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setViewModal(message)}
                          className="px-3 py-2 rounded-lg border text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          View
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openForward(message)}
                          className="px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                          style={{ background: 'var(--primary)', color: 'var(--btn-text)' }}
                        >
                          <FiShare2 size={14} />
                          Forward
                        </motion.button>
                      </>
                    ) : (
                      <div className="text-xs opacity-60 italic">No access to view/forward</div>
                    )}
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => deleteSent(message.id)}
                    className="p-1 rounded text-red-500 opacity-60 hover:opacity-100 transition-opacity"
                  >
                    <FiTrash2 size={14} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
      {/* Forward Modal */}
      <AnimatePresence>
        {forwardModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-2xl rounded-2xl shadow-2xl p-6 backdrop-blur-sm"
              style={{ 
                background: 'var(--card-bg)', 
                border: '1px solid var(--border)',
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.05), rgba(255,255,255,0.05))'
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Forward Message</h3>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setForwardModal(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <FiX />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">To</label>
                  <div className="rounded-xl p-3 border transition-colors focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(forwardState.toRecipients || []).map((r, idx) => (
                        <motion.div 
                          key={r+idx}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="px-3 py-1 rounded-full text-sm flex items-center gap-2"
                          style={{ 
                            background: 'rgba(99,102,241,0.12)', 
                            color: 'var(--card-text)' 
                          }}
                        >
                          <span>{r}</span>
                          <button 
                            onClick={() => removeRecipientFromForward(idx)}
                            className="hover:text-red-500 transition-colors"
                          >
                            ×
                          </button>
                        </motion.div>
                      ))}
                    </div>
                    <input 
                      placeholder="Type email and press Enter..."
                      value={forwardRecipientInput}
                      onChange={(e)=>setForwardRecipientInput(e.target.value)}
                      onKeyDown={(e)=>{ 
                        if(e.key === 'Enter'){ 
                          e.preventDefault(); 
                          addRecipientToForward(forwardRecipientInput.trim()); 
                        } 
                      }}
                      className="w-full bg-transparent outline-none"
                      style={{ color: 'var(--card-text)' }}
                    />
                  </div>
                  
                  {forwardRecipientInput && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 p-2 rounded-lg border max-h-32 overflow-y-auto"
                      style={{ borderColor: 'var(--border)', background: 'var(--card-bg)' }}
                    >
                      {recipientSuggestions
                        .filter(s => s.toLowerCase().includes(forwardRecipientInput.toLowerCase()) && !(forwardState.toRecipients||[]).includes(s))
                        .slice(0,6)
                        .map(s => (
                        <div 
                          key={s} 
                          onClick={() => addRecipientToForward(s)}
                          className="py-2 px-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                        >
                          {s}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Remarks / Minute</label>
                  <textarea 
                    value={forwardState.remarks} 
                    onChange={(e)=>setForwardState(s=>({...s,remarks:e.target.value}))}
                    className="w-full rounded-xl p-3 h-28 resize-none border transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    style={{ 
                      borderColor: 'var(--border)', 
                      background: 'transparent', 
                      color: 'var(--card-text)' 
                    }}
                    placeholder="Add your remarks..."
                  />
                </div>

                <div className="text-sm opacity-70 flex items-center gap-2">
                  <FiPaperclip />
                  <span>No attachment allowed for forwarding</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setForwardModal(null)}
                  className="px-6 py-2 rounded-lg border"
                  style={{ borderColor: 'var(--border)', background: 'transparent', color: 'var(--card-text)' }}
                >
                  Cancel
                </motion.button>
                {canSentOutside ? (
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={doForward}
                    className="px-6 py-2 rounded-lg"
                    style={{ background: 'var(--primary)', color: 'var(--btn-text)' }}
                  >
                    Forward Message
                  </motion.button>
                ) : (
                  <motion.button disabled className="px-6 py-2 rounded-lg opacity-50 cursor-not-allowed" style={{ background: 'var(--primary)', color: 'var(--btn-text)' }}>
                    No permission
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {viewModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-2xl rounded-2xl shadow-2xl p-6 backdrop-blur-sm"
              style={{ 
                background: 'var(--card-bg)', 
                border: '1px solid var(--border)',
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.05), rgba(255,255,255,0.05))'
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Message Details</h3>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setViewModal(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <FiX />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium opacity-70">To</label>
                  <div className="mt-1 font-medium">{viewModal.to}</div>
                </div>

                <div>
                  <label className="text-sm font-medium opacity-70">Content</label>
                  <div className="mt-1 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    {viewModal.description || viewModal.content}
                  </div>
                </div>

                {viewModal.attachName && (
                  <div className="flex items-center gap-2 text-sm">
                    <FiPaperclip />
                    <span>Attachment: {viewModal.attachName}</span>
                  </div>
                )}

                <div className="text-sm opacity-70">
                  Sent: {viewModal.sentAt ? new Date(viewModal.sentAt).toLocaleString() : '-'}
                </div>
              </div>

              <div className="flex justify-end mt-6 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setViewModal(null)}
                  className="px-6 py-2 rounded-lg border transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}