import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiSearch, FiMenu, FiHome, FiEdit, FiMail, FiSend, FiStar, FiUserPlus, FiSettings, FiFilePlus, FiChevronLeft, FiChevronRight, FiX, FiUsers, FiFileText, FiShield, FiDatabase, FiActivity } from 'react-icons/fi';

import { Helmet } from 'react-helmet';
import { useTheme } from '../contexts/ThemeContext';
import Home from './dashboard-components/DashboardHome';
import SetupCompany from "./dashboard-components/SetupCompany";
import Compose from "./dashboard-components/Compose";
import Inbox from "./dashboard-components/Inbox";
import Sent from "./dashboard-components/Sent";
import Important from "./dashboard-components/Important";
import CreateUser from "./dashboard-components/CreateUser";
import Permission from "./dashboard-components/Permission";
import Find from "./dashboard-components/Find";
import Settings from "./dashboard-components/Settings";
import AddFiles from "./dashboard-components/AddFileCategories";
import AddFileReference from "./dashboard-components/AddFileReference";
import AssignToUsers from "./dashboard-components/AssignToUsers";
import ThemeSelector from "./dashboard-components/ThemeSelector";
import ChangeUserRole from './dashboard-components/ChangeUserRole';
import PasswordResetRequests from './dashboard-components/PasswordResetRequests';

// Enhanced Sidebar component with improved organization
function SidebarInline({ 
  isCollapsed, 
  onLinkClick, 
  onSelect, 
  activeSection, 
  theme, 
  permissionsMap, 
  currentRole, 
  onToggleCollapse 
}) {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 text-sm group relative overflow-hidden ${
      isActive 
        ? `bg-gradient-to-r ${theme.sidebarActive} text-white shadow-lg ${theme.sidebarShadow}` 
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md'
    } ${isCollapsed ? 'justify-center' : ''}`;

  const iconClass = (isActive) => 
    `transition-transform duration-300 ${isActive ? 'scale-105' : 'group-hover:scale-105'} ${
      isCollapsed ? 'text-lg' : ''
    }`;

  const tooltipVariants = {
    hidden: { opacity: 0, x: -10, scale: 0.8 },
    visible: { opacity: 1, x: 0, scale: 1 }
  };

  const hasAccess = (key) => {
    try {
      if (!permissionsMap) return true;
      if (!currentRole) return true;
      if (currentRole === 'superadmin') return true;
      // permissionsMap may be either: { permissionKey: [allowedRoles...] } (new)
      // or legacy: { role: { permissionKey: boolean } }
      const perm = permissionsMap[key];
      if (Array.isArray(perm)) {
        return perm.includes(currentRole);
      }
      // legacy shape fallback
      const rolePerms = permissionsMap[currentRole] || {};
      return rolePerms[key] !== false;
    } catch (e) {
      return true;
    }
  };

  const menuSections = [
    {
      title: "Main Menu",
      items: [
        { key: "home", icon: FiHome, label: "Dashboard", badge: null },
        { key: "compose", icon: FiEdit, label: "Compose", badge: null },
        { key: "inbox", icon: FiMail, label: "Inbox", badge: "12" },
        { key: "sent", icon: FiSend, label: "Sent", badge: null },
        { key: "important", icon: FiStar, label: "Important", badge: "3" },
      ]
    },
    {
      title: "Document Management",
      items: [
        { key: "add-files", icon: FiFilePlus, label: "Add Files", badge: null },
        { key: "file-references", icon: FiFileText, label: "File References", badge: null },
        { key: "assign-users", icon: FiUserPlus, label: "Assign Users", badge: null },
        { key: "find", icon: FiSearch, label: "Find Documents", badge: null },
      ]
    },
    {
      title: "Administration",
      items: [
        { key: "create-user", icon: FiUserPlus, label: "Create User", badge: null },
        { key: "change-user-role", icon: FiShield, label: "Change Roles", badge: null },
        { key: "password-resets", icon: FiUsers, label: "Password Resets", badge: "2" },
        { key: "permissions", icon: FiDatabase, label: "Permissions", badge: null },
        { key: "setup-company", icon: FiSettings, label: "Setup Company", badge: null },
      ]
    }
  ];

  return (
    <motion.div 
      className={`bg-white/95 backdrop-blur-xl border-r border-gray-200 h-full flex flex-col ${
        isCollapsed ? 'w-20' : 'w-64'
      } transition-all duration-500 overflow-hidden shadow-xl`}
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      style={{ 
        scrollbarWidth: 'thin',
        scrollbarColor: `${theme.scrollbarThumb} ${theme.scrollbarTrack}`
      }}
    >
      {/* Sidebar Header */}
      <div className={`p-6 border-b border-gray-100 ${isCollapsed ? 'text-center' : ''}`}>
        <motion.div
          initial={false}
          animate={{ scale: isCollapsed ? 0.8 : 1 }}
          className="flex items-center justify-center"
        >
          <div className={`w-12 h-12 bg-gradient-to-br ${theme.sidebarActive} rounded-2xl flex items-center justify-center shadow-lg`}>
            <FiActivity className="text-white text-lg" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="ml-3"
              >
                <span className="font-bold text-gray-800 text-lg whitespace-nowrap block">DocuFlow</span>
                <span className="text-xs text-gray-500">Management System</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuSections.map((section, sectionIndex) => (
          <div key={section.title} className="mb-6">
            <div className={`text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 ${
              isCollapsed ? 'text-center' : 'px-3'
            }`}>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {section.title}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-1">
              {section.items.filter(item => hasAccess(item.key)).map((item) => {
                const isActive = activeSection === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      if (onSelect) onSelect(item.key);
                      if (onLinkClick) onLinkClick();
                    }}
                    className={linkClass({ isActive })}
                  >
                    <span className={`w-10 h-8 flex items-center justify-center rounded-md ${
                      isActive ? 'bg-white/20' : 'bg-transparent'
                    }`}>
                      <item.icon className={iconClass(isActive)} />
                    </span>
                    
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="whitespace-nowrap flex-1 text-left"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {item.badge && !isCollapsed && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {item.badge}
                      </span>
                    )}

                    {isCollapsed && (
                      <motion.div
                        variants={tooltipVariants}
                        initial="hidden"
                        whileHover="visible"
                        className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap z-50 shadow-xl"
                      >
                        {item.label}
                        {item.badge && (
                          <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                            {item.badge}
                          </span>
                        )}
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className={`p-4 border-t border-gray-100 ${isCollapsed ? 'text-center' : ''}`}>
        <div className="space-y-3">
          <button
            onClick={() => onToggleCollapse && onToggleCollapse()}
            className="flex items-center justify-center px-3 py-2 rounded-xl hover:bg-gray-50 transition-all duration-300 text-sm w-full group"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <FiChevronRight className="text-gray-500 group-hover:text-gray-700" />
            ) : (
              <FiChevronLeft className="text-gray-500 group-hover:text-gray-700" />
            )}
          </button>

          {/* removed collapsed-label toggle as labels are no longer shown when collapsed */}
        </div>
      </div>
    </motion.div>
  );
}

// Home view is moved to `src/pages/Home.js`.

// Enhanced Dashboard component
export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isThemeDialogOpen, setIsThemeDialogOpen] = useState(false);

  // Permission map (permission key -> array of allowed roles)
  const DEFAULT_PERMISSIONS = {
    compose: ['superadmin','admin','moderator'],
    'compose-draft': ['superadmin','admin','moderator'],
    'compose-send-outside': ['superadmin','admin'],
    // Inbox fine-grained
    'inbox-all': ['superadmin','admin','moderator','user'],
    'inbox-drafts': ['superadmin','admin','moderator'],
    'inbox-outside': ['superadmin','admin','moderator','user'],
    // Sent fine-grained
    'sent-all': ['superadmin','admin','moderator','user'],
    'sent-drafts': ['superadmin','admin','moderator'],
    'sent-outside': ['superadmin','admin','moderator','user'],
    important: ['superadmin','admin','moderator','user'],
    'create-user': ['superadmin','admin'],
    permissions: ['superadmin','admin'],
    'setup-company': ['superadmin'],
    'add-files': ['superadmin','admin'],
    'file-references': ['superadmin','admin'],
    'assign-users': ['superadmin','admin'],
    find: ['superadmin','admin','moderator','user']
  };

  const [permissionsMap, setPermissionsMap] = useState(() => {
    try {
      const raw = localStorage.getItem('permissions_map');
      return raw ? JSON.parse(raw) : DEFAULT_PERMISSIONS;
    } catch (e) { return DEFAULT_PERMISSIONS; }
  });

  const [currentRole] = useState(() => {
    try { return localStorage.getItem('current_role') || 'superadmin'; } catch { return 'superadmin'; }
  });

  useEffect(() => {
    try { localStorage.setItem('permissions_map', JSON.stringify(permissionsMap)); } catch {}
    try { window.dispatchEvent(new Event('permissionsChanged')); } catch (e) {}
  }, [permissionsMap]);

  useEffect(() => {
    try { localStorage.setItem('current_role', currentRole); } catch {}
  }, [currentRole]);

  // Use global theme from ThemeContext
  const { theme, selectedThemeKey, setSelectedThemeKey } = useTheme();

  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) || { full_name: 'John Doe', user_name: 'johndoe' }; } catch (e) { return { full_name: 'John Doe', user_name: 'johndoe' }; }
  });

  useEffect(() => {
    function onProfile() {
      try { setUser(JSON.parse(localStorage.getItem('user')) || { full_name: 'John Doe', user_name: 'johndoe' }); } catch (e) { setUser({ full_name: 'John Doe', user_name: 'johndoe' }); }
    }
    window.addEventListener('userProfileChanged', onProfile);
    return () => window.removeEventListener('userProfileChanged', onProfile);
  }, []);

  const logout = () => {
    try { localStorage.removeItem('user'); } catch (e) {}
    navigate('/login');
  };

  const parts = location.pathname.split('/').filter(Boolean);
  const initialSection = parts[1] || 'home';
  const [activeSection, setActiveSection] = useState(initialSection);

  useEffect(() => {
    const p = location.pathname.split('/').filter(Boolean);
    setActiveSection(p[1] || 'home');
  }, [location.pathname]);

  // Home content moved into `src/pages/Home.js` (stats, activities, quick actions, and performance metrics)

  const notifications = [
    { id: 1, title: 'System maintenance scheduled', time: 'Just now', unread: true, type: 'system' },
    { id: 2, title: 'New user registration approved', time: '5 min ago', unread: true, type: 'user' },
    { id: 3, title: 'Storage threshold reached', time: '1 hour ago', unread: false, type: 'storage' },
    { id: 4, title: 'Backup completed successfully', time: '2 hours ago', unread: false, type: 'system' },
  ];

  const titleMap = {
    home: 'Dashboard Overview',
    compose: 'Compose Message',
    inbox: 'Inbox Messages',
    sent: 'Sent Items',
    important: 'Important Messages',
    'create-user': 'Create New User',
    'settings': 'User Settings',
    permissions: 'Permissions Management',
    'setup-company': 'Company Setup',
    'add-files': 'Add Files & Categories',
    'assign-users': 'Assign To Users',
    'file-references': 'File References',
    find: 'Find Documents',
    'change-user-role': 'Change User Roles',
    'password-resets': 'Password Reset Requests'
  };

  const canAccess = (key) => {
    try {
      if (!permissionsMap) return true;
      if (!currentRole) return true;
      if (currentRole === 'superadmin') return true;
      const perm = permissionsMap[key];
      if (Array.isArray(perm)) return perm.includes(currentRole);
      // legacy shape fallback
      const rolePerms = permissionsMap[currentRole] || {};
      return rolePerms[key] !== false;
    } catch (e) { return true; }
  };

  // Quick action handling is handled by the Home component now.

  return (
    <div className={`h-screen bg-gradient-to-br ${theme.root} overflow-hidden`}>
      <Helmet>
        <title>{titleMap[activeSection] || 'Dashboard'} - DocuFlow</title>
        <meta name="description" content={titleMap[activeSection] ? `${titleMap[activeSection]} - Professional Document Management System` : 'Dashboard - Professional Document Management System'} />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="flex h-full">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex h-full flex-col relative">
          <div className="h-full overflow-hidden">
            <SidebarInline 
              isCollapsed={isSidebarCollapsed} 
              onLinkClick={() => setIsMobileSidebarOpen(false)} 
              onSelect={(s) => setActiveSection(s)}
              activeSection={activeSection}
              theme={theme}
              permissionsMap={permissionsMap}
              currentRole={currentRole}
              onToggleCollapse={() => setIsSidebarCollapsed(s => !s)}
            />
          </div>
          
          {/* Collapse Toggle Button */}
          <motion.button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-3 top-6 w-6 h-6 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-300 hover:scale-110 z-10"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {isSidebarCollapsed ? (
              <FiChevronRight className="text-gray-600 text-sm" />
            ) : (
              <FiChevronLeft className="text-gray-600 text-sm" />
            )}
          </motion.button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Enhanced Top Header */}
          <motion.header 
            className={`bg-gradient-to-r ${theme.header} backdrop-blur-xl border-b border-white/20 p-4 lg:p-6 flex-shrink-0 ${theme.text} shadow-lg`}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Mobile menu button */}
                <button 
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="lg:hidden p-3 bg-white/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm hover:bg-white/30"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiMenu className="text-white text-lg" />
                </button>
                
                <div>
                  <motion.h1 
                    className="text-2xl lg:text-3xl font-bold text-white"
                    key={activeSection}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {titleMap[activeSection] || 'Dashboard'}
                  </motion.h1>
                  <p className="text-white/80 text-sm mt-1 flex items-center gap-2">
                    <span>Welcome back,</span>
                    <span className="font-semibold">{user?.full_name || user?.user_name || 'Guest'}</span>
                    <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
                      {currentRole}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Enhanced Search Bar */}
                <motion.div 
                  className="hidden md:flex items-center bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
                  whileHover={{ scale: 1.02 }}
                  whileFocus={{ scale: 1.02 }}
                >
                  <FiSearch className="text-white/80 mr-3 text-lg" />
                  <input 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    placeholder="Search documents, messages, users..." 
                    className="outline-none text-sm bg-transparent w-48 lg:w-64 placeholder-white/60 text-white"
                  />
                </motion.div>

                {/* Enhanced Notifications */}
                <motion.div className="relative">
                  <button 
                    onClick={() => setShowNotifications(s => !s)}
                    className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 relative"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiBell className="text-white text-lg" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full border-2 border-white/20 animate-pulse"></span>
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                      >
                        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                          <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-gray-800 text-lg">Notifications</h3>
                            <span className="px-3 py-1 bg-indigo-500 text-white text-xs rounded-full font-medium">
                              {notifications.filter(n => n.unread).length} new
                            </span>
                          </div>
                        </div>
                        <div className="max-h-96 overflow-y-auto custom-scrollbar">
                          {notifications.map((notification, index) => (
                            <motion.div 
                              key={notification.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className={`p-4 border-b border-gray-50 hover:bg-gray-50/80 transition-colors group ${
                                notification.unread ? 'bg-blue-50/50' : ''
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex items-start gap-3 flex-1">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mt-1 ${
                                    notification.type === 'system' ? 'bg-blue-100 text-blue-600' :
                                    notification.type === 'user' ? 'bg-green-100 text-green-600' :
                                    'bg-orange-100 text-orange-600'
                                  }`}>
                                    <FiBell className="text-sm" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800">{notification.title}</p>
                                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                                  </div>
                                </div>
                                {notification.unread && (
                                  <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></span>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                        <div className="p-3 border-t border-gray-100 bg-gray-50">
                          <button className="w-full text-center text-sm text-gray-600 hover:text-gray-800 transition-colors py-2">
                            View all notifications
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Enhanced Theme chooser button */}
                <motion.button
                  type="button"
                  onClick={() => setIsThemeDialogOpen(true)}
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl hover:shadow-xl transition-all duration-300 text-white hover:bg-white/30"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Choose theme"
                >
                  <FiSettings className="text-lg" />
                </motion.button>

                {/* Enhanced User avatar */}
                <motion.button
                  onClick={() => setActiveSection('settings')}
                  title="Profile & Settings"
                  className="flex items-center justify-center w-10 h-10 rounded-2xl overflow-hidden border-2 border-white/30 hover:border-white/50 transition-all duration-300 bg-white/20 backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {user && user.avatarDataUrl ? (
                    <img src={user.avatarDataUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-2xl bg-white/20 flex items-center justify-center text-white font-semibold">
                      {user?.full_name?.charAt(0) || user?.user_name?.charAt(0) || 'U'}
                    </div>
                  )}
                </motion.button>

                {/* Enhanced Logout Button */}
                <motion.button 
                  onClick={logout}
                  className="px-4 py-3 bg-white/20 backdrop-blur-sm text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium hover:bg-white/30 border border-white/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Logout
                </motion.button>
              </div>
            </div>
          </motion.header>

          {/* Theme chooser modal */}
          <AnimatePresence>
            {isThemeDialogOpen && (
              <motion.div 
                className="fixed inset-0 z-50 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                  onClick={() => setIsThemeDialogOpen(false)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                <motion.div 
                  className="relative w-full max-w-2xl mx-4"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                >
                  <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
                    <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-800">Choose Theme</h3>
                      <button 
                        onClick={() => setIsThemeDialogOpen(false)} 
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-700"
                      >
                        <FiX className="text-lg" />
                      </button>
                    </div>
                    <div className="p-6 max-h-96 overflow-y-auto">
                      <ThemeSelector selectedKey={selectedThemeKey} onSelect={setSelectedThemeKey} />
                    </div>
                    <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                      <button 
                        onClick={() => setIsThemeDialogOpen(false)} 
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
                      >
                        Apply Theme
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content Area */}
          <div className="flex-1 overflow-auto p-4 lg:p-6 content-scrollbar">
            {!canAccess(activeSection) ? (
              <div className="mx-auto w-full lg:w-[80vw] max-w-full">
                <div className="p-12 bg-white rounded-3xl shadow-lg text-center border border-gray-200">
                  <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <FiShield className="text-red-500 text-3xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">Access Denied</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    You don't have permission to access this section. Please contact your administrator 
                    or switch to a role with appropriate permissions.
                  </p>
                  <button 
                    onClick={() => setActiveSection('home')}
                    className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            ) : activeSection === 'setup-company' ? (
              <div className="mx-auto w-full lg:w-[80vw] max-w-full">
                <SetupCompany />
              </div>
            ) : activeSection === 'compose' ? (
              <div className="mx-auto w-full lg:w-[80vw] max-w-full">
                <Compose />
              </div>
            ) : activeSection === 'inbox' ? (
              <div className="mx-auto w-full lg:w-[80vw] max-w-full">
                <Inbox />
              </div>
            ) : activeSection === 'sent' ? (
              <div className="mx-auto w-full lg:w-[80vw] max-w-full">
                <Sent />
              </div>
            ) : activeSection === 'important' ? (
              <div className="mx-auto w-full lg:w-[80vw] max-w-full">
                <Important />
              </div>
            ) : activeSection === 'create-user' ? (
              <div className="mx-auto w-full lg:w-[80vw] max-w-full">
                <CreateUser />
              </div>
            ) : activeSection === 'settings' ? (
              <div className="mx-auto w-full lg:w-[80vw] max-w-full">
                <Settings />
              </div>
            ) : activeSection === 'password-resets' ? (
              <div className="mx-auto w-full lg:w-[80vw] max-w-full">
                <PasswordResetRequests />
              </div>
            ) : activeSection === 'change-user-role' ? (
              <div className="mx-auto w-full lg:w-[80vw] max-w-full">
                <ChangeUserRole />
              </div>
            ) : activeSection === 'permissions' ? (
              <div className="mx-auto w-full lg:w-[80vw] max-w-full">
                <Permission permissionsMap={permissionsMap} onSave={setPermissionsMap} />
              </div>
            ) : activeSection === 'add-files' ? (
              <div className="mx-auto w-full lg:w-[80vw] max-w-full">
                <AddFiles />
              </div>
            ) : activeSection === 'file-references' ? (
              <div className="mx-auto w-full lg:w-[80vw] max-w-full">
                <AddFileReference />
              </div>
            ) : activeSection === 'assign-users' ? (
              <div className="mx-auto w-full lg:w-[80vw] max-w-full">
                <AssignToUsers />
              </div>
            ) : activeSection === 'find' ? (
              <div className="mx-auto w-full lg:w-[80vw] max-w-full">
                <Find />
              </div>
            ) : (
              <Home onNavigate={(s) => setActiveSection(s)} />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Slide-over Sidebar */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div 
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="absolute inset-0 bg-black/30 backdrop-blur-sm" 
              onClick={() => setIsMobileSidebarOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div 
              initial={{ x: '-100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '-100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-80 h-full bg-white shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="font-bold text-xl text-gray-800">DocuFlow Menu</div>
                <button 
                  onClick={() => setIsMobileSidebarOpen(false)} 
                  className="p-3 hover:bg-gray-100 rounded-2xl transition-colors"
                >
                  <FiX className="text-gray-600 text-lg" />
                </button>
              </div>
              <div className="h-full overflow-y-auto custom-scrollbar">
                <SidebarInline 
                  isCollapsed={false} 
                  onLinkClick={() => setIsMobileSidebarOpen(false)} 
                  onSelect={(s) => setActiveSection(s)}
                  activeSection={activeSection}
                  theme={theme}
                  permissionsMap={permissionsMap}
                  currentRole={currentRole}
                  onToggleCollapse={() => setIsSidebarCollapsed(s => !s)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add CSS for progress bar animation */}
      <style jsx>{`
        @keyframes growWidth {
          from { width: 0%; }
          to { width: var(--target-width); }
        }
      `}</style>
    </div>
  );
}