import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

export default function Settings() {
  const { theme } = useTheme() || {};
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [status, setStatus] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user')) || {};
      if (user.avatarDataUrl) setAvatarPreview(user.avatarDataUrl);
    } catch (e) {}
  }, []);

  function handleAvatarChange(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setAvatarFile(f);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(f);
  }

  function validatePasswordChange() {
    if (!currentPassword && !newPassword && !confirmPassword) return { ok: false, message: 'No changes detected' };
    if (!currentPassword) return { ok: false, message: 'Enter current password' };
    if (!newPassword) return { ok: false, message: 'Enter new password' };
    if (newPassword.length < 6) return { ok: false, message: 'New password must be at least 6 characters' };
    if (newPassword !== confirmPassword) return { ok: false, message: 'Passwords do not match' };
    return { ok: true };
  }

  async function handleSave(e) {
    e.preventDefault();
    setStatus(null);

    const user = (() => {
      try { return JSON.parse(localStorage.getItem('user')) || {}; } catch (e) { return {}; }
    })();

    if (avatarFile) {
      const dataUrl = await new Promise((resolve) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.readAsDataURL(avatarFile);
      });
      user.avatarDataUrl = dataUrl;
    }

    const passCheck = validatePasswordChange();
    if (passCheck.ok) {
      user.password = newPassword;
    } else if (passCheck.message && passCheck.message !== 'No changes detected') {
      setStatus({ type: 'error', text: passCheck.message });
      return;
    }

    try {
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setAvatarFile(null);
      setStatus({ type: 'success', text: 'Profile updated successfully!' });
      try { window.dispatchEvent(new Event('userProfileChanged')); } catch (e) {}
      setTimeout(() => setStatus(null), 2500);
    } catch (e) {
      setStatus({ type: 'error', text: 'Failed to save profile' });
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto w-full lg:w-[85vw] max-w-6xl"
    >
      <div className="p-8 rounded-3xl shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent"
            >
              Account Settings
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-sm text-gray-500 mt-2"
            >
              Manage your profile and security preferences
            </motion.p>
          </div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg"
          >
            ⚙️
          </motion.div>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Avatar & Basic Info */}
          <div className="xl:col-span-2 space-y-6">
            {/* Avatar Upload Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Profile Photo
              </h3>
              
              <div className="flex items-start gap-6">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="relative group cursor-pointer"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-gray-100 to-gray-200">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">👤</div>
                    )}
                  </div>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: isHovered ? 1 : 0, 
                      scale: isHovered ? 1 : 0.8 
                    }}
                    className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center"
                  >
                    <span className="text-white text-sm font-medium">Change</span>
                  </motion.div>
                </motion.div>
                
                <div className="flex-1">
                  <label className="block mb-4">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAvatarChange}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="cursor-pointer"
                    >
                      <div className="px-6 py-3 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors text-center group">
                        <div className="text-blue-500 font-medium group-hover:text-blue-600">
                          Upload New Photo
                        </div>
                        <div className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</div>
                      </div>
                    </motion.div>
                  </label>
                  <p className="text-xs text-gray-500">
                    Recommended: Square image, at least 400x400 pixels
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Password Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Change Password
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <motion.input
                      whileFocus={{ scale: 1.02 }}
                      type={showPasswords ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full rounded-xl p-4 border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <motion.input
                      whileFocus={{ scale: 1.02 }}
                      type={showPasswords ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-xl p-4 border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <motion.input
                      whileFocus={{ scale: 1.02 }}
                      type={showPasswords ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl p-4 border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <motion.label 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center gap-3 cursor-pointer"
                    >
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          checked={showPasswords} 
                          onChange={() => setShowPasswords(s => !s)}
                          className="sr-only"
                        />
                        <div className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                          showPasswords ? 'bg-blue-500' : 'bg-gray-300'
                        }`}>
                          <motion.div 
                            className={`w-5 h-5 rounded-full bg-white shadow-lg mt-0.5 ${
                              showPasswords ? 'ml-6' : 'ml-1'
                            }`}
                            layout
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">Show passwords</span>
                    </motion.label>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Save Button */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-between pt-4"
            >
              <AnimatePresence>
                {status && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`px-4 py-2 rounded-xl font-medium ${
                      status.type === 'error' 
                        ? 'bg-red-50 text-red-700 border border-red-200' 
                        : 'bg-green-50 text-green-700 border border-green-200'
                    }`}
                  >
                    {status.text}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <motion.button 
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 rounded-xl font-semibold text-white shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 ml-auto"
              >
                <span>Save Changes</span>
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </motion.button>
            </motion.div>
          </div>

          {/* Right Column - Preview & Info */}
          <div className="space-y-6">
            {/* Profile Preview */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-blue-50/30 border border-gray-200/60 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Profile Preview
              </h3>
              
              <div className="flex items-center gap-4 p-4 bg-white/60 rounded-xl backdrop-blur-sm">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-gradient-to-br from-gray-100 to-gray-200">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">👤</div>
                  )}
                </div>
                <div>
                  <div className="font-bold text-gray-800">
                    {(JSON.parse(localStorage.getItem('user') || '{}').full_name) || 'Current User'}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    @{(JSON.parse(localStorage.getItem('user') || '{}').user_name) || 'username'}
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50/50 rounded-xl border border-blue-200/50">
                <p className="text-xs text-blue-700/80 leading-relaxed">
                  <strong>Note:</strong> Changes affect local demo data only. In production, updates would be securely handled by your server.
                </p>
              </div>
            </motion.div>

            {/* Security Info */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50/30 border border-orange-200/60 shadow-sm"
            >
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                Security Notice
              </h4>
              <div className="space-y-3">
                <p className="text-xs text-orange-700/80 leading-relaxed">
                  🔒 <strong>Demo Only:</strong> Passwords are stored locally for demonstration purposes.
                </p>
                <p className="text-xs text-orange-700/80 leading-relaxed">
                  ⚠️ Do not use real passwords or sensitive information.
                </p>
                <p className="text-xs text-orange-700/80 leading-relaxed">
                  🚀 In production, implement proper server-side authentication and password hashing.
                </p>
              </div>
            </motion.div>
          </div>
        </form>
      </div>
    </motion.div>
  );
}