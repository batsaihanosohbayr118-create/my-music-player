import { useMemo, useState } from 'react'
import type { Song } from '../types'
import PlaylistItem from './PlaylistItem'

type Props = {
  songs: Song[]
  currentSongId: string | null
  onSelect: (song: Song) => void
  onRemove: (id: string, e: React.MouseEvent) => void
  onPlayAll: () => void
}

export default function Playlist({ songs, currentSongId, onSelect, onRemove, onPlayAll }: Props) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return songs
    const q = query.toLowerCase()
    return songs.filter((s) => s.title.toLowerCase().includes(q))
  }, [songs, query])

  return (
    <section className="playlist">
      <div className="search-bar">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          placeholder="Search music"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="playlist-toolbar">
        <button className="play-all" onClick={onPlayAll} disabled={songs.length === 0}>
          <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
            <path d="M7 5v14l12-7z" />
          </svg>
          Play All
          <span className="count">({songs.length})</span>
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <p>{songs.length === 0 ? 'No tracks yet' : 'No matches'}</p>
          <p>
            {songs.length === 0
              ? 'Paste a YouTube link to add your first track.'
              : 'Try a different search term.'}
          </p>
        </div>
      ) : (
        <ul className="song-list">
          {filtered.map((song) => (
            <PlaylistItem
              key={song.id}
              song={song}
              isActive={song.id === currentSongId}
              onSelect={() => onSelect(song)}
              onRemove={(e) => onRemove(song.id, e)}
            />
          ))}
        </ul>
      )}
    </section>
  )
}