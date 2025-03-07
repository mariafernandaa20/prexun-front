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
        hour12: true
    });
};


const generateWatermark = (doc, isPaid) => {
    doc.setFontSize(60);
    doc.setTextColor(200, 200, 200);
    doc.setFont(undefined, 'bold');
    doc.text(
        isPaid ? "PAGADO" : "NO PAGADO",
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
    doc.text("Comprobante de pago", 195, 30, { align: "right" });
};

const generateCompanyInfo = (doc, campus, card = null, leftCol, rightCol, currentY) => {
    // Título
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text("Prexun Asesorías", leftCol, currentY);
    
    // Restaurar fuente normal
    doc.setFont(undefined, 'normal');
    doc.setFontSize(11);
    
    // Nombre del campus
    currentY += 7;
    doc.text(campus?.name, leftCol, currentY);
    
    currentY += 7;
    const addressLines = doc.splitTextToSize(campus?.address, rightCol - leftCol - 10);
    doc.text(addressLines, leftCol, currentY);
    
    currentY += (addressLines.length * 7);
    
    // Titular
    doc.text(`Titular: ${campus?.titular}`, leftCol, currentY);
    
    // RFC
    currentY += 5;
    doc.text(`RFC: ${campus?.rfc}`, leftCol, currentY);

    // Tarjeta
    currentY += 5;
    doc.text(`Tarjeta: ${card?.number}`, leftCol, currentY);

    // CLABE
    currentY += 5;
    doc.text(`CLABE: ${card?.clabe}`, leftCol, currentY);
};

const generateInvoiceDetails = (doc, invoice, rightCol, currentY) => {
    doc.setFontSize(11);
    const details = [
        ["Comprobante de Pago:", `${invoice?.campus?.name?.charAt(0)}-${invoice.folio ? invoice.folio.toString().padStart(5, '0') : 'no_pagado'}`],
        ["Estudiante:", invoice.student?.firstname],
        ["", invoice.student?.lastname],

        ["Fecha:", new Date(invoice.payment_date ? invoice.payment_date : invoice.created_at).toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC'
        })],

        ["Hora de pago:", invoice.paid === 1 ?
            dayjs(invoice.updated_at).format('HH:mm A') : 'No pagada'],
        ["Metodo de pago:", PaymentMethod[invoice.payment_method]]
    ];

    details.forEach((row, index) => {
        // Añadir fondo amarillo claro solo para el número de comprobante (primera fila)
        if (index === 0) {
            const invoiceNumber = `${invoice?.campus?.name?.charAt(0)}-${invoice.folio ? invoice.folio.toString().padStart(5, '0') : 'no_pagado'}`;
            const textWidth = doc.getTextWidth(invoiceNumber);
            
            // Guardar el estado actual
            const currentFillColor = doc.getFillColor();
            
            // Establecer color amarillo claro (#FFFFCC)
            doc.setFillColor(255, 255, 204);
            
            // Dibujar el rectángulo (con un poco de padding)
            doc.rect(
                rightCol + 90 - textWidth - 2, // X position (ajustado para alineación derecha)
                currentY + (index * 5) - 4,    // Y position (ajustado arriba del texto)
                textWidth + 4,                 // Width (con padding)
                6,                             // Height
                'F'                            // 'F' significa "fill"
            );
            
            // Restaurar el color de relleno original
            doc.setFillColor(currentFillColor);
        }
        
        doc.text(row[0], rightCol, currentY + (index * 5), { align: 'left' });
        doc.text(row[1], rightCol + 90, currentY + (index * 5), { align: 'right' });
    });
};

const generateProductsTable = (doc: jsPDF, invoice: any, currentY: number) => {

    const formatPrice = (amount: number | undefined): string => {
        return typeof amount === 'number'
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
        const grupo = invoice?.student?.grupo ?? {};
        const groupInfo = [
            `${grupo.name ?? 'Sin grupo'} | ${grupo.type ?? 'Sin tipo'}`,
            `${new Date(grupo.start_date).toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                timeZone: 'UTC'
            })} - ${new Date(grupo.end_date).toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                timeZone: 'UTC'
            })}`,
            `Frecuencia clases: ${formatFrequency(grupo.frequency)}`,
            `${grupo.start_time ? formatTime(grupo.start_time) : 'N/A'} - ${grupo.end_time ? formatTime(grupo.end_time) : 'N/A'}`,
            `${invoice.notes ?? ''}`
        ];

        return groupInfo.join('\n');
    };

    doc.autoTable({
        startY: currentY + 50,
        head: [["PRODUCTOS Y SERVICIOS", "VALOR"]],
        body: [[
            {
                content: buildServiceDescription(invoice),
                styles: {
                    cellWidth: 'auto',
                    cellPadding: 4,
                    fontSize: 11,
                    lineHeight: 1.5
                }
            },
            {
                content: "$" + invoice.amount.toLocaleString(),
                styles: {
                    halign: 'center',
                    fontSize: 11
                }
            }
        ]],
        headStyles: { fillColor: [200, 200, 200] },
        styles: {
            fontSize: 11,
            lineHeight: 1.5,
            fillColor: null,
        },
        columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 40 }
        },
        theme: 'grid'
    });
};

const generateTotals = (doc, finalY, invoice) => {
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');

    // Calculations with 2 decimal tolerance
    const subtotal = +(invoice.amount / 1.16).toFixed(2);
    const iva = +(invoice.amount - subtotal).toFixed(2);
    const total = Number(invoice.amount).toFixed(2);

    // Add text to the document
    doc.text("Subtotal:", 140, finalY + 20);
    doc.text("$" + subtotal.toLocaleString(), 200, finalY + 20, { align: "right" });

    doc.text("IVA:", 140, finalY + 25);
    doc.text("$" + iva.toLocaleString(), 200, finalY + 25, { align: "right" });

    doc.text("Total:", 140, finalY + 30);
    doc.text("$" + total.toLocaleString(), 200, finalY + 30, { align: "right" });
};


const generateComments = (doc, finalY, leftCol) => {
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.text("Comentarios", leftCol, finalY + 50);
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
        'Si por alguna situación esporádica el Estado suspende las clases presenciales, las clases serán en línea.'
    ];

    let currentY = finalY + 60;
    lines.forEach((line, index) => {
        const splitLines = doc.splitTextToSize((index + 1) + '. ' + line, maxWidth);
        doc.text(splitLines, leftCol, currentY);
        currentY += 5 * splitLines.length;
    });

    // Add QR code to the right side
    doc.addImage('/qr.png', 'png', 160, finalY + 50, 40, 40);
    doc.setFontSize(8);
    doc.text("Términos y Condiciones", 180, finalY + 95, { align: "center" });
};

const generatePDF = (invoice) => {
    const doc = new jsPDF();
    const leftCol = 15;
    const rightCol = doc.internal.pageSize.width / 2;
    const currentY = 50;

    generateWatermark(doc, invoice.paid);
    generateHeader(doc);
    generateCompanyInfo(doc, invoice.campus, invoice.card, leftCol, rightCol, currentY);
    generateInvoiceDetails(doc, invoice, rightCol, currentY);
    generateProductsTable(doc, invoice, currentY);

    const finalY = (doc as any).lastAutoTable.finalY || 200;

    generateTotals(doc, finalY, invoice);
    generateComments(doc, finalY, leftCol);

    doc.save(`comprobante-${invoice.folio? invoice.folio.toString().padStart(5, '0') : 'no_pagado'}.pdf`);
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