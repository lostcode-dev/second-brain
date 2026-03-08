/**
 * Generate PWA icons from an SVG source.
 * Usage: node scripts/generate-icons.mjs
 *
 * Requires: sharp (will be installed temporarily if needed)
 * Generates all required icon sizes into public/icons/
 */

import { execSync } from 'child_process'

// Check if sharp is available, install temporarily if not
try {
  await import('sharp')
} catch {
  console.log('Installing sharp temporarily...')
  execSync('pnpm add -D sharp', { stdio: 'inherit' })
}

const sharp = (await import('sharp')).default

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
const maskableSizes = [192, 512]

// SVG source — Second Brain "brain" icon with green color
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="96" fill="#020618"/>
  <g transform="translate(56, 56) scale(0.78)">
    <path d="M256 48C176.6 48 112 112.6 112 192c0 45.3 21 85.7 53.8 112H152c-13.3 0-24 10.7-24 24s10.7 24 24 24h48v48c0 13.3 10.7 24 24 24s24-10.7 24-24v-72h16v72c0 13.3 10.7 24 24 24s24-10.7 24-24v-48h48c13.3 0 24-10.7 24-24s-10.7-24-24-24h-13.8C378 277.7 400 237.3 400 192 400 112.6 335.4 48 256 48z" fill="#00DC82"/>
    <circle cx="200" cy="180" r="20" fill="#020618"/>
    <circle cx="312" cy="180" r="20" fill="#020618"/>
    <path d="M200 240c0 0 20 32 56 32s56-32 56-32" stroke="#020618" stroke-width="12" stroke-linecap="round" fill="none"/>
  </g>
</svg>`

const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" fill="#020618"/>
  <g transform="translate(96, 96) scale(0.625)">
    <path d="M256 48C176.6 48 112 112.6 112 192c0 45.3 21 85.7 53.8 112H152c-13.3 0-24 10.7-24 24s10.7 24 24 24h48v48c0 13.3 10.7 24 24 24s24-10.7 24-24v-72h16v72c0 13.3 10.7 24 24 24s24-10.7 24-24v-48h48c13.3 0 24-10.7 24-24s-10.7-24-24-24h-13.8C378 277.7 400 237.3 400 192 400 112.6 335.4 48 256 48z" fill="#00DC82"/>
    <circle cx="200" cy="180" r="20" fill="#020618"/>
    <circle cx="312" cy="180" r="20" fill="#020618"/>
    <path d="M200 240c0 0 20 32 56 32s56-32 56-32" stroke="#020618" stroke-width="12" stroke-linecap="round" fill="none"/>
  </g>
</svg>`

const outDir = new URL('../public/icons/', import.meta.url).pathname

for (const size of sizes) {
  const filename = `icon-${size}x${size}.png`
  await sharp(Buffer.from(svgIcon))
    .resize(size, size)
    .png()
    .toFile(`${outDir}${filename}`)
  console.log(`✓ ${filename}`)
}

for (const size of maskableSizes) {
  const filename = `icon-maskable-${size}x${size}.png`
  await sharp(Buffer.from(maskableSvg))
    .resize(size, size)
    .png()
    .toFile(`${outDir}${filename}`)
  console.log(`✓ ${filename}`)
}

// Generate apple-touch-icon (180x180)
await sharp(Buffer.from(svgIcon))
  .resize(180, 180)
  .png()
  .toFile(`${outDir}apple-touch-icon.png`)
console.log('✓ apple-touch-icon.png')

console.log('\nAll icons generated successfully!')
