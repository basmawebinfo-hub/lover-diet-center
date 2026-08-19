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

const [, , pkg, ...rawFingerprints] = process.argv

if (!pkg || rawFingerprints.length === 0) {
  console.error('usage: node scripts/make-assetlinks.mjs <packageName> <sha256...>')
  process.exit(1)
}

if (!/^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/i.test(pkg)) {
  console.error(`error: "${pkg}" does not look like an Android package name (e.g. com.loversdc.app)`)
  process.exit(1)
}

// Accept fingerprints with or without colons, in any case.
const formatted = rawFingerprints.map((raw, i) => {
  const hex = raw.replace(/^SHA-?256:/i, '').replace(/[^0-9a-f]/gi, '').toUpperCase()
  if (hex.length !== 64) {
    console.error(
      `error: fingerprint #${i + 1} is ${hex.length} hex characters, expected 64. ` +
        `A SHA-1 fingerprint is 40 - make sure you copied the SHA256: line.`,
    )
    process.exit(1)
  }
  return hex.match(/.{2}/g).join(':')
})

const unique = [...new Set(formatted)]
if (unique.length !== formatted.length) {
  console.error('note: duplicate fingerprints given, keeping one of each')
}

const payload = [
  {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: pkg,
      sha256_cert_fingerprints: unique,
    },
  },
]

const out = resolve('public/.well-known/assetlinks.json')
mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, JSON.stringify(payload, null, 2) + '\n')

console.log('wrote', out)
console.log('  package', pkg)
unique.forEach((f, n) => console.log(`  key ${n + 1}   ${f}`))

if (unique.length === 1) {
  console.log(
    `
Only one key listed. If this app also ships through Google Play, add the ` +
      `Play App Signing fingerprint too, or Play installs will show the address bar.`,
  )
}

console.log(`
Next: deploy, then confirm it is served as JSON:`)
console.log('  curl -sI https://www.loversdc.com/.well-known/assetlinks.json')
