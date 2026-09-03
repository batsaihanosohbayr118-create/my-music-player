import { useState } from 'react'

type Props = {
  volume: number
  onVolumeChange: (value: number) => void
}

function VolumeIcon({ volume }: { volume: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 9v6h4l5 5V4L8 9H4z" fill="currentColor" stroke="none" />
      {volume === 0 ? (
        <path d="M16 9l5 6M21 9l-5 6" />
      ) : (
        <>
          <path d="M15.3 8.5a5 5 0 0 1 0 7" opacity={volume > 0 ? 1 : 0.25} />
          <path d="M18 6a8.5 8.5 0 0 1 0 12" opacity={volume > 50 ? 1 : 0.25} />
        </>
      )}
    </svg>
  )
}

export default function VolumeControl({ volume, onVolumeChange }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="volume">
      <button
        className="volume-toggle"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Volume"
      >
        <VolumeIcon volume={volume} />
      </button>

      {open && (
        <div className="volume-popover">
          <input
            type="range"
            className="progress-bar volume-slider"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            style={{ ['--progress' as string]: `${volume}%` }}
          />
        </div>
      )}
    </div>
  )
}