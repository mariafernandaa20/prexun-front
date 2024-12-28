'use client'

import { useState } from 'react'
import jsPDF from "jspdf";
import "jspdf-autotable";
import Image from "next/image";
import dayjs from 'dayjs';

export function InvoiceClient({ invoice }) {
    const [isGenerating, setIsGenerating] = useState(false)
    const invoiceNumber = ({ id }) => {
        if (id < 10) {
            return `N-0000${id}`;
        } if (id < 100) {
            return `N-000${id}`;
        }
        if (id < 1000) {
            return `N-00${id}`;
        }
        if (id < 10000) {
            return `N-0${id}`;
        }
        return `N-${id}`;
    };

    const generatePDF = async () => {
        const doc = new jsPDF();

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
                lineHeight: 1.5
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
        <div className='flex flex-col justify-center items-center mx-auto bg-white lg:h-screen text-black'>
            <div className="px-4 py-10 bg-white sm:p-20 w-full sm:w-[800px] border border-gray-400">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center">
                            <Image src="/logo-horizontal.png" alt="Prexun" width={150} height={50} />
                        </div>
                        <h1 className=" lg:text-2xl font-bold text-gray-700">Comprobante de pago</h1>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="font-semibold mb-2">Prexun Asesorías</h3>
                            <p className="text-gray-600">{invoice.campus?.name}</p>
                            <p className="text-gray-600">{invoice.campus?.address}</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="">Número de factura</span>
                                <span>{invoiceNumber(invoice)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="">Fecha</span>
                                <span>{dayjs(invoice.created_at).format('DD/MM/YYYY')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="">Fecha de vencimiento</span>
                                <span>{invoice.due_date ? invoice.due_date : 'Sin vencimiento'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="">Metodo de pago</span>
                                <span>{invoice.payment_method}</span>
                            </div>
                        </div>
                    </div>

                    <div className="border border-gray-400 overflow-hidden mb-8">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        PRODUCTOS Y SERVICIOS
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        VALOR
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                <tr>
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="font-medium text-gray-900">HF1 | R | 1-3</div>
                                            <div className="text-gray-500">
                                                <p>📅 Frecuencia clases: Lunes, miércoles y viernes</p>
                                                <p>⏰ 8:00 a.m. - 10:00 a.m.</p>
                                                <p className="mt-2">Parcialidad:</p>
                                                <p>▪ $2,000 antes del 30 de septiembre el 2024</p>
                                                <p className="mt-2">Liquidación:</p>
                                                <p>▪ $2,000 antes del 15 de octubre del 2024</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">MX$2,000.00</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-end space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
                        <div className="text-right">
                            <div className="flex justify-between mb-2">
                                <span className="font-medium">Total parcial</span>
                                <span>MX$2,000.00</span>
                            </div>
                            <div className="flex justify-between font-bold">
                                <span>Total</span>
                                <span>MX$2,000.00</span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-8">
                        <h3 className="text-lg font-semibold mb-4">Comentarios</h3>
                        <p className="text-gray-600 mb-4">
                            Este es un Comprobante de Pago este no es un comprobante fiscal ni una factura
                        </p>
                        <p className="text-gray-600">
                            Todas las tarifas se muestran en MXN y están sujetas a impuestos sobre las ventas (según corresponda).
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-4 text-center">
                <button
                    onClick={generatePDF}
                    disabled={isGenerating}
                    className="bg-blue-600 text-white px-6 py-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    {isGenerating ? 'Generando PDF...' : 'Descargar PDF'}
                </button>
            </div>
        </div>
    )
}