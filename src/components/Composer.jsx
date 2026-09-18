import { useEffect, useRef } from 'react'
import './Composer.css'

const Composer = ({
  agents,
  agent,
  prompt,
  attachedFile,
  loading,
  error,
  activeAgent,
  onAgentChange,
  onPromptChange,
  onFileChange,
  onSend
}) => {
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const messageArea = textarea.closest('.chat-panel')?.querySelector('.message-area')
    const distanceFromBottom = messageArea
      ? messageArea.scrollHeight - messageArea.scrollTop - messageArea.clientHeight
      : null

    textarea.style.height = 'auto'
    const maxHeight = window.innerWidth <= 760 ? 140 : 180
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden'

    if (messageArea && distanceFromBottom !== null && distanceFromBottom < 24) {
      window.requestAnimationFrame(() => {
        messageArea.scrollTop = messageArea.scrollHeight - messageArea.clientHeight
      })
    }
  }, [prompt])

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0]
    if (file && onFileChange) {
      onFileChange(file)
    }
  }

  const removeFile = () => {
    if (onFileChange) {
      onFileChange(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="composer-wrap">
      {error && <div className="error-banner" role="alert">{error}</div>}
      <div className="agent-tray">
        <span className="tray-label">Use an agent</span>
        {agents.map((item) => (
          <button
            className={`agent-chip ${agent === item.id ? 'selected' : ''}`}
            key={item.id}
            type="button"
            onClick={() => onAgentChange(item.id)}
            title={item.detail}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      <form className="composer" onSubmit={onSend}>
        {attachedFile && (
          <div className="attached-file-chip">
            <span className="file-icon">
              {attachedFile.type?.includes('pdf') ? '📄' : '🖼️'}
            </span>
            <span className="file-name">{attachedFile.name}</span>
            <button
              type="button"
              className="remove-file-btn"
              onClick={removeFile}
              title="Remove file"
            >
              ✕
            </button>
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(event) => onPromptChange(event.target.value)}
          placeholder={`Message ${activeAgent.label}...`}
          rows="1"
          aria-label="Message input"
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              onSend(event)
            }
          }}
        />

        <div className="composer-footer">
          <div className="footer-left">
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".pdf,image/jpeg,image/png,image/jpg"
              onChange={handleFileSelect}
            />
            <button
              type="button"
              className="attach-button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach PDF or image"
              aria-label="Attach file"
            >
              📎 <span className="attach-label">Attach file</span>
            </button>
            <span className="disclaimer">REZZAi can make mistakes. Check important info.</span>
          </div>

          <button
            className="send-button"
            type="submit"
            disabled={(!prompt.trim() && !attachedFile) || loading}
            aria-label="Send message"
          >
            ↑
          </button>
        </div>
      </form>
    </div>
  )
}

export default Composer
