// Flat config for ESLint 9 + eslint-config-next 16.
//
// The previous version pulled the legacy shareable configs
// ("next/core-web-vitals", "next/typescript") through FlatCompat.
// eslint-config-next 16 ships native flat configs on those same subpaths, and
// routing them through FlatCompat crashes on startup ("Converting circular
// structure to JSON") — part of why `pnpm lint` never ran in this repo.
import coreWebVitals from 'eslint-config-next/core-web-vitals'
import typescript from 'eslint-config-next/typescript'

const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'next-env.d.ts',
      'tsconfig.tsbuildinfo',
    ],
  },
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',

      // Downgraded from error, deliberately.
      //
      // Every remaining occurrence in this repo is one of two patterns that
      // are correct as written:
      //
      //  1. Post-hydration sync. Reading localStorage or a cookie during the
      //     first client render would disagree with the server HTML and cause
      //     a hydration mismatch. Setting state in an effect is the documented
      //     way to update *after* hydration (see lib/locale.tsx).
      //  2. Load-on-mount. Dashboard and admin pages call a loader that flips
      //     a loading flag before awaiting data.
      //
      // The cases where an external store really was the better tool have been
      // migrated to useSyncExternalStore (hooks/use-media-query.ts,
      // lib/currency.tsx, components/landing/segmented-header.tsx). Keeping
      // this as an error would leave `pnpm lint` permanently red and bury real
      // failures; as a warning the signal stays visible.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]

export default eslintConfig
