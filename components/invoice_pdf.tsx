import dayjs from 'dayjs';
import jsPDF from 'jspdf';
import { FileDown, Share } from 'lucide-react';
import React, { useState } from 'react'
import { Button } from './ui/button';

export default function InvoicePDF({ icon, invoice }) {

    console.log(invoice);

    const [isGenerating, setIsGenerating] = useState(false)
    const generatePDF = async () => {
        const doc = new jsPDF();

        // Water mark
        doc.setFontSize(60);
        doc.setTextColor(200, 200, 200);
        doc.setFont(undefined, 'bold');
        doc.text(invoice.paid ? "PAGADO" : "NO PAGADO", doc.internal.pageSize.width / 2 + 15, doc.internal.pageSize.height / 2 + 20, {
            align: 'center',
            angle: 45
        });
        doc.setTextColor(0, 0, 0);


        doc.addImage('/logo-horizontal.png', 'png', 15, 20, 40, 23);
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text("Comprobante de pago", 195, 30, { align: "right" },);

        doc.setFontSize(12);
        const leftCol = 15;
        const rightCol = doc.internal.pageSize.width / 2;
        let currentY = 50;

        doc.setFont(undefined, 'bold');
        doc.text("Prexun Asesorías", leftCol, currentY);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(11);
        doc.text(invoice.campus?.name, leftCol, currentY + 7);
        doc.text(`${invoice.campus?.address}`, leftCol, currentY + 14, { maxWidth: rightCol - leftCol - 10 });

        doc.setFontSize(11);
        const rightColumnData = [
            ["Número de factura:", `N-${invoice.id.toString().padStart(5, '0')}`],
            ["Fecha:", dayjs(invoice.created_at).format('DD/MM/YYYY')],
            ["Fecha de vencimiento:", invoice.due_date ? dayjs(invoice.due_date).format('DD/MM/YYYY') : 'Sin vencimiento'],
            ["Hora de pago:", invoice.payment_date ? dayjs(invoice.payment_date).format('HH:mm A') : 'No pagada']
        ];

        rightColumnData.forEach((row, index) => {
            doc.text(row[0], rightCol, currentY + (index * 7), { align: 'left' });
            doc.text(row[1], rightCol + 90, currentY + (index * 7), { align: 'right' });
        });

        // Products table
        (doc as any).autoTable({
            startY: currentY + 40,
            head: [["PRODUCTOS Y SERVICIOS", "VALOR"]],
            body: [
                [
                    {
                        content: "HF1 | R | 1-3\n\n" +
                            "Frecuencia clases: Lunes, miércoles y viernes\n" +
                            "8:00 a.m. - 10:00 a.m.\n\n" +
                            "Parcialidad:\n" +
                            "$2,000 antes del 30 de septiembre el 2024\n\n" +
                            "Liquidación:\n" +
                            "$2,000 antes del 15 de octubre del 2024",
                        styles: {
                            cellWidth: 'auto',
                            cellPadding: 4,
                            fontSize: 11,
                            lineHeight: 1.5
                        }
                    },
                    {
                        content: "MX$2,000.00",
                        styles: {
                            halign: 'center',
                            fontSize: 11
                        }
                    }
                ],
            ],
            headStyles: {
                fillColor: [200, 200, 200]
            },
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

        const finalY = (doc as any).lastAutoTable.finalY || 200;

        // Totals
        doc.setFontSize(11);
        doc.text("Total parcial:", 140, finalY + 10);
        doc.text("MX$2,000.00", 200, finalY + 10, { align: "right" });
        doc.setFont(undefined, 'bold');
        doc.text("Total:", 140, finalY + 20);
        doc.text("MX$2,000.00", 200, finalY + 20, { align: "right" });

        // Comments section
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        doc.text("Comentarios", leftCol, finalY + 35);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.text("Este es un Comprobante de Pago este no es un comprobante fiscal ni una factura", leftCol, finalY + 45);
        doc.text("Todas las tarifas se muestran en MXN y están sujetas a impuestos sobre las ventas (según corresponda).", leftCol, finalY + 52);

        doc.save("comprobante-de-pago.pdf");
    }

    return (

        <>
            {icon ?
                <Button variant="ghost" size="icon" onClick={generatePDF}>
                    < FileDown className="w-4 h-4 mr-2" />
                </Button> :
                <button

                    onClick={generatePDF}
                    disabled={isGenerating}
                    className="bg-blue-600 text-white px-6 py-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    {isGenerating ? 'Generando PDF...' : 'Descargar PDF'}
                </button>
            }
        </>
    )
}
