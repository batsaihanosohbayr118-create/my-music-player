import './App.css'
import { useEffect, useMemo, useState } from 'react'
import type { Playlist as PlaylistData, Song } from './types'
import { getYoutubeId, fetchVideoTitle } from './utils/youtube'
import { useYouTubePlayer } from './hooks/useYouTubePlayer'
import { useAudioPlayer } from './hooks/useAudioPlayer'
import { saveLocalFile, getLocalFile, deleteLocalFile } from './utils/localFileStore'
import Player from './components/Player'
import MiniPlayer from './components/MiniPlayer'
import BottomNav from './components/BottomNav'
import Playlist from './components/Playlist'
import ImportView from './components/ImportView'
import PlaylistsView from './components/PlaylistsView'
import FavoritesView from './components/FavoritesView'
import SettingsView from './components/SettingsView'

type Tab = 'library' | 'playlists' | 'favorites' | 'import' | 'settings'

// Case-insensitive, code-unit order: sorts Latin A-Z before Cyrillic А-Я,
// alphabetized within each script — matches how mixed-language titles here
// are expected to group.
function compareTitles(a: Song, b: Song) {
  const titleA = a.title.toLowerCase()
  const titleB = b.title.toLowerCase()
  if (titleA < titleB) return -1
  if (titleA > titleB) return 1
  return 0
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('library')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [urlError, setUrlError] = useState('')
  const [songs, setSongs] = useState<Song[]>([])
  const [playlists, setPlaylists] = useState<PlaylistData[]>([])
  const [currentSongId, setCurrentSongId] = useState<string | null>(null)
  const [favoriteSongIds, setFavoriteSongIds] = useState<string[]>([])
  const [recentlyPlayedIds, setRecentlyPlayedIds] = useState<string[]>([])
  const [hasLoaded, setHasLoaded] = useState(false)
  const [playerExpanded, setPlayerExpanded] = useState(false)
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null)
  const [isShuffled, setIsShuffled] = useState(false)
  const [shuffleHistory, setShuffleHistory] = useState<string[]>([])
  const [isRepeatOne, setIsRepeatOne] = useState(false)
  const [volume, setVolume] = useState(100)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const yt = useYouTubePlayer('yt-player', () => handleNext(), () => handleTrackError())
  const audio = useAudioPlayer(() => handleNext())

  const sortedSongs = useMemo(() => [...songs].sort(compareTitles), [songs])
  const currentSong = sortedSongs.find((s) => s.id === currentSongId) ?? null
  const currentIndex = sortedSongs.findIndex((s) => s.id === currentSongId)
  const engine = currentSong?.source === 'local' ? audio : yt

  // load saved playlist on first mount — local-file songs need their audio
  // Blob looked up in IndexedDB so we can mint a fresh blob: URL for them
  useEffect(() => {
    const saved = localStorage.getItem('my-music-playlist')
    if (saved) {
      try {
        const parsedSongs: Song[] = JSON.parse(saved)
        Promise.all(
          parsedSongs.map(async (song) => {
            if (song.source !== 'local') return song
            const blob = await getLocalFile(song.id).catch(() => undefined)
            // The file's data is gone (cleared storage, private browsing,
            // etc.) — drop the entry rather than keep an unplayable song.
            if (!blob) return null
            return { ...song, fileUrl: URL.createObjectURL(blob) }
          })
        ).then((resolved) => {
          setSongs(resolved.filter((s): s is Song => s !== null))
        })
      } catch {
        // ignore corrupted data
      }
    }
    const savedBackground = localStorage.getItem('my-music-background')
    if (savedBackground) {
      setBackgroundUrl(savedBackground)
    }
    const savedPlaylists = localStorage.getItem('my-music-playlists')
    if (savedPlaylists) {
      try {
        setPlaylists(JSON.parse(savedPlaylists))
      } catch {
        // ignore corrupted data
      }
    }
    const savedFavorites = localStorage.getItem('my-music-favorites')
    if (savedFavorites) {
      try {
        setFavoriteSongIds(JSON.parse(savedFavorites))
      } catch {
        // ignore corrupted data
      }
    }
    const savedRecent = localStorage.getItem('my-music-recent')
    if (savedRecent) {
      try {
        setRecentlyPlayedIds(JSON.parse(savedRecent))
      } catch {
        // ignore corrupted data
      }
    }
    const savedVolume = localStorage.getItem('my-music-volume')
    if (savedVolume) {
      const parsed = Number(savedVolume)
      if (!Number.isNaN(parsed)) setVolume(parsed)
    }
    setHasLoaded(true)
  }, [])

  // keep both playback engines in sync with the single volume setting, so
  // switching between a YouTube song and a local file never jumps volume
  useEffect(() => {
    yt.setVolume(volume)
    audio.setVolume(volume)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume])

  // persist volume whenever it changes
  useEffect(() => {
    if (!hasLoaded) return
    localStorage.setItem('my-music-volume', String(volume))
  }, [volume, hasLoaded])

  // persist playlist whenever it changes — but only after the initial load
  // above has run, otherwise this fires first and overwrites saved data
  // with the empty starting array
  useEffect(() => {
    if (!hasLoaded) return
    // fileUrl is a blob: URL that only lives for this browser session — the
    // actual audio data is saved separately in IndexedDB (see localFileStore)
    // and a fresh URL is minted for it on the next load.
    const persistable = songs.map((s) =>
      s.source === 'local' ? { id: s.id, title: s.title, source: s.source } : s
    )
    localStorage.setItem('my-music-playlist', JSON.stringify(persistable))
  }, [songs, hasLoaded])

  // persist background selection whenever it changes
  useEffect(() => {
    if (!hasLoaded) return
    if (backgroundUrl) {
      localStorage.setItem('my-music-background', backgroundUrl)
    } else {
      localStorage.removeItem('my-music-background')
    }
  }, [backgroundUrl, hasLoaded])

  // persist playlists whenever they change
  useEffect(() => {
    if (!hasLoaded) return
    localStorage.setItem('my-music-playlists', JSON.stringify(playlists))
  }, [playlists, hasLoaded])

  // persist favorite songs whenever they change
  useEffect(() => {
    if (!hasLoaded) return
    localStorage.setItem('my-music-favorites', JSON.stringify(favoriteSongIds))
  }, [favoriteSongIds, hasLoaded])

  // persist recently played songs whenever they change
  useEffect(() => {
    if (!hasLoaded) return
    localStorage.setItem('my-music-recent', JSON.stringify(recentlyPlayedIds))
  }, [recentlyPlayedIds, hasLoaded])

  // load the current song once the YouTube player finishes initializing
  useEffect(() => {
    if (yt.playerReady && currentSong && currentSong.source !== 'local' && currentSong.videoId) {
      yt.load(currentSong.videoId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yt.playerReady])

  const selectSong = (song: Song) => {
    setCurrentSongId(song.id)
    if (song.source === 'local' && song.fileUrl) {
      yt.stop()
      audio.load(song.fileUrl)
    } else if (song.videoId) {
      audio.stop()
      yt.load(song.videoId)
    }
    setRecentlyPlayedIds((prev) => [song.id, ...prev.filter((id) => id !== song.id)].slice(0, 50))
  }

  const handlePlayAll = () => {
    if (sortedSongs.length === 0) return
    if (currentSongId) {
      togglePlay()
    } else {
      selectSong(sortedSongs[0])
    }
  }

  const handleAddSong = (url: string) => {
    const videoId = getYoutubeId(url)

    if (!videoId) {
      setUrlError('YouTube холбоос буруу байна')
      return
    }

    const newSong: Song = {
      id: crypto.randomUUID(),
      videoId,
      title: `Video ${videoId}`,
    }

    setSongs((prev) => [...prev, newSong])

    fetchVideoTitle(videoId).then((title) => {
      if (!title) return
      setSongs((prev) =>
        prev.map((s) => (s.id === newSong.id ? { ...s, title } : s))
      )
    })

    if (!currentSongId) {
      selectSong(newSong)
    }

    setYoutubeUrl('')
    setUrlError('')
    setActiveTab('library')
  }

  const handleAddLocalFiles = (files: FileList | File[]) => {
    const audioFiles = Array.from(files).filter((f) => f.type.startsWith('audio/'))
    if (audioFiles.length === 0) return

    const newSongs: Song[] = audioFiles.map((file) => ({
      id: crypto.randomUUID(),
      title: file.name.replace(/\.[^/.]+$/, ''),
      source: 'local',
      fileUrl: URL.createObjectURL(file),
    }))

    newSongs.forEach((song, i) => {
      saveLocalFile(song.id, audioFiles[i]).catch(() => {
        // storage failed (quota, private browsing, etc.) — the song still
        // plays for this session via its blob: URL, just won't survive reload
      })
    })

    setSongs((prev) => [...prev, ...newSongs])

    if (!currentSongId) {
      selectSong(newSongs[0])
    }

    setActiveTab('library')
  }

  const handleCreatePlaylist = (name: string) => {
    const newPlaylist: PlaylistData = {
      id: crypto.randomUUID(),
      name,
      songIds: [],
    }
    setPlaylists((prev) => [...prev, newPlaylist])
  }

  const handleRenamePlaylist = (playlistId: string, name: string) => {
    setPlaylists((prev) => prev.map((p) => (p.id === playlistId ? { ...p, name } : p)))
  }

  const handleDeletePlaylist = (playlistId: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== playlistId))
  }

  const handleToggleSongInPlaylist = (playlistId: string, songId: string) => {
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId
          ? {
              ...p,
              songIds: p.songIds.includes(songId)
                ? p.songIds.filter((id) => id !== songId)
                : [...p.songIds, songId],
            }
          : p
      )
    )
  }

  const handleUrlChange = (value: string) => {
    setYoutubeUrl(value)
    setUrlError('')

    // Auto-add as soon as the pasted/typed text is a recognizable
    // YouTube link — no need to press "Add Song" separately.
    if (getYoutubeId(value)) {
      handleAddSong(value)
    }
  }

  const removeSong = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSongs((prev) => {
      const removed = prev.find((s) => s.id === id)
      if (removed?.source === 'local') {
        if (removed.fileUrl) URL.revokeObjectURL(removed.fileUrl)
        deleteLocalFile(id).catch(() => {})
      }
      return prev.filter((s) => s.id !== id)
    })
    setFavoriteSongIds((prev) => prev.filter((fid) => fid !== id))
    setRecentlyPlayedIds((prev) => prev.filter((rid) => rid !== id))
    if (currentSongId === id) {
      yt.stop()
      audio.stop()
      setCurrentSongId(null)
    }
  }

  const handlePrev = () => {
    if (isShuffled) {
      const history = [...shuffleHistory]
      let previousSong: Song | undefined
      while (history.length > 0 && !previousSong) {
        const id = history.pop()
        previousSong = sortedSongs.find((s) => s.id === id)
      }
      setShuffleHistory(history)
      if (previousSong) selectSong(previousSong)
      return
    }
    if (currentIndex > 0) selectSong(sortedSongs[currentIndex - 1])
  }

  const handleNext = () => {
    if (sortedSongs.length === 0) return

    if (isRepeatOne && currentSong) {
      selectSong(currentSong)
      return
    }

    if (isShuffled) {
      const candidates = currentSongId
        ? sortedSongs.filter((s) => s.id !== currentSongId)
        : sortedSongs
      const pool = candidates.length > 0 ? candidates : sortedSongs
      const randomSong = pool[Math.floor(Math.random() * pool.length)]
      if (currentSongId) {
        setShuffleHistory((prev) => [...prev, currentSongId])
      }
      selectSong(randomSong)
      return
    }

    // Wrap back to the first track once the last one finishes, so the
    // playlist keeps looping instead of stopping at the end.
    const nextIndex = currentIndex < sortedSongs.length - 1 ? currentIndex + 1 : 0
    selectSong(sortedSongs[nextIndex])
  }

  const toggleShuffle = () => {
    setIsShuffled((prev) => !prev)
    setShuffleHistory([])
  }

  const toggleRepeatOne = () => {
    setIsRepeatOne((prev) => !prev)
  }

  // Called when the YouTube player reports a playback error (video removed,
  // made private, region-locked, etc). Always moves to a genuinely different
  // track — bypassing shuffle/repeat-one — so a single broken video can't
  // retry-loop forever.
  const handleTrackError = () => {
    showToast('Энэ видеог тоглуулах боломжгүй байна — дараагийн дуу руу шилжлээ')
    if (sortedSongs.length <= 1) return
    const candidates = currentSongId
      ? sortedSongs.filter((s) => s.id !== currentSongId)
      : sortedSongs
    selectSong(candidates[0] ?? sortedSongs[0])
  }

  const togglePlay = () => {
    if (!currentSong || !engine.playerReady) return
    if (engine.isPlaying) {
      engine.pause()
    } else {
      engine.play()
    }
  }

  const toggleFavorite = (songId: string) => {
    setFavoriteSongIds((prev) =>
      prev.includes(songId) ? prev.filter((id) => id !== songId) : [...prev, songId]
    )
  }

  // Lock screen / notification media controls (Media Session API) — lets
  // the OS show the current track and forward play/pause/prev/next to us
  // even while the browser tab isn't focused.
  useEffect(() => {
    if (!('mediaSession' in navigator)) return

    if (currentSong) {
      const artwork =
        currentSong.source !== 'local' && currentSong.videoId
          ? [{ src: `https://i.ytimg.com/vi/${currentSong.videoId}/mqdefault.jpg`, sizes: '320x180', type: 'image/jpeg' }]
          : []
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: 'My Music Player',
        artwork,
      })
    } else {
      navigator.mediaSession.metadata = null
    }

    navigator.mediaSession.setActionHandler('play', () => engine.play())
    navigator.mediaSession.setActionHandler('pause', () => engine.pause())
    navigator.mediaSession.setActionHandler('previoustrack', () => handlePrev())
    navigator.mediaSession.setActionHandler('nexttrack', () => handleNext())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong])

  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.playbackState = engine.isPlaying ? 'playing' : 'paused'
  }, [engine.isPlaying])

  return (
    <main
      className="app"
      style={
        backgroundUrl
          ? {
              backgroundImage: `linear-gradient(180deg, rgba(10,12,11,0.05), rgba(10,12,11,0.22)), url(${backgroundUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      <div className="app-content">
        {activeTab === 'import' ? (
          <ImportView
            url={youtubeUrl}
            error={urlError}
            onUrlChange={handleUrlChange}
            onAdd={() => handleAddSong(youtubeUrl)}
            onAddLocalFiles={handleAddLocalFiles}
          />
        ) : activeTab === 'playlists' ? (
          <PlaylistsView
            songs={sortedSongs}
            currentSongId={currentSongId}
            favoriteSongIds={favoriteSongIds}
            recentlyPlayedIds={recentlyPlayedIds}
            playlists={playlists}
            onCreatePlaylist={handleCreatePlaylist}
            onRenamePlaylist={handleRenamePlaylist}
            onDeletePlaylist={handleDeletePlaylist}
            onSelectSong={(song) => {
              selectSong(song)
              setPlayerExpanded(true)
            }}
            onToggleFavorite={toggleFavorite}
            onToggleSongInPlaylist={handleToggleSongInPlaylist}
          />
        ) : activeTab === 'favorites' ? (
          <FavoritesView selected={backgroundUrl} onSelect={setBackgroundUrl} />
        ) : activeTab === 'settings' ? (
          <SettingsView onOpenBackgroundPicker={() => setActiveTab('favorites')} />
        ) : (
          <Playlist
            songs={sortedSongs}
            currentSongId={currentSongId}
            onSelect={(song) => {
              selectSong(song)
              setPlayerExpanded(true)
            }}
            onRemove={removeSong}
            onPlayAll={handlePlayAll}
          />
        )}
      </div>

      {/* Player is always mounted — it holds the YouTube player target,
          which must stay alive whether the full player is expanded or
          collapsed to the mini player. Visibility is controlled with CSS,
          not conditional rendering, so audio/video never gets torn down. */}
      <div className={playerExpanded ? 'player-overlay' : 'player-overlay collapsed'}>
        <Player
          currentSong={currentSong}
          isPlaying={engine.isPlaying}
          currentTime={engine.currentTime}
          duration={engine.duration}
          volume={volume}
          canGoPrev={isShuffled ? shuffleHistory.length > 0 : currentIndex > 0}
          canGoNext={sortedSongs.length > 0}
          onTogglePlay={togglePlay}
          onPrev={handlePrev}
          onNext={handleNext}
          onSeek={engine.seek}
          onVolumeChange={setVolume}
          onClose={() => setPlayerExpanded(false)}
          isFavorite={currentSong ? favoriteSongIds.includes(currentSong.id) : false}
          onToggleFavorite={() => currentSong && toggleFavorite(currentSong.id)}
          onSleepTimerEnd={() => engine.pause()}
          playlists={playlists}
          onToggleSongInPlaylist={handleToggleSongInPlaylist}
          isShuffled={isShuffled}
          onToggleShuffle={toggleShuffle}
          isRepeatOne={isRepeatOne}
          onToggleRepeatOne={toggleRepeatOne}
        />
      </div>

      <MiniPlayer
        currentSong={currentSong}
        isPlaying={engine.isPlaying}
        canGoNext={sortedSongs.length > 0}
        onTogglePlay={togglePlay}
        onNext={handleNext}
        onExpand={() => setPlayerExpanded(true)}
      />

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {toastMessage && <div className="app-toast">{toastMessage}</div>}
    </main>
  )
}

export default App