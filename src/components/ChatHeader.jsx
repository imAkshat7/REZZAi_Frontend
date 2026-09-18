const ChatHeader = ({ conversation, onToggleMobileSidebar }) => (
  <header className="chat-header">
    <div className="header-left">
      <button
        className="mobile-menu-btn"
        type="button"
        onClick={onToggleMobileSidebar}
        title="Toggle sidebar"
        aria-label="Toggle sidebar"
      >
        ☰
      </button>
      <div>
        <p className="header-kicker">Personal intelligence</p>
        <h1>{conversation ? conversation.title : 'A clear place to think'}</h1>
      </div>
    </div>
    <div className="header-actions">
      <div className="header-status-badge">
        <span className="status-dot" />
        <span>Ready</span>
      </div>
    </div>
  </header>
)

export default ChatHeader
