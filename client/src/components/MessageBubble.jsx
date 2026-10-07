import { Bot, User, Copy, Check } from 'lucide-react'
import { useState } from 'react'

function renderText(text) {
  const blocks = text.split(/```/g)
  return blocks.map((block, index) => {
    if (index % 2 === 1) {
      return (
        <pre key={index}>
          <code>{block.replace(/^[a-zA-Z]+\n/, '')}</code>
        </pre>
      )
    }

    return block.split(/\n\n+/).map((paragraph, pIndex) => (
      <p key={`${index}-${pIndex}`}>{paragraph}</p>
    ))
  })
}

export default function MessageBubble({ role, content }) {
  const [copied, setCopied] = useState(false)
  const isUser = role === 'user'

  async function copyMessage() {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500">
          <Bot size={18} />
        </div>
      )}

      <div className={`max-w-[85%] md:max-w-[75%] ${isUser ? 'items-end' : ''}`}>
        <div
          className={
            isUser
              ? 'rounded-2xl rounded-tr-md bg-indigo-600 px-4 py-3 text-sm leading-6 shadow-lg shadow-indigo-950/30'
              : 'message rounded-2xl rounded-tl-md border border-white/10 bg-zinc-900/80 px-4 py-3 text-sm leading-6 text-zinc-200'
          }
        >
          {renderText(content)}
        </div>

        {!isUser && (
          <button
            onClick={copyMessage}
            className="mt-2 flex items-center gap-1.5 px-1 text-xs text-zinc-600 transition hover:text-zinc-300"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>

      {isUser && (
        <div className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-zinc-800">
          <User size={18} />
        </div>
      )}
    </div>
  )
}
