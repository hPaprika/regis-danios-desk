interface EmailStats {
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

interface EmailTemplateData {
  stats: EmailStats
  byAirline: Array<{ name: string; value: number }>
  byCategory: Array<{ name: string; value: number }>
  topFlights: Array<{ flight: string; damages: number; airline?: string }>
  periodLabel: string
  generatedDate: string
}

export function generateEmailTemplate(data: EmailTemplateData): string {
  const { stats, byAirline, byCategory, topFlights, periodLabel, generatedDate } = data

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte de Daños - ${periodLabel}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
      color: #333333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 30px 20px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .header p {
      margin: 10px 0 0 0;
      font-size: 16px;
      opacity: 0.95;
    }
    .content {
      padding: 30px 20px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #667eea;
    }
    .stats-grid {
      display: table;
      width: 100%;
      border-collapse: collapse;
    }
    .stat-row {
      display: table-row;
    }
    .stat-cell {
      display: table-cell;
      padding: 15px;
      border: 1px solid #e5e7eb;
      background-color: #f9fafb;
      width: 50%;
    }
    .stat-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 3px;
    }
    .stat-subtitle {
      font-size: 14px;
      color: #6b7280;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    .table th {
      background-color: #667eea;
      color: #ffffff;
      padding: 12px;
      text-align: left;
      font-size: 14px;
      font-weight: 600;
    }
    .table td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 14px;
    }
    .table tr:nth-child(even) {
      background-color: #f9fafb;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-success {
      background-color: #d1fae5;
      color: #065f46;
    }
    .badge-warning {
      background-color: #fef3c7;
      color: #92400e;
    }
    .footer {
      background-color: #f9fafb;
      padding: 20px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 5px 0;
      font-size: 12px;
      color: #6b7280;
    }
    .highlight-box {
      background-color: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
    }
    .highlight-box p {
      margin: 0;
      color: #1e40af;
      font-size: 14px;
    }
    @media only screen and (max-width: 600px) {
      .stat-cell {
        display: block;
        width: 100% !important;
      }
      .table {
        font-size: 12px;
      }
      .table th, .table td {
        padding: 8px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>📊 Reporte de Daños</h1>
      <p>${periodLabel}</p>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Summary Section -->
      <div class="section">
        <h2 class="section-title">Resumen Ejecutivo</h2>
        <div class="stats-grid">
          <div class="stat-row">
            <div class="stat-cell">
              <div class="stat-label">Total de Daños</div>
              <div class="stat-value">${stats.total}</div>
              <div class="stat-subtitle">Registros totales</div>
            </div>
            <div class="stat-cell">
              <div class="stat-label">Tasa de Firmas</div>
              <div class="stat-value">${stats.signatureRate}%</div>
              <div class="stat-subtitle">${stats.signed}/${stats.total} firmados</div>
            </div>
          </div>
          <div class="stat-row">
            <div class="stat-cell">
              <div class="stat-label">Casos Severos</div>
              <div class="stat-value">${stats.siberia}</div>
              <div class="stat-subtitle">Con fotografía</div>
            </div>
            <div class="stat-cell">
              <div class="stat-label">Turno Dominante</div>
              <div class="stat-value">${stats.dominantShift}</div>
              <div class="stat-subtitle">${stats.shiftCounts[stats.dominantShift]} registros</div>
            </div>
          </div>
        </div>

        ${stats.signatureRate >= 80
      ? '<div class="highlight-box"><p>✅ <strong>Objetivo cumplido:</strong> La tasa de firmas supera el 80%</p></div>'
      : '<div class="highlight-box" style="background-color: #fef3c7; border-left-color: #f59e0b;"><p>⚠️ <strong>Atención:</strong> La tasa de firmas está por debajo del objetivo (80%)</p></div>'
    }
      </div>

      <!-- Top Airline & Category -->
      <div class="section">
        <h2 class="section-title">Indicadores Principales</h2>
        ${stats.topAirline ? `
        <p><strong>🛫 Aerolínea con más daños:</strong> ${stats.topAirline.name} 
          <span class="badge badge-warning">${stats.topAirline.count} casos</span>
        </p>
        ` : ''}
        ${stats.topCategory ? `
        <p><strong>⚠️ Tipo de daño más frecuente:</strong> ${stats.topCategory.label}
          <span class="badge badge-warning">${stats.topCategory.count} casos</span>
        </p>
        ` : ''}
      </div>

      <!-- By Airline Table -->
      <div class="section">
        <h2 class="section-title">Daños por Aerolínea</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Aerolínea</th>
              <th style="text-align: right;">Cantidad</th>
              <th style="text-align: right;">Porcentaje</th>
            </tr>
          </thead>
          <tbody>
            ${byAirline.map(airline => `
              <tr>
                <td><strong>${airline.name}</strong></td>
                <td style="text-align: right;">${airline.value}</td>
                <td style="text-align: right;">${((airline.value / stats.total) * 100).toFixed(1)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- By Category Table -->
      <div class="section">
        <h2 class="section-title">Daños por Categoría</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Categoría</th>
              <th style="text-align: right;">Cantidad</th>
              <th style="text-align: right;">Porcentaje</th>
            </tr>
          </thead>
          <tbody>
            ${byCategory.map(category => `
              <tr>
                <td>${category.name}</td>
                <td style="text-align: right;">${category.value}</td>
                <td style="text-align: right;">${((category.value / stats.total) * 100).toFixed(1)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Top Flights -->
      ${topFlights.length > 0 ? `
      <div class="section">
        <h2 class="section-title">Vuelos con Más Daños (Top 5)</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Vuelo</th>
              <th style="text-align: right;">Daños</th>
            </tr>
          </thead>
          <tbody>
            ${topFlights.map((flight, index) => `
              <tr>
                <td><strong>${index + 1}. ${flight.flight}</strong></td>
                <td style="text-align: right;">${flight.damages}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>RegisBags</strong> - Sistema de Registro de Maletas Dañadas</p>
      <p>Generado el ${generatedDate}</p>
      <p style="margin-top: 15px; font-size: 11px;">
        Este es un correo automático. Por favor no responder a este mensaje.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

// Función para generar el texto plano alternativo
export function generatePlainTextEmail(data: EmailTemplateData): string {
  const { stats, byAirline, byCategory, topFlights, periodLabel, generatedDate } = data

  return `
REPORTE DE DAÑOS - ${periodLabel}
${'='.repeat(50)}

RESUMEN EJECUTIVO
-----------------
Total de Daños: ${stats.total}
Tasa de Firmas: ${stats.signatureRate}% (${stats.signed}/${stats.total})
Casos Severos: ${stats.siberia}
Turno Dominante: ${stats.dominantShift} (${stats.shiftCounts[stats.dominantShift]} registros)

${stats.topAirline ? `Aerolínea con más daños: ${stats.topAirline.name} (${stats.topAirline.count} casos)\n` : ''}
${stats.topCategory ? `Tipo de daño más frecuente: ${stats.topCategory.label} (${stats.topCategory.count} casos)\n` : ''}

DAÑOS POR AEROLÍNEA
-------------------
${byAirline.map((a: { name: string; value: number }) => `${a.name}: ${a.value} (${((a.value / stats.total) * 100).toFixed(1)}%)`).join('\n')}

DAÑOS POR CATEGORÍA
-------------------
${byCategory.map((c: { name: string; value: number }) => `${c.name}: ${c.value} (${((c.value / stats.total) * 100).toFixed(1)}%)`).join('\n')}

${topFlights.length > 0 ? `
VUELOS CON MÁS DAÑOS (TOP 5)
-----------------------------
${topFlights.map((f: { flight: string; damages: number }, i: number) => `${i + 1}. ${f.flight}: ${f.damages} daños`).join('\n')}
` : ''}

---
RegisBags - Sistema de Registro de Maletas Dañadas
Generado el ${generatedDate}
  `.trim()
}
