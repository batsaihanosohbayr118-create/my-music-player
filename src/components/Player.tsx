import { useEffect, useRef, useState } from 'react'
import type { Playlist, Song } from '../types'
import { formatTime } from '../utils/youtube'
import VolumeControl from './VolumeControl'

type Props = {
  currentSong: Song | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  canGoPrev: boolean
  canGoNext: boolean
  onTogglePlay: () => void
  onPrev: () => void
  onNext: () => void
  onSeek: (seconds: number) => void
  onVolumeChange: (value: number) => void
  onClose: () => void
  // Сонголтоор: эцэг компонентоос favorite төлөвийг удирдах бол дамжуулна.
  // Дамжуулаагүй бол Player дотооддоо (зөвхөн энэ сессэд) удирдана.
  isFavorite?: boolean
  onToggleFavorite?: () => void
  // Sleep timer дуусахад дуудагдана. Дамжуулаагүй бол Player isPlaying-г
  // ашиглаж onTogglePlay-г дуудна (тоглож байгаа үед л зогсооно).
  onSleepTimerEnd?: () => void
  playlists: Playlist[]
  onToggleSongInPlaylist: (playlistId: string, songId: string) => void
  isShuffled: boolean
  onToggleShuffle: () => void
  isRepeatOne: boolean
  onToggleRepeatOne: () => void
}

const SLEEP_TIMER_OPTIONS = [15, 30, 45, 60, 90, 120]

export default function Player({
  currentSong,
  isPlaying,
  currentTime,
  duration,
  volume,
  canGoPrev,
  canGoNext,
  onTogglePlay,
  onPrev,
  onNext,
  onSeek,
  onVolumeChange,
  onClose,
  isFavorite,
  onToggleFavorite,
  onSleepTimerEnd,
  playlists,
  onToggleSongInPlaylist,
  isShuffled,
  onToggleShuffle,
  isRepeatOne,
  onToggleRepeatOne,
}: Props) {
  const [localFavorite, setLocalFavorite] = useState(false)
  const [addToPlaylistOpen, setAddToPlaylistOpen] = useState(false)
  const favorite = isFavorite ?? localFavorite

  const handleToggleFavorite = () => {
    if (onToggleFavorite) {
      onToggleFavorite()
    } else {
      setLocalFavorite((prev) => !prev)
    }
  }

  // --- Sleep timer ---
  const [sleepMenuOpen, setSleepMenuOpen] = useState(false)
  const [sleepSecondsLeft, setSleepSecondsLeft] = useState<number | null>(null)
  const isPlayingRef = useRef(isPlaying)
  isPlayingRef.current = isPlaying

  useEffect(() => {
    if (sleepSecondsLeft === null) return
    if (sleepSecondsLeft <= 0) {
      setSleepSecondsLeft(null)
      if (onSleepTimerEnd) {
        onSleepTimerEnd()
      } else if (isPlayingRef.current) {
        onTogglePlay()
      }
      return
    }
    const id = setTimeout(() => setSleepSecondsLeft((s) => (s !== null ? s - 1 : s)), 1000)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sleepSecondsLeft])

  const startSleepTimer = (minutes: number) => {
    setSleepSecondsLeft(minutes * 60)
    setSleepMenuOpen(false)
  }

  const cancelSleepTimer = () => {
    setSleepSecondsLeft(null)
    setSleepMenuOpen(false)
  }

  const sleepLabel =
    sleepSecondsLeft !== null
      ? `${Math.floor(sleepSecondsLeft / 60)}:${String(sleepSecondsLeft % 60).padStart(2, '0')}`
      : null

  // --- Share ---
  const [shareFeedback, setShareFeedback] = useState<string | null>(null)

  const handleShare = async () => {
    if (!currentSong) return
    const url = `https://www.youtube.com/watch?v=${currentSong.videoId}`

    if (navigator.share) {
      try {
        await navigator.share({ title: currentSong.title, url })
      } catch {
        // Хэрэглэгч цуцалсан эсвэл дэмжигдээгүй тохиолдол — юу ч хийхгүй
      }
      return
    }

    try {
      await navigator.clipboard.writeText(url)
      setShareFeedback('Холбоос хуулагдлаа')
    } catch {
      setShareFeedback('Хуулж чадсангүй')
    }
    setTimeout(() => setShareFeedback(null), 2000)
  }

  // --- Car mode ---
  const [carModeOpen, setCarModeOpen] = useState(false)

  return (
    <section className={`player player-expanded${carModeOpen ? ' car-mode' : ''}`}>
      {carModeOpen ? (
        <button className="car-mode-exit" onClick={() => setCarModeOpen(false)} aria-label="Exit car mode">
          ✕
        </button>
      ) : (
        <button className="player-close" onClick={onClose} aria-label="Collapse player">
          ‹
        </button>
      )}

      {!carModeOpen && (
        <div className="player-volume">
          <VolumeControl volume={volume} onVolumeChange={onVolumeChange} />
        </div>
      )}

      <div className="song-info">
        <h2>{currentSong ? currentSong.title : 'No song selected'}</h2>
        {!currentSong && <p>Add a song to start listening</p>}
      </div>

      <div className="cover">
        <div id="yt-player" className="yt-player-mount" />
        {(!currentSong || currentSong.source === 'local') && (
          <span className="cover-placeholder">♪</span>
        )}
      </div>

      {!carModeOpen && (
        <div className="quick-actions">
        <button
          className="quick-action"
          aria-label="Add to playlist"
          disabled={!currentSong}
          onClick={() => setAddToPlaylistOpen(true)}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6h13M4 12h13M4 18h6" />
            <path d="M18 15v6M15 18h6" />
          </svg>
        </button>
        <button
          className={`quick-action${favorite ? ' is-active' : ''}`}
          aria-label="Favorite"
          aria-pressed={favorite}
          disabled={!currentSong}
          onClick={handleToggleFavorite}
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill={favorite ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 20s-7-4.35-9.5-8.5C.7 8.1 2.4 4.5 6 4.5c2 0 3.3 1.1 4 2.2.7-1.1 2-2.2 4-2.2 3.6 0 5.3 3.6 3.5 7-2.5 4.15-9.5 8.5-9.5 8.5z" />
          </svg>
        </button>
        <div className="sleep-timer-wrap">
          <button
            className={`quick-action${sleepLabel ? ' is-active' : ''}`}
            aria-label="Sleep timer"
            aria-pressed={sleepMenuOpen}
            onClick={() => setSleepMenuOpen((prev) => !prev)}
          >
            {sleepLabel ? (
              <span className="sleep-timer-badge">{sleepLabel}</span>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="13" r="8" />
                <path d="M12 9v4l3 2M9 2h6" />
              </svg>
            )}
          </button>
        </div>

        {sleepMenuOpen && (
          <div className="sheet-overlay" onClick={() => setSleepMenuOpen(false)}>
            <div className="action-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="action-sheet-group">
                <p className="action-sheet-title">Timer</p>
                {SLEEP_TIMER_OPTIONS.map((minutes) => (
                  <button key={minutes} onClick={() => startSleepTimer(minutes)}>
                    {minutes} mins
                  </button>
                ))}
                {sleepSecondsLeft !== null && (
                  <button className="action-sheet-danger" onClick={cancelSleepTimer}>
                    Stop timer
                  </button>
                )}
              </div>
              <button className="action-sheet-cancel" onClick={() => setSleepMenuOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {addToPlaylistOpen && (
          <div className="sheet-overlay" onClick={() => setAddToPlaylistOpen(false)}>
            <div className="action-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="action-sheet-group">
                <p className="action-sheet-title">Add to Playlist</p>
                {playlists.length === 0 ? (
                  <p className="action-sheet-empty">
                    No playlists yet — create one from the Playlists tab.
                  </p>
                ) : (
                  playlists.map((playlist) => {
                    const inPlaylist = currentSong ? playlist.songIds.includes(currentSong.id) : false
                    return (
                      <button
                        key={playlist.id}
                        onClick={() => currentSong && onToggleSongInPlaylist(playlist.id, currentSong.id)}
                      >
                        {playlist.name}
                        {inPlaylist && <span className="action-sheet-check">✓</span>}
                      </button>
                    )
                  })
                )}
              </div>
              <button className="action-sheet-cancel" onClick={() => setAddToPlaylistOpen(false)}>
                Done
              </button>
            </div>
          </div>
        )}

        <div className="share-wrap">
          <button
            className="quick-action"
            aria-label="Share"
            disabled={!currentSong}
            onClick={handleShare}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
              <path d="M16 6l-4-4-4 4M12 2v14" />
            </svg>
          </button>
          {shareFeedback && <span className="share-feedback">{shareFeedback}</span>}
        </div>
        <button
          className={`quick-action${carModeOpen ? ' is-active' : ''}`}
          aria-label="Car mode"
          aria-pressed={carModeOpen}
          disabled={!currentSong}
          onClick={() => setCarModeOpen(true)}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11" />
            <rect x="3" y="11" width="18" height="6" rx="2" />
            <path d="M7 17v2M17 17v2" />
            <circle cx="7.5" cy="14" r="0.6" fill="currentColor" stroke="none" />
            <circle cx="16.5" cy="14" r="0.6" fill="currentColor" stroke="none" />
          </svg>
        </button>
        </div>
      )}

      <div className="progress">
        <input
          type="range"
          className="progress-bar"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          disabled={!currentSong}
          onChange={(e) => onSeek(Number(e.target.value))}
          style={{
            ['--progress' as string]: `${duration ? (currentTime / duration) * 100 : 0}%`,
          }}
        />
        <div className="progress-times">
          <span className="time">{formatTime(currentTime)}</span>
          <span className="time">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="controls">
        <button
          className={isShuffled ? 'is-active' : ''}
          aria-label="Shuffle"
          aria-pressed={isShuffled}
          onClick={onToggleShuffle}
          disabled={!currentSong}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 3h5v5" />
            <path d="M4 20L21 3" />
            <path d="M21 16v5h-5" />
            <path d="M15 15l6 6" />
            <path d="M4 4l5 5" />
          </svg>
        </button>
        <button onClick={onPrev} disabled={!canGoPrev}>⏮</button>
        <button className="play-button" onClick={onTogglePlay} disabled={!currentSong}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button onClick={onNext} disabled={!canGoNext}>⏭</button>
        <button
          className={isRepeatOne ? 'is-active' : ''}
          aria-label="Repeat one"
          aria-pressed={isRepeatOne}
          onClick={onToggleRepeatOne}
          disabled={!currentSong}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 1l4 4-4 4" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <path d="M7 23l-4-4 4-4" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            <text x="12" y="15.5" fontSize="8" textAnchor="middle" fill="currentColor" stroke="none">1</text>
          </svg>
        </button>
      </div>
    </section>
  )
}