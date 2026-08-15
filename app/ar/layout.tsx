// Pass-through layout, twin of app/en/layout.tsx. The middleware sets the
// ldc_locale cookie to "ar" whenever the URL is /ar, so the root layout in
// app/layout.tsx already renders <html lang="ar" dir="rtl"> for this route.
// No nested <html>/<body> here — that would be invalid HTML.

export default function ArLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
