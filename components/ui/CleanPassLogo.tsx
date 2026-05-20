import Image from 'next/image'

interface Props {
  size?: number
  variant?: 'light' | 'dark'
  showWordmark?: boolean
  showTagline?: boolean
}

export default function CleanPassLogo({
  size = 40,
  variant = 'light',
  showTagline = false,
}: Props) {
  const src = variant === 'dark'
    ? '/logo-cleanpass-negativo.png'
    : '/logo-cleanpass-normal.png'

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <Image
        src={src}
        alt="CleanPass logo"
        width={size}
        height={size}
        style={{ display: 'block' }}
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
