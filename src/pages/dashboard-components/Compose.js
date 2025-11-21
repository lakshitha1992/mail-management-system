import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FiSend, 
  FiPaperclip, 
  FiPlus, 
  FiSave, 
  FiEdit, 
  FiTrash2, 
  FiMail,
  FiExternalLink,
  FiFileText,
  FiClock,
  FiArchive
} from 'react-icons/fi';

const DRAFTS_KEY = 'draft_mails_v1';
const SENT_KEY = 'sent_mails_v1';

export default function Compose() {
  const { theme } = useTheme() || {};
  const [canDraft, setCanDraft] = useState(true);
  const [canSendOutside, setCanSendOutside] = useState(true);
  const [activeTab, setActiveTab] = useState('drafts');
  const [drafts, setDrafts] = useState(() => {
    try { return JSON.parse(localStorage.getItem(DRAFTS_KEY)) || []; } catch { return []; }
  });
  const [editingId, setEditingId] = useState(null);
  const [to, setTo] = useState('');
  const [content, setContent] = useState('');
  const [fileRef, setFileRef] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [earlierNo, setEarlierNo] = useState('');

  // Send Outside state
  const [outTo, setOutTo] = useState('');
  const [outDescription, setOutDescription] = useState('');
  const [outAttach, setOutAttach] = useState(null);
  const [outFileRef, setOutFileRef] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    try { localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts)); } catch {}
  }, [drafts]);

  // Read permissions from localStorage (saved by Dashboard)
  useEffect(() => {
    function refreshPermissions() {
      try {
        const rawMap = localStorage.getItem('permissions_map');
        const role = localStorage.getItem('current_role') || 'superadmin';
        if (!rawMap) {
          setCanDraft(true);
          setCanSendOutside(true);
          return;
        }
        const parsed = JSON.parse(rawMap);
        // parsed may be role->keys (Dashboard shape) or key->[roles] (old shape)
        if (parsed[role]) {
          const rolePerms = parsed[role] || {};
          setCanDraft(!!rolePerms['compose-draft']);
          setCanSendOutside(!!rolePerms['compose-send-outside']);
        } else {
          // parsed is key -> [roles]
          const draftAllowed = (parsed['compose-draft'] || []).includes(role);
          const sendAllowed = (parsed['compose-send-outside'] || []).includes(role);
          setCanDraft(!!draftAllowed);
          setCanSendOutside(!!sendAllowed);
        }
      } catch (e) {
        setCanDraft(true);
        setCanSendOutside(true);
      }
    }

    refreshPermissions();
    window.addEventListener('permissionsChanged', refreshPermissions);
    return () => window.removeEventListener('permissionsChanged', refreshPermissions);
  }, []);

  const saveDraft = () => {
    const payload = {
      id: editingId || Date.now().toString(),
      to, content, fileRef, referenceNo, earlierNo, 
      updatedAt: new Date().toISOString()
    };
    setDrafts(prev => {
      const existing = prev.filter(d => d.id !== payload.id);
      return [payload, ...existing];
    });
    setEditingId(payload.id);
  };

  const loadDraft = (d) => {
    setEditingId(d.id);
    setTo(d.to || '');
    setContent(d.content || '');
    setFileRef(d.fileRef || '');
    setReferenceNo(d.referenceNo || '');
    setEarlierNo(d.earlierNo || '');
    setActiveTab('drafts');
  };

  const deleteDraft = (id) => {
    setDrafts(prev => prev.filter(d => d.id !== id));
    if (editingId === id) {
      setEditingId(null); 
      setTo(''); 
      setContent(''); 
      setFileRef(''); 
      setReferenceNo(''); 
      setEarlierNo('');
    }
  };

  const sendDraft = (id) => {
    const d = drafts.find(x => x.id === id);
    if (!d) return;
    try {
      const sent = JSON.parse(localStorage.getItem(SENT_KEY)) || [];
      const newSent = [{ ...d, sentAt: new Date().toISOString() }, ...sent];
      localStorage.setItem(SENT_KEY, JSON.stringify(newSent));
    } catch {}
    deleteDraft(id);
  };

  const sendOutside = async () => {
    const payload = { 
      id: Date.now().toString(), 
      to: outTo, 
      description: outDescription, 
      fileRef: outFileRef, 
      attachName: outAttach ? outAttach.name : null, 
      sentAt: new Date().toISOString() 
    };
    try {
      const sent = JSON.parse(localStorage.getItem(SENT_KEY)) || [];
      localStorage.setItem(SENT_KEY, JSON.stringify([payload, ...sent]));
      setOutTo(''); 
      setOutDescription(''); 
      setOutAttach(null); 
      setOutFileRef('');
      if (fileInputRef.current) fileInputRef.current.value = null;
    } catch (e) { console.error(e); }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const tabVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0, 
      x: -20,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div 
      className="compose-container rounded-3xl p-8 shadow-2xl border"
      style={{ 
        background: 'var(--card-bg)', 
        color: 'var(--card-text)', 
        borderColor: 'var(--border)',
        backdropFilter: 'blur(10px)'
      }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div className="flex items-center justify-between mb-8" variants={itemVariants}>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl" style={{ background: 'var(--primary)', color: 'white' }}>
            <FiMail size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--card-text)' }}>Compose Message</h2>
            <p className="text-sm opacity-70" style={{ color: 'var(--muted)' }}>
              Draft mailbox and external communication
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div className="flex gap-2 mb-8" variants={itemVariants}>
        {canDraft && (
          <button 
            onClick={() => setActiveTab('drafts')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
              activeTab === 'drafts' 
                ? 'shadow-lg scale-105' 
                : 'opacity-70 hover:opacity-100'
            }`}
            style={activeTab === 'drafts' ? 
              { background: 'var(--primary)', color: 'white' } : 
              { background: 'var(--btn-bg)', color: 'var(--btn-text)' }
            }
          >
            <FiFileText size={18} />
            Draft Mail
          </button>
        )}

        {canSendOutside && (
          <button 
            onClick={() => setActiveTab('outside')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
              activeTab === 'outside' 
                ? 'shadow-lg scale-105' 
                : 'opacity-70 hover:opacity-100'
            }`}
            style={activeTab === 'outside' ? 
              { background: 'var(--primary)', color: 'white' } : 
              { background: 'var(--btn-bg)', color: 'var(--btn-text)' }
            }
          >
            <FiExternalLink size={18} />
            Send Outside
          </button>
        )}

        {!canDraft && !canSendOutside && (
          <div className="p-4 rounded-xl text-sm text-gray-500">You don't have permissions to compose or send messages.</div>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === 'drafts' ? (
          <motion.div
            key="drafts"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid lg:grid-cols-3 gap-8"
          >
            {/* Draft Form */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div variants={itemVariants}>
                <label className="text-sm font-medium mb-2 block opacity-80">Recipient</label>
                <input 
                  value={to} 
                  onChange={(e) => setTo(e.target.value)} 
                  className="w-full rounded-xl p-4 transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    border: '1px solid var(--border)', 
                    background: 'var(--input-bg, transparent)', 
                    color: 'var(--card-text)',
                  }}
                  placeholder="Enter recipient email address"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="text-sm font-medium mb-2 block opacity-80">Message Content</label>
                <textarea 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)} 
                  className="w-full rounded-xl p-4 h-48 transition-all duration-300 focus:ring-2 focus:ring-opacity-50 resize-none"
                  style={{ 
                    border: '1px solid var(--border)', 
                    background: 'var(--input-bg, transparent)', 
                    color: 'var(--card-text)'
                  }}
                  placeholder="Type your message here..."
                />
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block opacity-80">File Reference</label>
                  <input 
                    value={fileRef} 
                    onChange={(e) => setFileRef(e.target.value)} 
                    className="w-full rounded-xl p-3 transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
                    style={{ 
                      border: '1px solid var(--border)', 
                      background: 'var(--input-bg, transparent)', 
                      color: 'var(--card-text)'
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block opacity-80">Reference No</label>
                  <input 
                    value={referenceNo} 
                    onChange={(e) => setReferenceNo(e.target.value)} 
                    className="w-full rounded-xl p-3 transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
                    style={{ 
                      border: '1px solid var(--border)', 
                      background: 'var(--input-bg, transparent)', 
                      color: 'var(--card-text)'
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block opacity-80">Earlier No</label>
                  <input 
                    value={earlierNo} 
                    onChange={(e) => setEarlierNo(e.target.value)} 
                    className="w-full rounded-xl p-3 transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
                    style={{ 
                      border: '1px solid var(--border)', 
                      background: 'var(--input-bg, transparent)', 
                      color: 'var(--card-text)'
                    }}
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-center gap-3 pt-4">
                <motion.button 
                  onClick={saveDraft}
                  whileHover={{ scale: canDraft ? 1.05 : 1 }}
                  whileTap={{ scale: canDraft ? 0.95 : 1 }}
                  disabled={!canDraft}
                  className={`px-6 py-3 rounded-xl flex items-center gap-3 font-medium shadow-lg transition-all duration-300 ${!canDraft ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{ background: 'var(--btn-bg)', color: 'var(--btn-text)' }}
                >
                  <FiSave size={18} />
                  Save Draft
                </motion.button>
                  {editingId && canDraft && (
                    <motion.button 
                      onClick={() => sendDraft(editingId)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 rounded-xl flex items-center gap-3 font-medium shadow-lg transition-all duration-300"
                      style={{ background: 'var(--primary)', color: 'white' }}
                    >
                      <FiSend size={18} />
                      Send Message
                    </motion.button>
                  )}
              </motion.div>
            </div>

            {/* Draft Mailbox */}
            <div className="lg:col-span-1">
              <motion.div variants={itemVariants} className="flex items-center gap-2 mb-4">
                <FiArchive size={20} className="opacity-70" />
                <h4 className="font-semibold text-lg">Draft Mailbox</h4>
                <span className="px-2 py-1 rounded-full text-xs font-medium ml-auto" 
                      style={{ background: 'var(--primary)', color: 'white' }}>
                  {drafts.length}
                </span>
              </motion.div>
              
              <div className="space-y-3 max-h-96 overflow-auto pr-2">
                {drafts.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 rounded-xl border-2 border-dashed opacity-50"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <FiFileText size={32} className="mx-auto mb-2" />
                    <div className="text-sm">No drafts saved yet</div>
                  </motion.div>
                ) : (
                  drafts.map((d, index) => (
                    <motion.div 
                      key={d.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-lg ${
                        editingId === d.id ? 'ring-2 ring-opacity-50' : ''
                      }`}
                      style={{ 
                        borderColor: 'var(--border)',
                        background: editingId === d.id ? 'var(--primary)' : 'var(--card-bg)',
                        color: editingId === d.id ? 'white' : 'var(--card-text)'
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{d.to || '—'}</div>
                          <div className="text-sm opacity-80 mt-1 line-clamp-2">
                            {d.content || 'No content'}
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                            <FiClock size={12} />
                            {new Date(d.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 ml-3">
                          <motion.button 
                            onClick={() => loadDraft(d)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-all"
                          >
                            <FiEdit size={14} />
                          </motion.button>
                          <motion.button 
                            onClick={() => canDraft ? sendDraft(d.id) : null}
                            whileHover={{ scale: canDraft ? 1.1 : 1 }}
                            whileTap={{ scale: canDraft ? 0.9 : 1 }}
                            disabled={!canDraft}
                            className={`p-2 rounded-lg ${canDraft ? 'bg-green-500 bg-opacity-20 hover:bg-opacity-30' : 'bg-gray-200 text-gray-400 cursor-not-allowed' } transition-all`}
                          >
                            <FiSend size={14} />
                          </motion.button>
                          <motion.button 
                            onClick={() => deleteDraft(d.id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-lg bg-red-500 bg-opacity-20 hover:bg-opacity-30 transition-all"
                          >
                            <FiTrash2 size={14} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="outside"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid lg:grid-cols-3 gap-8"
          >
            {/* Send Outside Form */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div variants={itemVariants}>
                <label className="text-sm font-medium mb-2 block opacity-80">Recipient</label>
                <input 
                  value={outTo} 
                  onChange={(e) => setOutTo(e.target.value)} 
                  className="w-full rounded-xl p-4 transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    border: '1px solid var(--border)', 
                    background: 'var(--input-bg, transparent)', 
                    color: 'var(--card-text)'
                  }}
                  placeholder="Enter external recipient details"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="text-sm font-medium mb-2 block opacity-80">Description</label>
                <textarea 
                  value={outDescription} 
                  onChange={(e) => setOutDescription(e.target.value)} 
                  className="w-full rounded-xl p-4 h-48 transition-all duration-300 focus:ring-2 focus:ring-opacity-50 resize-none"
                  style={{ 
                    border: '1px solid var(--border)', 
                    background: 'var(--input-bg, transparent)', 
                    color: 'var(--card-text)'
                  }}
                  placeholder="Describe your external message..."
                />
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block opacity-80">Attachment</label>
                  <div className="relative">
                    <input 
                      ref={fileInputRef} 
                      type="file" 
                      onChange={(e) => setOutAttach(e.target.files && e.target.files[0])} 
                      className="w-full rounded-xl p-3 border border-dashed transition-all duration-300 hover:border-solid file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold"
                      style={{ 
                        borderColor: 'var(--border)', 
                        background: 'var(--input-bg, transparent)', 
                        color: 'var(--card-text)'
                      }}
                    />
                    <FiPaperclip className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-50" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block opacity-80">File Reference</label>
                  <input 
                    value={outFileRef} 
                    onChange={(e) => setOutFileRef(e.target.value)} 
                    className="w-full rounded-xl p-3 transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
                    style={{ 
                      border: '1px solid var(--border)', 
                      background: 'var(--input-bg, transparent)', 
                      color: 'var(--card-text)'
                    }}
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-4">
                <motion.button 
                  onClick={() => canSendOutside ? sendOutside() : null}
                  whileHover={{ scale: canSendOutside ? 1.05 : 1 }}
                  whileTap={{ scale: canSendOutside ? 0.95 : 1 }}
                  disabled={!canSendOutside}
                  className={`px-8 py-4 rounded-xl flex items-center gap-3 font-medium shadow-lg transition-all duration-300 w-full justify-center ${!canSendOutside ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{ background: 'var(--primary)', color: 'white' }}
                >
                  <FiSend size={20} />
                  Send External Message
                </motion.button>
              </motion.div>
            </div>

            {/* Quick Info */}
            <div className="lg:col-span-1">
              <motion.div variants={itemVariants} className="p-6 rounded-2xl" style={{ background: 'var(--primary)', color: 'white' }}>
                <div className="flex items-center gap-3 mb-4">
                  <FiExternalLink size={24} />
                  <h4 className="font-semibold text-lg">External Sending</h4>
                </div>
                <div className="text-sm opacity-90 space-y-3">
                  <p>Use this section to send messages to external recipients with file attachments and references.</p>
                  <p>All sent messages are automatically archived in your Sent mailbox for future reference.</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}