import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

export default function SetupCompany() {
  const [mainCompany, setMainCompany] = useState({ name: '', address: '' });
  const [branches, setBranches] = useState([]);
  const [mainSaved, setMainSaved] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('main');

  // helper: read file as data URL
  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  useEffect(() => {
    try {
      const existing = localStorage.getItem('companySetup');
      if (existing) {
        const parsed = JSON.parse(existing);
        if (parsed.mainCompany) {
          setMainCompany(parsed.mainCompany);
          if (parsed.mainCompany.name && parsed.mainCompany.address) setMainSaved(true);
        }
        if (Array.isArray(parsed.branches)) setBranches(parsed.branches);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const validate = () => {
    const err = {};
    if (!mainCompany.name || mainCompany.name.trim() === '') err.mainName = 'Required';
    if (!mainCompany.address || mainCompany.address.trim() === '') err.mainAddress = 'Required';
    branches.forEach((b, idx) => {
      if (!b.name || b.name.trim() === '') err[`branchName_${idx}`] = 'Required';
      if (!b.address || b.address.trim() === '') err[`branchAddress_${idx}`] = 'Required';
    });
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const payload = { mainCompany, branches };
      localStorage.setItem('companySetup', JSON.stringify(payload));
      setSaved(true);
      if (mainCompany.name && mainCompany.address) setMainSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch (e) {
      console.error('Failed to save company setup', e);
    }
  };

  const saveMainCompany = (e) => {
    e && e.preventDefault();
    const err = {};
    if (!mainCompany.name || mainCompany.name.trim() === '') err.mainName = 'Required';
    if (!mainCompany.address || mainCompany.address.trim() === '') err.mainAddress = 'Required';
    setErrors(err);
    if (Object.keys(err).length > 0) return;
    try {
      const payload = { mainCompany, branches };
      localStorage.setItem('companySetup', JSON.stringify(payload));
      setMainSaved(true);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch (e) {
      console.error('Failed to save main company', e);
    }
  };

  const addBranch = () => {
    setBranches((s) => [...s, { id: Date.now().toString(), name: '', address: '', logo: '' }]);
    setActiveTab('branches');
  };

  const removeBranch = (id) => {
    setBranches((s) => s.filter((b) => b.id !== id));
  };

  const updateBranch = (id, field, value) => {
    setBranches((s) => s.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
  };

  const updateBranchLogo = async (id, file) => {
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setBranches((s) => s.map((b) => (b.id === id ? { ...b, logo: dataUrl } : b)));
    } catch (e) {
      console.error('Failed to read branch logo', e);
    }
  };

  const removeBranchLogo = (id) => {
    setBranches((s) => s.map((b) => (b.id === id ? { ...b, logo: '' } : b)));
  };

  const updateMainLogo = async (file) => {
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setMainCompany((s) => ({ ...s, logo: dataUrl }));
    } catch (e) {
      console.error('Failed to read main logo', e);
    }
  };

  const removeMainLogo = () => setMainCompany((s) => ({ ...s, logo: '' }));

  const { theme } = useTheme() || {};

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-8 shadow-2xl backdrop-blur-sm"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--card-text)' }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-3xl font-bold mb-2"
              style={{ color: 'var(--card-text)' }}
            >
              Company Setup
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{ color: 'var(--muted)' }}
            >
              Configure your main company details and manage branches
            </motion.p>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 rounded-2xl p-1 mb-8" style={{ background: 'rgba(0,0,0,0.03)' }}>
            <button
              onClick={() => setActiveTab('main')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeTab === 'main'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🏢 Main Company
            </button>
            <button
              onClick={() => setActiveTab('branches')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeTab === 'branches'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🌿 Branches ({branches.length})
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Main Company Section */}
            <AnimatePresence mode="wait">
              {activeTab === 'main' && (
                <motion.div
                  key="main"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {/* Company Card */}
                  <div className="rounded-2xl p-6" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold">Main Company</h3>
                        <p className="text-sm" style={{ color: 'var(--muted)' }}>Your primary business details</p>
                      </div>
                      {mainSaved && (
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"
                        >
                          ✓ Saved
                        </motion.span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company Name *
                          </label>
                          <input
                            value={mainCompany.name}
                            onChange={(e) => setMainCompany((s) => ({ ...s, name: e.target.value }))}
                            placeholder="Acme Corporation"
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-300"
                            style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--card-text)' }}
                          />
                          {errors.mainName && (
                            <motion.span 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-xs text-red-600 mt-1 flex items-center gap-1"
                            >
                              ⚠️ {errors.mainName}
                            </motion.span>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company Address *
                          </label>
                          <textarea
                            value={mainCompany.address}
                            onChange={(e) => setMainCompany((s) => ({ ...s, address: e.target.value }))}
                            placeholder="123 Main Street, Suite 100\nCity, State 12345\nCountry"
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-300 resize-none"
                            style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--card-text)' }}
                            rows={4}
                          />
                          {errors.mainAddress && (
                            <motion.span 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-xs text-red-600 mt-1 flex items-center gap-1"
                            >
                              ⚠️ {errors.mainAddress}
                            </motion.span>
                          )}
                        </div>
                      </div>

                      {/* Logo Upload Section */}
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company Logo
                        </label>
                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl transition-colors duration-300" style={{ borderColor: 'var(--border)', background: 'transparent' }}>
                          {mainCompany.logo ? (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="text-center"
                            >
                              <img 
                                src={mainCompany.logo} 
                                alt="Company logo" 
                                className="w-32 h-32 object-cover rounded-2xl mx-auto mb-4 shadow-md"
                              />
                              <button 
                                type="button" 
                                onClick={removeMainLogo}
                                className="px-4 py-2 rounded-lg text-sm transition-colors duration-300"
                                style={{ background: 'var(--btn-bg)', color: 'var(--btn-text)' }}
                              >
                                Remove Logo
                              </button>
                            </motion.div>
                          ) : (
                            <div className="text-center">
                              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <span className="text-2xl">🏢</span>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">Upload your company logo</p>
                              <label className="px-4 py-2 rounded-lg text-sm cursor-pointer transition-colors duration-300" style={{ background: 'var(--btn-bg)', color: 'var(--btn-text)' }}>
                                Choose File
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const f = e.target.files && e.target.files[0];
                                    if (f) await updateMainLogo(f);
                                  }}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 mt-4" style={{ borderTop: '1px solid var(--border)' }}>
                      <button
                        type="button"
                        onClick={saveMainCompany}
                        className="px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg"
                        style={{ background: 'var(--btn-bg)', color: 'var(--btn-text)', boxShadow: '0 10px 20px rgba(0,0,0,0.06)' }}
                      >
                        Save Main Company
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Branches Section */}
              {activeTab === 'branches' && (
                <motion.div
                  key="branches"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Company Branches</h3>
                      <p className="text-sm text-gray-600">Manage your business locations</p>
                    </div>
                    <button
                      type="button"
                      onClick={addBranch}
                      disabled={!mainSaved}
                      className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform ${
                        mainSaved
                          ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200 hover:scale-105'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      + Add Branch
                    </button>
                  </div>

                  {!mainSaved && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-yellow-600 text-lg">⚠️</span>
                        <p className="text-sm text-yellow-800">
                          Please save the main company details first to add branches.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  <div className="grid gap-4">
                    <AnimatePresence>
                      {branches.map((b, idx) => (
                        <motion.div
                          key={b.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <h4 className="font-medium text-gray-800">
                              Branch {idx + 1}
                            </h4>
                            <button
                              type="button"
                              onClick={() => removeBranch(b.id)}
                              className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors duration-300"
                            >
                              🗑️
                            </button>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Branch Name *
                                </label>
                                <input
                                  value={b.name}
                                  onChange={(e) => updateBranch(b.id, 'name', e.target.value)}
                                  placeholder={`Branch ${idx + 1} Name`}
                                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                />
                                {errors[`branchName_${idx}`] && (
                                  <span className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                    ⚠️ {errors[`branchName_${idx}`]}
                                  </span>
                                )}
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Branch Address *
                                </label>
                                <input
                                  value={b.address}
                                  onChange={(e) => updateBranch(b.id, 'address', e.target.value)}
                                  placeholder="Branch address"
                                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                />
                                {errors[`branchAddress_${idx}`] && (
                                  <span className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                    ⚠️ {errors[`branchAddress_${idx}`]}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Branch Logo
                              </label>
                              <div className="flex items-center gap-4">
                                {b.logo ? (
                                  <div className="flex items-center gap-4">
                                    <img 
                                      src={b.logo} 
                                      alt="Branch logo" 
                                      className="w-16 h-16 object-cover rounded-xl shadow-sm"
                                    />
                                    <button 
                                      type="button" 
                                      onClick={() => removeBranchLogo(b.id)}
                                      className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors duration-300"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ) : (
                                  <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition-colors duration-300 cursor-pointer bg-white">
                                    <span className="text-2xl">🌿</span>
                                    <div>
                                      <p className="text-sm font-medium text-gray-700">Upload logo</p>
                                      <p className="text-xs text-gray-500">Click to browse</p>
                                    </div>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={async (e) => {
                                        const f = e.target.files && e.target.files[0];
                                        if (f) await updateBranchLogo(b.id, f);
                                      }}
                                      className="hidden"
                                    />
                                  </label>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {branches.length === 0 && mainSaved && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                      >
                        <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                          <span className="text-3xl">🏢</span>
                        </div>
                        <h4 className="text-lg font-medium text-gray-600 mb-2">No branches yet</h4>
                        <p className="text-gray-500 text-sm">
                          Add your first branch to get started
                        </p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Save Button */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-between pt-6 border-t border-gray-200"
            >
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all duration-300 transform hover:scale-105 active:scale-95"
                >
                  💾 Save All Changes
                </button>
                {saved && (
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-2"
                  >
                    <span>✓</span>
                    Changes Saved!
                  </motion.span>
                )}
              </div>
              
              <div className="text-right">
                <p className="text-xs text-gray-500">
                  Data stored locally in your browser
                </p>
                <p className="text-xs text-gray-400">
                  Secure • Private • Instant
                </p>
              </div>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}