import { readFileSync } from 'fs'
import path from 'path'

/** Simula drag & drop de uno o más PDFs sobre una zona de la UI. */
export async function dropPdfFiles(page, dropZone, filePaths) {
  const files = filePaths.map((filePath) => ({
    name: path.basename(filePath),
    buffer: [...readFileSync(filePath)],
  }))

  await dropZone.dispatchEvent('drop', {
    dataTransfer: await page.evaluateHandle((payload) => {
      const dt = new DataTransfer()
      for (const file of payload) {
        dt.items.add(
          new File([new Uint8Array(file.buffer)], file.name, {
            type: 'application/pdf',
          }),
        )
      }
      return dt
    }, files),
  })
}
