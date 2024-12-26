import { InvoiceClient } from "./invoice_page";

// app/invoices/[slug]/page.js
async function getInvoiceData(slug) {
    const res = await fetch(`http://localhost:8000/api/invoice/${slug}`, {
        // Next.js 14 cache options
        cache: 'force-cache', // Default, SSG behavior
        // cache: 'no-store', // For dynamic data
        // next: {
        //   revalidate: 60 // ISR behavior, revalidate every 60 seconds
        // }
    });

    if (!res.ok) {
        throw new Error('Failed to fetch invoice');
    }

    return res.json();
}

// Server Component
export default async function InvoicePage({ params }) {
    try {
        const invoice = await getInvoiceData(params.slug);
        return <InvoiceClient invoice={invoice} />;
    } catch (error) {
        // Next.js error handling
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <p className="text-red-600 text-lg">Error al cargar la factura</p>
                </div>
            </div>
        );
    }
}
