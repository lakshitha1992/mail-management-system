import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({});

const THEMES_MAP = {
  theme1: { 
    header: 'from-indigo-500 to-purple-500', 
    root: 'from-indigo-50 via-white to-purple-50', 
    text: 'text-white',
    sidebarActive: 'from-indigo-500 to-purple-500',
    sidebarShadow: 'shadow-indigo-500/25',
    scrollbarTrack: '#e0e7ff',
    scrollbarThumb: '#6366f1'
  },
  theme2: { 
    header: 'from-blue-500 to-teal-400', 
    root: 'from-blue-50 via-white to-teal-50', 
    text: 'text-white',
    sidebarActive: 'from-blue-500 to-teal-400',
    sidebarShadow: 'shadow-blue-500/25',
    scrollbarTrack: '#dbeafe',
    scrollbarThumb: '#3b82f6'
  },
  theme3: { 
    header: 'from-pink-500 to-orange-400', 
    root: 'from-pink-50 via-white to-orange-50', 
    text: 'text-white',
    sidebarActive: 'from-pink-500 to-orange-400',
    sidebarShadow: 'shadow-pink-500/25',
    scrollbarTrack: '#fce7f3',
    scrollbarThumb: '#ec4899'
  },
  theme4: { 
    header: 'from-green-500 to-lime-400', 
    root: 'from-green-50 via-white to-lime-50', 
    text: 'text-white',
    sidebarActive: 'from-green-500 to-lime-400',
    sidebarShadow: 'shadow-green-500/25',
    scrollbarTrack: '#dcfce7',
    scrollbarThumb: '#22c55e'
  },
  theme5: { 
    header: 'from-cyan-500 to-indigo-500', 
    root: 'from-cyan-50 via-white to-indigo-50', 
    text: 'text-white',
    sidebarActive: 'from-cyan-500 to-indigo-500',
    sidebarShadow: 'shadow-cyan-500/25',
    scrollbarTrack: '#cffafe',
    scrollbarThumb: '#06b6d4'
  },
  theme6: { 
    header: 'from-rose-500 to-fuchsia-500', 
    root: 'from-rose-50 via-white to-fuchsia-50', 
    text: 'text-white',
    sidebarActive: 'from-rose-500 to-fuchsia-500',
    sidebarShadow: 'shadow-rose-500/25',
    scrollbarTrack: '#ffe4e6',
    scrollbarThumb: '#f43f5e'
  },
  theme7: { 
    header: 'from-yellow-400 to-amber-400', 
    root: 'from-yellow-50 via-white to-amber-50', 
    text: 'text-gray-900',
    sidebarActive: 'from-yellow-400 to-amber-400',
    sidebarShadow: 'shadow-yellow-500/25',
    scrollbarTrack: '#fef9c3',
    scrollbarThumb: '#eab308'
  },
  theme8: { 
    header: 'from-slate-600 to-zinc-600', 
    root: 'from-slate-50 via-white to-zinc-50', 
    text: 'text-white',
    sidebarActive: 'from-slate-600 to-zinc-600',
    sidebarShadow: 'shadow-slate-500/25',
    scrollbarTrack: '#f1f5f9',
    scrollbarThumb: '#475569'
  },
  theme9: { 
    header: 'from-violet-500 to-pink-500',
    root: 'from-violet-50 via-white to-pink-50',
    text: 'text-white',
    sidebarActive: 'from-violet-500 to-pink-500',
    sidebarShadow: 'shadow-violet-500/25',
    scrollbarTrack: '#f5f3ff',
    scrollbarThumb: '#8b5cf6'
  },
  theme10: {
    header: 'from-emerald-500 to-teal-500',
    root: 'from-emerald-50 via-white to-teal-50',
    text: 'text-white',
    sidebarActive: 'from-emerald-500 to-teal-500',
    sidebarShadow: 'shadow-emerald-500/25',
    scrollbarTrack: '#ecfdf5',
    scrollbarThumb: '#10b981'
  },
  theme11: {
    header: 'from-sky-500 to-indigo-500',
    root: 'from-sky-50 via-white to-indigo-50',
    text: 'text-white',
    sidebarActive: 'from-sky-500 to-indigo-500',
    sidebarShadow: 'shadow-sky-500/25',
    scrollbarTrack: '#f0f9ff',
    scrollbarThumb: '#0ea5e9'
  },
  theme12: {
    header: 'from-pink-400 to-purple-600',
    root: 'from-pink-50 via-white to-purple-50',
    text: 'text-white',
    sidebarActive: 'from-pink-400 to-purple-600',
    sidebarShadow: 'shadow-pink-400/25',
    scrollbarTrack: '#fff1f2',
    scrollbarThumb: '#fb7185'
  },
  theme13: {
    header: 'from-orange-500 to-red-500',
    root: 'from-orange-50 via-white to-red-50',
    text: 'text-white',
    sidebarActive: 'from-orange-500 to-red-500',
    sidebarShadow: 'shadow-orange-500/25',
    scrollbarTrack: '#fff7ed',
    scrollbarThumb: '#fb923c'
  },
  theme14: {
    header: 'from-lime-500 to-green-500',
    root: 'from-lime-50 via-white to-green-50',
    text: 'text-white',
    sidebarActive: 'from-lime-500 to-green-500',
    sidebarShadow: 'shadow-lime-500/25',
    scrollbarTrack: '#f7fee7',
    scrollbarThumb: '#84cc16'
  },
  theme15: {
    header: 'from-gray-600 to-gray-800',
    root: 'from-gray-50 via-white to-gray-100',
    text: 'text-white',
    sidebarActive: 'from-gray-600 to-gray-800',
    sidebarShadow: 'shadow-gray-600/25',
    scrollbarTrack: '#f3f4f6',
    scrollbarThumb: '#6b7280'
  }
};

export const ThemeProvider = ({ children }) => {
  const [selectedThemeKey, setSelectedThemeKey] = useState(() => {
    try { return localStorage.getItem('selectedTheme') || 'theme1'; } catch { return 'theme1'; }
  });

  useEffect(() => {
    try { localStorage.setItem('selectedTheme', selectedThemeKey); } catch {}
    const themeDef = THEMES_MAP[selectedThemeKey] || THEMES_MAP.theme1;
    try {
      const root = document.documentElement;
      root.style.setProperty('--primary', themeDef.scrollbarThumb || '#6366f1');
      root.style.setProperty('--card-bg', '#ffffff');
      root.style.setProperty('--card-text', '#1f2937');
      root.style.setProperty('--muted', '#718096');
      root.style.setProperty('--btn-bg', themeDef.scrollbarThumb || '#6366f1');
      root.style.setProperty('--btn-text', '#ffffff');
      root.style.setProperty('--border', '#e6e9f2');
    } catch (e) {}

    const styleId = 'theme-context-scrollbars';
    let style = document.getElementById(styleId);
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      document.head.appendChild(style);
    }
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar { width: 6px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: ${themeDef.scrollbarTrack}; border-radius: 10px; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: ${themeDef.scrollbarThumb}; border-radius: 10px; }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: ${themeDef.scrollbarThumb}dd; }
      .content-scrollbar::-webkit-scrollbar { width: 8px; }
      .content-scrollbar::-webkit-scrollbar-track { background: ${themeDef.scrollbarTrack}; border-radius: 10px; }
      .content-scrollbar::-webkit-scrollbar-thumb { background: ${themeDef.scrollbarThumb}; border-radius: 10px; }
      .content-scrollbar::-webkit-scrollbar-thumb:hover { background: ${themeDef.scrollbarThumb}dd; }
    `;
    return () => {};
  }, [selectedThemeKey]);

  const value = {
    theme: THEMES_MAP[selectedThemeKey] || THEMES_MAP.theme1,
    selectedThemeKey,
    setSelectedThemeKey
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
