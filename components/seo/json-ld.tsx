// A minimal server component that renders a JSON-LD <script>.
// Safe to include in server layouts and pages.

type Props = {
  data: unknown
  id?: string
}

export function JsonLd({ data, id }: Props) {
  return (
    <script
      id={id}
      type="application/ld+json"
      // JSON is escaped by dangerouslySetInnerHTML — schema.org allows this
      // and it's the standard way to emit structured data in Next.js.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  )
}
