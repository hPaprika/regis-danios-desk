import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2 solid #2563eb',
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 3,
  },
  date: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 5,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    borderBottom: '1 solid #e2e8f0',
    paddingBottom: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    width: '23%',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    border: '1 solid #e2e8f0',
  },
  statLabel: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 4,
    marginBottom: 5,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1 solid #e2e8f0',
  },
  tableCell: {
    fontSize: 10,
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
  },
  col1: {
    width: '40%',
  },
  col2: {
    width: '30%',
  },
  col3: {
    width: '30%',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#94a3b8',
    borderTop: '1 solid #e2e8f0',
    paddingTop: 10,
  },
  chartSection: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingBottom: 6,
    borderBottom: '1 solid #e2e8f0',
  },
  chartLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  chartValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e293b',
  },
});

export interface ReportData {
  month: string;
  year: string;
  // stats: {
  //   total: number;
  //   counter: number;
  //   siberia: number;
  //   signed: number;
  // };
  byAirline: Array<{ name: string; value: number }>;
  byCategory: Array<{ name: string; value: number }>;
  topFlights: Array<{ flight: string; damages: number; airline?: string }>;
  generatedDate: string;
}

interface ReportDocumentProps {
  data: ReportData;
}

export const ReportDocument = ({ data }: ReportDocumentProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Reporte de Maletas Dañadas</Text>
        <Text style={styles.subtitle}>
          Período: {data.month} {data.year}
        </Text>
        <Text style={styles.date}>Generado el: {data.generatedDate}</Text>
      </View>

      {/* Estadísticas Principales */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumen Ejecutivo</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total de Maletas</Text>
            {/* <Text style={styles.statValue}>{data.stats.total}</Text> */}
          </View>
          {/* <View style={styles.statBox}>
            <Text style={styles.statLabel}>Siberia</Text>
            <Text style={styles.statValue}>{data.stats.siberia}</Text>
          </View> */}
          {/* <View style={styles.statBox}>
            <Text style={styles.statLabel}>Con Firma</Text>
            <Text style={styles.statValue}>{data.stats.signed}</Text>
          </View> */}
        </View>
      </View>

      {/* Daños por Aerolínea */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Distribución por Aerolínea</Text>
        <View style={styles.chartSection}>
          {data.byAirline.map((item, index) => (
            <View key={index} style={styles.chartRow}>
              <Text style={styles.chartLabel}>{item.name}</Text>
              <Text style={styles.chartValue}>{item.value} maletas</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Daños por Categoría */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Distribución por Categoría</Text>
        <View style={styles.chartSection}>
          {data.byCategory.map((item, index) => (
            <View key={index} style={styles.chartRow}>
              <Text style={styles.chartLabel}>{item.name}</Text>
              <Text style={styles.chartValue}>{item.value} casos</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Top Vuelos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vuelos con Mayor Incidencia</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCellHeader, styles.col1]}>Vuelo</Text>
            <Text style={[styles.tableCellHeader, styles.col2]}>Aerolínea</Text>
            <Text style={[styles.tableCellHeader, styles.col3]}>Daños</Text>
          </View>
          {data.topFlights.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col1]}>{item.flight}</Text>
              <Text style={[styles.tableCell, styles.col2]}>{item.airline || 'N/A'}</Text>
              <Text style={[styles.tableCell, styles.col3]}>{item.damages}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>Sistema de Gestión de Maletas Dañadas - Aeropuerto SCL</Text>
        <Text>Documento generado automáticamente</Text>
      </View>
    </Page>
  </Document>
);
