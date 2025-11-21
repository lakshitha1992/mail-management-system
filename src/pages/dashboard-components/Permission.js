import React, { useEffect, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

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

const AVAILABLE_ROLES = ['superadmin','admin','moderator','user'];

const ROLE_COLORS = {
  superadmin: 'from-red-500 to-pink-600',
  admin: 'from-blue-500 to-cyan-600',
  moderator: 'from-emerald-500 to-teal-600',
  user: 'from-purple-500 to-indigo-600'
};

const ROLE_ICONS = {
  superadmin: '👑',
  admin: '⚡',
  moderator: '🛡️',
  user: '👤'
};

export default function Permission({ permissionsMap: propPermissions, onSave }) {
  const { theme } = useTheme() || {};
  // propPermissions is expected as role-> { key: boolean }
  // Internal UI state uses key -> [roles]
  const convertRoleMapToKeyMap = (roleMap) => {
    // roleMap: { role: { key: bool } }
    // return: { key: [roles...] }
    const out = {};
    if (!roleMap) return { ...DEFAULT_PERMISSIONS };
    Object.keys(roleMap).forEach(role => {
      const keys = roleMap[role] || {};
      Object.keys(keys).forEach(k => {
        if (keys[k]) {
          out[k] = out[k] || [];
          if (!out[k].includes(role)) out[k].push(role);
        }
      });
    });
    // ensure default keys exist
    Object.keys(DEFAULT_PERMISSIONS).forEach(k => { out[k] = out[k] || DEFAULT_PERMISSIONS[k].slice(); });
    return out;
  };

  const convertKeyMapToRoleMap = (keyMap) => {
    // keyMap: { key: [roles] }
    const roles = {};
    AVAILABLE_ROLES.forEach(r => roles[r] = {});
    Object.keys(keyMap).forEach(k => {
      const arr = keyMap[k] || [];
      AVAILABLE_ROLES.forEach(r => {
        roles[r][k] = arr.includes(r);
      });
    });
    return roles;
  };

  const [permissionsMap, setPermissionsMap] = useState(() => {
    try {
      if (propPermissions) return convertRoleMapToKeyMap(propPermissions);
      const raw = localStorage.getItem('permissions_map');
      // support both shapes
      if (raw) {
        const parsed = JSON.parse(raw);
        // if parsed is role->map, convert
        const firstLevelKeys = Object.keys(parsed || {});
        if (firstLevelKeys.length && AVAILABLE_ROLES.includes(firstLevelKeys[0])) {
          return convertRoleMapToKeyMap(parsed);
        }
        return parsed;
      }
      return DEFAULT_PERMISSIONS;
    } catch (e) {
      return DEFAULT_PERMISSIONS;
    }
  });

  const [saveState, setSaveState] = useState('idle'); // idle, saving, saved

  useEffect(() => {
    // when parent prop changes, sync internal UI
    if (propPermissions) {
      setPermissionsMap(convertRoleMapToKeyMap(propPermissions));
    }
  }, [propPermissions]);

  function toggleRoleForKey(key, role) {
    setPermissionsMap(prev => {
      const setForKey = new Set(prev[key] || []);
      if (setForKey.has(role)) setForKey.delete(role); else setForKey.add(role);
      return { ...prev, [key]: Array.from(setForKey) };
    });
  }

  const handleSave = async () => {
    setSaveState('saving');
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    // Convert back to role->key map and call onSave if provided
    const roleMap = convertKeyMapToRoleMap(permissionsMap);
    try {
      if (onSave) onSave(roleMap);
      try { localStorage.setItem('permissions_map', JSON.stringify(roleMap)); } catch (e) {}
    } catch (e) {}
    setSaveState('saved');
    setTimeout(() => setSaveState('idle'), 2000);
  };

  const handleReset = () => {
    setPermissionsMap(DEFAULT_PERMISSIONS);
    const roleMap = convertKeyMapToRoleMap(DEFAULT_PERMISSIONS);
    try { if (onSave) onSave(roleMap); try { localStorage.setItem('permissions_map', JSON.stringify(roleMap)); } catch (e){} } catch(e){}
  };

  const keys = Object.keys(DEFAULT_PERMISSIONS);

  return (
    <div className="mx-auto w-full lg:w-[85vw] max-w-full">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-white to-gray-50/80 rounded-3xl p-8 shadow-2xl shadow-gray-200/50 border border-gray-100 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-2xl bg-gradient-to-r ${theme?.header || 'from-indigo-500 to-purple-500'} shadow-lg`}>
                <span className="text-white text-lg">🔐</span>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Permissions & Visibility
              </h2>
            </div>
            <p className="text-gray-600 text-sm max-w-2xl leading-relaxed">
              Control which roles can view each section of the dashboard. 
              <span className="font-medium text-indigo-600"> Changes are saved automatically</span> and take effect immediately.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-medium shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-300"
            >
              ↺ Reset Defaults
            </button>
            
            <button 
              onClick={handleSave}
              disabled={saveState === 'saving'}
              className={`px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none ${
                saveState === 'saved' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                  : `bg-gradient-to-r ${theme?.sidebarActive || 'from-indigo-500 to-purple-500'}`
              } text-white`}
            >
              {saveState === 'saving' ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : saveState === 'saved' ? (
                <span className="flex items-center gap-2">
                  ✓ Saved
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>

        {/* Permissions Grid */}
        <div className="grid gap-4">
          {keys.map((key, index) => (
            <div 
              key={key}
              className="group p-6 bg-white/80 rounded-2xl border border-gray-200/60 hover:border-gray-300/80 transition-all duration-300 hover:shadow-lg backdrop-blur-sm"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-8 bg-gradient-to-b from-indigo-400 to-purple-500 rounded-full shadow-sm"></div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg capitalize">
                        {key.replace('-', ' ')}
                      </h3>
                      <div className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded-lg inline-block mt-1">
                        {key}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {AVAILABLE_ROLES.map(role => (
                    <label 
                      key={role}
                      className="relative flex flex-col items-center gap-2 cursor-pointer group/role"
                    >
                      <input
                        type="checkbox"
                        checked={(permissionsMap[key] || []).includes(role)}
                        onChange={() => toggleRoleForKey(key, role)}
                        className="sr-only"
                      />
                      <div className={`
                        w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 transform group-hover/role:scale-110
                        ${(permissionsMap[key] || []).includes(role) 
                          ? `bg-gradient-to-br shadow-lg ${ROLE_COLORS[role]} text-white` 
                          : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                        }
                      `}>
                        <span className="text-xl">{ROLE_ICONS[role]}</span>
                      </div>
                      <span className={`
                        text-xs font-medium capitalize transition-colors duration-200
                        ${(permissionsMap[key] || []).includes(role) 
                          ? 'text-gray-800' 
                          : 'text-gray-500'
                        }
                      `}>
                        {role}
                      </span>
                      
                      {/* Checkmark indicator */}
                      {(permissionsMap[key] || []).includes(role) && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${ROLE_COLORS[role]}`}></div>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Visual access indicator */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-500">Access granted to:</span>
                <div className="flex gap-1">
                  {AVAILABLE_ROLES.map(role => 
                    (permissionsMap[key] || []).includes(role) && (
                      <div 
                        key={role}
                        className={`w-6 h-6 rounded-full bg-gradient-to-r ${ROLE_COLORS[role]} flex items-center justify-center text-xs text-white shadow-sm`}
                        title={role}
                      >
                        {ROLE_ICONS[role]}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200/60">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"></div>
                <span>Active permissions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span>No access</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-medium text-gray-700">
                {Object.keys(permissionsMap).length} sections configured
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}