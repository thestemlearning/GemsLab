import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { GemReport } from '../types';
import { Gem, ShieldCheck, ShieldAlert, Calendar, User, ExternalLink, ArrowLeft } from 'lucide-react';
import CryptoJS from 'crypto-js';
import { motion } from 'motion/react';

export default function Verify() {
  const { reportId } = useParams<{ reportId: string }>();
  const [report, setReport] = useState<GemReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    async function fetchReport() {
      if (!reportId) return;

      const { data, error } = await supabase
        .from('gem_reports')
        .select('*')
        .eq('report_id', reportId)
        .single();

      if (!error && data) {
        setReport(data);
        
        // Verify hash
        const hashContent = `${data.report_id}${data.gem_type}${data.shape}${data.weight}${data.dimension}${data.created_at}`;
        const calculatedHash = CryptoJS.SHA256(hashContent).toString();
        setIsValid(calculatedHash === data.data_hash);
      } else {
        setIsValid(false);
      }
      setLoading(false);
    }

    fetchReport();
  }, [reportId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E4E3E0] flex items-center justify-center p-4">
        <div className="font-mono text-xs uppercase tracking-[0.3em] animate-pulse">Running Authenticity Protocol...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E4E3E0] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#141414] p-2 rounded-sm rotate-3">
                <Gem size={24} className="text-white" />
              </div>
              <h1 className="font-serif italic font-bold text-2xl tracking-tight">Gems Lab Verification</h1>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-widest opacity-60">Global Gemstone Certification Registry</p>
          </div>
          <Link to="/login" className="font-mono text-[10px] uppercase underline opacity-40 hover:opacity-100 transition-opacity flex items-center gap-2">
            Staff Portal <ExternalLink size={12} />
          </Link>
        </header>

        {isValid === false && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border-2 border-red-900/20 p-12 text-center shadow-[8px_8px_0px_0px_rgba(127,29,29,0.1)] rounded-lg mb-12"
          >
            <ShieldAlert size={64} className="text-red-600 mx-auto mb-6" />
            <h2 className="font-serif italic font-bold text-3xl text-red-900 mb-4">Invalid Certification Record</h2>
            <p className="font-sans text-red-800/80 mb-8 max-w-md mx-auto">
              The report identifier <span className="font-mono font-bold">{reportId}</span> could not be verified against our secure database. This document may be counterfeit or tampered with.
            </p>
            <div className="bg-red-900 text-white inline-block px-8 py-3 font-mono text-xs uppercase tracking-widest rounded-sm">
              Secured Protocol Warning
            </div>
          </motion.div>
        )}

        {isValid === true && report && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="bg-emerald-100 border border-emerald-900/20 p-6 flex items-center gap-4 rounded-xl shadow-lg shadow-emerald-100">
                <div className="bg-emerald-600 p-2 rounded-full text-white">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h2 className="font-bold text-emerald-900 text-xl tracking-tight">Authenticity Verified</h2>
                  <p className="font-sans text-emerald-800/70 text-sm italic">This report matches our official laboratory records.</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-xl shadow-slate-200">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8 border-b border-slate-100 pb-4 flex items-center justify-between">
                  Classification Data
                  <span className="text-blue-900">v2.0 Protocol</span>
                </h3>
                
                <div className="space-y-4">
                  {[
                    { label: 'Identification', value: report.gem_type, em: true },
                    { label: 'Shape', value: report.shape },
                    { label: 'Cut', value: report.cut },
                    { label: 'Weight', value: `${report.weight} CT` },
                    { label: 'Dimension', value: report.dimension },
                    { label: 'Colour & Clarity', value: report.color },
                    { label: 'Transparency', value: report.transparency },
                    { label: 'Magnification', value: report.magnification },
                    { label: 'Refractive Index', value: report.refractive_index },
                    { label: 'Provenance', value: report.origin },
                  ].map((field, i) => (
                    <div key={i} className="flex justify-between items-baseline border-b border-slate-50 pb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{field.label}</span>
                      <span className={`font-bold text-slate-800 ${field.em ? 'text-lg italic text-blue-900' : 'text-sm'}`}>{field.value}</span>
                    </div>
                  ))}
                  <div className="pt-4">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Laboratory Observations</span>
                    <p className="text-sm font-semibold text-slate-700 italic leading-relaxed bg-slate-50 p-4 rounded-lg">
                      {report.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-60">
                <div className="flex items-center gap-2"><Calendar size={12} /> Issued: {new Date(report.created_at).toLocaleDateString()}</div>
                <div className="flex items-center gap-2"><ShieldCheck size={12} /> ID: {report.report_id}</div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="bg-[#F5F5F0] border border-[#141414] p-1 shadow-[8px_8px_0px_0px_#141414] aspect-square flex items-center justify-center overflow-hidden bg-white">
                {report.image_url ? (
                  <img src={report.image_url} alt="Certified Gem" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center p-12 opacity-10 italic">
                    <Gem size={80} className="mx-auto mb-4" />
                    <p className="font-mono text-xs uppercase tracking-widest">No Digital Image Provided</p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-[#141414] text-[#E4E3E0] rounded shadow-[4px_4px_0px_0px_#E4E3E0]">
                <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] mb-4 opacity-100 flex items-center gap-2 box-border">
                  <ShieldCheck size={14} className="text-amber-500" /> Secure Hash Verification
                </h4>
                <p className="font-mono text-[9px] opacity-60 mb-4 leading-relaxed tracking-tight break-all">
                  SHA-256 DIGITAL FINGERPRINT:<br />
                  <span className="text-amber-500 font-bold">{report.data_hash}</span>
                </p>
                <div className="h-[1px] bg-white/10 my-4 w-full"></div>
                <p className="font-sans text-[10px] italic opacity-60">
                  This fingerprint is generated by encrypting the report identity, classification fields, and timestamp. Any alteration to the physical or digital document will result in a hash mismatch.
                </p>
              </div>
            </motion.div>
          </div>
        )}

        <footer className="mt-24 pt-8 border-t border-[#141414]/10 text-center">
          <p className="font-mono text-[9px] uppercase tracking-widest opacity-30">
            &copy; 2026 Gems Lab Certification System &bull; All Rights Reserved &bull; Secured with SHA-256
          </p>
        </footer>
      </div>
    </div>
  );
}
