import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import ArtifactCard from './ArtifactCard'
import { getPdfArtifact, getPptArtifact, getGeneratedFiles } from '../utils/artifactUtils'
import './MessageList.css'

const CodeBlock = ({ language, code }) => {
  const [copied, setCopied] = useState(false)

  const copyCode = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="code-block-wrap">
      <div className="code-block-header">
        <span className="code-block-lang">{language || 'code'}</span>
        <button className="copy-code-button" type="button" onClick={copyCode} title="Copy code">
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        PreTag="div"
        customStyle={{
          margin: '0',
          border: '1px solid #232b25',
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          background: '#0e120f',
          fontSize: '12.5px',
          padding: '14px 16px'
        }}
        codeTagProps={{ style: { fontFamily: "'DM Mono', monospace" } }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

const markdownComponents = {
  code({ className, children, ...props }) {
    const language = /language-(\w+)/.exec(className || '')?.[1]
    const code = String(children).replace(/\n$/, '')

    if (!language) {
      return <code className="inline-code" {...props}>{children}</code>
    }

    return <CodeBlock language={language} code={code} />
  },
  a({ href, children, ...props }) {
    const isPdfOrPptLink = href && (
      href.startsWith('data:application/pdf') ||
      href.startsWith('data:application/vnd') ||
      href.startsWith('data:') ||
      href.includes('filename=') ||
      href.endsWith('.pdf') ||
      href.endsWith('.pptx') ||
      String(children).includes('PDF_DOCUMENT') ||
      String(children).includes('PPT_DOCUMENT')
    )

    if (isPdfOrPptLink) {
      return null
    }
    return <a href={href} target="_blank" rel="noreferrer" {...props}>{children}</a>
  }
}

const ImageCard = ({ src, alt }) => {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  const isAiGenerated = typeof src === 'string' && src.includes('pollinations.ai')

  useEffect(() => {
    let active = true
    const timeoutMs = isAiGenerated ? 60000 : 15000
    const timer = setTimeout(() => {
      if (active && !loaded) {
        setError(true)
      }
    }, timeoutMs)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [loaded, src, isAiGenerated])

  if (error) return null

  return (
    <div className="image-card-container">
      {!loaded && (
        <div className="image-skeleton-card">
          <span className="image-skeleton-icon">✦</span>
          <span className="image-skeleton-text">
            {isAiGenerated ? 'Generating visual...' : 'Loading image...'}
          </span>
        </div>
      )}
      <a
        href={src}
        target="_blank"
        rel="noreferrer"
        referrerPolicy="no-referrer"
        className={`image-card-link ${loaded ? 'loaded' : 'loading'}`}
      >
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      </a>
    </div>
  )
}

const MessageListSkeleton = () => (
  <div className="chat-skeleton-feed" aria-label="Loading conversation messages">
    <div className="skeleton-msg user">
      <div className="skeleton-avatar" />
      <div className="skeleton-bubble user-bubble">
        <div className="skeleton-bar w-70" />
        <div className="skeleton-bar w-45" />
      </div>
    </div>

    <div className="skeleton-msg assistant">
      <div className="skeleton-avatar assistant-avatar" />
      <div className="skeleton-bubble assistant-bubble">
        <div className="skeleton-meta-line" />
        <div className="skeleton-bar w-90" />
        <div className="skeleton-bar w-80" />
        <div className="skeleton-bar w-60" />
        <div className="skeleton-block-card" />
        <div className="skeleton-bar w-75" />
      </div>
    </div>

    <div className="skeleton-msg user">
      <div className="skeleton-avatar" />
      <div className="skeleton-bubble user-bubble">
        <div className="skeleton-bar w-55" />
      </div>
    </div>

    <div className="skeleton-msg assistant">
      <div className="skeleton-avatar assistant-avatar" />
      <div className="skeleton-bubble assistant-bubble">
        <div className="skeleton-meta-line" />
        <div className="skeleton-bar w-85" />
        <div className="skeleton-bar w-65" />
      </div>
    </div>
  </div>
)

const MessageList = ({
  messages,
  loading,
  loadingMessages,
  activeAgent,
  activeArtifact,
  onOpenArtifact,
  onSelectPrompt
}) => {
  const bottomRef = useRef(null)
  const [copiedMsgId, setCopiedMsgId] = useState(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading, loadingMessages])

  const copyMessageText = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMsgId(id)
      setTimeout(() => setCopiedMsgId(null), 1800)
    } catch {
      // ignore
    }
  }

  const isImageAgent = ['imageGen', 'imageagent', 'image agent'].includes(activeAgent?.id)

  const quickStarters = [
    {
      icon: '📊',
      title: 'PowerPoint Presentation',
      subtitle: 'Create a 5-slide deck on AI trends for 2026',
      prompt: 'Create a 5-slide executive presentation on AI trends in 2026 with key takeaways and actionable strategies.',
      agent: 'ppt'
    },
    {
      icon: '💻',
      title: 'Interactive Web App',
      subtitle: 'Build a sleek task board with local state',
      prompt: 'Build a full interactive modern Kanban task board with add, move, and filter features in HTML, CSS, and JS with preview.',
      agent: 'coding'
    },
    {
      icon: '▤',
      title: 'Professional PDF Document',
      subtitle: 'Compile a business proposal and executive summary',
      prompt: 'Generate a comprehensive professional PDF project proposal document with executive summary, deliverables, timeline, and budget.',
      agent: 'pdf'
    },
    {
      icon: '⌕',
      title: 'Deep Web Intelligence',
      subtitle: 'Synthesize recent market reports and analysis',
      prompt: 'Provide a structured market research briefing on sustainable tech and renewable energy breakthroughs.',
      agent: 'search'
    }
  ]

  return (
    <div className="message-area">
      {loadingMessages ? (
        <MessageListSkeleton />
      ) : messages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-hero">
            <div className="orbit-mark">
              <span className="orbit-glyph">✦</span>
            </div>
            <p className="eyebrow">Personal Intelligence Workspace</p>
            <h2>
              What are we creating<br /><em>today?</em>
            </h2>
            <p className="empty-copy">
              Ask questions, generate presentations, build live apps, or analyze complex documents. REZZAi is tuned for sharp thinking.
            </p>
          </div>

          <div className="quick-starters-grid">
            {quickStarters.map((starter, i) => (
              <button
                key={i}
                type="button"
                className="quick-starter-card"
                onClick={() => onSelectPrompt?.(starter.prompt, starter.agent)}
              >
                <div className="starter-icon-box">{starter.icon}</div>
                <div className="starter-text">
                  <strong>{starter.title}</strong>
                  <span>{starter.subtitle}</span>
                </div>
                <span className="starter-arrow">→</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        messages.map((message, index) => {
          const pptArtifact = message.role === 'assistant' ? getPptArtifact(message.content) : null
          const pdfArtifact = message.role === 'assistant' ? getPdfArtifact(message.content) : null
          const files = message.role === 'assistant' ? getGeneratedFiles(message.content) : null
          const messageId = message._id || `${message.role}-${index}`
          const isArtifactActive = activeArtifact?.id === messageId

          return (
            <article className={`message ${message.role}`} key={messageId}>
              <div className={`message-avatar ${message.role}`}>
                {message.role === 'user' ? 'U' : '✦'}
              </div>
              <div className="message-body">
                <div className="message-meta-row">
                  <span className="message-label">
                    {message.role === 'user' ? 'You' : 'REZZAi'}
                  </span>
                  {message.role === 'assistant' && (
                    <button
                      type="button"
                      className="message-action-btn"
                      onClick={() => copyMessageText(messageId, message.content)}
                      title="Copy response"
                    >
                      {copiedMsgId === messageId ? '✓ Copied' : '⧉ Copy'}
                    </button>
                  )}
                </div>

                {message.role === 'assistant' ? (
                  <>
                    {!message.content?.trim().startsWith('{') && (
                      <div className="markdown-content">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                          {message.content
                            ?.replace(/\[(?:PDF_DOCUMENT|PDF_DATA_SOURCE|PPT_DOCUMENT|📥\s*\*\*Download Generated PDF Document\*\*|PDF|PPT)\]\([^)]+\)/gi, '')
                            ?.replace(/<!--[\s\S]*?-->/g, '')
                            ?.replace(/\b(?:PDF_DOCUMENT|PPT_DOCUMENT)\b/gi, '')
                            ?.trim()}
                        </ReactMarkdown>
                      </div>
                    )}
                    {pptArtifact ? (
                      <ArtifactCard
                        isPpt={true}
                        title={pptArtifact.title}
                        active={isArtifactActive}
                        onOpen={() => onOpenArtifact({ id: messageId, ...pptArtifact })}
                      />
                    ) : pdfArtifact ? (
                      <ArtifactCard
                        isPdf={true}
                        title={pdfArtifact.title}
                        active={isArtifactActive}
                        onOpen={() => onOpenArtifact({ id: messageId, ...pdfArtifact })}
                      />
                    ) : files ? (
                      <ArtifactCard
                        files={files}
                        active={isArtifactActive}
                        onOpen={() => onOpenArtifact({ id: messageId, files })}
                      />
                    ) : null}
                  </>
                ) : (
                  <div className="user-message-bubble">
                    <p>{message.content}</p>
                  </div>
                )}
                {message.role === 'assistant' && message.images?.length > 0 && (
                  <div className="image-grid">
                    {message.images.map((image, imageIndex) => (
                      <ImageCard
                        key={`${image}-${imageIndex}`}
                        src={image}
                        alt={`Generated visual ${imageIndex + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </article>
          )
        })
      )}
      {loading && (
        <div className="typing">
          <div className="typing-dots-pulse">
            <span />
            <span />
            <span />
          </div>
          <span className="typing-text">
            {isImageAgent ? 'REZZAi Image Agent is composing visuals...' : `Thinking with ${activeAgent?.label || 'Agent'}...`}
          </span>
        </div>
      )}
      <div ref={bottomRef} aria-hidden="true" />
    </div>
  )
}

export default MessageList
