import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { GemReport } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, FileText, Search, Activity, User, Shield } from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, recent: [] as GemReport[] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      let query = supabase.from('gem_reports').select('*', { count: 'exact' });
      
      if (!isAdmin && profile) {
        query = query.eq('created_by', profile.id);
      }

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error) {
        setStats({ total: count || 0, recent: data || [] });
      }
      setLoading(false);
    }

    fetchStats();
  }, [isAdmin, profile]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
        <h1 className="text-xl font-bold text-slate-800">Laboratory Dashboard</h1>
        <div className="flex gap-4">
          <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-200 uppercase">
            SECURED {isAdmin ? 'ADMIN' : 'OPERATOR'} ACCESS
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Reports</span>
              <Activity size={18} className="text-emerald-500" />
            </div>
            <div className="text-4xl font-bold text-slate-900">{loading ? '...' : stats.total}</div>
            <p className="mt-2 text-xs text-slate-500 font-medium tracking-tight">Verified registry entries</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">System User</span>
              <User size={18} className="text-slate-400" />
            </div>
            <p className="text-sm font-semibold truncate text-slate-900 mb-2">{profile?.email}</p>
            <div className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded inline-block uppercase tracking-wider font-bold">
              {profile?.role}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Quick Actions</span>
              <Shield size={18} className="text-amber-500" />
            </div>
            <div className="flex gap-3">
              <Link to="/new-report" className="bg-emerald-600 text-white p-2.5 rounded-lg hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-200/50">
                <Plus size={20} />
              </Link>
              <Link to="/reports" className="bg-slate-800 text-white p-2.5 rounded-lg hover:bg-slate-700 transition-colors shadow-md shadow-slate-200/50">
                <FileText size={20} />
              </Link>
              <Link to="/reprint" className="bg-white text-slate-600 border border-slate-200 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                <Search size={20} />
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Certifications</h2>
            <Link to="/reports" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-4 decoration-emerald-200">View Archives</Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-[10px] uppercase font-bold text-slate-400 tracking-widest p-4 px-6">Report ID</th>
                  <th className="text-[10px] uppercase font-bold text-slate-400 tracking-widest p-4 px-6">Classification</th>
                  <th className="text-[10px] uppercase font-bold text-slate-400 tracking-widest p-4 px-6">Weight</th>
                  <th className="text-[10px] uppercase font-bold text-slate-400 tracking-widest p-4 px-6">Issued On</th>
                  <th className="text-[10px] uppercase font-bold text-slate-400 tracking-widest p-4 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400 italic text-sm">Querying secure registry entries...</td>
                  </tr>
                ) : stats.recent.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400 italic text-sm">No recent records detected in the vault.</td>
                  </tr>
                ) : (
                  stats.recent.map((report) => (
                    <tr 
                      key={report.id} 
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group" 
                      onClick={() => navigate(`/reprint?id=${report.report_id}`)}
                    >
                      <td className="p-4 px-6">
                        <span className="font-mono text-[11px] font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                          {report.report_id}
                        </span>
                      </td>
                      <td className="p-4 px-6 font-serif italic text-slate-800 font-semibold">{report.gem_type}</td>
                      <td className="p-4 px-6 text-sm font-medium text-slate-600">{report.weight} CT</td>
                      <td className="p-4 px-6 text-xs text-slate-400 font-medium">{new Date(report.created_at).toLocaleDateString()}</td>
                      <td className="p-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                          Verified
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
