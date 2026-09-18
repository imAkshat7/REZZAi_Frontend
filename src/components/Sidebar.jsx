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
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') onCloseMobile() }}
        />
      )}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-head">
          <a className="brand" href="/" aria-label="REZZAi home">
            <span className="brand-mark">
              <img src="/logo.png" alt="REZZAi" className="brand-logo-img" />
            </span>
            {!collapsed && <span>REZZAi</span>}
          </a>
          <button
            className="icon-button collapse-btn"
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label="Toggle sidebar"
          >
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        <button className="new-chat" type="button" onClick={onNewChat} title="Create new chat">
          <span>＋</span>
          {!collapsed && <span>New chat</span>}
          {!collapsed && <kbd>⌘ K</kbd>}
        </button>

        <div className="history-section">
          {!collapsed && (
            <div className="section-label">
              <span>Recent chats</span>
              <span>{conversations.length}</span>
            </div>
          )}
          <div className="conversation-list">
            {loadingHistory && <p className="empty-note">Loading your space...</p>}
            {!loadingHistory && conversations.length === 0 && (
              <p className="empty-note">{collapsed ? '...' : 'Your conversations will appear here.'}</p>
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
                    if (mobileOpen) onCloseMobile()
                  }}
                  title={conversation.title || 'Untitled conversation'}
                >
                  <span className="conversation-dot" />
                  {!collapsed && <span>{conversation.title || 'Untitled conversation'}</span>}
                </button>
                {!collapsed && (
                  <button
                    className="delete-conversation"
                    type="button"
                    title="Delete conversation"
                    aria-label={`Delete ${conversation.title || 'conversation'}`}
                    onClick={() => onDeleteConversation(conversation)}
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

          <div
            className="profile-row"
            role="button"
            tabIndex={0}
            onClick={() => setShowUserMenu((prev) => !prev)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowUserMenu((prev) => !prev) }}
            title="Account options"
          >
            <div className="avatar">
              {avatarUrl && !avatarError ? (
                <img src={avatarUrl} alt={displayName} className="avatar-img" onError={() => setAvatarError(true)} />
              ) : (
                initialLetter
              )}
            </div>
            {!collapsed && (
              <div className="profile-info">
                <strong>{displayName}</strong>
                <small>{userEmail}</small>
              </div>
            )}
            {!collapsed && (
              <button
                className={`more-button ${showUserMenu ? 'active' : ''}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowUserMenu((prev) => !prev)
                }}
                title="Account options"
                aria-label="More profile options"
              >
                •••
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
