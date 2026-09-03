import { useState } from 'react'
import type { Playlist, Song } from '../types'
import SongCollectionPanel from './SongCollectionPanel'

type Props = {
  songs: Song[]
  currentSongId: string | null
  favoriteSongIds: string[]
  recentlyPlayedIds: string[]
  playlists: Playlist[]
  onCreatePlaylist: (name: string) => void
  onRenamePlaylist: (playlistId: string, name: string) => void
  onDeletePlaylist: (playlistId: string) => void
  onSelectSong: (song: Song) => void
  onToggleFavorite: (songId: string) => void
  onToggleSongInPlaylist: (playlistId: string, songId: string) => void
}

type ExpandedPanel = 'favorite' | 'recently' | null

export default function PlaylistsView({
  songs,
  currentSongId,
  favoriteSongIds,
  recentlyPlayedIds,
  playlists,
  onCreatePlaylist,
  onRenamePlaylist,
  onDeletePlaylist,
  onSelectSong,
  onToggleFavorite,
  onToggleSongInPlaylist,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [expandedPanel, setExpandedPanel] = useState<ExpandedPanel>(null)
  const [openPlaylistId, setOpenPlaylistId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [optionsPlaylistId, setOptionsPlaylistId] = useState<string | null>(null)
  const [renameTarget, setRenameTarget] = useState<Playlist | null>(null)
  const [renameName, setRenameName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Playlist | null>(null)

  const closeModal = () => {
    setModalOpen(false)
    setName('')
  }

  const handleCreate = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onCreatePlaylist(trimmed)
    closeModal()
  }

  const openOptions = (e: React.MouseEvent, playlist: Playlist) => {
    e.stopPropagation()
    setOptionsPlaylistId(playlist.id)
  }

  const startRename = (playlist: Playlist) => {
    setRenameTarget(playlist)
    setRenameName(playlist.name)
    setOptionsPlaylistId(null)
  }

  const submitRename = () => {
    const trimmed = renameName.trim()
    if (!trimmed || !renameTarget) return
    onRenamePlaylist(renameTarget.id, trimmed)
    setRenameTarget(null)
  }

  const startDelete = (playlist: Playlist) => {
    setDeleteTarget(playlist)
    setOptionsPlaylistId(null)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    onDeletePlaylist(deleteTarget.id)
    setDeleteTarget(null)
  }

  const filteredPlaylists = query.trim()
    ? playlists.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()))
    : playlists

  const favoriteSongs = songs.filter((s) => favoriteSongIds.includes(s.id))
  const recentSongs = recentlyPlayedIds
    .map((id) => songs.find((s) => s.id === id))
    .filter((s): s is Song => Boolean(s))

  if (expandedPanel === 'favorite') {
    return (
      <SongCollectionPanel
        title="Favorite"
        songs={favoriteSongs}
        currentSongId={currentSongId}
        emptyTitle="No favorite songs yet"
        emptyNote="Tap the heart on a song to save it here."
        onSelect={onSelectSong}
        onBack={() => setExpandedPanel(null)}
        favoriteSongIds={favoriteSongIds}
        onToggleFavorite={onToggleFavorite}
      />
    )
  }

  if (expandedPanel === 'recently') {
    return (
      <SongCollectionPanel
        title="Recently"
        songs={recentSongs}
        currentSongId={currentSongId}
        emptyTitle="No recently played songs yet"
        emptyNote="Play a song and it'll show up here."
        onSelect={onSelectSong}
        onBack={() => setExpandedPanel(null)}
      />
    )
  }

  const openPlaylist = playlists.find((p) => p.id === openPlaylistId) ?? null
  if (openPlaylist) {
    const playlistSongs = openPlaylist.songIds
      .map((id) => songs.find((s) => s.id === id))
      .filter((s): s is Song => Boolean(s))
    return (
      <SongCollectionPanel
        title={openPlaylist.name}
        songs={playlistSongs}
        currentSongId={currentSongId}
        emptyTitle="No songs in this playlist yet"
        emptyNote="Use Add to Playlist from the player to add songs here."
        onSelect={onSelectSong}
        onBack={() => setOpenPlaylistId(null)}
        onRemove={(songId) => onToggleSongInPlaylist(openPlaylist.id, songId)}
      />
    )
  }

  return (
    <section className="playlists-view">
      <div className="search-bar">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          placeholder="Search Playlists"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="quick-cards">
        <button className="quick-card" onClick={() => setExpandedPanel('favorite')}>
          <span className="quick-card-icon favorite">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12 21s-6.7-4.35-9.3-8.1C.9 10.1 1.6 6.6 4.6 5.2c2.2-1 4.6-.3 5.9 1.5l1.5 2 1.5-2c1.3-1.8 3.7-2.5 5.9-1.5 3 1.4 3.7 4.9 1.9 7.7C18.7 16.65 12 21 12 21z" />
            </svg>
          </span>
          <div>
            <p className="quick-card-title">Favorite</p>
            <p className="quick-card-count">{favoriteSongs.length}</p>
          </div>
        </button>

        <button className="quick-card" onClick={() => setExpandedPanel('recently')}>
          <span className="quick-card-icon recent">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3.5 2" />
            </svg>
          </span>
          <div>
            <p className="quick-card-title">Recently</p>
            <p className="quick-card-count">{recentSongs.length}</p>
          </div>
        </button>
      </div>

      <div className="playlists-header">
        <h3>My Playlist</h3>
        <button className="playlists-add" aria-label="Create playlist" onClick={() => setModalOpen(true)}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      {filteredPlaylists.length === 0 ? (
        <div className="playlists-empty">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 8a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <path d="M14.5 10.5v4.3" />
            <path d="M14.5 10.5l3-0.6v4.2" />
            <circle cx="13.2" cy="15.3" r="1.3" fill="currentColor" stroke="none" />
            <circle cx="16.5" cy="14.6" r="1.3" fill="currentColor" stroke="none" />
          </svg>
          <p>{query.trim() ? 'No playlists match your search' : 'No playlists found'}</p>
        </div>
      ) : (
        <ul className="playlist-list">
          {filteredPlaylists.map((playlist) => (
            <li
              key={playlist.id}
              className="playlist-row"
              onClick={() => setOpenPlaylistId(playlist.id)}
            >
              <span className="playlist-row-icon">
                <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <path d="M14.5 10.5v4.3" />
                  <path d="M14.5 10.5l3-0.6v4.2" />
                  <circle cx="13.2" cy="15.3" r="1.3" fill="currentColor" stroke="none" />
                  <circle cx="16.5" cy="14.6" r="1.3" fill="currentColor" stroke="none" />
                </svg>
              </span>
              <div className="playlist-row-body">
                <p className="playlist-row-title">{playlist.name}</p>
                <p className="playlist-row-count">{playlist.songIds.length} songs</p>
              </div>
              <button
                className="playlist-row-menu"
                aria-label="Playlist options"
                onClick={(e) => openOptions(e, playlist)}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <circle cx="12" cy="5" r="1.6" />
                  <circle cx="12" cy="12" r="1.6" />
                  <circle cx="12" cy="19" r="1.6" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create Playlist</h2>
            <input
              type="text"
              placeholder="Playlist name"
              value={name}
              autoFocus
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate()
              }}
            />
            <div className="modal-actions">
              <button onClick={closeModal}>Cancel</button>
              <button onClick={handleCreate}>Create</button>
            </div>
          </div>
        </div>
      )}

      {optionsPlaylistId && (
        <div className="sheet-overlay" onClick={() => setOptionsPlaylistId(null)}>
          <div className="action-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="action-sheet-group">
              <button
                onClick={() => {
                  const playlist = playlists.find((p) => p.id === optionsPlaylistId)
                  if (playlist) startRename(playlist)
                }}
              >
                Rename
              </button>
              <button
                className="action-sheet-danger"
                onClick={() => {
                  const playlist = playlists.find((p) => p.id === optionsPlaylistId)
                  if (playlist) startDelete(playlist)
                }}
              >
                Delete
              </button>
            </div>
            <button className="action-sheet-cancel" onClick={() => setOptionsPlaylistId(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {renameTarget && (
        <div className="modal-overlay" onClick={() => setRenameTarget(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Rename Playlist</h2>
            <input
              type="text"
              placeholder="Playlist name"
              value={renameName}
              autoFocus
              onChange={(e) => setRenameName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitRename()
              }}
            />
            <div className="modal-actions">
              <button onClick={() => setRenameTarget(null)}>Cancel</button>
              <button onClick={submitRename}>Save</button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Delete playlist?</h2>
            <p className="settings-confirm-body">
              This will permanently delete "{deleteTarget.name}".
            </p>
            <div className="modal-actions">
              <button onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="modal-danger-confirm" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
