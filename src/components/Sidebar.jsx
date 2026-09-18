import { useEffect, useRef, useState } from 'react'

const Sidebar = ({
  user,
  conversations,
  activeConversation,
  loadingHistory,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onLogout,
  mobileOpen,
  onCloseMobile
}) => {
  const [collapsed, setCollapsed] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [avatarError, setAvatarError] = useState(false)
  const popoverRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auto-close on resize to desktop & handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileOpen) {
        onCloseMobile?.()
      }
    }
    const handleResize = () => {
      if (window.innerWidth > 768 && mobileOpen) {
        onCloseMobile?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', handleResize)
    }
  }, [mobileOpen, onCloseMobile])

  // In mobile view, the sidebar is an off-canvas drawer and should never be in 72px collapsed mode
  const isCollapsed = collapsed && !mobileOpen

  const initialLetter = (user?.name || user?.email || 'User')[0].toUpperCase()
  const displayName = user?.name || user?.email?.split('@')[0] || 'My workspace'
  const userEmail = user?.email || 'Personal plan'
  const avatarUrl = user?.avatar || user?.photoURL

  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onCloseMobile}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar overlay"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') onCloseMobile?.() }}
        />
      )}

      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-head">
          <a className="brand" href="/" aria-label="REZZAi home">
            <span className="brand-mark">
              <img src="/logo.png" alt="REZZAi" className="brand-logo-img" />
            </span>
            {!isCollapsed && <span>REZZAi</span>}
          </a>

          {/* Desktop collapse button */}
          <button
            className="icon-button collapse-btn"
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label="Toggle sidebar"
          >
            {collapsed ? '›' : '‹'}
          </button>

          {/* Mobile close button */}
          <button
            className="icon-button mobile-close-btn"
            type="button"
            onClick={onCloseMobile}
            title="Close sidebar"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <button
          className="new-chat"
          type="button"
          onClick={() => {
            onNewChat()
            if (mobileOpen) onCloseMobile?.()
          }}
          title="Create new chat"
        >
          <span>＋</span>
          {!isCollapsed && <span>New chat</span>}
          {!isCollapsed && !mobileOpen && <kbd>⌘ K</kbd>}
        </button>

        <div className="history-section">
          {!isCollapsed && (
            <div className="section-label">
              <span>Recent chats</span>
              <span>{conversations.length}</span>
            </div>
          )}
          <div className="conversation-list">
            {loadingHistory && <p className="empty-note">Loading your space...</p>}
            {!loadingHistory && conversations.length === 0 && (
              <p className="empty-note">{isCollapsed ? '...' : 'Your conversations will appear here.'}</p>
            )}
            {conversations.map((conversation) => (
              <div
                className={`conversation-row ${activeConversation?._id === conversation._id ? 'active' : ''}`}
                key={conversation._id}
              >
                <button
                  className="conversation-item"
                  type="button"
                  onClick={() => {
                    onSelectConversation(conversation)
                    if (mobileOpen) onCloseMobile?.()
                  }}
                  title={conversation.title || 'Untitled conversation'}
                >
                  <span className="conversation-dot" />
                  {!isCollapsed && <span>{conversation.title || 'Untitled conversation'}</span>}
                </button>
                {!isCollapsed && (
                  <button
                    className="delete-conversation"
                    type="button"
                    title="Delete conversation"
                    aria-label={`Delete ${conversation.title || 'conversation'}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteConversation(conversation)
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-bottom" ref={popoverRef}>
          {showUserMenu && (
            <div className="user-menu-popover">
              <div className="user-menu-profile">
                <div className="avatar">
                  {avatarUrl && !avatarError ? (
                    <img src={avatarUrl} alt={displayName} className="avatar-img" onError={() => setAvatarError(true)} />
                  ) : (
                    initialLetter
                  )}
                </div>
                <div className="user-menu-info">
                  <strong>{user?.name || 'User Account'}</strong>
                  <small>{user?.email || 'Logged in'}</small>
                </div>
              </div>

              <div className="user-menu-divider" />

              <button
                className="user-menu-item danger"
                type="button"
                onClick={() => {
                  setShowUserMenu(false)
                  onLogout?.()
                }}
              >
                <span className="menu-icon">🚪</span>
                <span>Log out</span>
              </button>
            </div>
          )}

          <div className="profile-row">
            <div
              className="avatar"
              role="button"
              tabIndex={0}
              onClick={() => setShowUserMenu((prev) => !prev)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowUserMenu((prev) => !prev) }}
              title="Account options"
            >
              {avatarUrl && !avatarError ? (
                <img src={avatarUrl} alt={displayName} className="avatar-img" onError={() => setAvatarError(true)} />
              ) : (
                initialLetter
              )}
            </div>
            {!isCollapsed && (
              <div
                className="profile-info"
                role="button"
                tabIndex={0}
                onClick={() => setShowUserMenu((prev) => !prev)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowUserMenu((prev) => !prev) }}
                title="Account options"
              >
                <strong>{displayName}</strong>
                <small>{userEmail}</small>
              </div>
            )}
            {!isCollapsed && (
              <button
                className="sidebar-logout-btn"
                type="button"
                onClick={onLogout}
                title="Log out"
                aria-label="Log out"
              >
                <span className="logout-icon">🚪</span>
                <span>Log out</span>
              </button>
            )}
            {isCollapsed && (
              <button
                className="sidebar-logout-btn-collapsed"
                type="button"
                onClick={onLogout}
                title="Log out"
                aria-label="Log out"
              >
                🚪
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
