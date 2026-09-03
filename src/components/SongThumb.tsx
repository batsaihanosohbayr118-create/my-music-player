import type { Song } from '../types'

type Props = {
  song: Song
  className?: string
}

export default function SongThumb({ song, className = 'song-thumb' }: Props) {
  const classes = className

  if (song.source === 'local') {
    return (
      <span className={`${classes} local-thumb`}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l11-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="17" cy="16" r="3" />
        </svg>
      </span>
    )
  }

  return (
    <img
      className={classes}
      src={`https://i.ytimg.com/vi/${song.videoId}/mqdefault.jpg`}
      alt=""
      loading="lazy"
    />
  )
}
