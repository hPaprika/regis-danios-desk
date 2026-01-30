import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Interface para los registros de Siberia
interface SiberiaRecord {
  id: string;
  codigo: string;
  vuelo: string;
  fecha_hora: string;
  imagen_url: string;
  firma: boolean;
  observacion: string;
  turno: string;
  created_at: string;
  updated_at: string;
}

/**
 * Genera el nombre del archivo de reporte con el formato REP_CUS_MALETAS_YYYYMMDD
 * @param date - Fecha para el nombre del archivo (por defecto: fecha actual)
 * @returns Nombre del archivo sin extensión
 */
export const getReportFileName = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `REP_CUS_MALETAS_${year}${month}${day}`;
};

/**
 * Genera y descarga un archivo CSV con los datos del reporte
 * @param records - Registros de maletas dañadas
 * @param fileName - Nombre del archivo (sin extensión)
 */
export const generateCSV = (records: SiberiaRecord[], fileName?: string): void => {
  try {
    // Encabezados del CSV
    const headers = ['codigo', 'vuelo', 'observacion', 'turno', 'prioridad'];

    // Convertir registros a filas CSV
    const rows = records.map(record => {
      // Prioridad: ALTA si no tiene firma, MEDIA si tiene firma
      const prioridad = record.firma ? 'MEDIA' : 'ALTA';

      // Validar y limpiar campos
      const codigo = record.codigo || '';
      const vuelo = record.vuelo || '';
      const observacion = record.observacion || '';
      const turno = record.turno || '';

      return [
        codigo,
        vuelo,
        `"${observacion.replace(/"/g, '""')}"`, // Escapar comillas en observación
        turno,
        prioridad
      ];
    });

    // Construir contenido CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Crear blob y descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName || getReportFileName()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Liberar el objeto URL
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al generar CSV:', error);
    throw error;
  }
};

/**
 * Genera y descarga un archivo PDF con el reporte
 * @param htmlElement - Elemento HTML del reporte a convertir
 * @param records - Registros de maletas dañadas
 * @param reportDate - Fecha del reporte
 * @param fileName - Nombre del archivo (sin extensión)
 */
export const generatePDF = (
  _htmlElement: HTMLElement,
  records: SiberiaRecord[],
  reportDate: string,
  fileName?: string
): void => {
  const doc = new jsPDF('p', 'mm', 'a4');

  // Configuración de colores (usando type assertions para compatibilidad con jsPDF)
  const colors = {
    primary: [198, 40, 40] as [number, number, number],
    primaryBg: [253, 236, 234] as [number, number, number],
    gray: [85, 85, 85] as [number, number, number],
    grayLight: [245, 245, 245] as [number, number, number],
    border: [221, 221, 221] as [number, number, number],
    black: [34, 34, 34] as [number, number, number]
  };

  // Título
  doc.setFontSize(18);
  doc.setTextColor(...colors.black);
  doc.text('REPORTE DIARIO DE MALETAS DAÑADAS', 14, 20);

  // Metadata
  doc.setFontSize(10);
  doc.setTextColor(...colors.gray);
  const formattedDate = new Date(reportDate).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.text(`Fecha del reporte: ${formattedDate}`, 14, 28);
  doc.text('Periodo evaluado: (00:00 – 23:59)', 14, 33);

  // Resumen
  const criticalCount = records.filter(r => !r.firma).length;
  doc.setFontSize(9);
  doc.text(`Total de maletas registradas: ${records.length}`, 14, 41);
  doc.setTextColor(...colors.primary);
  doc.text(`Casos críticos (SIN FIRMA | LR): ${criticalCount}`, 14, 46);

  // Separar registros críticos y normales
  const criticalRecords = records.filter(r => !r.firma);
  const normalRecords = records.filter(r => r.firma);

  let yPosition = 55;

  // Sección de registros críticos
  if (criticalRecords.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(...colors.primary);
    doc.text('⚠️ MALETAS REGISTRADAS SIN FIRMA', 14, yPosition);
    yPosition += 5;

    autoTable(doc, {
      startY: yPosition,
      head: [['Código', 'Vuelo', 'Observación', 'Turno']],
      body: criticalRecords.map(r => [
        r.codigo,
        r.vuelo,
        r.observacion,
        r.turno
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: colors.grayLight,
        textColor: colors.black,
        fontSize: 9,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fillColor: colors.primaryBg,
        textColor: colors.black,
        fontSize: 8
      },
      alternateRowStyles: {
        fillColor: colors.primaryBg
      },
      margin: { left: 14, right: 14 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Sección de registros normales
  if (normalRecords.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(...colors.black);
    doc.text('MALETAS REGISTRADAS CON FIRMA', 14, yPosition);
    yPosition += 5;

    autoTable(doc, {
      startY: yPosition,
      head: [['Código', 'Vuelo', 'Observación', 'Turno']],
      body: normalRecords.map(r => [
        r.codigo,
        r.vuelo,
        r.observacion,
        r.turno
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: colors.grayLight,
        textColor: colors.black,
        fontSize: 9,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 8
      },
      margin: { left: 14, right: 14 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(...colors.gray);
  doc.text('Reporte generado por la estación Cusco', 14, pageHeight - 15);
  const generationDate = new Date().toLocaleDateString('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  doc.text(`Fecha y hora de generación: ${generationDate}`, 14, pageHeight - 10);

  // Descargar PDF
  doc.save(`${fileName || getReportFileName()}.pdf`);
};
