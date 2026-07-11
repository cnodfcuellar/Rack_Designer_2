/**
 * js/auth/roles.js
 * Sistema de roles de usuario para Rack Designer Next.
 * Sin dependencias externas. Se expone como window.RackAuth.
 */
(function () {
  const ROLES = { ADMIN: 'admin', EDITOR: 'editor', VIEWER: 'viewer' };
  const SESSION_KEY = 'RACK_SESSION_USER';
  const PIN_KEY     = 'RACK_ADMIN_PIN';
  const DEFAULT_PIN_HASH = '392bd907741c5258c4098e873c0780ca0532873f3f4b0cbacfb57026619130a0'; // "rack2024"

  let _sessionToken = null; // Token de integridad en memoria

  // ---- Crypto Utilities ----
  async function hashPIN(pin) {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // ---- PIN Management ----

  function getAdminPinHash() {
    return localStorage.getItem(PIN_KEY) || DEFAULT_PIN_HASH;
  }

  async function validateAdminPin(pin) {
    const hashed = await hashPIN(pin);
    return hashed === getAdminPinHash();
  }

  async function setAdminPin(newPin) {
    if (!newPin || newPin.trim().length < 4) return false;
    const hashed = await hashPIN(newPin.trim());
    localStorage.setItem(PIN_KEY, hashed);
    return true;
  }

  function isPinConfigured() {
    return !!localStorage.getItem(PIN_KEY);
  }

  // ---- Session Management ----

  function getCurrentUser() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const user = JSON.parse(raw);
      
      // Validación de Integridad para Administradores
      if (user.role === ROLES.ADMIN) {
        if (!_sessionToken || user.token !== _sessionToken) {
          console.warn('[Seguridad] Token de sesión alterado o ausente. Forzando logout.');
          logout();
          return null;
        }
      }
      return user;
    } catch { return null; }
  }

  function _saveUser(role, name) {
    _sessionToken = crypto.randomUUID(); // Sello secreto en memoria
    const user = { role, name, loginAt: Date.now(), token: _sessionToken };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  }

  async function tryAdminLogin(pin) {
    if (await validateAdminPin(pin)) {
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
    getAdminPinHash,
    validateAdminPin,
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
