import { useRef, useState } from 'react'

type Props = {
  url: string
  error: string
  onUrlChange: (value: string) => void
  onAdd: () => void
  onAddLocalFiles: (files: FileList | File[]) => void
}

export default function ImportView({ url, error, onUrlChange, onAdd, onAddLocalFiles }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const closeModal = () => setModalOpen(false)

  const handleAdd = () => {
    onAdd()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) onAddLocalFiles(e.target.files)
    e.target.value = ''
  }

  return (
    <section className="import-view">
      <div className="import-methods">
        <div className="import-method" onClick={() => setModalOpen(true)}>
          <span className="import-method-icon yt">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M7 5v14l12-7z" />
            </svg>
          </span>
          <div className="import-method-body">
            <p className="import-method-title">Import from song</p>
          </div>
        </div>

        <div className="import-method" onClick={() => fileInputRef.current?.click()}>
          <span className="import-method-icon files">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
          </span>
          <div className="import-method-body">
            <p className="import-method-title">Import from files</p>
          </div>
        </div>

        <div className="import-method" onClick={() => fileInputRef.current?.click()}>
          <span className="import-method-icon device">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="12" rx="1.5" />
              <path d="M8 20h8M12 16v4" />
            </svg>
          </span>
          <div className="import-method-body">
            <p className="import-method-title">Import from computer</p>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        multiple
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Import from song</h2>
            <input
              type="text"
              placeholder="https://youtube.com/watch?v=..."
              value={url}
              autoFocus
              onChange={(e) => onUrlChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd()
              }}
            />
            {error && <p className="error">{error}</p>}
            <div className="modal-actions">
              <button onClick={closeModal}>Cancel</button>
              <button onClick={handleAdd}>Add Song</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}