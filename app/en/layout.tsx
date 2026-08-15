// Pass-through layout, twin of app/ar/layout.tsx. The middleware sets the
// ldc_locale cookie to "en" whenever the URL is /en, so the root layout in
// app/layout.tsx already renders <html lang="en" dir="ltr"> for this route.
// No nested <html>/<body> here — that would be invalid HTML.

export default function EnLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
