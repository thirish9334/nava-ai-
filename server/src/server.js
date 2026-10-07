import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import { GoogleGenAI } from '@google/genai'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173'
}))
app.use(express.json({ limit: '1mb' }))

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        timeout: 15000,
        retryOptions: { attempts: 1 }
      }
    })
  : null

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: Boolean(ai),
    databaseConfigured: Boolean(process.env.MONGODB_URI)
  })
})

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required.' })
    }

    if (!ai) {
      return res.status(500).json({
        error: 'Gemini API key is not configured. Add GEMINI_API_KEY to server/.env.'
      })
    }

    const safeHistory = Array.isArray(history)
      ? history
          .filter(item => item && ['user', 'model'].includes(item.role) && typeof item.content === 'string')
          .slice(-20)
      : []

    const contents = [
      ...safeHistory.map(item => ({
        role: item.role,
        parts: [{ text: item.content }]
      })),
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ]

    let response
    const models = [
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-flash-lite-latest'
    ]

    for (const model of models) {
      try {
        response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction:
              'You are Nova AI, a helpful, friendly and accurate AI assistant. Give clear answers. When providing code, use markdown code fences. For beginners, explain difficult concepts simply.'
          }
        })
        break
      } catch (error) {
        const retryable = error?.status === 429
          || error?.status >= 500
          || error?.name === 'TypeError'
          || error?.name === 'AbortError'
          || error?.name === 'TimeoutError'

        if (!retryable) {
          throw error
        }

        console.warn(`Gemini model ${model} unavailable; trying the next model.`)
      }
    }

    if (!response) {
      const error = new Error('Gemini is temporarily unavailable. Please try again shortly.')
      error.status = 503
      throw error
    }

    const reply = response.text || 'I could not generate a response.'
    res.json({ reply })
  } catch (error) {
    console.error('Chat error:', error)
    let message = error instanceof Error
      ? error.message
      : 'Failed to generate AI response.'

    try {
      message = JSON.parse(message).error?.message || message
    } catch {
      // Keep the original error message when it is not a JSON API error.
    }

    const upstreamStatus = error?.status
    const timedOut = error?.name === 'AbortError'
      || error?.name === 'TimeoutError'
      || /deadline expired|timed out/i.test(message)
    const status = timedOut
      ? 504
      : upstreamStatus === 429 || upstreamStatus >= 500
        ? 503
        : upstreamStatus >= 400
          ? 502
          : 500

    res.status(status).json({
      error: timedOut
        ? 'Gemini took too long to respond. Please try again.'
        : message
    })
  }
})

function start() {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })

  if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI)
      .then(() => {
        console.log('MongoDB connected')
      })
      .catch(error => {
        console.warn('MongoDB connection failed. Chatbot will still run without database persistence.')
        console.warn(error.message)
      })
  }
}

start()
