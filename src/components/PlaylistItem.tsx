import type { Song } from '../types'
import SongThumb from './SongThumb'

type Props = {
  song: Song
  isActive: boolean
  onSelect: () => void
  onRemove: (e: React.MouseEvent) => void
}

export default function PlaylistItem({ song, isActive, onSelect, onRemove }: Props) {
  return (
    <li className={isActive ? 'active' : ''} onClick={onSelect}>
      <SongThumb song={song} />
      <span className="song-title">{song.title}</span>
      <button className="song-remove" onClick={onRemove} aria-label="Remove from playlist">
        ✕
      </button>
    </li>
  )
}