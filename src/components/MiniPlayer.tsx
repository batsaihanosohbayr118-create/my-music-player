import type { Song } from '../types'
import SongThumb from './SongThumb'

type Props = {
  currentSong: Song | null
  isPlaying: boolean
  canGoNext: boolean
  onTogglePlay: () => void
  onNext: () => void
  onExpand: () => void
}

export default function MiniPlayer({
  currentSong,
  isPlaying,
  canGoNext,
  onTogglePlay,
  onNext,
  onExpand,
}: Props) {
  if (!currentSong) return null

  return (
    <div className="mini-player" onClick={onExpand}>
      <SongThumb song={currentSong} className="mini-thumb" />
      <div className="mini-info">
        <p className="mini-title">{currentSong.title}</p>
      </div>
      <div className="mini-controls">
        <button
          className="mini-play"
          onClick={(e) => {
            e.stopPropagation()
            onTogglePlay()
          }}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNext()
          }}
          disabled={!canGoNext}
          aria-label="Next"
        >
          ⏭
        </button>
      </div>
    </div>
  )
}