export type Song = {
  id: string
  title: string
  // YouTube-backed songs set videoId; local-file songs set source: 'local'
  // and fileUrl (a blob: URL, valid only for this browser session).
  videoId?: string
  source?: 'local'
  fileUrl?: string
}

export type Playlist = {
  id: string
  name: string
  songIds: string[]
}