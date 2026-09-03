import { useState } from 'react'

const TERMS_TEXT = `By using My Music Player, you agree to use the app only for lawful, personal, non-commercial purposes. Songs are streamed via YouTube's public API; you're responsible for complying with YouTube's own Terms of Service for any content you play. We provide the app "as is" without warranties of any kind, and we're not liable for any content accessed through the app. We may update these terms from time to time — continued use after changes means you accept the new terms.`

const PRIVACY_TEXT = `My Music Player stores your playlist, songs, and background preference locally on your device — none of this data is sent to us or any third party. The app streams video through YouTube's embedded player, which may collect data per Google's own privacy policy. We don't collect analytics, ads data, or personal information ourselves. Clearing your browser storage or uninstalling the app removes all locally saved data.`

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}

type Props = {
  onOpenBackgroundPicker: () => void
}

export default function SettingsView({ onOpenBackgroundPicker }: Props) {
  const [toast, setToast] = useState<string | null>(null)
  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | null>(null)

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 2000)
  }

  const handleShare = async () => {
    const shareUrl = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Music Player', url: shareUrl })
      } catch {
        // user cancelled the share sheet — nothing to do
      }
    } else {
      await navigator.clipboard.writeText(shareUrl)
      showToast('Link copied to clipboard')
    }
  }

  return (
    <section className="settings-view">
      <div className="app-banner">
        <span className="app-banner-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l11-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="17" cy="16" r="3" />
          </svg>
        </span>
        <div>
          <p className="app-banner-title">My Music Player</p>
          <p className="app-banner-subtitle">A simple YouTube-powered playlist app</p>
        </div>
      </div>

      <div className="settings-section">

        <button className="settings-nav-row" onClick={onOpenBackgroundPicker}>
          <p className="settings-row-title">Theme mode</p>
          <ChevronIcon />
        </button>

        <button className="settings-nav-row" onClick={handleShare}>
          <p className="settings-row-title">Share app</p>
          <ChevronIcon />
        </button>

        <button className="settings-nav-row" onClick={() => setLegalModal('terms')}>
          <p className="settings-row-title">Terms of Service</p>
          <ChevronIcon />
        </button>

        <button className="settings-nav-row" onClick={() => setLegalModal('privacy')}>
          <p className="settings-row-title">Privacy Policy</p>
          <ChevronIcon />
        </button>
      </div>

      {toast && <div className="settings-toast">{toast}</div>}

      {legalModal && (
        <div className="modal-overlay" onClick={() => setLegalModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{legalModal === 'terms' ? 'Terms of Service' : 'Privacy Policy'}</h2>
            <p className="settings-confirm-body">
              {legalModal === 'terms' ? TERMS_TEXT : PRIVACY_TEXT}
            </p>
            <div className="modal-actions">
              <button onClick={() => setLegalModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}