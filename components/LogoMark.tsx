interface Props {
  size?: number
}

export default function LogoMark({ size = 72 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Focus Pomodoro"
    >
      {/* fundo arredondado */}
      <rect width="80" height="80" rx="18" fill="#e74c3c" />

      {/* corpo do tomate */}
      <circle cx="40" cy="48" r="21" fill="rgba(255,255,255,0.93)" />

      {/* folhas */}
      <ellipse cx="36" cy="22" rx="4.5" ry="11" fill="#27ae60" transform="rotate(-18 36 22)" />
      <ellipse cx="44" cy="22" rx="4.5" ry="11" fill="#2ecc71" transform="rotate(18 44 22)" />

      {/* letra F */}
      <text
        x="40"
        y="59"
        textAnchor="middle"
        fontSize="30"
        fontWeight="700"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fill="#e74c3c"
      >
        F
      </text>
    </svg>
  )
}
