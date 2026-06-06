import React from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

/**
 * Renders a string that may contain inline math delimited by $...$.
 * Falls back to plain text on KaTeX parse failure.
 */
export function MathText({ text, className }: { text: string; className?: string }) {
  const parts = React.useMemo(() => splitMath(text), [text])
  return (
    <span className={className}>
      {parts.map((p, i) =>
        p.type === 'math' ? (
          <span
            key={i}
            className="inline-block align-middle text-foreground"
            dangerouslySetInnerHTML={{
              __html: renderMath(p.value),
            }}
          />
        ) : (
          <span key={i}>{p.value}</span>
        ),
      )}
    </span>
  )
}

function splitMath(input: string): { type: 'text' | 'math'; value: string }[] {
  const out: { type: 'text' | 'math'; value: string }[] = []
  const regex = /\$([^$]+)\$/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      out.push({ type: 'text', value: input.slice(lastIndex, match.index) })
    }
    out.push({ type: 'math', value: match[1] })
    lastIndex = regex.lastIndex
  }
  if (lastIndex < input.length) {
    out.push({ type: 'text', value: input.slice(lastIndex) })
  }
  return out.length ? out : [{ type: 'text', value: input }]
}

function renderMath(tex: string): string {
  try {
    return katex.renderToString(tex, { throwOnError: false, output: 'html' })
  } catch {
    return tex
  }
}
