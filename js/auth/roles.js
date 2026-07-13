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
  function sha256_fallback(ascii) {
    function rightRotate(value, amount) {
      return (value >>> amount) | (value << (32 - amount));
    }
    const words = [];
    const asciiLength = ascii.length;
    for (let i = 0; i < asciiLength; i++) {
      words[i >> 2] |= (ascii.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
    }
    const maxWords = ((asciiLength + 8) >> 6) * 16 + 15;
    words[asciiLength >> 2] |= 0x80 << (24 - (asciiLength % 4) * 8);
    words[maxWords] = asciiLength * 8;
    const h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    const k = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];
    for (let i = 0; i < words.length; i += 16) {
      const w = [];
      let a = h[0], b = h[1], c = h[2], d = h[3], e = h[4], f = h[5], g = h[6], j = h[7];
      for (let t = 0; t < 64; t++) {
        if (t < 16) {
          w[t] = words[i + t] || 0;
        } else {
          const s0 = rightRotate(w[t - 15], 7) ^ rightRotate(w[t - 15], 18) ^ (w[t - 15] >>> 3);
          const s1 = rightRotate(w[t - 2], 17) ^ rightRotate(w[t - 2], 19) ^ (w[t - 2] >>> 10);
          w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
        }
        const ch = (e & f) ^ (~e & g);
        const temp1 = (j + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) + ch + k[t] + w[t]) | 0;
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const temp2 = ((rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) + maj) | 0;
        j = g; g = f; f = e; e = (d + temp1) | 0; d = c; c = b; b = a; a = (temp1 + temp2) | 0;
      }
      h[0] = (h[0] + a) | 0;
      h[1] = (h[1] + b) | 0;
      h[2] = (h[2] + c) | 0;
      h[3] = (h[3] + d) | 0;
      h[4] = (h[4] + e) | 0;
      h[5] = (h[5] + f) | 0;
      h[6] = (h[6] + g) | 0;
      h[7] = (h[7] + j) | 0;
    }
    return h.map(word => {
      const hex = (word >>> 0).toString(16);
      return '00000000'.substring(hex.length) + hex;
    }).join('');
  }

  async function hashPIN(pin) {
    if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(pin);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (e) {
        return sha256_fallback(pin);
      }
    }
    return sha256_fallback(pin);
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
    _sessionToken = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : (Math.random().toString(36).substring(2) + Date.now().toString(36));
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
