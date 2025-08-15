import Image from "next/image";
import { ReciboPage } from "./recibo_page";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

async function getInvoiceData(slug) {
  const url = `${API_URL}/uuid_invoice/${slug}`;
  const res = await axios.get(url);

  if (res.status !== 200) {
    throw new Error('Failed to fetch invoice');
  }
  return res.data;
}

export default async function InvoicePage({ params }) {
  try {
    const invoice = await getInvoiceData(params.slug.join('/'));
    return <ReciboPage invoice={invoice} />;
  } catch (error) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-[#F0F0F0]">
        <div className="text-center">
          <p className="text-black text-lg text-pretty">No encontramos el recibo que estas buscando.</p>
          <Image src="/dog.png" alt="404" width={400} height={400} />
        </div>
      </div>
    );
  }
}
