import supabase from './supabase/client'
import { generateEmailTemplate, generatePlainTextEmail } from './email-template'

interface SendEmailParams {
  to: string
  subject: string
  stats: {
    total: number
    counter: number
    siberia: number
    signed: number
    signatureRate: number
    topAirline: { name: string; count: number } | null
    topCategory: { code: string; label: string; count: number } | null
    dominantShift: string
    shiftCounts: Record<string, number>
  }
  byAirline: Array<{ name: string; value: number }>
  byCategory: Array<{ name: string; value: number }>
  topFlights: Array<{ flight: string; damages: number; airline?: string }>
  periodLabel: string
  generatedDate: string
}

export async function sendReportEmail(params: SendEmailParams): Promise<void> {
  const { to, subject, ...emailData } = params

  // Generar el HTML y texto plano
  const htmlContent = generateEmailTemplate(emailData)
  const textContent = generatePlainTextEmail(emailData)

  // Llamar a la edge function de Supabase
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: {
      to,
      subject,
      html: htmlContent,
      text: textContent,
    },
  })

  if (error) {
    console.error('Error al enviar email:', error)
    throw new Error(`Error al enviar el correo: ${error.message}`)
  }

  return data
}
