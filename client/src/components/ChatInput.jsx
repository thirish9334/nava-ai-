import { ArrowUp, LoaderCircle } from 'lucide-react'
import { useState } from 'react'

export default function ChatInput({ onSend, loading }) {
  const [value, setValue] = useState('')

  function submit() {
    const text = value.trim()
    if (!text || loading) return
    onSend(text)
    setValue('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="glass flex items-end gap-3 rounded-2xl p-2 shadow-2xl shadow-black/30">
        <textarea
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Nova AI..."
          className="max-h-40 min-h-12 flex-1 resize-none bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-600"
        />
        <button
          onClick={submit}
          disabled={!value.trim() || loading}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Send message"
        >
          {loading ? <LoaderCircle className="animate-spin" size={20} /> : <ArrowUp size={20} />}
        </button>
      </div>
      <p className="mt-2 text-center text-[11px] text-zinc-600">
        Nova AI can make mistakes. Check important information.
      </p>
    </div>
  )
}
