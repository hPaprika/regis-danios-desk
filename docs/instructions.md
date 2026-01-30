## 🗓️ Información General

- **Fecha del reporte:** 29/01/2026  
- **Periodo evaluado:** (00:00 – 23:59)  
- **Total de maletas registradas:** 18  
- **Casos críticos (SIN FIRMA | LR):** 5  

---
### instrucciones
- aplica los colores del sistema a la preview generada.
- debe mostrar siempre los registros del dia anterior pues son datos historicos(opcion por defecto al generar el reporte)
- integrado con los 2 botones para descargar en formatos de pdf y csv
- el nombre del archivo descargado debe seguir el siguiente modelo terminando con la fecha actual de la generación: **REP_CUS_MALETAS_20260128**
---
> el reporte generado debe seguir el diseño del ejemplo a continuacion, usalo solo como guia de diseño
```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Reporte Diario de Maletas Dañadas</title>
  <style>
    :root {
      --rojo: #c62828;
      --rojo-bg: #fdecea;
      --gris: #555;
      --gris-claro: #f5f5f5;
      --borde: #ddd;
      --negro: #222;
    }

    body {
      font-family: Arial, Helvetica, sans-serif;
      background: #fafafa;
      color: var(--negro);
      margin: 0;
      padding: 32px;
    }

    .reporte {
      max-width: 1100px;
      margin: auto;
      background: #fff;
      padding: 32px;
      border: 1px solid var(--borde);
    }

    /* ======================
       ENCABEZADO
    ====================== */
    .header {
      border-bottom: 2px solid var(--borde);
      margin-bottom: 24px;
      padding-bottom: 16px;
    }

    .header h1 {
      margin: 0;
      font-size: 24px;
      letter-spacing: 1px;
    }

    .meta {
      margin-top: 8px;
      color: var(--gris);
      font-size: 14px;
    }

    .resumen {
      display: flex;
      gap: 32px;
      margin-top: 16px;
    }

    .resumen div {
      background: var(--gris-claro);
      padding: 12px 16px;
      border-left: 5px solid var(--borde);
      font-size: 14px;
    }

    .resumen .critico {
      border-color: var(--rojo);
      background: var(--rojo-bg);
      color: var(--rojo);
      font-weight: bold;
    }

    /* ======================
       SECCIONES
    ====================== */
    .seccion {
      margin-top: 32px;
    }

    .seccion h2 {
      margin-bottom: 12px;
      font-size: 18px;
    }

    .seccion.critica h2 {
      color: var(--rojo);
    }

    /* ======================
       TABLAS
    ====================== */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    th, td {
      border: 1px solid var(--borde);
      padding: 10px;
      text-align: left;
    }

    th {
      background: var(--gris-claro);
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 0.5px;
    }

    tr.critico {
      background: var(--rojo-bg);
    }

    tr.critico td:first-child {
      font-weight: bold;
      color: var(--rojo);
    }

    /* ======================
       PIE
    ====================== */
    .footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid var(--borde);
      font-size: 12px;
      color: var(--gris);
    }

    /* ======================
       IMPRESIÓN (PDF)
    ====================== */
    @media print {
      body {
        padding: 0;
        background: white;
      }

      .reporte {
        border: none;
        padding: 0;
      }

      .resumen {
        flex-direction: column;
        gap: 8px;
      }
    }
  </style>
</head>
<body>

  <div class="reporte">

    <!-- ENCABEZADO -->
    <div class="header">
      <h1>REPORTE DIARIO DE MALETAS DAÑADAS</h1>
      <div class="meta">
        Fecha del reporte: <strong>29/01/2026</strong><br>
        Periodo evaluado: <strong>(00:00 – 23:59)</strong>
      </div>

      <div class="resumen">
        <div>Total de maletas registradas: <strong>18</strong></div>
        <div class="critico">Casos críticos (SIN FIRMA | LR): <strong>5</strong></div>
      </div>
    </div>

    <!-- SECCIÓN CRÍTICOS -->
    <div class="seccion critica">
      <h2>⚠️ MALETAS REGISTRADAS SIN FIRMA</h2>

      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Vuelo</th>
            <th>Observación</th>
            <th>Turno</th>
          </tr>
        </thead>
        <tbody>
          <tr class="critico">
            <td>346219</td>
            <td>2366</td>
            <td>Rueda desprendida</td>
            <td>BRC-ERC</td>
          </tr>
          <tr class="critico">
            <td>811783</td>
            <td>2328</td>
            <td>Carcasa rota lateral derecha</td>
            <td>IRC-KRC</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- SECCIÓN NORMALES -->
    <div class="seccion">
      <h2>MALETAS REGISTRADAS CON FIRMA</h2>

      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Vuelo</th>
            <th>Observación</th>
            <th>Turno</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>774431</td>
            <td>2010</td>
            <td>Golpe superficial</td>
            <td>BRC-ERC</td>
          </tr>
          <tr>
            <td>655602</td>
            <td>2267</td>
            <td>Rasguño lateral menor</td>
            <td>IRC-KRC</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- PIE -->
    <div class="footer">
      Reporte generado por la estación Cusco<br>
      Fecha y hora de generación: 29/01/2026 |
    </div>

  </div>

</body>
</html>

```
---

## 📊 FORMATO CSV – REPORTE OPERATIVO DIARIO

```csv
codigo,vuelo,observacion,turno,prioridad
123456,2239,"Rueda desprendida",IRC-KRC,ALTA
234567,2239,"Carcasa rota lateral derecha",BRC-ERC,ALTA
345678,2239,"Cremallera inutilizable",IRC-KRC,ALTA
456789,2239,"Golpe superficial",BRC-ERC,MEDIA
567890,2239,"Rasguño lateral menor",IRC-KRC,MEDIA
```

>ALTA=sin firma y MEDIA=con firma