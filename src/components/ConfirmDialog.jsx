const ConfirmDialog = ({ conversation, onCancel, onConfirm }) => {
  if (!conversation) return null

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onCancel}>
      <section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="dialog-icon">×</div>
        <p className="dialog-kicker">Delete conversation</p>
        <h2 id="delete-dialog-title">Remove this conversation?</h2>
        <p className="dialog-copy">“{conversation.title || 'Untitled conversation'}” and all its messages will be permanently deleted.</p>
        <div className="dialog-actions">
          <button className="dialog-cancel" type="button" onClick={onCancel}>Keep it</button>
          <button className="dialog-delete" type="button" onClick={onConfirm}>Delete conversation</button>
        </div>
      </section>
    </div>
  )
}

export default ConfirmDialog
