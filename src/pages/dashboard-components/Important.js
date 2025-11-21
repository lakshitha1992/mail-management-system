import React, { useEffect, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const DRAFTS_KEY = 'draft_mails_v1';
const SENT_KEY = 'sent_mails_v1';

export default function Important() {
  const { theme } = useTheme() || {};
  const [items, setItems] = useState([]);

  useEffect(() => { loadImportant(); function onStorage(){ loadImportant(); } window.addEventListener('storage', onStorage); return () => window.removeEventListener('storage', onStorage); }, []);

  function loadImportant() {
    try {
      const drafts = JSON.parse(localStorage.getItem(DRAFTS_KEY)) || [];
      const sent = JSON.parse(localStorage.getItem(SENT_KEY)) || [];
      const all = [
        ...drafts.map(d=>({ ...d, _source: 'draft' })),
        ...sent.map(s=>({ ...s, _source: 'outside' })),
      ];
      const important = all.filter(x=>x.important);
      setItems(important);
    } catch (e) { setItems([]); }
  }

  return (
    <div className="rounded-3xl p-6 shadow-lg border" style={{ background: 'var(--card-bg)', color: 'var(--card-text)', borderColor: 'var(--border)' }}>
      <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--card-text)' }}>Important</h2>
      <p className="text-sm" style={{ color: 'var(--muted)' }}>Starred messages across Drafts and Outside.</p>
      <div className="mt-4 space-y-3">
        {items.length === 0 && <div style={{ color: 'var(--muted)' }}>No important items.</div>}
        {items.map(it => (
          <div key={it.id} className="p-3 rounded-lg border flex items-start justify-between" style={{ borderColor: 'var(--border)' }}>
            <div>
              <div className="font-medium" style={{ color: 'var(--card-text)' }}>{it.to || it.description?.slice(0,60) || '—'}</div>
              <div className="text-sm" style={{ color: 'var(--muted)' }}>{(it.content||it.description||'').slice(0,120)}</div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>{it._source}</div>
            </div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>{it.sentAt ? new Date(it.sentAt).toLocaleString() : (it.updatedAt ? new Date(it.updatedAt).toLocaleString() : '')}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
