import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

export function useYouTubePlayer(elementId: string, onEnded?: () => void, onError?: () => void) {
  const playerRef = useRef<any>(null)
  const [playerReady, setPlayerReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(100)

  // onStateChange/onError are registered once when the player is created,
  // so they'd otherwise capture stale callbacks from that first render. Keep
  // the latest callbacks in refs so the handlers always call the current one.
  const onEndedRef = useRef(onEnded)
  useEffect(() => {
    onEndedRef.current = onEnded
  }, [onEnded])

  const onErrorRef = useRef(onError)
  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  useEffect(() => {
    const initPlayer = () => {
      playerRef.current = new window.YT.Player(elementId, {
        height: '100%',
        width: '100%',
        videoId: '',
        playerVars: {
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onReady: (e: any) => {
            setPlayerReady(true)
            e.target.setVolume(volume)
          },
          onStateChange: (e: any) => {
            setIsPlaying(e.data === window.YT.PlayerState.PLAYING)
            if (e.data === window.YT.PlayerState.ENDED) {
              onEndedRef.current?.()
            }
          },
          onError: () => {
            onErrorRef.current?.()
          },
        },
      })
    }

    if (window.YT && window.YT.Player) {
      initPlayer()
      return
    }

    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.body.appendChild(tag)
    window.onYouTubeIframeAPIReady = initPlayer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // keep progress in sync with actual playback
  useEffect(() => {
    if (!playerReady) return

    const id = setInterval(() => {
      const player = playerRef.current
      if (!player || typeof player.getCurrentTime !== 'function') return
      setCurrentTime(player.getCurrentTime())
      setDuration(player.getDuration())
    }, 500)

    return () => clearInterval(id)
  }, [playerReady])

  const load = (videoId: string) => {
    setCurrentTime(0)
    setDuration(0)
    if (playerReady) {
      playerRef.current.loadVideoById(videoId)
    }
  }

  const play = () => playerRef.current?.playVideo()
  const pause = () => playerRef.current?.pauseVideo()
  const stop = () => playerRef.current?.stopVideo?.()

  const seek = (seconds: number) => {
    setCurrentTime(seconds)
    playerRef.current?.seekTo(seconds, true)
  }

  const setVolume = (value: number) => {
    setVolumeState(value)
    playerRef.current?.setVolume(value)
  }

  return {
    playerReady,
    isPlaying,
    currentTime,
    duration,
    volume,
    load,
    play,
    pause,
    stop,
    seek,
    setVolume,
  }
}