import type { Song } from '../types'
import SongThumb from './SongThumb'

type Props = {
  title: string
  songs: Song[]
  currentSongId: string | null
  emptyTitle: string
  emptyNote: string
  onSelect: (song: Song) => void
  onBack: () => void
  favoriteSongIds?: string[]
  onToggleFavorite?: (songId: string) => void
  onRemove?: (songId: string) => void
}

export default function SongCollectionPanel({
  title,
  songs,
  currentSongId,
  emptyTitle,
  emptyNote,
  onSelect,
  onBack,
  favoriteSongIds,
  onToggleFavorite,
  onRemove,
}: Props) {
  return (
    <section className="song-collection">
      <div className="song-collection-header">
        <button className="song-collection-back" onClick={onBack} aria-label="Back">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
        <h3>{title}</h3>
      </div>

      {songs.length === 0 ? (
        <div className="empty">
          <p>{emptyTitle}</p>
          <p>{emptyNote}</p>
        </div>
      ) : (
        <ul className="song-list">
          {songs.map((song) => {
            const isFavorite = favoriteSongIds?.includes(song.id) ?? false
            return (
              <li
                key={song.id}
                className={song.id === currentSongId ? 'active' : ''}
                onClick={() => onSelect(song)}
              >
                <SongThumb song={song} />
                <span className="song-title">{song.title}</span>
                {onToggleFavorite && (
                  <button
                    className={`song-favorite${isFavorite ? ' is-active' : ''}`}
                    aria-label="Toggle favorite"
                    aria-pressed={isFavorite}
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleFavorite(song.id)
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill={isFavorite ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 20s-7-4.35-9.5-8.5C.7 8.1 2.4 4.5 6 4.5c2 0 3.3 1.1 4 2.2.7-1.1 2-2.2 4-2.2 3.6 0 5.3 3.6 3.5 7-2.5 4.15-9.5 8.5-9.5 8.5z" />
                    </svg>
                  </button>
                )}
                {onRemove && (
                  <button
                    className="song-remove"
                    aria-label="Remove from playlist"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemove(song.id)
                    }}
                  >
                    ✕
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
