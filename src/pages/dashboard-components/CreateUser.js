import React, { useState, useMemo } from "react";
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

// ------------------------
// CREATE USER FORM COMPONENT
// ------------------------
function CreateUserForm({ onClose, onCreate }) {
  const { theme } = useTheme() || {};
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    appointment: "",
    password: ""
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    onCreate({ ...form, photoPreview });
    onClose();
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50">
        {/* Backdrop */}
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.45 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black"
          onClick={onClose}
        />

        {/* Slide-over panel */}
        <motion.aside
          key="panel"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl overflow-auto"
        >
          <div className="p-0">
            <div className={`p-5 bg-gradient-to-r ${theme?.header || 'from-blue-400 via-purple-500 to-pink-400'} shadow-lg`}> 
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white drop-shadow-md">Create New User</h2>
                <button 
                  onClick={onClose}
                  className="text-white/90 hover:text-white transition-colors text-lg font-semibold"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Name Input */}
                <div className="group">
                  <label className="text-sm font-medium text-gray-600 mb-1 block">Full Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-200 rounded-xl bg-white/50 focus:bg-white transition-all duration-300 focus:ring-2 focus:ring-blue-300 focus:border-transparent shadow-sm group-hover:shadow-md"
                    placeholder="Enter full name"
                  />
                </div>

                {/* Mobile Input */}
                <div className="group">
                  <label className="text-sm font-medium text-gray-600 mb-1 block">Mobile Number</label>
                  <input
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    type="tel"
                    className="w-full p-3 border border-gray-200 rounded-xl bg-white/50 focus:bg-white transition-all duration-300 focus:ring-2 focus:ring-purple-300 focus:border-transparent shadow-sm group-hover:shadow-md"
                    placeholder="Enter mobile number"
                  />
                </div>

                {/* Email Input */}
                <div className="group">
                  <label className="text-sm font-medium text-gray-600 mb-1 block">Email Address</label>
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    type="email"
                    className="w-full p-3 border border-gray-200 rounded-xl bg-white/50 focus:bg-white transition-all duration-300 focus:ring-2 focus:ring-pink-300 focus:border-transparent shadow-sm group-hover:shadow-md"
                    placeholder="Enter email address"
                  />
                </div>

                {/* Profile Photo */}
                <div className="group">
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Profile Photo</label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 cursor-pointer">
                      <div className="p-3 border-2 border-dashed border-gray-300 rounded-xl bg-white/30 hover:bg-white/50 transition-colors text-center text-gray-500 hover:text-gray-700 group-hover:border-blue-300">
                        Choose File
                      </div>
                      <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                    </label>
                    {photoPreview && (
                      <div className="relative">
                        <img
                          src={photoPreview}
                          className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg"
                          alt="Preview"
                        />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Appointment */}
                <div className="group">
                  <label className="text-sm font-medium text-gray-600 mb-1 block">Appointment Date & Time</label>
                  <input
                    name="appointment"
                    value={form.appointment}
                    onChange={handleChange}
                    type="datetime-local"
                    className="w-full p-3 border border-gray-200 rounded-xl bg-white/50 focus:bg-white transition-all duration-300 focus:ring-2 focus:ring-green-300 focus:border-transparent shadow-sm group-hover:shadow-md"
                  />
                </div>

                {/* Password */}
                <div className="group">
                  <label className="text-sm font-medium text-gray-600 mb-1 block">Password</label>
                  <div className="relative">
                    <input
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      type={showPassword ? "text" : "password"}
                      placeholder="Create password"
                      className="w-full p-3 border border-gray-200 rounded-xl bg-white/50 focus:bg-white transition-all duration-300 focus:ring-2 focus:ring-orange-300 focus:border-transparent shadow-sm group-hover:shadow-md pr-24"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 px-3 py-1 text-sm bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all shadow-sm"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "🙈 Hide" : "👁 Show"}
                    </button>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end pt-4 gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-medium hover:from-gray-200 hover:to-gray-300 transition-all shadow-sm hover:shadow-md"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className={`px-6 py-3 rounded-xl text-white font-medium bg-gradient-to-r ${theme?.sidebarActive || 'from-blue-500 to-purple-500'} hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
                  >
                    Create User
                  </button>
                </div>

              </form>
            </div>
          </div>
        </motion.aside>
      </div>
    </AnimatePresence>
  );
}

// ------------------------
// MAIN PAGE
// ------------------------
export default function UserManagement() {
  const { theme } = useTheme() || {};
  const [users, setUsers] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [search, setSearch] = useState("");

  // PAGINATION
  const [page, setPage] = useState(1);
  const perPage = 20;

  const filtered = useMemo(() => {
    return users.filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / perPage);

  function handleCreate(user) {
    setUsers(prev => [...prev, { ...user, id: Date.now() }]);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50/30 to-pink-50/50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              User Management
            </h1>
            <p className="text-gray-600 mt-1">Manage your users efficiently</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-initial">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">🔍</span>
              </div>
              <input
                className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white/70 backdrop-blur-sm focus:bg-white focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all w-full shadow-sm"
                placeholder="Search users..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            {/* Create Button */}
            <button
              onClick={() => setOpenForm(true)}
              className={`px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r ${theme?.sidebarActive || 'from-green-500 to-emerald-600'} hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 whitespace-nowrap`}
            >
              <span className="text-lg">+</span> Create User
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                  <th className="p-4 text-left font-semibold text-blue-800/80">Photo</th>
                  <th className="p-4 text-left font-semibold text-blue-800/80">Name</th>
                  <th className="p-4 text-left font-semibold text-blue-800/80">Mobile</th>
                  <th className="p-4 text-left font-semibold text-blue-800/80">Email</th>
                  <th className="p-4 text-left font-semibold text-blue-800/80">Appointment</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {paginated.map((u, i) => (
                  <tr key={u.id || i} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/30 transition-colors group">
                    <td className="p-4">
                      <div className="flex justify-center">
                        {u.photoPreview ? (
                          <div className="relative">
                            <img 
                              src={u.photoPreview} 
                              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg group-hover:scale-110 transition-transform" 
                              alt="Profile" 
                            />
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20"></div>
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center text-gray-500 border-2 border-white shadow-lg">
                            👤
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-gray-700">{u.name}</td>
                    <td className="p-4 text-gray-600">{u.mobile}</td>
                    <td className="p-4 text-gray-600">{u.email}</td>
                    <td className="p-4 text-gray-600">{u.appointment || "—"}</td>
                  </tr>
                ))}

                {paginated.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <div className="text-6xl mb-4">👥</div>
                        <p className="text-lg font-medium text-gray-500">No users found</p>
                        <p className="text-sm mt-1">Create your first user to get started</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
            <div className="text-sm text-gray-600">
              Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage, filtered.length)} of {filtered.length} users
            </div>
            
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-medium hover:from-gray-200 hover:to-gray-300 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                ← Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-10 h-10 rounded-xl font-medium transition-all ${
                        page === pageNum 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                          : 'bg-white/70 text-gray-600 hover:bg-white shadow-sm'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {totalPages > 5 && <span className="px-2 text-gray-400">...</span>}
              </div>

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-medium hover:from-gray-200 hover:to-gray-300 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {openForm && (
        <CreateUserForm
          onClose={() => setOpenForm(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}