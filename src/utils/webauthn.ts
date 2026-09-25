/**
 * webauthn.ts — Real FIDO2 / WebAuthn passkey utilities for Ember.run
 *
 * Flow:
 *  1. Registration  → navigator.credentials.create() → SHA-256 of credential ID → Ethereum address
 *  2. Authentication → navigator.credentials.get()   → look up stored credential → return account data
 *
 * The derived Ethereum address is deterministic per device credential but cannot sign
 * on-chain transactions without Account Abstraction (ERC-4337). For this demo, it
 * acts as a real identity layer — the address is unique to the user's hardware key.
 */

export interface PasskeyCredential {
  credentialId: string;   // base64url-encoded rawId
  address: string;        // deterministic 0x Ethereum address derived from credential ID
  username: string;
  displayName: string;
  createdAt: number;      // Unix timestamp ms
}

const STORAGE_KEY = 'ember_passkeys_v1';

// ─── Public API ──────────────────────────────────────────────────────────────

/** Returns true if the browser supports WebAuthn / FIDO2 */
export function isWebAuthnSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.PublicKeyCredential !== 'undefined' &&
    typeof navigator.credentials?.create === 'function'
  );
}

/**
 * Register a new passkey credential on this device.
 * Triggers the browser's native biometric prompt (Touch ID / Face ID / Windows Hello / YubiKey).
 * Returns a PasskeyCredential that can be stored and used to derive a wallet address.
 */
export async function registerPasskey(username: string): Promise<PasskeyCredential> {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn is not supported in this browser.');
  }

  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const userId = crypto.getRandomValues(new Uint8Array(16));

  let credential: PublicKeyCredential;
  try {
    credential = (await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: {
          name: 'Ember.run — Monad Curation Market',
          id: window.location.hostname,
        },
        user: {
          id: userId,
          name: username,
          displayName: username,
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },   // ES256 / P-256 (preferred)
          { alg: -257, type: 'public-key' },  // RS256 fallback
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform', // Touch ID, Face ID, Windows Hello
          userVerification: 'preferred',
          residentKey: 'preferred',
        },
        timeout: 60_000,
        attestation: 'none',
      },
    })) as PublicKeyCredential;
  } catch (err: any) {
    if (err.name === 'NotAllowedError') {
      throw new Error('Passkey creation was cancelled or timed out. Please try again.');
    }
    if (err.name === 'InvalidStateError') {
      throw new Error('A passkey already exists for this account on this device.');
    }
    if (err.name === 'NotSupportedError') {
      throw new Error('Your device does not support platform authenticators.');
    }
    throw new Error(`Passkey creation failed: ${err.message}`);
  }

  const credentialId = bufferToBase64Url(credential.rawId);
  const address = await deriveEthereumAddress(credential.rawId);

  const passkeyData: PasskeyCredential = {
    credentialId,
    address,
    username,
    displayName: username,
    createdAt: Date.now(),
  };

  const stored = getStoredPasskeys();
  stored[credentialId] = passkeyData;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

  return passkeyData;
}

/**
 * Authenticate with an existing passkey.
 * If credentialId is provided, prompts for that specific key.
 * Otherwise shows all available keys on the device.
 */
export async function authenticatePasskey(credentialId?: string): Promise<PasskeyCredential | null> {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn is not supported in this browser.');
  }

  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const allowCredentials: PublicKeyCredentialDescriptor[] = credentialId
    ? [{ id: base64UrlToBuffer(credentialId), type: 'public-key' }]
    : [];

  let assertion: PublicKeyCredential;
  try {
    assertion = (await navigator.credentials.get({
      publicKey: {
        challenge,
        userVerification: 'preferred',
        allowCredentials,
        timeout: 60_000,
      },
    })) as PublicKeyCredential;
  } catch (err: any) {
    if (err.name === 'NotAllowedError') {
      throw new Error('Passkey authentication was cancelled. Please try again.');
    }
    throw new Error(`Passkey authentication failed: ${err.message}`);
  }

  const returnedCredId = bufferToBase64Url(assertion.rawId);
  const stored = getStoredPasskeys();

  if (stored[returnedCredId]) {
    return stored[returnedCredId];
  }

  // Credential used but not in our storage — recover by deriving address
  const address = await deriveEthereumAddress(assertion.rawId);
  const recovered: PasskeyCredential = {
    credentialId: returnedCredId,
    address,
    username: 'Passkey Voyager',
    displayName: 'Passkey Voyager',
    createdAt: Date.now(),
  };
  stored[returnedCredId] = recovered;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  return recovered;
}

/** Returns all passkeys stored in localStorage for this origin */
export function getStoredPasskeys(): Record<string, PasskeyCredential> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Returns an array of all stored passkeys, sorted newest first */
export function listStoredPasskeys(): PasskeyCredential[] {
  const map = getStoredPasskeys();
  return Object.values(map).sort((a, b) => b.createdAt - a.createdAt);
}

/** Removes a stored passkey record (does NOT revoke the hardware credential) */
export function removeStoredPasskey(credentialId: string): void {
  const stored = getStoredPasskeys();
  delete stored[credentialId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function deriveEthereumAddress(rawId: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', rawId);
  const hashBytes = new Uint8Array(hashBuffer);
  const addrBytes = hashBytes.slice(hashBytes.length - 20);
  return '0x' + Array.from(addrBytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64UrlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}
