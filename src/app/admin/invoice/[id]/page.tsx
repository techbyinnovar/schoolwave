'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

// Format currency helper
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Format date helper
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Calculate invoice totals
const calculateInvoiceTotals = (lineItems: any[] = []) => {
  const subtotal = lineItems.reduce((sum: number, item: any) => {
    const unitPrice = item.unitPrice || 0;
    const students = item.studentCount || 1;
    const terms = item.terms || 1;
    const discount = item.discount || 0;
    
    let amount = 0;
    if (item.type === 'plan') {
      amount = unitPrice * students * terms * (1 - discount / 100);
    } else {
      amount = item.total || (unitPrice * students * terms);
    }
    return sum + (amount || 0);
  }, 0);

  const taxRate = 0.10; // 10% tax rate
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return { subtotal, tax, total };
};

export default function InvoicePage() {
  const params = useParams();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const res = await fetch(`/api/invoice/${params.id}`);
        if (!res.ok) throw new Error('Invoice not found');
        const data = await res.json();
        setInvoice(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchInvoice();
  }, [params.id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error || !invoice) return <div className="p-8 text-red-600">Invoice not found</div>;

  const { subtotal, tax, total } = calculateInvoiceTotals(invoice.lineItems);
  const invoiceDate = invoice.createdAt ? new Date(invoice.createdAt) : new Date();
  const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : new Date();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 print:bg-white">
      <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg overflow-hidden print:shadow-none">
        {/* Header */}
        <div className="p-8 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">INVOICE</h1>
              <p className="text-gray-500 mt-1">#{invoice.invoiceNumber || '------'}</p>
            </div>
            <div className="text-right">
              <img 
                src="/innovar.png" 
                alt="Schoolwave" 
                className="h-12 mb-2 mx-auto"
              />
              <p className="text-sm text-gray-500">Innovar Ideas Ltd</p>
              <p className="text-sm text-gray-500">makers of Schoolwave</p>
            </div>
          </div>
        </div>

        {/* Client and Invoice Info */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Bill to</h2>
            <p className="font-medium text-gray-800">{invoice.customer?.name || 'Customer Name'}</p>
            <p className="text-gray-600">{invoice.customer?.school || 'School Name'}</p>
            <p className="text-gray-600">{invoice.customer?.address || '123 School Address'}</p>
            <p className="text-gray-600">Lagos, Nigeria</p>
            <p className="text-gray-600 mt-2">{invoice.customer?.email || 'school@example.com'}</p>
          </div>
          <div className="md:text-right">
            <div className="inline-block text-left">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Invoice Date</h3>
                <p className="text-gray-800">{formatDate(invoice.createdAt)}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Due Date</h3>
                <p className="text-gray-800">{formatDate(invoice.dueDate)}</p>
              </div>
            </div>
          </div>
        </div>
        {/* Bill To & Invoice Meta */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-6">
          <div>
            <div className="text-xs font-semibold text-gray-500 mb-1">BILL TO</div>
            <div className="font-semibold text-gray-700">{invoice.customer?.name || invoice.customerId}</div>
            <div className="text-gray-500 text-sm">{invoice.customer?.address || ""}</div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex gap-2 text-xs">
              <span className="bg-yellow-300 text-gray-800 px-3 py-1 rounded font-semibold">Invoice No.<br/>{invoice.invoiceNumber || '------'}</span>
              <span className="bg-yellow-100 text-gray-800 px-3 py-1 rounded font-semibold">Issue date<br/>{invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : "-"}</span>
              <span className="bg-yellow-100 text-gray-800 px-3 py-1 rounded font-semibold">Due date<br/>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "-"}</span>
              <span className="bg-blue-900 text-white px-3 py-1 rounded font-semibold">Total due<br/>₦{
  Array.isArray(invoice.lineItems)
    ? invoice.lineItems.reduce((acc: number, item: any) => {
        let unitPrice = item.unitPrice || 0;
        let students = item.studentCount || 1;
        let terms = item.terms || 1;
        let discount = item.discount || 0;
        let amount = 0;
        if (item.type === 'plan') {
          amount = unitPrice * students * terms * (1 - discount / 100);
        } else {
          amount = item.total || (unitPrice * students * terms);
        }
        return acc + (amount || 0);
      }, 0).toLocaleString()
    : '0'
}</span>
            </div>
          </div>
        </div>
        {/* Line Items */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-8 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
                <th scope="col" className="px-8 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th scope="col" className="px-8 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(invoice.lineItems) && invoice.lineItems.map((item: any, idx: number) => {
                const unitPrice = item.unitPrice || 0;
                const students = item.studentCount || 1;
                const terms = item.terms || 1;
                const discount = item.discount || 0;
                const amount = item.type === 'plan' 
                  ? unitPrice * students * terms * (1 - discount / 100)
                  : item.total || (unitPrice * students * terms);
                
                return (
                  <tr key={idx}>
                    <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-medium">{item.name}</div>
                      {discount > 0 && (
                        <span className="text-xs text-green-600">
                          {discount}% discount applied
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {students}
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatCurrency(unitPrice)}
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      {formatCurrency(amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Invoice Totals */}
        <div className="mt-8 px-8 py-6 bg-gray-50">
          <div className="max-w-md ml-auto space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tax (10%):</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            
            <div className="pt-2 mt-4 border-t border-gray-200">
              <div className="flex justify-between text-base font-bold text-gray-900">
                <span>Total:</span>
                <span className="text-blue-700">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Payment Details */}
        <div className="mt-12 px-8 py-6 bg-blue-50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h3 className="text-sm font-semibold text-gray-700">PAYMENT INFORMATION</h3>
            <button 
              onClick={() => {
                window.location.href = 'https://paystack.shop/pay/schoolwave';
              }}
              className="mt-4 md:mt-0 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md shadow-sm transition-colors duration-200 print:hidden"
            >
              Pay Now
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Bank Transfer:</p>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm font-medium text-gray-900">Innovar Ideas Ltd</p>
                <p className="text-sm text-gray-600 mt-1">Guaranty Trust Bank (GTB)</p>
                <p className="text-sm text-gray-600">Account #: 0916976225</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Reference:</p>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm font-medium text-gray-900">Invoice #{invoice.invoiceNumber || '------'}</p>
                <p className="text-sm text-gray-600 mt-2">Please include the invoice number in your payment reference.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center">
                <img src="/schoolwave2.png" alt="Schoolwave" className="h-8 mr-2" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
              Smart Tools for Smarter Schools</p>
            </div>
            <div className="text-xs text-gray-500 text-center md:text-right">
              <p>AVM Complex, Agungi, Lagos, Nigeria</p>
              <p className="mt-1">
                <a href="mailto:mail@schoolwave.ng" className="text-blue-600 hover:underline">mail@schoolwave.ng</a>
                {' • '}
                <a href="tel:+2348021337988" className="text-blue-600 hover:underline">+234 802 133 7988</a>
              </p>
              <p className="mt-1">
                <a href="https://schoolwave.ng" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  www.schoolwave.ng
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Thank You Note */}
        <div className="px-8 py-6 bg-gray-50 text-center">
          <p className="text-sm text-gray-600">
            Thank you for your business. Please don&apos;t hesitate to contact us if you have any questions.
          </p>
        </div>
        {/* PDF Icon (for download/print, optional) */}
        {/* <div className="absolute bottom-4 right-4">
          <button className="bg-red-100 px-3 py-2 rounded flex items-center gap-2 text-red-700 font-semibold">
            <svg ... /> PDF
          </button>
        </div> */}
      </div>
    </div>
  );
}

