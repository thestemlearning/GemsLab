import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { GemReport } from '../types';
import { Search, Loader2, Filter, ChevronDown, Gem } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function Reports() {
  const { profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<GemReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredReports, setFilteredReports] = useState<GemReport[]>([]);

  useEffect(() => {
    async function fetchReports() {
      let query = supabase.from('gem_reports').select('*');
      
      if (!isAdmin && profile) {
        query = query.eq('created_by', profile.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (!error && data) {
        setReports(data);
        setFilteredReports(data);
      }
      setLoading(false);
    }

    fetchReports();
  }, [isAdmin, profile]);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = reports.filter(r => 
      r.report_id.toLowerCase().includes(term) ||
      r.client_name.toLowerCase().includes(term) ||
      r.gem_type.toLowerCase().includes(term)
    );
    setFilteredReports(filtered);
  }, [searchTerm, reports]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
        <h1 className="text-xl font-bold text-slate-800">Certification Registry</h1>
        <div className="flex gap-4">
          <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded border border-slate-200 uppercase">
            ARCHIVES ACCESS: {isAdmin ? 'UNRESTRICTED' : 'OPERATOR'}
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search report ID, client, or gemstone..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm outline-none focus:border-emerald-500 transition-all text-sm font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {filteredReports.length} Active Records
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {loading ? (
                <div className="col-span-full py-24 flex flex-col items-center justify-center opacity-40">
                  <Loader2 className="animate-spin mb-4" size={32} />
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Querying secure records...</p>
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="col-span-full py-24 flex flex-col items-center justify-center opacity-40 border-2 border-dashed border-slate-200 rounded-2xl">
                  <p className="text-lg font-semibold text-slate-600 mb-2">No matching registry entries discovered</p>
                  <p className="text-sm font-medium text-slate-400">Please refine your search criteria</p>
                </div>
              ) : (
                filteredReports.map((report, idx) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    layout
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col"
                  >
                    <div className="aspect-[4/3] bg-slate-50 border-b border-slate-100 relative group overflow-hidden flex items-center justify-center">
                      {report.image_url ? (
                        <img src={report.image_url} alt="Gem" className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <Gem size={48} className="text-slate-200" />
                      )}
                      <div className="absolute top-4 left-4 bg-slate-900 text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest shadow-lg">
                        {report.report_id}
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex-1">
                        <h3 className="font-serif italic font-bold text-xl text-slate-900 mb-1 leading-tight">{report.gem_type}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">{report.client_name}</p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Standard Weight</div>
                            <div className="text-sm font-bold text-slate-800">{report.weight} CT</div>
                          </div>
                          <div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Verified Origin</div>
                            <div className="text-sm font-serif italic font-semibold text-slate-800">{report.origin}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{new Date(report.created_at).toLocaleDateString()}</span>
                        <button 
                          onClick={() => navigate(`/reprint?id=${report.report_id}`)}
                          className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-widest underline underline-offset-4 decoration-emerald-200"
                        >
                          View Certificate
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
