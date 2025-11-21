import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export default function Find() {
  const { theme } = useTheme() || {};
  return (
    <div className="rounded-3xl p-6 shadow-lg border" style={{ background: 'var(--card-bg)', color: 'var(--card-text)', borderColor: 'var(--border)' }}>
      <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--card-text)' }}>Find</h2>
      <p className="text-sm" style={{ color: 'var(--muted)' }}>Search documents and files (placeholder).</p>
      <div className="mt-4">
        <input placeholder="Search..." className="w-full rounded-lg p-2" style={{ border: '1px solid var(--border)', background: 'transparent', color: 'var(--card-text)' }} />
      </div>
    </div>
  );
}
