import { forwardRef } from 'react';

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

interface ReportPreviewProps {
  records: SiberiaRecord[];
  reportDate: string;
}

/**
 * Componente de preview del reporte HTML
 * Muestra el reporte con el diseño especificado en las instrucciones usando Tailwind CSS
 */
export const ReportPreview = forwardRef<HTMLDivElement, ReportPreviewProps>(
  ({ records, reportDate }, ref) => {
    // Separar registros críticos (sin firma) y normales (con firma)
    const criticalRecords = records.filter(r => !r.firma);
    const normalRecords = records.filter(r => r.firma);

    // Formatear fecha
    const formattedDate = new Date(reportDate).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const generationDate = new Date().toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    return (
      <div ref={ref} className="max-w-[1100px] mx-auto bg-background p-8 border border-border rounded-lg">
        {/* Encabezado */}
        <div className="border-b-2 border-border mb-6 pb-4">
          <h1 className="text-2xl font-bold tracking-wider m-0">
            REPORTE DIARIO DE MALETAS DAÑADAS
          </h1>

          <div className="mt-2 text-muted-foreground text-sm">
            Fecha del reporte: <strong className="text-foreground">{formattedDate}</strong><br />
            Periodo evaluado: <strong className="text-foreground">(00:00 – 23:59)</strong>
          </div>

          <div className="flex gap-8 mt-4 flex-wrap">
            <div className="bg-muted px-4 py-3 border-l-[5px] border-border text-sm rounded">
              Total de maletas registradas: <strong>{records.length}</strong>
            </div>
            <div className="bg-destructive/10 px-4 py-3 border-l-[5px] border-destructive text-sm rounded text-destructive font-bold">
              Casos críticos (SIN FIRMA | LR): <strong>{criticalRecords.length}</strong>
            </div>
          </div>
        </div>

        {/* Sección de registros críticos */}
        {criticalRecords.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 text-lg font-bold text-destructive">
              ⚠️ MALETAS REGISTRADAS SIN FIRMA
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm mt-3">
                <thead>
                  <tr>
                    <th className="border border-border bg-muted px-2.5 py-2.5 text-left uppercase text-xs tracking-wide font-bold">
                      Código
                    </th>
                    <th className="border border-border bg-muted px-2.5 py-2.5 text-left uppercase text-xs tracking-wide font-bold">
                      Vuelo
                    </th>
                    <th className="border border-border bg-muted px-2.5 py-2.5 text-left uppercase text-xs tracking-wide font-bold">
                      Observación
                    </th>
                    <th className="border border-border bg-muted px-2.5 py-2.5 text-left uppercase text-xs tracking-wide font-bold">
                      Turno
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {criticalRecords.map((record) => (
                    <tr key={record.id} className="bg-destructive/10">
                      <td className="border border-border px-2.5 py-2.5 font-bold text-destructive">
                        {record.codigo}
                      </td>
                      <td className="border border-border px-2.5 py-2.5">
                        {record.vuelo}
                      </td>
                      <td className="border border-border px-2.5 py-2.5">
                        {record.observacion}
                      </td>
                      <td className="border border-border px-2.5 py-2.5">
                        {record.turno}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sección de registros normales */}
        {normalRecords.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 text-lg font-bold">
              MALETAS REGISTRADAS CON FIRMA
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm mt-3">
                <thead>
                  <tr>
                    <th className="border border-border bg-muted px-2.5 py-2.5 text-left uppercase text-xs tracking-wide font-bold">
                      Código
                    </th>
                    <th className="border border-border bg-muted px-2.5 py-2.5 text-left uppercase text-xs tracking-wide font-bold">
                      Vuelo
                    </th>
                    <th className="border border-border bg-muted px-2.5 py-2.5 text-left uppercase text-xs tracking-wide font-bold">
                      Observación
                    </th>
                    <th className="border border-border bg-muted px-2.5 py-2.5 text-left uppercase text-xs tracking-wide font-bold">
                      Turno
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {normalRecords.map((record) => (
                    <tr key={record.id}>
                      <td className="border border-border px-2.5 py-2.5">
                        {record.codigo}
                      </td>
                      <td className="border border-border px-2.5 py-2.5">
                        {record.vuelo}
                      </td>
                      <td className="border border-border px-2.5 py-2.5">
                        {record.observacion}
                      </td>
                      <td className="border border-border px-2.5 py-2.5">
                        {record.turno}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 pt-4 border-t border-border text-xs text-muted-foreground">
          Reporte generado por la estación Cusco<br />
          Fecha y hora de generación: {generationDate}
        </div>
      </div>
    );
  }
);

ReportPreview.displayName = 'ReportPreview';
