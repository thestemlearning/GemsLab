import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Gem, Loader2, Mail, Lock } from 'lucide-react';
import { motion } from 'motion/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl shadow-slate-200 border border-slate-200 p-10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-slate-900 rounded-xl flex items-center justify-center shadow-xl shadow-slate-200 mb-4 transform -rotate-3 group hover:rotate-0 transition-transform">
            <Gem size={28} className="text-emerald-500" />
          </div>
          <h1 className="font-bold text-2xl tracking-tight text-slate-900">GEMS LAB</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Authorized Access Only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Terminal ID (Email)</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-sm font-medium"
                placeholder="admin@gemslab.tsg"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Access Protocol (Pass)</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-sm font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold text-sm shadow-xl shadow-slate-200 flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Initialize Session'}
          </button>
        </form>

        <div className="mt-10 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">
            <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
            Secured via SHA-256 Protocol
          </div>
        </div>
      </motion.div>
    </div>
  );
}
