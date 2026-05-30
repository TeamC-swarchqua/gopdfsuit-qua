import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../../../..')

export const SAMPLE = {
  acroformPdf: path.join(
    REPO_ROOT,
    'sampledata/filler/us_hospital_encounter_acroform.pdf',
  ),test-validacion-filler: test-validation-filler
  xfdf: path.join(
    REPO_ROOT,
    'sampledata/filler/us_hospital_encounter_data.xfdf',
  ),
  coverTemplate: path.join(
    REPO_ROOT,
    'sampledata/editor/financial_report.json',
  ),
}

export const PDF_BASENAMES = {
  acroform: 'us_hospital_encounter_acroform.pdf',
  coverTemplate: 'financial_report.json',
}
