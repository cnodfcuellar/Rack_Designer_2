/**
 * js/auth/roles.js
 * Sistema de roles de usuario para Rack Designer 2.
 * Sin dependencias externas. Se expone como window.RackAuth.
 */
(function () {
  const ROLES = { ADMIN: 'admin', EDITOR: 'editor', VIEWER: 'viewer' };
  const SESSION_KEY = 'RACK_SESSION_USER';
  const PIN_KEY     = 'RACK_ADMIN_PIN';
  const DEFAULT_PIN = 'rack2024';

  // ---- PIN Management ----

  function getAdminPin() {
    return localStorage.getItem(PIN_KEY) || DEFAULT_PIN;
  }

  function setAdminPin(newPin) {
    if (!newPin || newPin.trim().length < 4) return false;
    localStorage.setItem(PIN_KEY, newPin.trim());
    return true;
  }

  function isPinConfigured() {
    return !!localStorage.getItem(PIN_KEY);
  }

  // ---- Session Management ----

  function getCurrentUser() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function _saveUser(role, name) {
    const user = { role, name, loginAt: Date.now() };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  }

  function tryAdminLogin(pin) {
    if (pin === getAdminPin()) {
      return _saveUser(ROLES.ADMIN, 'Administrador');
    }
    return null; // PIN incorrecto
  }

  function loginAsEditor() {
    return _saveUser(ROLES.EDITOR, 'Editor');
  }

  function loginAsViewer() {
    return _saveUser(ROLES.VIEWER, 'Espectador');
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function isAdmin() {
    return getCurrentUser()?.role === ROLES.ADMIN;
  }

  // ---- Permission Matrix ----
  // Qué acciones puede hacer cada rol

  const PERMISSIONS = {
    toggleGodMode:  [ROLES.ADMIN],
    editDevices:    [ROLES.ADMIN, ROLES.EDITOR],
    addRacks:       [ROLES.ADMIN, ROLES.EDITOR],
    deleteRacks:    [ROLES.ADMIN, ROLES.EDITOR],
    addConnections: [ROLES.ADMIN, ROLES.EDITOR],
    clearProject:   [ROLES.ADMIN, ROLES.EDITOR],
    changeAdminPin: [ROLES.ADMIN],
    viewData:       [ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER],
  };

  function can(action) {
    const role = getCurrentUser()?.role;
    return PERMISSIONS[action]?.includes(role) ?? false;
  }

  // ---- Expose API ----
  window.RackAuth = {
    ROLES,
    getAdminPin,
    setAdminPin,
    isPinConfigured,
    getCurrentUser,
    tryAdminLogin,
    loginAsEditor,
    loginAsViewer,
    logout,
    isAdmin,
    can,
  };
})();
