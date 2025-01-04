import dayjs from 'dayjs';
import jsPDF from 'jspdf';
import { FileDown } from 'lucide-react';
import React from 'react';
import { Button } from './ui/button';

declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: any) => any;
    }
}
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

const generateCompanyInfo = (doc, campus, leftCol, rightCol, currentY) => {
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text("Prexun Asesorías", leftCol, currentY);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(11);
    doc.text(campus?.name, leftCol, currentY + 7);
    doc.text(`${campus?.address}`, leftCol, currentY + 14, {
        maxWidth: rightCol - leftCol - 10
    });
};

const generateInvoiceDetails = (doc, invoice, rightCol, currentY) => {
    doc.setFontSize(11);
    const details = [
        ["Número de factura:", `N-${invoice.id.toString().padStart(5, '0')}`],

        ["Fecha:", new Intl.DateTimeFormat('es', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: 'UTC'
        }).format(new Date(invoice.created_at)),],

        ["Fecha de vencimiento:", new Intl.DateTimeFormat('es', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: 'UTC'
        }).format(new Date(invoice.expiration_date))
        ],

        ["Hora de pago:", invoice.payment_date ?
            dayjs(invoice.payment_date).format('HH:mm A') : 'No pagada']
    ];

    details.forEach((row, index) => {
        doc.text(row[0], rightCol, currentY + (index * 7), { align: 'left' });
        doc.text(row[1], rightCol + 90, currentY + (index * 7), { align: 'right' });
    });
};

const generateProductsTable = (doc: jsPDF, invoice: any, currentY: number) => {
    doc.autoTable({
        startY: currentY + 40,
        head: [["PRODUCTOS Y SERVICIOS", "VALOR"]],
        body: [[
            {
                content: invoice.student?.grupo?.name + " | " + invoice.student?.grupo?.type + "\n\n" +
                    "Frecuencia clases:" + JSON.parse(invoice.student?.grupo?.frequency).join(', ') + "\n" +
                    invoice.student?.grupo?.start_time + " - " + invoice.student?.grupo?.end_time + "\n\n" +
                    "Notas: " + invoice.notes ? invoice.notes : "",
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

const generateTotals = (doc, finalY ,invoice) => {
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text("Total:", 140, finalY + 20);
    doc.text("$" + invoice.amount.toLocaleString(), 200, finalY + 20, { align: "right" });
};

const generateComments = (doc, finalY, leftCol) => {
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.text("Comentarios", leftCol, finalY + 35);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text("Este es un Comprobante de Pago este no es un comprobante fiscal ni una factura",
        leftCol, finalY + 45);
    doc.text("Todas las tarifas se muestran en MXN y están sujetas a impuestos sobre las ventas (según corresponda).",
        leftCol, finalY + 52);
};

const generatePDF = (invoice) => {
    const doc = new jsPDF();
    const leftCol = 15;
    const rightCol = doc.internal.pageSize.width / 2;
    const currentY = 50;

    generateWatermark(doc, invoice.paid);
    generateHeader(doc);
    generateCompanyInfo(doc, invoice.campus, leftCol, rightCol, currentY);
    generateInvoiceDetails(doc, invoice, rightCol, currentY);
    generateProductsTable(doc, invoice, currentY);

    const finalY = (doc as any).lastAutoTable.finalY || 200;

    generateTotals(doc, finalY, invoice);
    generateComments(doc, finalY, leftCol);

    doc.save(`comprobante-${invoice.id.toString().padStart(5, '0')}.pdf`);
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