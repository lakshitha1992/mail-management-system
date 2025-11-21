import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const THEMES = [
  { key: 'theme1', name: 'Indigo → Purple', header: 'bg-gradient-to-r from-indigo-500 to-purple-500', root: 'bg-gradient-to-br from-indigo-50 via-white to-purple-50', text: 'text-white' },
  { key: 'theme2', name: 'Blue → Teal', header: 'bg-gradient-to-r from-blue-500 to-teal-400', root: 'bg-gradient-to-br from-blue-50 via-white to-teal-50', text: 'text-white' },
  { key: 'theme3', name: 'Pink → Orange', header: 'bg-gradient-to-r from-pink-500 to-orange-400', root: 'bg-gradient-to-br from-pink-50 via-white to-orange-50', text: 'text-white' },
  { key: 'theme4', name: 'Green → Lime', header: 'bg-gradient-to-r from-green-500 to-lime-400', root: 'bg-gradient-to-br from-green-50 via-white to-lime-50', text: 'text-white' },
  { key: 'theme5', name: 'Cyan → Indigo', header: 'bg-gradient-to-r from-cyan-500 to-indigo-500', root: 'bg-gradient-to-br from-cyan-50 via-white to-indigo-50', text: 'text-white' },
  { key: 'theme6', name: 'Rose → Fuchsia', header: 'bg-gradient-to-r from-rose-500 to-fuchsia-500', root: 'bg-gradient-to-br from-rose-50 via-white to-fuchsia-50', text: 'text-white' },
  { key: 'theme7', name: 'Yellow → Amber', header: 'bg-gradient-to-r from-yellow-400 to-amber-400', root: 'bg-gradient-to-br from-yellow-50 via-white to-amber-50', text: 'text-gray-900' },
  { key: 'theme8', name: 'Slate → Zinc', header: 'bg-gradient-to-r from-slate-600 to-zinc-600', root: 'bg-gradient-to-br from-slate-50 via-white to-zinc-50', text: 'text-white' },
  { key: 'theme9', name: 'Purple → Pink', header: 'bg-gradient-to-r from-violet-500 to-pink-500', root: 'bg-gradient-to-br from-violet-50 via-white to-pink-50', text: 'text-white' },
  { key: 'theme10', name: 'Emerald → Teal', header: 'bg-gradient-to-r from-emerald-500 to-teal-500', root: 'bg-gradient-to-br from-emerald-50 via-white to-teal-50', text: 'text-white' },
  { key: 'theme11', name: 'Sky → Indigo', header: 'bg-gradient-to-r from-sky-500 to-indigo-500', root: 'bg-gradient-to-br from-sky-50 via-white to-indigo-50', text: 'text-white' },
  { key: 'theme12', name: 'Pink → Purple', header: 'bg-gradient-to-r from-pink-400 to-purple-600', root: 'bg-gradient-to-br from-pink-50 via-white to-purple-50', text: 'text-white' },
  { key: 'theme13', name: 'Orange → Red', header: 'bg-gradient-to-r from-orange-500 to-red-500', root: 'bg-gradient-to-br from-orange-50 via-white to-red-50', text: 'text-white' },
  { key: 'theme14', name: 'Lime → Green', header: 'bg-gradient-to-r from-lime-500 to-green-500', root: 'bg-gradient-to-br from-lime-50 via-white to-green-50', text: 'text-white' },
  { key: 'theme15', name: 'Cool Gray', header: 'bg-gradient-to-r from-gray-600 to-gray-800', root: 'bg-gradient-to-br from-gray-50 via-white to-gray-100', text: 'text-white' },
];

export default function ThemeSelector({ selectedKey, onSelect }) {
  const ctx = useTheme();
  const save = (key) => {
    try { localStorage.setItem('selectedTheme', key); } catch {};
    if (onSelect) return onSelect(key);
    if (ctx && ctx.setSelectedThemeKey) ctx.setSelectedThemeKey(key);
  };

  return (
    <div className="p-2">
      <div className="text-xs text-gray-600 mb-2">Theme</div>
      <div className="grid grid-cols-5 gap-2">
        {THEMES.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => save(t.key)}
            className={`h-10 w-10 rounded-lg border-2 ${selectedKey === t.key ? 'border-white ring-2 ring-offset-2 ring-indigo-400' : 'border-transparent'} overflow-hidden`}
            title={t.name}
          >
            <div className={`${t.header} h-full w-full`} />
          </button>
        ))}
      </div>
    </div>
  );
}
