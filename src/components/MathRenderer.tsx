import React, { useMemo } from "react"
import katex from "katex"
import "katex/dist/katex.min.css"
import "../styles/MathRenderer.css"

interface MathRendererProps {
  content: string
  className?: string
}

/**
 * Delimiters:
 * - Block:   $$ ... $$    yoki   \[ ... \]
 * - Inline:  $ ... $      yoki   $$ ... $$
 * Eslatma: $ belgisi escape qilinmagan bo‘lishi kerak (\$ inline sifatida olinmaydi).
 */

type Token =
  | { type: "text"; value: string }
  | { type: "inline"; value: string }
  | { type: "block"; value: string }

function tokenizeMath(input: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  const len = input.length

  const pushText = (s: string) => {
    if (s) tokens.push({ type: "text", value: s })
  }

  while (i < len) {
    // Block $$ ... $$
    if (input[i] === "$" && input[i + 1] === "$") {
      const start = i + 2
      const end = input.indexOf("$$", start)
      if (end !== -1) {
        tokens.push({ type: "block", value: input.slice(start, end).trim() })
        i = end + 2
        continue
      }
    }

    // Block \[ ... \]
    if (input[i] === "\\" && input[i + 1] === "[") {
      const start = i + 2
      const end = input.indexOf("\\]", start)
      if (end !== -1) {
        tokens.push({ type: "block", value: input.slice(start, end).trim() })
        i = end + 2
        continue
      }
    }

    // Inline $$ ... $$
    if (input[i] === "\\" && input[i + 1] === "(") {
      const start = i + 2
      const end = input.indexOf("\\)", start)
      if (end !== -1) {
        tokens.push({ type: "inline", value: input.slice(start, end).trim() })
        i = end + 2
        continue
      }
    }

    // Inline $ ... $
    if (input[i] === "$") {
      // Escape qilingan \$ emasligini tekshiramiz
      const isEscaped = i > 0 && input[i - 1] === "\\"
      if (!isEscaped) {
        const start = i + 1
        let end = start
        while (end < len) {
          if (input[end] === "$" && !(end > 0 && input[end - 1] === "\\")) break
          end++
        }
        if (end < len && input[end] === "$") {
          tokens.push({ type: "inline", value: input.slice(start, end).trim() })
          i = end + 1
          continue
        }
      }
    }

    // Oddiy matn: keyingi delimiterga qadar
    let j = i + 1
    while (j < len) {
      const two = input.slice(j, j + 2)
      const c = input[j]
      if (two === "$$" || two === "\\[" || two === "\\(" || c === "$") {
        if (c === "$" && j > 0 && input[j - 1] === "\\") {
          j++
          continue
        }
        break
      }
      j++
    }
    pushText(input.slice(i, j))
    i = j
  }

  return tokens
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = "" }) => {
  const nodes = useMemo(() => {
    if (!content) return null
    const tokens = tokenizeMath(content)
    const out: React.ReactNode[] = []
    let k = 0

    for (const t of tokens) {
      if (t.type === "text") {
        out.push(<span key={`t-${k++}`}>{t.value}</span>)
        continue
      }

      const displayMode = t.type === "block"
      try {
        const html = katex.renderToString(t.value, {
          displayMode,
          throwOnError: false,
          errorColor: "#cc0000",
          strict: "warn",
          trust: false,
        })
        out.push(
          displayMode ? (
            <div
              key={`m-${k++}`}
              className="katex-block my-3"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <span
              key={`m-${k++}`}
              className="katex-inline"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ),
        )
      } catch {
        out.push(
          <span key={`e-${k++}`} className="katex-error">
            {displayMode ? `$$${t.value}$$` : `$${t.value}$`}
          </span>,
        )
      }
    }
    return out
  }, [content])

  return <div className={`math-content ${className}`}>{nodes}</div>
}

// Qo‘shimcha helperlar (ixtiyoriy)
export const InlineMath: React.FC<{ children: string; className?: string }> = ({ children, className = "" }) => {
  try {
    const html = katex.renderToString(children, {
      displayMode: false,
      throwOnError: false,
      errorColor: "#cc0000",
    })
    return <span className={`inline-math ${className}`} dangerouslySetInnerHTML={{ __html: html }} />
  } catch {
    return <span className={`inline-math error ${className}`}>${children}$</span>
  }
}

export const BlockMath: React.FC<{ children: string; className?: string }> = ({ children, className = "" }) => {
  try {
    const html = katex.renderToString(children, {
      displayMode: true,
      throwOnError: false,
      errorColor: "#cc0000",
    })
    return <div className={`block-math my-4 ${className}`} dangerouslySetInnerHTML={{ __html: html }} />
  } catch {
    return <div className={`block-math error my-4 ${className}`}>$$ {children} $$</div>
  }
}
