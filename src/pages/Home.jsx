import { useEffect, useMemo, useRef, useState } from 'react'
import Sidebar from '../components/Sidebar'
import ChatHeader from '../components/ChatHeader'
import MessageList from '../components/MessageList'
import CanvasPanel from '../components/CanvasPanel'
import { getGeneratedFiles, isFullWebAppRequest, getPdfArtifact, isPdfRequest, getPptArtifact, isPptRequest } from '../utils/artifactUtils'
import Composer from '../components/Composer'
import ConfirmDialog from '../components/ConfirmDialog'
import { agents } from '../components/agents'
import { API_BASE_URL } from '../../utils/axios'

const api = async (path, options = {}) => {
  const token = localStorage.getItem('rezzai_token')
  const isFormData = options.body instanceof FormData
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  }

  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`
  const response = await fetch(url, {
    credentials: 'include',
    headers,
    ...options
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `Request failed (${response.status})`)
  }
  if (response.status === 204) return null
  return response.json()
}

const Home = ({ user, onLogout }) => {
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [prompt, setPrompt] = useState('')
  const [attachedFile, setAttachedFile] = useState(null)
  const [agent, setAgent] = useState('auto')
  const [generatingConversationId, setGeneratingConversationId] = useState(null)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [error, setError] = useState('')
  const [conversationToDelete, setConversationToDelete] = useState(null)
  const [activeArtifact, setActiveArtifact] = useState(null)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)

  const activeConversationRef = useRef(activeConversation)
  useEffect(() => {
    activeConversationRef.current = activeConversation
  }, [activeConversation])

  const activeAgent = useMemo(() => agents.find((item) => item.id === agent), [agent])
  const isCurrentConversationLoading = Boolean(activeConversation?._id && generatingConversationId === activeConversation._id)

  const loadConversations = async () => {
    try {
      const data = await api('/chat/conversations')
      setConversations(data)
      if (data.length > 0) setActiveConversation((prev) => prev || data[0])
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoadingHistory(false)
    }
  }

  const loadMessages = async (conversationId) => {
    try {
      setLoadingMessages(true)
      const fetchedMessages = await api(`/chat/conversations/${conversationId}/messages`)
      if (activeConversationRef.current?._id === conversationId) {
        setMessages(fetchedMessages)
      }
      return fetchedMessages
    } catch (loadError) {
      if (activeConversationRef.current?._id === conversationId) {
        setError(loadError.message)
      }
      return []
    } finally {
      setLoadingMessages(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(loadConversations, 0)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeConversation?._id) loadMessages(activeConversation._id)
      else {
        setMessages([])
        setActiveArtifact(null)
        setLoadingMessages(false)
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [activeConversation])

  const createConversation = async () => {
    try {
      const conversation = await api('/chat/conversations', { method: 'POST', body: JSON.stringify({ title: 'New conversation' }) })
      setConversations((current) => [conversation, ...current])
      setActiveConversation(conversation)
      setMessages([])
      setActiveArtifact(null)
      setLoadingMessages(false)
    } catch (createError) {
      setError(createError.message)
    }
  }

  const deleteConversation = async () => {
    const conversation = conversationToDelete
    if (!conversation) return

    try {
      await api(`/chat/conversations/${conversation._id}`, { method: 'DELETE' })
      const remaining = conversations.filter((item) => item._id !== conversation._id)
      setConversations(remaining)
      if (activeConversation?._id === conversation._id) {
        setActiveConversation(remaining[0] || null)
        setMessages([])
        setActiveArtifact(null)
      }
      setConversationToDelete(null)
    } catch (deleteError) {
      setError(deleteError.message)
      setConversationToDelete(null)
    }
  }

  const sendMessage = async (event) => {
    event.preventDefault()
    const rawContent = prompt.trim()
    const currentFile = attachedFile
    if ((!rawContent && !currentFile) || isCurrentConversationLoading) return
    setError('')

    const content = rawContent || (currentFile ? `[Attached File: ${currentFile.name}]` : '')

    let conversation = activeConversation
    const isFirstMessage = messages.length === 0
    try {
      if (!conversation) {
        conversation = await api('/chat/conversations', { method: 'POST', body: JSON.stringify({ title: 'New conversation' }) })
        setConversations((current) => [conversation, ...current])
        setActiveConversation(conversation)
      }

      const targetConvId = conversation._id
      setGeneratingConversationId(targetConvId)

      const isFullWebApp = isFullWebAppRequest(content)
      const isPdf = isPdfRequest(content, agent)
      const isPpt = isPptRequest(content, agent)

      if (isPpt && activeConversationRef.current?._id === targetConvId) {
        setActiveArtifact({
          isGenerating: true,
          isPpt: true,
          title: 'Compiling PowerPoint slides...'
        })
      } else if (isPdf && activeConversationRef.current?._id === targetConvId) {
        setActiveArtifact({
          isGenerating: true,
          isPdf: true,
          title: 'Compiling PDF document...'
        })
      } else if (isFullWebApp && activeConversationRef.current?._id === targetConvId) {
        setActiveArtifact({
          isGenerating: true,
          title: 'Generating project files...'
        })
      }

      if (activeConversationRef.current?._id === targetConvId) {
        setMessages((current) => [...current, { content, role: 'user', pending: true }])
      }
      setPrompt('')
      setAttachedFile(null)

      let reqBody
      if (currentFile) {
        const formData = new FormData()
        formData.append('prompt', content)
        formData.append('conversationId', targetConvId)
        if (agent !== 'auto') formData.append('agent', agent)
        if (isFirstMessage) formData.append('suggestTitle', 'true')
        formData.append('file', currentFile)
        reqBody = formData
      } else {
        reqBody = JSON.stringify({
          prompt: content,
          conversationId: targetConvId,
          agent: agent === 'auto' ? undefined : agent,
          suggestTitle: isFirstMessage
        })
      }

      const result = await api('/agent/chat', {
        method: 'POST',
        body: reqBody
      })

      const updatedMessages = await loadMessages(targetConvId)

      if (!result.content) throw new Error('The agent returned no response')

      const isStillActive = activeConversationRef.current?._id === targetConvId

      if (isPpt && isStillActive) {
        const lastMsg = [...updatedMessages].reverse().find((m) => m.role === 'assistant' && getPptArtifact(m.content))
        if (lastMsg) {
          const pptArtifact = getPptArtifact(lastMsg.content)
          setActiveArtifact({ id: lastMsg._id, ...pptArtifact })
        } else {
          setActiveArtifact(null)
        }
      } else if (isPdf && isStillActive) {
        const lastMsg = [...updatedMessages].reverse().find((m) => m.role === 'assistant' && getPdfArtifact(m.content))
        if (lastMsg) {
          const pdfArtifact = getPdfArtifact(lastMsg.content)
          setActiveArtifact({ id: lastMsg._id, ...pdfArtifact })
        } else {
          setActiveArtifact(null)
        }
      } else if (isFullWebApp && isStillActive) {
        const lastMsg = [...updatedMessages].reverse().find((m) => m.role === 'assistant' && getGeneratedFiles(m.content))
        if (lastMsg) {
          const files = getGeneratedFiles(lastMsg.content)
          setActiveArtifact({ id: lastMsg._id, files })
        } else {
          setActiveArtifact(null)
        }
      }

      if (result.images?.length && isStillActive) {
        setMessages((current) => current.map((message, index) => index === current.length - 1 && message.role === 'assistant' ? { ...message, images: result.images } : message))
      }

      if (result.title) {
        setConversations((current) => current.map((item) => item._id === targetConvId ? { ...item, title: result.title } : item))
        if (isStillActive) {
          setActiveConversation((prev) => (prev ? { ...prev, title: result.title } : prev))
        }
      }
    } catch (sendError) {
      if (activeConversationRef.current?._id === conversation?._id) {
        setMessages((current) => current.filter((message) => !message.pending))
        setError(sendError.message)
        setActiveArtifact(null)
      }
    } finally {
      setGeneratingConversationId((current) => (current === conversation?._id ? null : current))
    }
  }

  const handleSelectPrompt = (starterPrompt, starterAgent) => {
    setPrompt(starterPrompt)
    if (starterAgent) setAgent(starterAgent)
  }

  return (
    <main className={`workspace-shell ${activeArtifact ? 'has-canvas' : ''}`}>
      <Sidebar
        user={user}
        conversations={conversations}
        activeConversation={activeConversation}
        loadingHistory={loadingHistory}
        onNewChat={createConversation}
        onSelectConversation={(conv) => {
          if (activeConversation?._id !== conv._id) {
            setActiveConversation(conv)
            setActiveArtifact(null)
            setMessages([])
            setLoadingMessages(true)
          }
          if (mobileSidebarOpen) setMobileSidebarOpen(false)
        }}
        onDeleteConversation={setConversationToDelete}
        onLogout={onLogout}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />
      <section className="chat-panel">
        <ChatHeader
          conversation={activeConversation}
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        />
        <MessageList
          messages={messages}
          loading={isCurrentConversationLoading}
          loadingMessages={loadingMessages}
          activeAgent={activeAgent}
          activeArtifact={activeArtifact}
          onOpenArtifact={setActiveArtifact}
          onSelectPrompt={handleSelectPrompt}
        />
        <Composer
          agents={agents}
          agent={agent}
          prompt={prompt}
          attachedFile={attachedFile}
          loading={isCurrentConversationLoading}
          error={error}
          activeAgent={activeAgent}
          onAgentChange={setAgent}
          onPromptChange={setPrompt}
          onFileChange={setAttachedFile}
          onSend={sendMessage}
        />
      </section>

      {activeArtifact && (
        <CanvasPanel
          key={activeArtifact.id || activeArtifact.title || 'active-canvas'}
          artifact={activeArtifact}
          onClose={() => setActiveArtifact(null)}
        />
      )}

      <ConfirmDialog
        conversation={conversationToDelete}
        onCancel={() => setConversationToDelete(null)}
        onConfirm={deleteConversation}
      />
    </main>
  )
}

export default Home
