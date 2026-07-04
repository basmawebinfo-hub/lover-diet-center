// This layout is now a pass-through (Phase 5 · Arabic SSR). The middleware
// sets the ldc_locale cookie to "ar" whenever the URL is /en, so the root
// layout in app/layout.tsx already renders <html lang="ar" dir="rtl"> for
// this route. No nested <html>/<body> needed — that was invalid HTML and
// blocked proper Arabic SSR.

export default function EnLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
