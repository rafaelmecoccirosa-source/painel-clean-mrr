import Image from 'next/image'

// ícone: 260×236 | tipo: 769×129
const ICON_ASPECT = 260 / 236
const TYPE_ASPECT = 769 / 129

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
  const iconH = size
  const iconW = Math.round(size * ICON_ASPECT)
  const typeH = Math.round(size * 0.55)
  const typeW = Math.round(typeH * TYPE_ASPECT)

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: Math.round(size * 0.22) }}>
        <Image
          src="/logo-cleanpass-icone.png"
          alt=""
          width={iconW}
          height={iconH}
          style={{ display: 'block', width: iconW, height: iconH }}
          priority
        />
        <Image
          src="/logo-cleanpass-type.png"
          alt="CleanPass"
          width={typeW}
          height={typeH}
          style={{ display: 'block', width: typeW, height: typeH, filter: variant === 'dark' ? 'invert(1)' : 'none' }}
          priority
        />
      </div>
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
