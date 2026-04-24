import React, { forwardRef } from 'react';
import QRCode from 'react-qr-code';
import { GemReport } from '../types';
import { Gem } from 'lucide-react';

interface PrintReportProps {
  report: GemReport;
}

export const GemReportPrint = forwardRef<HTMLDivElement, PrintReportProps>(({ report }, ref) => {
  const verifyUrl = `${window.location.origin}/verify/${report.report_id}`;
  const formattedDate = new Date(report.created_at).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div ref={ref} className="print-container font-sans text-slate-800">
      <div className="relative w-[210mm] h-[148mm] bg-white overflow-hidden p-6 border-b-8 border-red-600">
        {/* Background watermark or subtle texture could go here */}
        
        {/* Right Header Section (Title & Logo) */}
        <div className="absolute top-6 right-8 text-right flex flex-col items-end">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-12 h-12 rounded-full border-2 border-red-600 flex items-center justify-center p-1">
              <div className="w-full h-full rounded-full bg-red-600 flex items-center justify-center text-[10px] text-white font-bold">TSG</div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-red-600 leading-none">Total Solution</h1>
              <h2 className="text-2xl font-bold text-red-600 leading-tight">Gemological Center</h2>
            </div>
          </div>
          <div className="mt-1">
            <p className="text-blue-900 font-bold tracking-[0.15em] text-lg">GEM IDENTIFICATION CARD</p>
          </div>
        </div>

        {/* Left Data Column */}
        <div className="mt-2 w-[55%] space-y-1 text-[11px]">
          <div className="flex mb-4 gap-6">
            <div>
              <p className="font-bold text-slate-400 text-[9px] uppercase">Report No:</p>
              <p className="font-bold text-sm">{report.report_id.split('-').pop()}</p>
            </div>
            <div>
              <p className="font-bold text-slate-400 text-[9px] uppercase">Date:</p>
              <p className="font-bold text-xs">{formattedDate}</p>
            </div>
          </div>

          <div className="space-y-0.5">
            {[
              { label: 'Shape', value: report.shape },
              { label: 'Cut', value: report.cut },
              { label: 'Weight', value: `${report.weight}cts` },
              { label: 'Dimension', value: report.dimension },
              { label: 'Colour & Clarity', value: report.color },
              { label: 'Transparency', value: report.transparency },
              { label: 'Magnification', value: report.magnification },
              { label: 'Refractive Index', value: report.refractive_index },
              { label: 'Identification', value: report.gem_type, highlight: true },
              { label: 'Origin', value: report.origin, highlight: true },
              { label: 'Treatment', value: report.treatment, highlight: true },
            ].map((field, i) => (
              <div key={i} className="flex items-baseline">
                <span className="w-32 font-bold text-slate-600">{field.label} :</span>
                <span className={`font-bold ${field.highlight ? 'text-blue-900' : 'text-slate-900'}`}>{field.value}</span>
              </div>
            ))}
            <div className="flex items-start pt-1">
              <span className="w-32 font-bold text-slate-600">Comment :</span>
              <p className="flex-1 font-bold text-slate-900 text-[10px] leading-tight italic">
                {report.description}
              </p>
            </div>
          </div>
        </div>

        {/* Gem Image - Centered Right */}
        <div className="absolute top-1/2 left-[65%] -translate-y-1/2 w-48 h-48 flex items-center justify-center">
          {report.image_url ? (
            <div className="relative">
               <div className="absolute inset-0 bg-red-600/5 blur-3xl rounded-full scale-150"></div>
               <img src={report.image_url} alt="Gem" className="relative z-10 w-full h-full object-contain drop-shadow-2xl" />
            </div>
          ) : (
            <Gem size={80} className="text-slate-100" />
          )}
        </div>

        {/* Footer Area */}
        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
          {/* Signature Box */}
          <div className="w-48 text-center border-t border-slate-300 pt-1">
            <p className="text-blue-900 font-bold text-[11px] leading-tight">Li Lar Nath</p>
            <p className="text-slate-500 text-[9px] font-bold">Accredited Gemologist</p>
            <p className="text-slate-500 text-[8px]">B.sc(Geol), AG(AIGS)</p>
          </div>

          {/* QR Code & Reg ID */}
          <div className="flex flex-col items-center gap-2">
             <div className="bg-white p-1 border border-slate-200">
               <QRCode value={verifyUrl} size={64} level="H" />
             </div>
             <p className="text-[8px] font-mono text-slate-400">Reg ID: {report.data_hash.substring(0, 32)}</p>
          </div>

          {/* Contact Info Footer */}
          <div className="text-right">
            <p className="text-[8px] font-bold text-slate-400 italic">No.(249) Aung Chang Thar, Mogok. PH: 09402524616</p>
          </div>
        </div>

        {/* Vertical Separator Line */}
        <div className="absolute left-[54%] top-[10%] bottom-[10%] w-[1px] bg-slate-100 border-r border-dashed border-red-600/20"></div>
      </div>

      <style>{`
        @media print {
          @page {
            size: A5 landscape;
            margin: 0;
          }
          body {
            -webkit-print-color-adjust: exact;
          }
          .print-container {
            width: 210mm;
            height: 148mm;
          }
          .navbar { display: none !important; }
        }
      `}</style>
    </div>
  );
});

GemReportPrint.displayName = 'GemReportPrint';
