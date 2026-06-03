import sharp from 'sharp'
import { mkdir } from 'fs/promises'

await mkdir('public/icons', { recursive: true })

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <!-- fundo arredondado vermelho -->
  <rect width="512" height="512" rx="110" fill="#e74c3c"/>

  <!-- círculo de fundo suave -->
  <circle cx="256" cy="275" r="155" fill="rgba(255,255,255,0.10)"/>

  <!-- folha -->
  <ellipse cx="256" cy="112" rx="18" ry="38" fill="#27ae60" transform="rotate(-20 256 112)"/>
  <ellipse cx="256" cy="112" rx="18" ry="38" fill="#2ecc71" transform="rotate(20 256 112)"/>

  <!-- tomate -->
  <circle cx="256" cy="290" r="130" fill="rgba(255,255,255,0.92)"/>
  <circle cx="256" cy="290" r="130" fill="#c0392b" opacity="0.08"/>

  <!-- letra F centralizada -->
  <text
    x="256" y="355"
    text-anchor="middle"
    font-size="210"
    font-weight="700"
    font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fill="#e74c3c"
  >F</text>
</svg>
`

const sizes = [192, 512]

for (const size of sizes) {
  const file = `public/icons/icon-${size}.png`
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(file)
  console.log(`✓ ${file}`)
}

console.log('\nÍcones PWA gerados com sucesso.')
