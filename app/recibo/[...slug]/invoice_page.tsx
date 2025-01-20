'use client'

import { useState } from 'react'
import jsPDF from "jspdf";
import "jspdf-autotable";
import Image from "next/image";
import dayjs from 'dayjs';
import InvoicePDF from '@/components/invoice_pdf';
import { FormattedDate, formatTime } from '@/lib/utils';
export function InvoiceClient({ invoice }) {
    console.log(invoice);
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

    return (
        <div className='flex flex-col justify-center items-center mx-auto bg-white lg:h-screen text-black text-xs'>
            <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{
                    transform: 'rotate(45deg)',
                    opacity: 0.2,
                    zIndex: 10
                }}
            >
                <span className="text-gray-400 text-8xl font-bold">
                    {invoice.paid ? "PAGADO" : "NO PAGADO"}
                </span>
            </div>
            <div className="px-4 py-10 bg-white sm:p-20 w-full sm:w-[800px] border border-gray-400  lg:min-h-[1056px]">
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
                                <span className="">Comprobante de Pago</span>
                                <span>{invoiceNumber(invoice)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="">Estudiante</span>
                                <span>{invoice.student?.firstname} {invoice.student?.lastname}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="">Fecha</span>
                                <span>
                                    {new Date(invoice.created_at).toLocaleDateString('es-MX', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        timeZone: 'UTC'
                                    })}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="">Fecha de vencimiento</span>
                                <span>
                                    {invoice.expiration_date
                                        ? formatTime({
                                            time: invoice.expiration_date
                                        })
                                        : 'Sin vencimiento'
                                    }
                                </span>                         </div>
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
                                            <div className="font-medium text-gray-900">{invoice.student?.grupo?.name} | {invoice.student?.grupo?.type}</div>
                                            <div className="font-medium text-gray-900">
                                                {new Date(invoice.student?.grupo?.start_date).toLocaleDateString('es-MX', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    timeZone: 'UTC'
                                                })} - {new Date(invoice.student?.grupo?.end_date).toLocaleDateString('es-MX', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    timeZone: 'UTC'
                                                })}
                                            </div>
                                            <div className="text-gray-500">
                                                <p>Frecuencia clases: {JSON.parse(invoice.student?.grupo?.frequency).join(', ')}</p>
                                                <p>{invoice.student?.grupo?.start_time} - {invoice.student?.grupo?.end_time}</p>
                                                <p>{invoice.notes}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">MX{invoice.amount}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-end space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
                        <div className="text-right">
                            <div className="flex justify-between font-bold gap-4">
                                <span>SubTotal</span>
                                <span>MX${(invoice.amount / 1.16).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold gap-4">
                                <span>IVA</span>
                                <span>MX${(invoice.amount - (invoice.amount / 1.16)).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold gap-4">
                                <span>Total</span>
                                <span>MX${Number(invoice.amount).toFixed(2)}</span>
                            </div>
                        </div>

                    </div>

                    <div className="border-t pt-8 text-xs">
                        <h3 className="font-semibold">Comentarios</h3>
                        <p className="text-gray-600">
                            1. Este es un "Comprobante de pago", por ende, no es un comprobante fiscal o una factura.
                        </p>
                        <p className="text-gray-600">
                            2. Todas las tarifas se muestran en MXN y están sujetas a impuestos sobre las ventas (según corresponda).
                        </p>
                        <p className="text-gray-600">
                            3. No se hacen devoluciones o compensaciones de ninguna índole.
                        </p>
                        <p className="text-gray-600">
                            4. El valor de promoción solo aplica si se liquida en las fechas convenidas.
                        </p>
                        <p className="text-gray-600">
                            5. El libro de estudios se entregará una semana previa al inicio de clases.
                        </p>
                        <p className="text-gray-600">
                            6. Si usted requiere factura, solicitar al registrarse; no se emitirá en caso de no ser solicitada en la inscripción.
                        </p>
                        <p className="text-gray-600">
                            7. Nuestro material está protegido por derechos de autor, hacer uso con fines diferentes al establecido es perseguido por la ley.
                        </p>
                        <p className="text-gray-600">
                            8. En las sesiones de clase y evaluaciones no se permite usar o tener en las manos teléfonos celulares.
                        </p>
                        <p className="text-gray-600">
                            9. Los padres o tutores encargados del alumno deberán solicitar informes de su desempeño durante el curso.
                        </p>
                        <p className="text-gray-600">
                            10. Si por alguna situación esporádica el Estado suspende las clases presenciales, las clases serán en línea.
                        </p>
                        <p className="text-gray-600">
                            <a href="https://asesoriasprexun.com/terminos-y-condiciones/" target="_blank" rel="noreferrer">
                                Terminos y Condiciones
                            </a>
                        </p>
                        <Image src="/qr.png" alt="Prexun Terminos y Condiciones" width={150} height={50} />
                    </div>
                </div>
            </div>

            <InvoicePDF icon={false} invoice={invoice} />
        </div>
    )
}