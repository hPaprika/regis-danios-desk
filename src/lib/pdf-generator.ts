import { pdf } from '@react-pdf/renderer';
import { ReportDocument, type ReportData } from '@/components/pdf/ReportDocument';

export const generatePDFReport = async (data: ReportData): Promise<Blob> => {
  const doc = ReportDocument({ data });
  const blob = await pdf(doc).toBlob();
  return blob;
};

export const downloadPDFReport = async (data: ReportData, filename: string) => {
  try {
    const blob = await generatePDFReport(data);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
