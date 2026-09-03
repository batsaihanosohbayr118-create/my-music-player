type Props = {
  open: boolean
  url: string
  error: string
  onUrlChange: (value: string) => void
  onCancel: () => void
  onAdd: () => void
}

export default function AddSongModal({ open, url, error, onUrlChange, onCancel, onAdd }: Props) {
  if (!open) return null

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Add Song</h2>

        <input
          type="text"
          placeholder="Paste YouTube URL"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
        />
        {error && <p className="error">{error}</p>}

        <div className="modal-actions">
          <button onClick={onCancel}>Cancel</button>
          <button onClick={onAdd}>Add Song</button>
        </div>
      </div>
    </div>
  )
}