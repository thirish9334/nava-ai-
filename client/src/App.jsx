import { useEffect, useMemo, useState } from 'react'
import { Menu, Sparkles, Plus, AlertCircle } from 'lucide-react'
import Sidebar from './components/Sidebar'
import MessageBubble from './components/MessageBubble'
import ChatInput from './components/ChatInput'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')

const starterPrompts = [
  'Explain JavaScript promises in simple words',
  'Create a Python beginner project for me',
  'Give me a roadmap to become a full stack developer',
  'Help me debug my code'
]

export default function App() {
  const [messages, setMessages] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('nova-messages')) || []
    } catch {
      return []
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem('nova-messages', JSON.stringify(messages))
  }, [messages])

  const hasMessages = messages.length > 0

  const conversation = useMemo(
    () => messages.map(({ role, content }) => ({ role, content })),
    [messages]
  )

  async function sendMessage(text) {
    setError('')
    if (import.meta.env.PROD && !apiBaseUrl) {
      setError('The chatbot backend is not configured. Set the VITE_API_BASE_URL repository variable to your backend URL and redeploy.')
      return
    }

    const userMessage = { role: 'user', content: text }
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setLoading(true)

    try {
      const response = await fetch(`${apiBaseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: conversation
        })
      })

      const responseBody = await response.text()
      let data

      if (!responseBody.trim()) {
        throw new Error(
          `The server returned an empty response (HTTP ${response.status}). Make sure the backend is running and check its logs.`
        )
      }

      try {
        data = JSON.parse(responseBody)
      } catch {
        throw new Error(
          `The server returned an invalid response (HTTP ${response.status}). Check that the backend and API proxy are running correctly.`
        )
      }

      if (!response.ok) {
        throw new Error(data.error || `Request failed (HTTP ${response.status}).`)
      }

      if (typeof data.reply !== 'string' || !data.reply.trim()) {
        throw new Error('The server response did not include a reply. Check the backend logs.')
      }

      setMessages((current) => [
        ...current,
        { role: 'model', content: data.reply }
      ])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function newChat() {
    setMessages([])
    setError('')
    localStorage.removeItem('nova-messages')
    setMobileOpen(false)
  }

  function clearMessages() {
    setMessages([])
    localStorage.removeItem('nova-messages')
  }

  return (
    <div className="flex min-h-screen bg-transparent">
      <Sidebar onNewChat={newChat} onClear={clearMessages} messageCount={messages.length} />

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <main className="relative flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center border-b border-white/10 px-4 md:px-8">
          <button
            onClick={() => setMobileOpen(true)}
            className="mr-3 rounded-lg p-2 text-zinc-400 hover:bg-white/5 md:hidden"
          >
            <Menu size={21} />
          </button>

          <div className="flex items-center gap-2">
            <Sparkles className="text-indigo-400" size={18} />
            <span className="font-semibold">Nova AI</span>
            <span className="hidden rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-zinc-500 sm:inline">
              GEMINI
            </span>
          </div>

          <button
            onClick={newChat}
            className="ml-auto flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-white"
          >
            <Plus size={17} /> <span className="hidden sm:inline">New chat</span>
          </button>
        </header>

        <section className="flex flex-1 flex-col overflow-hidden">
          {!hasMessages ? (
            <div className="flex flex-1 items-center justify-center px-5 py-10">
              <div className="w-full max-w-3xl">
                <div className="mb-10 text-center">
                  <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-xl shadow-indigo-500/20">
                    <Sparkles size={30} />
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
                    How can I help you?
                  </h2>
                  <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-zinc-500 md:text-base">
                    Ask questions, write code, learn new topics, or brainstorm ideas with your AI assistant.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {starterPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="rounded-2xl border border-white/10 bg-white/[.025] p-4 text-left text-sm text-zinc-300 transition hover:border-indigo-400/30 hover:bg-white/[.05]"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-4 py-8">
              <div className="mx-auto flex max-w-4xl flex-col gap-6">
                {messages.map((message, index) => (
                  <MessageBubble
                    key={`${message.role}-${index}`}
                    role={message.role}
                    content={message.content}
                  />
                ))}

                {loading && (
                  <div className="flex items-center gap-3 text-sm text-zinc-500">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500">
                      <Sparkles size={17} />
                    </div>
                    <div className="flex gap-1">
                      <span className="animate-bounce">•</span>
                      <span className="animate-bounce [animation-delay:150ms]">•</span>
                      <span className="animate-bounce [animation-delay:300ms]">•</span>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {error && (
            <div className="mx-auto flex w-full max-w-4xl items-start gap-3 px-4 pb-2 text-sm text-red-300">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Could not get a response</p>
                <p className="mt-1 text-red-300/70">{error}</p>
              </div>
            </div>
          )}

          <div className="px-4 pb-5 pt-3">
            <ChatInput onSend={sendMessage} loading={loading} />
          </div>
        </section>
      </main>
    </div>
  )
}
