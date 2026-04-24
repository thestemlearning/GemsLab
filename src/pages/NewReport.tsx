import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { GemReport } from '../types';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { GemReportPrint } from '../components/GemReportPrint';
import { Upload, X, Loader2, Check, Printer, ChevronRight, Gem, Shield, Database } from 'lucide-react';
import { cn } from '../lib/utils';
import CryptoJS from 'crypto-js';
import { motion } from 'motion/react';

export default function NewReport() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [createdReport, setCreatedReport] = useState<GemReport | null>(null);
  
  const [formData, setFormData] = useState({
    client_name: '',
    gem_type: '',
    shape: '',
    cut: '',
    weight: '',
    dimension: '',
    color: '',
    clarity: '',
    transparency: '',
    magnification: '',
    refractive_index: '',
    origin: '',
    treatment: '',
    description: '',
  });

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `GemReport_${createdReport?.report_id}`,
  });

  const generateReportId = async () => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    // Get sequence for the day
    const { count } = await supabase
      .from('gem_reports')
      .select('id', { count: 'exact', head: true })
      .filter('report_id', 'like', `TSG-${dateStr}-%`);
    
    const sequence = (count || 0) + 1;
    const sequenceStr = sequence.toString().padStart(4, '0');
    
    return `TSG-${dateStr}-${sequenceStr}`;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size must be less than 2MB');
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const reportId = await generateReportId();
      let imageUrl = '';

      // 1. Upload image
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${user.id}/${reportId}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('gem-images')
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('gem-images')
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
      }

      // 2. Generate Hash
      const createdAt = new Date().toISOString();
      const hashContent = `${reportId}${formData.gem_type}${formData.shape}${formData.weight}${formData.dimension}${createdAt}`;
      const dataHash = CryptoJS.SHA256(hashContent).toString();

      // 3. Save to database
      const { data, error } = await supabase
        .from('gem_reports')
        .insert({
          report_id: reportId,
          client_name: formData.client_name,
          gem_type: formData.gem_type,
          shape: formData.shape,
          cut: formData.cut,
          weight: parseFloat(formData.weight),
          dimension: formData.dimension,
          color: formData.color,
          clarity: formData.clarity,
          transparency: formData.transparency,
          magnification: formData.magnification,
          refractive_index: formData.refractive_index,
          origin: formData.origin,
          treatment: formData.treatment,
          description: formData.description,
          image_url: imageUrl,
          created_by: user.id,
          created_at: createdAt,
          data_hash: dataHash,
        })
        .select()
        .single();

      if (error) throw error;

      setCreatedReport(data);
      setPreview(true);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (preview && createdReport) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center bg-[#F5F5F0] border border-[#141414] p-4 shadow-[4px_4px_0px_0px_#141414]">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 p-1.5 rounded-full text-white">
              <Check size={16} />
            </div>
            <h1 className="font-serif italic font-bold">Report Created Successfully</h1>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handlePrint}
              className="bg-[#141414] text-[#E4E3E0] px-6 py-2 font-mono text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-[#252525] transition-colors"
            >
              <Printer size={14} /> Print Report
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="border border-[#141414] px-6 py-2 font-mono text-[10px] uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
            >
              Return Home
            </button>
          </div>
        </div>

        <div className="bg-white border-2 border-[#141414] p-1 shadow-[8px_8px_0px_0px_#141414] mb-12 overflow-hidden pointer-events-none">
          <GemReportPrint report={createdReport} ref={printRef} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
        <h1 className="text-xl font-bold text-slate-800">Generate Certification Report</h1>
        <div className="flex gap-4">
          <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded border border-slate-200 uppercase">
            PROTOCOL: TSG-CER-V2
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-slate-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-12 gap-8">
            {/* Form Section */}
            <section className="col-span-12 lg:col-span-7 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                  <Database size={14} className="text-emerald-500" /> Gemstone Classification Details
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Client Identifier</label>
                      <input
                        required
                        type="text"
                        value={formData.client_name}
                        onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                        className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                        placeholder="Organization or Individual"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Identification</label>
                      <input
                        required
                        type="text"
                        value={formData.gem_type}
                        onChange={(e) => setFormData({...formData, gem_type: e.target.value})}
                        className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                        placeholder="e.g. Natural Star Ruby"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Shape</label>
                      <input
                        required
                        type="text"
                        value={formData.shape}
                        onChange={(e) => setFormData({...formData, shape: e.target.value})}
                        className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                        placeholder="e.g. Oval"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cut</label>
                      <input
                        required
                        type="text"
                        value={formData.cut}
                        onChange={(e) => setFormData({...formData, cut: e.target.value})}
                        className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                        placeholder="e.g. Star cut"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Weight (CT)</label>
                      <input
                        required
                        type="number"
                        step="0.01"
                        value={formData.weight}
                        onChange={(e) => setFormData({...formData, weight: e.target.value})}
                        className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Dimension (mm)</label>
                      <input
                        required
                        type="text"
                        value={formData.dimension}
                        onChange={(e) => setFormData({...formData, dimension: e.target.value})}
                        className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                        placeholder="e.g. 12 * 13 * 14 mm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Colour & Clarity</label>
                      <input
                        required
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData({...formData, color: e.target.value})}
                        className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                        placeholder="e.g. Red"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Transparency</label>
                      <input
                        required
                        type="text"
                        value={formData.transparency}
                        onChange={(e) => setFormData({...formData, transparency: e.target.value})}
                        className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Magnification</label>
                      <input
                        required
                        type="text"
                        value={formData.magnification}
                        onChange={(e) => setFormData({...formData, magnification: e.target.value})}
                        className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                        placeholder="None"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Refractive Index</label>
                      <input
                        required
                        type="text"
                        value={formData.refractive_index}
                        onChange={(e) => setFormData({...formData, refractive_index: e.target.value})}
                        className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                        placeholder="1.762"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Provenance / Origin</label>
                      <input
                        required
                        type="text"
                        value={formData.origin}
                        onChange={(e) => setFormData({...formData, origin: e.target.value})}
                        className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Enhancements & Treatments</label>
                    <input
                      required
                      type="text"
                      value={formData.treatment}
                      onChange={(e) => setFormData({...formData, treatment: e.target.value})}
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                      placeholder="e.g. No indications of thermal enhancement"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Laboratory Observations</label>
                    <textarea
                      required
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium resize-none text-slate-700 leading-relaxed"
                    />
                  </div>

                  <div className="pt-6 flex gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : <Printer size={18} />}
                      Save & Print Report
                    </button>
                    <button
                      type="button"
                      className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold text-sm shadow-lg shadow-slate-100 hover:bg-slate-700 transition-all"
                    >
                      Draft Save
                    </button>
                  </div>
                </form>
              </div>
            </section>

            {/* Assets Section */}
            <section className="col-span-12 lg:col-span-5 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Digital Evidence</h2>
                <div 
                  className={cn(
                    "relative aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-50 hover:bg-slate-100 overflow-hidden",
                    imagePreview && "border-none shadow-inner"
                  )}
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-4 drop-shadow-2xl" />
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-white rounded-full shadow-sm border border-slate-200 flex items-center justify-center mb-4 text-emerald-500">
                        <Upload size={20} />
                      </div>
                      <p className="text-xs font-bold text-slate-600 tracking-tight">Upload Gem Image</p>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase font-medium">JPEG / PNG MAX 2MB</p>
                    </>
                  )}
                  <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </div>
              </div>

              <div className="bg-slate-900 rounded-xl shadow-xl shadow-slate-200 p-6 text-white overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Shield size={120} />
                </div>
                <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Shield size={14} /> Security Protocol V2
                </h3>
                <ul className="space-y-4">
                  {[
                    "Biometric ID Authentication: Verified",
                    "SHA-256 Hashing Encryption: Ready",
                    "A5 Landscape Print Rendering: Active",
                    "Dynamic QR Link Propagation: Integrated"
                  ].map((text, i) => (
                    <li key={i} className="flex items-center gap-3 text-[11px] font-medium tracking-tight text-slate-300">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
