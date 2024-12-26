'use client'

import { useState } from 'react'
import jsPDF from "jspdf";
import "jspdf-autotable";
import Image from "next/image";
export default function Invoice({ params }) {
    console.log(params);

    const [isGenerating, setIsGenerating] = useState(false)


    const generatePDF = async () => {
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.addImage('/logo-prexun.webp', 'webp', 15, 20, 50, 20);
        doc.text("Comprobante de pago", 200, 20, { align: "right" });

        doc.setFontSize(12);
        doc.text("PREXUN ASESORÍAS", 15, 100);
        doc.text("Francico I Madero", 15, 107);
        doc.text("664460 Monterrey", 15, 114);
        doc.text("Nuevo Leon México", 15, 121);

        doc.text("Número de factura: N-10000005", 15, 75);
        doc.text("Fecha de la factura: 13 de septiembre de 2024", 15, 82);
        doc.text("Fecha de vencimiento: 13 de septiembre de 2024", 15, 89);
        doc.text("Plantel: Madero", 15, 96);
        doc.text("Hora de pago: 9:32 A.M.", 15, 103);

        (doc as any).autoTable({
            startY: 110,
            head: [["PRODUCTOS Y SERVICIOS", "VALOR"]],
            body: [
                [
                    {
                        content: "HF1 | R | 1-3\n" +
                            "Frecuencia clases: Lunes, miércoles y viernes\n" +
                            "8:00 a.m. - 10:00 a.m.\n" +
                            "Parcialidad:\n" +
                            "$2,000 antes del 30 de septiembre el 2024\n" +
                            "Liquidación:\n" +
                            "$2,000 antes del 15 de octubre del 2024",
                        styles: { cellWidth: 'auto', cellPadding: 2 }
                    },
                    "MX$2,000.00"
                ],
            ],
        });

        const finalY = (doc as any).lastAutoTable.finalY || 200;
        doc.text("Total: MX$2,000.00", 15, finalY + 10);

        doc.text("Comentarios", 15, finalY + 25);
        doc.setFontSize(10);
        doc.text("Este es un Comprobante de Pago este no es un comprobante fiscal ni una factura", 15, finalY + 35);
        doc.text("Todas las tarifas se muestran en MXN y están sujetas a impuestos sobre las ventas (según corresponda).", 15, finalY + 42);
        doc.save("comprobante-de-pago.pdf");
        return;
    }

    return (
        <div className='flex flex-col justify-center items-center mx-auto bg-white h-screen text-black'>
            <div className="px-4 py-10 bg-white  sm:p-20 w-[800px] border border-gray-400">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center">
                            <Image src="/logo-prexun.webp" alt="Prexun" width={150} height={50} />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-700">Comprobante de pago</h1>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="font-semibold mb-2">Prexun Asesorías</h3>
                            <p className="text-gray-600">Francico I Madero</p>
                            <p className="text-gray-600">664460 Monterrey</p>
                            <p className="text-gray-600">Nuevo Leon México</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="">Número de factura</span>
                                <span>N-10000005</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="">Fecha de la factura</span>
                                <span>13 de septiembre de 2024</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="">Fecha de vencimiento</span>
                                <span>13 de septiembre de 2024</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="">Plantel</span>
                                <span>Madero</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="">Hora de pago</span>
                                <span>9:32 A.M.</span>
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

                    <div className="flex justify-end space-x-4 mb-8">
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

