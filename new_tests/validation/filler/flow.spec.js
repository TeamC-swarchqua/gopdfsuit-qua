import { readFileSync } from 'fs'
import { test, expect } from '@playwright/test'
import { seedAuth } from './helpers/auth.js'
import { SAMPLE, PDF_BASENAMES } from './helpers/fixtures.js'
import { dropPdfFiles } from './helpers/dragDrop.js'
import { gotoTool, clickNavLink } from './helpers/navigation.js'

test.describe('Flujo validación RF', () => {
  test.beforeEach(async ({ page }) => {
    page.on('dialog', async (dialog) => {
      await dialog.dismiss()
    })
    await seedAuth(page)
  })

  test('comprobar → rellenar → portada → fusionar → validar', async ({
    page,
  }, testInfo) => {
    const filledPath = testInfo.outputPath('filled.pdf')
    const coverPath = testInfo.outputPath('cover.pdf')
    const mergedPath = testInfo.outputPath('merged.pdf')
    const templateJson = readFileSync(SAMPLE.coverTemplate, 'utf-8')
    let initialPages

    await test.step('FR-FILLER-01 — Interfaz web única con acceso a todas las herramientas', async () => {
      await gotoTool(page, '')
      await expect(page.getByRole('link', { name: /^Redact$/i }).first()).toBeVisible()
      await expect(page.getByRole('link', { name: /^Filler$/i }).first()).toBeVisible()
      await expect(page.getByRole('link', { name: /^Viewer$/i }).first()).toBeVisible()
      await expect(page.getByRole('link', { name: /^Merge$/i }).first()).toBeVisible()
    })

    await test.step('FR-FILLER-03 — Rechaza PDF vacío y archivo que no es PDF', async () => {
      await clickNavLink(page, 'Redact')
      await expect(page.getByRole('heading', { name: /PDF Redaction/i })).toBeVisible()

      await page.locator('#pdf-upload').setInputFiles({
        name: 'empty.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.alloc(0),
      })
      await expect(page.getByText(/Selected PDF is empty/i)).toBeVisible()
      await expect(page.locator('text=/Page \\d+ of \\d+/')).toHaveCount(0)

      await gotoTool(page, 'redact')
      await page.locator('#pdf-upload').setInputFiles({
        name: 'notes.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('esto no es un pdf'),
      })
      await expect(page.getByText(/Please select a valid PDF file/i)).toBeVisible()
      await expect(page.locator('text=/Page \\d+ of \\d+/')).toHaveCount(0)
    })

    await test.step('FR-FILLER-02 — Página Redact: subir PDF original válido', async () => {
      await gotoTool(page, 'redact')
      await expect(page.getByRole('heading', { name: /PDF Redaction/i })).toBeVisible()
      await page.locator('#pdf-upload').setInputFiles(SAMPLE.acroformPdf)
    })

    await test.step('FR-FILLER-04 — Vista previa y número total de páginas', async () => {
      const pageCountText = page.locator('text=/Page \\d+ of \\d+/')
      await expect(pageCountText).toBeVisible({ timeout: 30_000 })
      const initialPageLabel = await pageCountText.textContent()
      const initialMatch = initialPageLabel?.match(/Page \d+ of (\d+)/)
      expect(initialMatch).toBeTruthy()
      initialPages = Number(initialMatch[1])
      expect(initialPages).toBeGreaterThanOrEqual(1)
      await expect(page.locator('canvas').first()).toBeVisible({ timeout: 30_000 })
    })

    await test.step('FR-FILLER-05 — Navegar a Filler tras PDF válido', async () => {
      await clickNavLink(page, 'Filler')
      await expect(
        page.getByRole('heading', { name: /PDF Form Filler/i }),
      ).toBeVisible()
    })

    await test.step('FR-FILLER-06 — Subir PDF AcroForm y XFDF por separado', async () => {
      const pdfInput = page.locator('input[accept=".pdf"]')
      const xfdfInput = page.locator('input[accept=".xfdf,.xml"]')
      await pdfInput.setInputFiles(SAMPLE.acroformPdf)
      await xfdfInput.setInputFiles(SAMPLE.xfdf)
    })

    await test.step('FR-FILLER-07 — Mostrar nombre y tamaño en cada caja de subida', async () => {
      await expect(page.getByText(PDF_BASENAMES.acroform)).toBeVisible()
      await expect(page.getByText(/us_hospital_encounter_data\.xfdf/i)).toBeVisible()
      await expect(page.getByText(/KB|Bytes/i).first()).toBeVisible()
      await expect(page.getByRole('button', { name: /Fill PDF Form/i })).toBeEnabled()
    })

    await test.step('FR-FILLER-08 — Indicador de carga, descarga y previsualización', async () => {
      const fillBtn = page.getByRole('button', { name: /Fill PDF Form/i })
      const fillResponse = page.waitForResponse(
        (res) => res.url().includes('/api/v1/fill') && res.ok(),
      )
      const filledDownloadPromise = page.waitForEvent('download')
      await fillBtn.click()
      await expect(fillBtn.locator('.spin')).toBeVisible()
      await fillResponse
      const filledDownload = await filledDownloadPromise
      expect(filledDownload.suggestedFilename()).toMatch(
        /^filled-us_hospital_encounter_acroform\.pdf$/,
      )
      await filledDownload.saveAs(filledPath)
      await expect(page.getByTitle('Filled PDF')).toBeVisible({ timeout: 30_000 })
    })

    await test.step('FR-FILLER-09 — Download Filled PDF sin repetir el proceso', async () => {
      const redownloadBtn = page.getByRole('button', { name: /Download Filled PDF/i })
      await expect(redownloadBtn).toBeVisible()
      const [redownload] = await Promise.all([
        page.waitForEvent('download'),
        redownloadBtn.click(),
      ])
      expect(redownload.suggestedFilename()).toMatch(
        /^filled-us_hospital_encounter_acroform\.pdf$/,
      )
    })

    await test.step('FR-FILLER-10 — Navegar a Viewer para generar portada', async () => {
      await clickNavLink(page, 'Viewer')
      await expect(page.getByRole('heading', { name: /PDF Viewer/i })).toBeVisible()
    })

    await test.step('FR-FILLER-12 — Generate PDF deshabilitado con plantilla vacía', async () => {
      await expect(page.getByRole('button', { name: /Generate PDF/i })).toBeDisabled()
    })

    await test.step('FR-FILLER-11 — Cargar plantilla: textarea, botón ejemplo y upload .json', async () => {
      const generateBtn = page.getByRole('button', { name: /Generate PDF/i })
      const templateTextarea = page.getByPlaceholder(
        /Enter or paste your JSON template here/i,
      )
      const jsonInput = page.locator('input[accept=".json"]')

      await expect(
        page.getByRole('button', { name: 'temp_multiplepage.json' }),
      ).toBeVisible()
      await expect(page.getByRole('button', { name: 'temp.json' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'temp_og.json' })).toBeVisible()

      await templateTextarea.fill(templateJson)
      await expect(generateBtn).toBeEnabled()
      await templateTextarea.fill('')
      await expect(generateBtn).toBeDisabled()

      await page.getByRole('button', { name: 'temp_multiplepage.json' }).click()
      await expect(page.getByPlaceholder(/Enter filename/i)).toHaveValue(
        'temp_multiplepage.json',
        { timeout: 15_000 },
      )

      await gotoTool(page, 'viewer')
      await expect(generateBtn).toBeDisabled()
      await jsonInput.setInputFiles(SAMPLE.coverTemplate)
      await expect(page.getByPlaceholder(/Enter filename/i)).toHaveValue(
        PDF_BASENAMES.coverTemplate,
      )
      await expect(generateBtn).toBeEnabled()
    })

    await test.step('FR-FILLER-13 — Spinner, preview y Download PDF', async () => {
      const generateBtn = page.getByRole('button', { name: /Generate PDF/i })
      const generateResponse = page.waitForResponse(
        (res) =>
          res.url().includes('/api/v1/generate/template-pdf') && res.ok(),
      )
      await generateBtn.click()
      await expect(generateBtn.locator('.spin')).toBeVisible()
      await generateResponse
      await expect(page.getByTitle('PDF Preview')).toBeVisible({ timeout: 60_000 })
      await expect(page.getByText(/Preview Ready/i)).toBeVisible()

      const [coverDownload] = await Promise.all([
        page.waitForEvent('download'),
        page.getByRole('button', { name: /Download PDF/i }).first().click(),
      ])
      expect(coverDownload.suggestedFilename()).toMatch(/^template-pdf-\d+\.pdf$/)
      await coverDownload.saveAs(coverPath)
    })

    await test.step('FR-FILLER-14 — Navegar a Merge', async () => {
      await clickNavLink(page, 'Merge')
      await expect(page.getByRole('heading', { name: /PDF Merge Tool/i })).toBeVisible()
    })

    await test.step('FR-FILLER-15 — Añadir PDFs con selector y drag & drop', async () => {
      await page.locator('input[accept=".pdf"]').setInputFiles(coverPath)
      await expect(page.getByText('cover.pdf')).toBeVisible()
    })

    await test.step('FR-FILLER-16 — Merge PDFs deshabilitado con un solo archivo', async () => {
      const mergeBtn = page.getByRole('button', { name: /Merge PDFs/i })
      await expect(mergeBtn).toBeDisabled()
      await dropPdfFiles(page, page.getByText(/Click to upload or drag & drop/i), [
        filledPath,
      ])
      await expect(page.getByText('filled.pdf')).toBeVisible()
      await expect(mergeBtn).toBeEnabled()
    })

    await test.step('FR-FILLER-17 — Reordenar con ↑/↓', async () => {
      const fileRows = page
        .getByRole('heading', { name: /Selected Files/i })
        .locator('+ div > div')
      await expect(fileRows.nth(0)).toContainText('cover.pdf')
      await expect(fileRows.nth(1)).toContainText('filled.pdf')

      await page.getByRole('button', { name: '↓' }).first().click()
      await expect(fileRows.nth(0)).toContainText('filled.pdf')
      await expect(fileRows.nth(1)).toContainText('cover.pdf')

      await page.getByRole('button', { name: '↑' }).nth(1).click()
      await expect(fileRows.nth(0)).toContainText('cover.pdf')
      await expect(fileRows.nth(1)).toContainText('filled.pdf')
    })

    await test.step('FR-FILLER-18 — Indicador de carga, descarga y Download Merged PDF', async () => {
      const mergeBtn = page.getByRole('button', { name: /Merge PDFs/i })
      const mergeResponse = page.waitForResponse(
        (res) => res.url().includes('/api/v1/merge') && res.ok(),
      )
      const mergedDownloadPromise = page.waitForEvent('download')
      await mergeBtn.click()
      await expect(mergeBtn.locator('.spin')).toBeVisible()
      await mergeResponse
      const mergedDownload = await mergedDownloadPromise
      expect(mergedDownload.suggestedFilename()).toMatch(/^merged-pdf-\d+\.pdf$/)
      await mergedDownload.saveAs(mergedPath)

      await expect(page.getByTitle('Merged PDF')).toBeVisible({ timeout: 30_000 })

      const downloadMergedBtn = page.getByRole('button', {
        name: /Download Merged PDF/i,
      })
      await expect(downloadMergedBtn).toBeVisible()
      const [mergedRedownload] = await Promise.all([
        page.waitForEvent('download'),
        downloadMergedBtn.click(),
      ])
      expect(mergedRedownload.suggestedFilename()).toMatch(/^merged-pdf-\d+\.pdf$/)
    })

    await test.step('FR-FILLER-19 — Validar paquete final en Redact', async () => {
      await clickNavLink(page, 'Redact')
      await page.locator('#pdf-upload').setInputFiles(mergedPath)

      const mergedPageLabel = page.locator('text=/Page \\d+ of \\d+/')
      await expect(mergedPageLabel).toBeVisible({ timeout: 30_000 })
      const mergedText = await mergedPageLabel.textContent()
      const mergedMatch = mergedText?.match(/Page \d+ of (\d+)/)
      expect(mergedMatch).toBeTruthy()
      const mergedPages = Number(mergedMatch[1])
      expect(mergedPages).toBeGreaterThan(initialPages)
      await expect(page.locator('canvas').first()).toBeVisible({ timeout: 30_000 })
    })
  })
})
