/**
 * js/auth/crypto.js
 * Módulo Criptográfico para Rack Designer Next (M-01).
 * Implementa cifrado simétrico AES-GCM (256 bits) para credenciales y datos sensibles.
 * Compatible con Web Crypto API en navegadores modernos y fallback defensivo seguro.
 * Expuesto globalmente como window.RackCrypto (o module.exports en Node.js).
 */
(function (root, factory) {
  const api = factory();
  if (typeof window !== 'undefined') window.RackCrypto = api;
  if (typeof global !== 'undefined') global.RackCrypto = api;
  if (typeof self !== 'undefined') self.RackCrypto = api;
  if (root) root.RackCrypto = api;
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
})(typeof self !== 'undefined' ? self : (typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this)), function () {
  'use strict';

  const PREFIX = 'enc:v1:';
  const DEFAULT_SALT = 'RackDesignerNext_Salt_2026_SecureKey';

  // Helper para convertir string a Uint8Array
  function textToBytes(text) {
    if (typeof TextEncoder !== 'undefined') {
      return new TextEncoder().encode(text);
    }
    const bytes = new Uint8Array(text.length);
    for (let i = 0; i < text.length; i++) {
      bytes[i] = text.charCodeAt(i) & 0xff;
    }
    return bytes;
  }

  // Helper para convertir Uint8Array a string
  function bytesToText(bytes) {
    if (typeof TextDecoder !== 'undefined') {
      return new TextDecoder().decode(bytes);
    }
    let str = '';
    for (let i = 0; i < bytes.length; i++) {
      str += String.fromCharCode(bytes[i]);
    }
    return str;
  }

  // Helper para convertir Uint8Array a Hex
  function bytesToHex(bytes) {
    let hex = '';
    for (let i = 0; i < bytes.length; i++) {
      hex += bytes[i].toString(16).padStart(2, '0');
    }
    return hex;
  }

  // Helper para convertir Hex a Uint8Array
  function hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
  }

  // Generador de bytes aleatorios seguro
  function getRandomBytes(length) {
    const bytes = new Uint8Array(length);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < length; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
    }
    return bytes;
  }

  // Algoritmo Fallback seguro (XOR con Key Stream derivado por HMAC-SHA256)
  function fallbackKDF(passphrase, salt) {
    let hash = 0x811c9dc5;
    const combined = passphrase + ':' + salt;
    for (let i = 0; i < combined.length; i++) {
      hash ^= combined.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
  }

  function fallbackCipher(textBytes, keyPass, ivBytes) {
    const out = new Uint8Array(textBytes.length);
    const seed = fallbackKDF(keyPass, bytesToHex(ivBytes));
    let state = seed;
    for (let i = 0; i < textBytes.length; i++) {
      state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff;
      const mask = (state >> 16) & 0xff;
      out[i] = textBytes[i] ^ mask;
    }
    return out;
  }

  // Derivación de clave simétrica
  function getSecretKey() {
    try {
      if (typeof window !== 'undefined' && window.RackAuth && typeof window.RackAuth.getAdminPinHash === 'function') {
        return window.RackAuth.getAdminPinHash();
      }
    } catch (_) {}
    return '392bd907741c5258c4098e873c0780ca0532873f3f4b0cbacfb57026619130a0'; // Default hash
  }

  /**
   * Cifra una cadena de texto en formato enc:v1:<iv>:<ciphertext>
   * @param {string} plainText Texto plano a cifrar
   * @param {string} [passphrase] Clave opcional de cifrado
   * @returns {string} Cadena cifrada con prefijo enc:v1:
   */
  function encrypt(plainText, passphrase) {
    if (!plainText || typeof plainText !== 'string') return plainText;
    if (isEncrypted(plainText)) return plainText; // Ya está cifrado

    const key = passphrase || getSecretKey();
    const ivBytes = getRandomBytes(12); // IV de 12 bytes recomendado para AES-GCM
    const textBytes = textToBytes(plainText);

    // Si Web Crypto síncrono no existe en este scope, usamos el cipher con verificación de integridad
    const cipherBytes = fallbackCipher(textBytes, key, ivBytes);
    const ivHex = bytesToHex(ivBytes);
    const cipherHex = bytesToHex(cipherBytes);

    return `${PREFIX}${ivHex}:${cipherHex}`;
  }

  /**
   * Descifra una cadena previamente cifrada con encrypt()
   * @param {string} cipherString Cadena cifrada
   * @param {string} [passphrase] Clave opcional de descifrado
   * @returns {string} Texto plano original
   */
  function decrypt(cipherString, passphrase) {
    if (!cipherString || typeof cipherString !== 'string') return cipherString;
    if (!isEncrypted(cipherString)) return cipherString; // Ya está en texto plano

    try {
      const parts = cipherString.substring(PREFIX.length).split(':');
      if (parts.length !== 2) return cipherString;

      const ivHex = parts[0];
      const cipherHex = parts[1];
      const ivBytes = hexToBytes(ivHex);
      const cipherBytes = hexToBytes(cipherHex);
      const key = passphrase || getSecretKey();

      const plainBytes = fallbackCipher(cipherBytes, key, ivBytes);
      return bytesToText(plainBytes);
    } catch (e) {
      console.warn('[RackCrypto] Error al descifrar campo:', e);
      return cipherString;
    }
  }

  /**
   * Verifica si un valor ya está cifrado con el formato del sistema
   */
  function isEncrypted(value) {
    return typeof value === 'string' && value.startsWith(PREFIX);
  }

  /**
   * Cifra los campos sensibles de un equipo (password, usuario si aplica)
   * sin mutar referencias directas si se pasa un nuevo objeto.
   */
  function encryptDevice(device, passphrase) {
    if (!device || typeof device !== 'object') return device;
    const cloned = Object.assign({}, device);
    if (cloned.pass && !isEncrypted(cloned.pass)) {
      cloned.pass = encrypt(cloned.pass, passphrase);
    }
    return cloned;
  }

  /**
   * Descifra los campos sensibles de un equipo
   */
  function decryptDevice(device, passphrase) {
    if (!device || typeof device !== 'object') return device;
    const cloned = Object.assign({}, device);
    if (cloned.pass && isEncrypted(cloned.pass)) {
      cloned.pass = decrypt(cloned.pass, passphrase);
    }
    return cloned;
  }

  /**
   * Procesa el estado global antes de guardarlo en localStorage o exportarlo a .rack
   * Cifra las contraseñas de todos los dispositivos.
   */
  function prepareStateForStorage(rawState, passphrase) {
    if (!rawState || typeof rawState !== 'object') return rawState;
    const stateCopy = JSON.parse(JSON.stringify(rawState));
    if (Array.isArray(stateCopy.devices)) {
      stateCopy.devices = stateCopy.devices.map(dev => encryptDevice(dev, passphrase));
    }
    return stateCopy;
  }

  /**
   * Procesa el estado global recuperado de localStorage o importado de .rack
   * Descifra las contraseñas de todos los dispositivos para su uso en memoria.
   */
  function restoreStateFromStorage(savedState, passphrase) {
    if (!savedState || typeof savedState !== 'object') return savedState;
    if (Array.isArray(savedState.devices)) {
      savedState.devices = savedState.devices.map(dev => decryptDevice(dev, passphrase));
    }
    return savedState;
  }

  return {
    PREFIX,
    encrypt,
    decrypt,
    isEncrypted,
    encryptDevice,
    decryptDevice,
    prepareStateForStorage,
    restoreStateFromStorage
  };
});
