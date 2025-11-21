import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

export default function Footer() {
  const year = new Date().getFullYear();
  const ctx = useTheme();
  const theme = (ctx && ctx.theme) || {};
  return (
    <footer className="w-full py-4 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-3 text-sm text-gray-700">
          {/* Animated logo placeholder */}
          <motion.div
            className="w-8 h-8 rounded-md flex items-center justify-center text-xs shadow-sm"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden
            style={{ background: `linear-gradient(135deg, ${theme.scrollbarThumb || '#fbbf24'} 0%, rgba(255,255,255,0.08) 100%)`, color: '#fff' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M3 8.5L12 13L21 8.5V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8.5Z" />
            </svg>
          </motion.div>

          {/* Company name and year in one line */}
          <div className="flex items-baseline gap-2">
            <span className="font-medium" style={{ color: 'var(--card-text)' }}>Alright Reserved</span>
            <span className="text-gray-500">© {year}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
