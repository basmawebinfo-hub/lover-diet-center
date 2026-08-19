#!/usr/bin/env node
/*
 * Writes public/.well-known/assetlinks.json — the Digital Asset Links file
 * that proves the Android app and loversdc.com belong to the same owner.
 *
 * Without it the Trusted Web Activity still runs, but Chrome cannot verify
 * the link and shows its address bar across the top of the app. That single
 * missing file is the difference between "an app" and "a browser someone
 * put an icon on".
 *
 * Usage:
 *   node scripts/make-assetlinks.mjs <packageName> <sha256Fingerprint>
 *
 * Example:
 *   node scripts/make-assetlinks.mjs com.loversdc.app \
 *     AB:CD:12:...:EF
 *
 * Get the fingerprint from the signing keystore:
 *   keytool -list -v -keystore loversdc.keystore -alias loversdc
 * and copy the line beginning "SHA256:".
 *
 * NOTE: if you let Google Play manage signing (Play App Signing, which is
 * the default), the fingerprint that matters is the one Play shows under
 * "App signing key certificate" — NOT your local upload key. Using the
 * upload key here is the most common reason the address bar stays visible
 * after a Play release.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const [, , pkg, rawFingerprint] = process.argv

if (!pkg || !rawFingerprint) {
  console.error('usage: node scripts/make-assetlinks.mjs <packageName> <sha256Fingerprint>')
  process.exit(1)
}

if (!/^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/i.test(pkg)) {
  console.error(`error: "${pkg}" does not look like an Android package name (e.g. com.loversdc.app)`)
  process.exit(1)
}

// Accept the fingerprint with or without colons, any case.
const fingerprint = rawFingerprint.replace(/^SHA256:/i, '').replace(/[^0-9a-f]/gi, '').toUpperCase()

if (fingerprint.length !== 64) {
  console.error(
    `error: expected a SHA-256 fingerprint (64 hex characters, got ${fingerprint.length}).\n` +
      '       Did you copy the SHA-1 line by mistake? It must be the SHA256: line.',
  )
  process.exit(1)
}

const formatted = fingerprint.match(/.{2}/g).join(':')

const payload = [
  {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: pkg,
      sha256_cert_fingerprints: [formatted],
    },
  },
]

const out = resolve('public/.well-known/assetlinks.json')
mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, JSON.stringify(payload, null, 2) + '\n')

console.log('wrote', out)
console.log('  package    ', pkg)
console.log('  fingerprint', formatted)
console.log('\nNext: deploy, then confirm it is served as JSON:')
console.log('  curl -sI https://www.loversdc.com/.well-known/assetlinks.json')
