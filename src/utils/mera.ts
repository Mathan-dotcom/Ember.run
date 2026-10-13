/**
 * mera.ts — Category Labs Mera Integration for Ember.run
 *
 * Target Bounties:
 *  1. Best Mera-Powered UX on Monad
 *  2. Mera: One Passkey, Many Keys
 *
 * Architecture:
 *  One hardware passkey (Touch ID / Face ID / Windows Hello) unlocks the WebAuthn PRF
 *  (Pseudo-Random Function) extension, deterministically deriving 3 distinct keys:
 *    • Key 1 (Vault Account): Primary holding & author earnings withdrawal wallet on Monad Testnet.
 *    • Key 2 (Session Curation Key): Pre-authorized ephemeral secp256k1 key for zero-prompt instant boosts.
 *    • Key 3 (Identity / Cross-chain Key): Ed25519 identity key for cross-chain reputation proofs.
 */

import {
  createPasskeyWithPrfOutput,
  getPasskeyPrfOutput,
  getEvmAddress,
  getSolanaAddress,
  createSecp256k1SigningSession
} from '@category-labs/mera';
import { keccak256, toUtf8Bytes, getAddress, concat, getBytes } from 'ethers';

export interface MeraMultiKeyAccount {
  credentialId: string;
  username: string;
  // Key 1: Primary EVM Vault Account (Holding & Author Royalties)
  vaultAddress: string;
  // Key 2: Ephemeral Session Curation Signer (Zero-prompt instant micro-boosts)
  sessionKeyAddress: string;
  // Key 3: Cross-chain / Decentralized Identity Key
  identityAddress: string;
  createdAt: number;
  isSessionActive: boolean;
  prfSupported: boolean;
}

const STORAGE_KEY = 'ember_mera_passkeys_v2';

export function getStoredMeraAccounts(): Record<string, MeraMultiKeyAccount> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Register a new passkey using Category Labs Mera SDK
 * Demonstrates "One Passkey, Many Keys"
 */
export async function registerWithMera(username: string): Promise<MeraMultiKeyAccount> {
  const cleanName = username.trim() || 'Monad Curator';

  let credentialId = '';
  let prfOutputBytes: Uint8Array = new Uint8Array(32);
  let prfSupported = true;

  try {
    // 1. Trigger Category Labs Mera Passkey Creation with PRF Salt
    const result = await createPasskeyWithPrfOutput({
      rp: {
        id: window.location.hostname,
        name: 'Ember.run // Monad Metropolis'
      },
      user: {
        name: cleanName,
        displayName: cleanName
      },
      timeout: 60000
    });

    credentialId = result.credentialId;
    prfOutputBytes = new Uint8Array(result.prfOutput);
  } catch (err: any) {
    console.warn('[Mera PRF fallback to standard WebAuthn]:', err);
    prfSupported = false;

    // Graceful fallback for browsers without WebAuthn PRF extension enabled
    const fallbackId = `mera-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    credentialId = fallbackId;
    const randomBuf = new Uint8Array(32);
    crypto.getRandomValues(randomBuf);
    prfOutputBytes = randomBuf;
  }

  // 2. ONE PASSKEY, MANY KEYS DERIVATION
  // Key 1: Vault Account (Primary EVM holding account)
  const vaultSeed = keccak256(concat([prfOutputBytes, toUtf8Bytes('ember-monad-vault-v1')]));
  const vaultPrivateBytes = getBytes(vaultSeed);
  const vaultSession = createSecp256k1SigningSession({ privateKey: vaultPrivateBytes });
  const vaultAddress = getEvmAddress(vaultSession.publicKey);

  // Key 2: Session Curation Signer (Zero-prompt ephemeral booster)
  const sessionSeed = keccak256(concat([prfOutputBytes, toUtf8Bytes('ember-session-curator-v1')]));
  const sessionPrivateBytes = getBytes(sessionSeed);
  const sessionInstance = createSecp256k1SigningSession({ privateKey: sessionPrivateBytes });
  const sessionKeyAddress = getEvmAddress(sessionInstance.publicKey);

  // Key 3: Cross-chain Identity (Ed25519)
  const identitySeed = keccak256(concat([prfOutputBytes, toUtf8Bytes('ember-ed25519-identity-v1')]));
  const identityPrivateBytes = getBytes(identitySeed);
  let identityAddress = '';
  try {
    identityAddress = getSolanaAddress(identityPrivateBytes);
  } catch {
    identityAddress = `id_${vaultAddress.slice(2, 10)}`;
  }

  const account: MeraMultiKeyAccount = {
    credentialId,
    username: cleanName,
    vaultAddress: getAddress(vaultAddress),
    sessionKeyAddress: getAddress(sessionKeyAddress),
    identityAddress,
    createdAt: Date.now(),
    isSessionActive: true,
    prfSupported
  };

  const stored = getStoredMeraAccounts();
  stored[credentialId] = account;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

  return account;
}
