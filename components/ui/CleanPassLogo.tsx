import Image from 'next/image'

// PNG original: 1086×263 → aspect ratio ≈ 4.13
const LOGO_ASPECT = 1086 / 263

interface Props {
  size?: number
  variant?: 'light' | 'dark'
  showWordmark?: boolean
  showTagline?: boolean
}

export default function CleanPassLogo({
  size = 44,
  variant = 'light',
  showTagline = false,
}: Props) {
  const src = variant === 'dark'
    ? '/logo-cleanpass-negativo.png'
    : '/logo-cleanpass-normal.png'

  const h = size
  const w = Math.round(size * LOGO_ASPECT)

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <Image
        src={src}
        alt="CleanPass logo"
        width={w}
        height={h}
        style={{ display: 'block', width: w, height: h }}
        priority
      />
      {showTagline && (
        <p style={{
          fontSize: 11,
          color: '#7A9A84',
          letterSpacing: '0.15em',
          margin: '4px 0 0 2px',
          fontFamily: 'sans-serif',
          whiteSpace: 'nowrap',
        }}>
          LIMPEZA E CUIDADO PARA USINAS SOLARES
        </p>
      )}
    </div>
  )
}
