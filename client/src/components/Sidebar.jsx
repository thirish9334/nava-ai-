import { MessageSquare, Plus, Trash2, Sparkles, Settings } from 'lucide-react'

export default function Sidebar({ onNewChat, onClear, messageCount }) {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-zinc-950/70 p-4 md:flex md:flex-col">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-lg shadow-indigo-500/20">
          <Sparkles size={21} />
        </div>
        <div>
          <h1 className="font-bold">Nova AI</h1>
          <p className="text-xs text-zinc-500">Gemini Chat Assistant</p>
        </div>
      </div>

      <button
        onClick={onNewChat}
        className="mb-3 flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
      >
        <Plus size={18} /> New chat
      </button>

      <div className="mb-2 mt-6 px-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Current chat
      </div>

      <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3 text-sm text-zinc-300">
        <MessageSquare size={17} />
        <span className="truncate">Conversation</span>
        <span className="ml-auto text-xs text-zinc-600">{messageCount}</span>
      </div>

      <div className="mt-auto space-y-2">
        <button
          onClick={onClear}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
        >
          <Trash2 size={17} /> Clear messages
        </button>
        <div className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-zinc-500">
          <Settings size={17} /> Settings
        </div>
      </div>
    </aside>
  )
}
