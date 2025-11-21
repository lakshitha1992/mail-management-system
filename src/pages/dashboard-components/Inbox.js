import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { FiEdit, FiTrash2, FiShare2, FiMail, FiStar, FiX, FiPaperclip, FiSend } from 'react-icons/fi';

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

export default function Inbox() {
  const { theme } = useTheme() || {};
  const [drafts, setDrafts] = useState([]);
  const [outside, setOutside] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [viewModal, setViewModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [forwardModal, setForwardModal] = useState(null);
  const [editState, setEditState] = useState({ toRecipients: [], content: '' });
  const [forwardState, setForwardState] = useState({ toRecipients: [], remarks: '' });
  const [editRecipientInput, setEditRecipientInput] = useState('');
  const [forwardRecipientInput, setForwardRecipientInput] = useState('');

  const currentUserRole = (localStorage.getItem('current_role') || localStorage.getItem('current_user_role') || 'user');
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

  const role = (localStorage.getItem('current_role') || localStorage.getItem('current_user_role') || 'user');
  const canInboxAll = !(permissions[role] && permissions[role]['inbox-all'] === false);
  const canInboxDrafts = !(permissions[role] && permissions[role]['inbox-drafts'] === false);
  const canInboxOutside = !(permissions[role] && permissions[role]['inbox-outside'] === false);

  // Filter messages based on active tab
  const filteredMessages = {
    all: [...drafts, ...outside],
    drafts: drafts,
    outside: outside
  }[activeTab];

  const recipientSuggestions = Array.from(new Set([
    ...drafts.map(d => d.to).filter(Boolean),
    ...outside.map(o => o.to).filter(Boolean)
  ])).slice(0, 40);

  // Recipient management functions
  function addRecipientToEdit(recipient) {
    if (!recipient) return;
    setEditState(s => {
      const list = s.toRecipients || [];
      if (list.includes(recipient)) return s;
      return { ...s, toRecipients: [...list, recipient] };
    });
    setEditRecipientInput('');
  }

  function removeRecipientFromEdit(idx) {
    setEditState(s => ({ ...s, toRecipients: (s.toRecipients || []).filter((_,i)=>i!==idx) }));
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

  useEffect(() => {
    loadData();
    function onStorage(e) {
      if (e.key === DRAFTS_KEY || e.key === SENT_KEY) loadData();
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  function loadData() {
    try { setDrafts(JSON.parse(localStorage.getItem(DRAFTS_KEY)) || []); } catch { setDrafts([]); }
    try { setOutside(JSON.parse(localStorage.getItem(SENT_KEY)) || []); } catch { setOutside([]); }

    // Seed dummy data when nothing exists yet
    try {
      const existingDrafts = JSON.parse(localStorage.getItem(DRAFTS_KEY)) || [];
      const existingOutside = JSON.parse(localStorage.getItem(SENT_KEY)) || [];
      if ((existingDrafts.length === 0) && (existingOutside.length === 0)) {
        const sampleDrafts = [
          {
            id: 'd1',
            to: 'finance@company.com',
            content: 'Draft: Please review the attached invoice and confirm payment schedule.',
            fileRef: 'INV-2025-001',
            referenceNo: 'REF-001',
            earlierNo: 'EAR-100',
            updatedAt: new Date().toISOString()
          },
          {
            id: 'd2',
            to: 'hr@company.com',
            content: 'Draft: Proposed holiday schedule for Q4. Need approval from management.',
            fileRef: 'HR-PS-07',
            referenceNo: 'REF-002',
            earlierNo: '',
            updatedAt: new Date().toISOString()
          }
        ];

        const sampleOutside = [
          {
            id: 'o1',
            to: 'client@example.org',
            description: 'Outside: Contract renewal notice sent to client with new terms attached.',
            attachName: 'contract-renewal.pdf',
            sentAt: new Date().toISOString()
          },
          {
            id: 'o2',
            to: 'vendor@example.com',
            description: 'Outside: Request for quote sent for upcoming supply order.',
            attachName: null,
            sentAt: new Date().toISOString()
          }
        ];

        localStorage.setItem(DRAFTS_KEY, JSON.stringify(sampleDrafts));
        localStorage.setItem(SENT_KEY, JSON.stringify(sampleOutside));
        setDrafts(sampleDrafts);
        setOutside(sampleOutside);
      }
    } catch (e) {
      // ignore seed errors
    }
  }

  function openEdit(d) {
    setEditModal(d);
    setEditState({ toRecipients: d.to ? [d.to] : [], content: d.content || '' });
  }

  function saveEditedDraft() {
    if (!editModal) return;
    const updated = { ...editModal, to: (editState.toRecipients || []).join(', '), content: editState.content, updatedAt: new Date().toISOString() };
    const next = [updated, ...drafts.filter(x => x.id !== updated.id)];
    try { localStorage.setItem(DRAFTS_KEY, JSON.stringify(next)); } catch {}
    setDrafts(next);
    setEditModal(null);
  }

  function sendFromDraft(id, finalized = false) {
    const d = drafts.find(x => x.id === id);
    if (!d) return;
    try {
      // All sends move to outside (sent mailbox); finalization role no longer creates a separate internal mailbox
      const sent = JSON.parse(localStorage.getItem(SENT_KEY)) || [];
      localStorage.setItem(SENT_KEY, JSON.stringify([{ ...d, sentAt: new Date().toISOString(), _type: 'outside' }, ...sent]));
    } catch (e) { console.error(e); }
    const next = drafts.filter(x => x.id !== id);
    try { localStorage.setItem(DRAFTS_KEY, JSON.stringify(next)); } catch {}
    setDrafts(next);
    loadData();
  }

  function deleteDraft(id) {
    const next = drafts.filter(x => x.id !== id);
    try { localStorage.setItem(DRAFTS_KEY, JSON.stringify(next)); } catch {}
    setDrafts(next);
  }

  function toggleImportant(type, id) {
    try {
      if (type === 'draft') {
        const list = JSON.parse(localStorage.getItem(DRAFTS_KEY)) || [];
        const next = list.map(i => i.id === id ? { ...i, important: !i.important } : i);
        localStorage.setItem(DRAFTS_KEY, JSON.stringify(next));
        setDrafts(next);
      } else if (type === 'outside') {
        const list = JSON.parse(localStorage.getItem(SENT_KEY)) || [];
        const next = list.map(i => i.id === id ? { ...i, important: !i.important } : i);
        localStorage.setItem(SENT_KEY, JSON.stringify(next));
        setOutside(next);
      }
    } catch (e) { console.error(e); }
  }

  function openForward(msg) {
    setForwardModal(msg);
    setForwardState({ toRecipients: [], remarks: '' });
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
      const sent = JSON.parse(localStorage.getItem(SENT_KEY)) || [];
      localStorage.setItem(SENT_KEY, JSON.stringify([payload, ...sent]));
    } catch (e) { console.error(e); }
    setForwardModal(null);
    loadData();
    alert('Message forwarded and saved to sent mailbox');
  }

  const tabs = [
    ...(canInboxAll ? [{ id: 'all', label: 'All', count: drafts.length + outside.length }] : []),
    ...(canInboxDrafts ? [{ id: 'drafts', label: 'Drafts', count: drafts.length }] : []),
    ...(canInboxOutside ? [{ id: 'outside', label: 'Outside', count: outside.length }] : [])
  ];

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
            Inbox
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="text-sm opacity-70 mt-1"
          >
            Manage your drafts and communications
          </motion.p>
        </div>
        <motion.div 
          variants={itemVariants}
          className="flex gap-4 text-sm"
        >
          {tabs.map(tab => (
            <div key={tab.id} className="text-center">
              <div className="font-semibold text-lg">{tab.count}</div>
              <div className="opacity-60 text-xs">{tab.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex gap-1 mb-6 p-1 rounded-2xl bg-gray-100/50 dark:bg-gray-800/50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-300`}
              style={ activeTab === tab.id ? { background: 'var(--btn-bg)', color: 'var(--btn-text)', boxShadow: 'var(--box-shadow)' } : { color: 'var(--muted)' }}
            >
              {tab.label} {tab.count > 0 && `(${tab.count})`}
            </button>
          ))}
      </motion.div>

      {/* Message List */}
      <motion.div variants={containerVariants} className="space-y-3">
        {filteredMessages.length === 0 ? (
          <motion.div 
            variants={itemVariants}
            className="text-center py-12 rounded-2xl border-2 border-dashed opacity-60"
          >
            <FiMail className="mx-auto text-4xl mb-3" />
            <div className="font-medium">No messages found</div>
            <div className="text-sm mt-1">Your {activeTab} folder is empty</div>
          </motion.div>
        ) : (
          filteredMessages.map((message, index) => (
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
                      onClick={() => toggleImportant(drafts.includes(message) ? 'draft' : 'outside', message.id)} 
                      className="transition-transform hover:scale-110"
                    >
                      <FiStar 
                        className="transition-colors"
                        style={{ color: message.important ? 'var(--primary)' : 'var(--muted)' }}
                      />
                    </button>
                    
                    {/* Message Type Badge */}
                    <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'transparent', color: 'var(--muted)' }}>
                      {drafts.includes(message) ? 'Draft' : 'Outside'}
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
                    {drafts.includes(message) && canInboxDrafts && (
                      <>
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openEdit(message)}
                          className="p-2 rounded-lg border transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <FiEdit style={{ color: 'var(--primary)' }} />
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => sendFromDraft(message.id, false)}
                          className="p-2 rounded-lg"
                          style={{ background: 'var(--btn-bg)', color: 'var(--btn-text)', borderColor: 'var(--border)' }}
                        >
                          <FiSend size={14} />
                        </motion.button>
                        {currentUserRole === 'superior' && (
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => sendFromDraft(message.id, true)}
                            className="px-3 py-2 rounded-lg text-sm font-medium"
                            style={{ background: 'var(--primary)', color: 'var(--btn-text)' }}
                          >
                            Finalize
                          </motion.button>
                        )}
                      </>
                    )}
                    
                    {outside.includes(message) && canInboxOutside && (
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
                    )}

                    
                  </div>

                  {(drafts.includes(message) || outside.includes(message)) && (
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => deleteDraft(message.id)}
                      className="p-1 rounded text-red-500 opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <FiTrash2 size={14} />
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Edit Draft Modal */}
      <AnimatePresence>
        {editModal && (
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
                <h3 className="text-xl font-bold">Edit Draft</h3>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setEditModal(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <FiX />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Recipients</label>
                  <div className="rounded-xl p-3 border transition-colors focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(editState.toRecipients || []).map((r, idx) => (
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
                            onClick={() => removeRecipientFromEdit(idx)}
                            className="hover:text-red-500 transition-colors"
                          >
                            ×
                          </button>
                        </motion.div>
                      ))}
                    </div>
                    <input 
                      placeholder="Type email and press Enter..."
                      value={editRecipientInput}
                      onChange={(e)=>setEditRecipientInput(e.target.value)}
                      onKeyDown={(e)=>{ 
                        if(e.key === 'Enter'){ 
                          e.preventDefault(); 
                          addRecipientToEdit(editRecipientInput.trim()); 
                        } 
                      }}
                      className="w-full bg-transparent outline-none"
                      style={{ color: 'var(--card-text)' }}
                    />
                  </div>
                  
                  {editRecipientInput && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 p-2 rounded-lg border max-h-32 overflow-y-auto"
                      style={{ borderColor: 'var(--border)', background: 'var(--card-bg)' }}
                    >
                      {recipientSuggestions
                        .filter(s => s.toLowerCase().includes(editRecipientInput.toLowerCase()) && !(editState.toRecipients||[]).includes(s))
                        .slice(0,6)
                        .map(s => (
                        <div 
                          key={s} 
                          onClick={() => addRecipientToEdit(s)}
                          className="py-2 px-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                        >
                          {s}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Content</label>
                  <textarea 
                    value={editState.content} 
                    onChange={(e)=>setEditState(s=>({...s,content:e.target.value}))}
                    className="w-full rounded-xl p-3 h-36 resize-none border transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    style={{ 
                      borderColor: 'var(--border)', 
                      background: 'transparent', 
                      color: 'var(--card-text)' 
                    }}
                    placeholder="Type your message here..."
                  />
                </div>
              </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setEditModal(null)}
                  className="px-6 py-2 rounded-lg border"
                  style={{ borderColor: 'var(--border)', background: 'transparent', color: 'var(--card-text)' }}
                >
                  Cancel
                </motion.button>
                
                    {canInboxDrafts ? (
                    <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const updated = { ...editModal, to: (editState.toRecipients||[]).join(', '), content: editState.content };
                    try { 
                      const sent = JSON.parse(localStorage.getItem(SENT_KEY)) || []; 
                      localStorage.setItem(SENT_KEY, JSON.stringify([{ ...updated, sentAt: new Date().toISOString(), _type: 'outside' }, ...sent])); 
                    } catch(e){}
                    try { 
                      const next = (drafts||[]).filter(x=>x.id !== editModal.id); 
                      localStorage.setItem(DRAFTS_KEY, JSON.stringify(next)); 
                      setDrafts(next); 
                    } catch(e){}
                    setEditModal(null);
                    loadData();
                  }}
                  className="px-6 py-2 rounded-lg"
                  style={{ background: 'var(--btn-bg)', color: 'var(--btn-text)' }}
                >
                  Send
                </motion.button>
                ) : (
                  <motion.button disabled className="px-6 py-2 rounded-lg opacity-50 cursor-not-allowed" style={{ background: 'var(--btn-bg)', color: 'var(--btn-text)' }}>
                    No permission
                  </motion.button>
                )}
                
                {currentUserRole === 'superior' && canInboxDrafts && (
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const updated = { ...editModal, to: (editState.toRecipients||[]).join(', '), content: editState.content };
                      try { 
                        const sent = JSON.parse(localStorage.getItem(SENT_KEY)) || []; 
                        localStorage.setItem(SENT_KEY, JSON.stringify([{ ...updated, sentAt: new Date().toISOString(), _type: 'outside' }, ...sent])); 
                      } catch(e){}
                      try { 
                        const next = (drafts||[]).filter(x=>x.id !== editModal.id); 
                        localStorage.setItem(DRAFTS_KEY, JSON.stringify(next)); 
                        setDrafts(next); 
                      } catch(e){}
                      setEditModal(null);
                      loadData();
                    }}
                    className="px-6 py-2 rounded-lg"
                    style={{ background: 'var(--primary)', color: 'var(--btn-text)' }}
                  >
                    Finalize & Send
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                {canInboxOutside ? (
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