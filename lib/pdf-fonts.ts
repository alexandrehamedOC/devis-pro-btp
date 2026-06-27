import path from 'node:path'
import { Font } from '@react-pdf/renderer'

let registered = false

export function registerPdfFonts() {
  if (registered) return
  registered = true

  const fontsDir = path.join(process.cwd(), 'public', 'fonts')

  Font.register({
    family: 'Fraunces',
    fonts: [
      { src: path.join(fontsDir, 'Fraunces-Regular.ttf'), fontWeight: 400 },
      { src: path.join(fontsDir, 'Fraunces-SemiBold.ttf'), fontWeight: 600 },
      { src: path.join(fontsDir, 'Fraunces-Bold.ttf'), fontWeight: 700 },
      { src: path.join(fontsDir, 'Fraunces-Italic.ttf'), fontWeight: 400, fontStyle: 'italic' },
    ],
  })

  Font.register({
    family: 'Inter',
    fonts: [
      { src: path.join(fontsDir, 'Inter-Regular.ttf'), fontWeight: 400 },
      { src: path.join(fontsDir, 'Inter-Medium.ttf'), fontWeight: 500 },
      { src: path.join(fontsDir, 'Inter-SemiBold.ttf'), fontWeight: 600 },
    ],
  })

  Font.register({
    family: 'JetBrains Mono',
    fonts: [{ src: path.join(fontsDir, 'JetBrainsMono-Regular.ttf'), fontWeight: 400 }],
  })
}
