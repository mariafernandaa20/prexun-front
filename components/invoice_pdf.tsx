import dayjs from 'dayjs';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import { FileDown } from 'lucide-react';
import React from 'react';
import { Button } from './ui/button';
import { PaymentMethod } from '@/lib/types';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => any;
  }
}

const formatTime = (time) => {
  if (!time) return 'N/A';

  // Crear un objeto Date con una fecha arbitraria y la hora especificada
  const [hours, minutes] = time.split(':');
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);

  // Formatear la hora en 12 horas con AM/PM
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const generateWatermark = (doc, isPaid) => {
  doc.setFontSize(60);
  doc.setTextColor(200, 200, 200);
  doc.setFont(undefined, 'bold');
  doc.text(
    isPaid ? 'PAGADO' : 'NO PAGADO',
    doc.internal.pageSize.width / 2 + 15,
    doc.internal.pageSize.height / 2 + 20,
    { align: 'center', angle: 45 }
  );
  doc.setTextColor(0, 0, 0);
};

const generateHeader = (doc) => {
  doc.addImage('/logo-horizontal.png', 'png', 15, 20, 40, 23);
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('Comprobante de pago', 195, 30, { align: 'right' });
};

const generateCompanyInfo = (
  doc,
  campus,
  card = null,
  leftCol,
  rightCol,
  currentY
) => {
  // Título
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Prexun Asesorías', leftCol, currentY);

  // Restaurar fuente normal
  doc.setFont(undefined, 'normal');
  doc.setFontSize(11);

  // Nombre del campus
  currentY += 7;
  doc.text(campus?.name || 'Campus no especificado', leftCol, currentY);

  currentY += 7;
  const address = campus?.address || 'Dirección no disponible';
  const addressLines = doc.splitTextToSize(address, rightCol - leftCol - 10);
  doc.text(addressLines, leftCol, currentY);

  currentY += addressLines.length * 7;

  // // Titular
  // doc.text(`Titular: ${campus?.titular}`, leftCol, currentY);

  // // RFC
  // currentY += 5;
  // doc.text(`RFC: ${campus?.rfc}`, leftCol, currentY);

  // Tarjeta
  // currentY += 5;
  // doc.text(`Tarjeta: ${card?.number}`, leftCol, currentY);

  // CLABE
  // currentY += 5;
  // doc.text(`CLABE: ${card?.clabe}`, leftCol, currentY);
};

const generateInvoiceDetails = (doc, invoice, rightCol, currentY) => {
  doc.setFontSize(11);
  const folioFormatted =
    invoice.folio_new +
    ' ' +
    (invoice.folio || invoice.folio_cash || invoice.folio_transfer)
      .toString()
      .padStart(4, '0');

  const details = [
    ['Comprobante de Pago:', invoice.paid ? folioFormatted : 'No pagado'],
    [
      'Estudiante:',
      invoice.student?.firstname + ' ' + invoice.student?.lastname || 'N/A',
    ],

    [
      'Fecha:',
      new Date(
        invoice.payment_date ? invoice.payment_date : invoice.created_at
      ).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }),
    ],

    [
      'Hora de pago:',
      invoice.paid === 1
        ? dayjs(invoice.updated_at).format('HH:mm A')
        : 'No pagada',
    ],
    [
      'Metodo de pago:',
      invoice.payment_method
        ? PaymentMethod[invoice.payment_method]
        : 'No especificado',
    ],
  ];

  details.forEach((row, index) => {
    // Añadir fondo amarillo claro solo para el número de comprobante (primera fila)
    if (index === 0) {
      const invoiceNumber = `${folioFormatted}`;
      const textWidth = doc.getTextWidth(invoiceNumber);

      // Guardar el estado actual
      const currentFillColor = doc.getFillColor();

      // Establecer color amarillo claro (#FFFFCC)
      doc.setFillColor(255, 255, 204);

      // Dibujar el rectángulo (con un poco de padding)
      doc.rect(
        rightCol + 90 - textWidth - 2, // X position (ajustado para alineación derecha)
        currentY + index * 5 - 4, // Y position (ajustado arriba del texto)
        textWidth + 4, // Width (con padding)
        6, // Height
        'F' // 'F' significa "fill"
      );

      // Restaurar el color de relleno original
      doc.setFillColor(currentFillColor);
    }

    doc.text(row[0], rightCol, currentY + index * 5, { align: 'left' });
    doc.text(row[1], rightCol + 90, currentY + index * 5, { align: 'right' });
  });
};

const generateProductsTable = (doc: jsPDF, invoice: any, currentY: number) => {
  const formatPrice = (amount: number | undefined): string => {
    return typeof amount === 'number' && !isNaN(amount)
      ? `$${amount.toLocaleString()}`
      : '$0';
  };

  const formatFrequency = (frequencyStr: string | undefined): string => {
    try {
      return frequencyStr
        ? JSON.parse(frequencyStr).join(', ')
        : 'No especificada';
    } catch {
      return 'No especificada';
    }
  };

  const buildServiceDescription = (invoice: any): string => {
    // Helper function to get assignment information (same as in invoice_page.tsx)
    const getAssignmentInfo = () => {
      // First check if there's a debt with assignment information
      if (invoice.debt?.assignment) {
        return {
          assignment: invoice.debt.assignment,
          source: 'debt',
        };
      }

      // Then check if student has active assignments
      const activeAssignments = invoice.student?.assignments?.filter(
        (assignment) => assignment.is_active
      );
      if (activeAssignments && activeAssignments.length > 0) {
        // Get the most recent assignment
        const latestAssignment = activeAssignments.sort(
          (a, b) =>
            new Date(b.assigned_at).getTime() -
            new Date(a.assigned_at).getTime()
        )[0];
        return {
          assignment: latestAssignment,
          source: 'student',
        };
      }

      // Fallback to grupo information if available
      if (invoice.student?.grupo) {
        return {
          assignment: null,
          source: 'grupo',
        };
      }

      return null;
    };

    const assignmentInfo = getAssignmentInfo();

    if (!assignmentInfo) {
      return 'Servicio no especificado';
    }

    if (
      assignmentInfo.source === 'debt' ||
      assignmentInfo.source === 'student'
    ) {
      const assignment = assignmentInfo.assignment;
      const period = assignment.period;
      const grupo = assignment.grupo;
      const semanaIntensiva = assignment.semanaIntensiva;

      // Usar las fechas del grupo/semana intensiva, no del período
      let startDate = 'Fecha no disponible';
      let endDate = 'Fecha no disponible';

      if (grupo?.start_date && grupo?.end_date) {
        startDate = new Date(grupo.start_date).toLocaleDateString('es-MX', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          timeZone: 'UTC',
        });
        endDate = new Date(grupo.end_date).toLocaleDateString('es-MX', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          timeZone: 'UTC',
        });
      } else if (semanaIntensiva?.start_date && semanaIntensiva?.end_date) {
        startDate = new Date(semanaIntensiva.start_date).toLocaleDateString(
          'es-MX',
          {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC',
          }
        );
        endDate = new Date(semanaIntensiva.end_date).toLocaleDateString(
          'es-MX',
          {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC',
          }
        );
      }

      const serviceInfo = [period?.name || 'Período no especificado'];

      if (grupo) {
        serviceInfo.push(
          `Grupo: ${grupo.name} | ${grupo.type || 'Tipo no especificado'}`
        );
      }

      if (semanaIntensiva) {
        serviceInfo.push(
          `Semana Intensiva: ${semanaIntensiva.name} | ${semanaIntensiva.type || 'Tipo no especificado'}`
        );
      }

      serviceInfo.push(
        `${startDate} - ${endDate}`,
        `Frecuencia clases: ${formatFrequency(grupo?.frequency || semanaIntensiva?.frequency)}`,
        `${grupo?.start_time || semanaIntensiva?.start_time ? formatTime(grupo?.start_time || semanaIntensiva?.start_time) : 'N/A'} - ${grupo?.end_time || semanaIntensiva?.end_time ? formatTime(grupo?.end_time || semanaIntensiva?.end_time) : 'N/A'}`,
        `${invoice.notes ?? ''}`
      );

      return serviceInfo.join('\n');
    }

    // Fallback to grupo information
    const grupo = invoice.student.grupo;

    const startDate = grupo.start_date
      ? new Date(grupo.start_date).toLocaleDateString('es-MX', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          timeZone: 'UTC',
        })
      : 'Fecha no disponible';

    const endDate = grupo.end_date
      ? new Date(grupo.end_date).toLocaleDateString('es-MX', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          timeZone: 'UTC',
        })
      : 'Fecha no disponible';

    const groupInfo = [
      `${grupo.name ?? 'Grupo no asignado'} | ${grupo.type ?? 'Tipo no especificado'}`,
      `${startDate} - ${endDate}`,
      `Frecuencia clases: ${formatFrequency(grupo.frequency)}`,
      `${grupo.start_time ? formatTime(grupo.start_time) : 'N/A'} - ${grupo.end_time ? formatTime(grupo.end_time) : 'N/A'}`,
      `${invoice.notes ?? ''}`,
    ];

    return groupInfo.join('\n');
  };

  doc.autoTable({
    startY: currentY + 50,
    head: [['PRODUCTOS Y SERVICIOS', 'VALOR']],
    body: [
      [
        {
          content: buildServiceDescription(invoice),
          styles: {
            cellWidth: 'auto',
            cellPadding: 4,
            fontSize: 11,
            lineHeight: 1.5,
          },
        },
        {
          content:
            '$' + (invoice.amount ? invoice.amount.toLocaleString() : '0'),
          styles: {
            halign: 'center',
            fontSize: 11,
          },
        },
      ],
    ],
    headStyles: { fillColor: [200, 200, 200] },
    styles: {
      fontSize: 11,
      lineHeight: 1.5,
      fillColor: null,
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 40 },
    },
    theme: 'grid',
  });
};

const generateTotals = (doc, finalY, invoice) => {
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');

  // Validar que amount existe y es un número válido
  const amount =
    invoice.amount && !isNaN(invoice.amount) ? Number(invoice.amount) : 0;

  // Calculations with 2 decimal tolerance
  const subtotal = +(amount / 1.16).toFixed(2);
  const iva = +(amount - subtotal).toFixed(2);
  const total = amount.toFixed(2);

  // Add text to the document
  doc.text('Subtotal:', 140, finalY + 20);
  doc.text('$' + subtotal.toLocaleString(), 200, finalY + 20, {
    align: 'right',
  });

  doc.text('IVA:', 140, finalY + 25);
  doc.text('$' + iva.toLocaleString(), 200, finalY + 25, { align: 'right' });

  doc.text('Total:', 140, finalY + 30);
  doc.text('$' + total.toLocaleString(), 200, finalY + 30, { align: 'right' });
};

const generateComments = (doc, finalY, leftCol) => {
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('Comentarios', leftCol, finalY + 50);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);

  const maxWidth = 140;

  const lines = [
    'Este es un "Comprobante de pago", por ende, no es un comprobante fiscal o una factura.',
    'Todas las tarifas se muestran en MXN y están sujetas a impuestos sobre las ventas (según corresponda).',
    'No se hacen devoluciones o compensaciones de ninguna índole.',
    'El valor de promoción solo aplica si se liquida en las fechas convenidas.',
    'El libro de estudios se entregará una semana previa al inicio de clases.',
    'Si usted requiere factura, solicitar al registrarse; no se emitirá en caso de no ser solicitada en la inscripción.',
    'Nuestro material está protegido por derechos de autor, hacer uso con fines diferentes al establecido es perseguido por la ley.',
    'En las sesiones de clase y evaluaciones no se permite usar o tener en las manos teléfonos celulares.',
    'Los padres o tutores encargados del alumno deberán solicitar informes de su desempeño durante el curso.',
    'Si por alguna situación esporádica el Estado suspende las clases presenciales, las clases serán en línea.',
  ];

  let currentY = finalY + 60;
  lines.forEach((line, index) => {
    const splitLines = doc.splitTextToSize(index + 1 + '. ' + line, maxWidth);
    doc.text(splitLines, leftCol, currentY);
    currentY += 5 * splitLines.length;
  });

  // Add QR code to the right side
  doc.addImage('/qr.png', 'png', 160, finalY + 50, 40, 40);
  doc.setFontSize(8);
  doc.text('Términos y Condiciones', 180, finalY + 95, { align: 'center' });
};

const generatePDF = (invoice) => {
  const doc = new jsPDF();
  const leftCol = 15;
  const rightCol = doc.internal.pageSize.width / 2;
  const currentY = 50;

  generateWatermark(doc, invoice.paid);
  generateHeader(doc);
  generateCompanyInfo(
    doc,
    invoice.campus,
    invoice.card,
    leftCol,
    rightCol,
    currentY
  );
  generateInvoiceDetails(doc, invoice, rightCol, currentY);
  generateProductsTable(doc, invoice, currentY);

  const finalY = (doc as any).lastAutoTable.finalY || 200;

  generateTotals(doc, finalY, invoice);
  generateComments(doc, finalY, leftCol);

  const folioForFilename =
    invoice.folio_new +
    (invoice.folio || invoice.folio_cash || invoice.folio_transfer)
      .toString()
      .padStart(3, '0');
  doc.save(`comprobante-${folioForFilename}.pdf`);
};

const InvoicePDF = ({ icon, invoice }) => {
  if (icon) {
    return (
      <Button variant="ghost" size="icon" onClick={() => generatePDF(invoice)}>
        <FileDown className="w-4 h-4 mr-2" />
      </Button>
    );
  }

  return (
    <button
      onClick={() => generatePDF(invoice)}
      className="bg-blue-600 text-white px-6 py-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
    >
      Descargar PDF
    </button>
  );
};

export default InvoicePDF;
