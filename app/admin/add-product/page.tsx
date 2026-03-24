"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  Upload, 
  X, 
  Save, 
  Image as ImageIcon, 
  ChevronLeft, 
  FileText,
  DollarSign,
  Layers,
  Zap,
  Tag,
  Ruler,
  Plus
} from "lucide-react";
import Image from "next/image";
import Swal from "sweetalert2";

export default function AddProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "Uncategorized",
    sizes: [] as string[],
    specifications: [{ key: "", value: "" }] as { key: string; value: string }[],
    is_high_demand: false,
    sold_today: 0,
    rating: 4.9,
    short_description: "",
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/auth");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role !== "admin") {
          router.push("/");
          return;
        }
        setAuthLoading(false);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/");
      }
    };
    checkAdmin();
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (images.length + selectedFiles.length > 5) {
        return Swal.fire({
          title: "Limit Exceeded",
          text: "Maximum 5 visual assets allowed per registry.",
          icon: "warning",
          confirmButtonColor: "#000",
          customClass: { popup: "rounded-[2rem] font-mono" }
        });
      }
      
      setImages(prev => [...prev, ...selectedFiles]);
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previews[index]);
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addSpecification = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, { key: "", value: "" }]
    }));
  };

  const removeSpecification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }));
  };

  const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...formData.specifications];
    newSpecs[index][field] = value;
    setFormData(prev => ({ ...prev, specifications: newSpecs }));
  };

  const toggleSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) 
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      return Swal.fire({
        title: "Missing Assets",
        text: "At least one visual artifact is required for registration.",
        icon: "error",
        confirmButtonColor: "#000",
        customClass: { popup: "rounded-[2rem] font-mono" }
      });
    }

    setLoading(true);
    try {
      const uploadedUrls: string[] = [];

      // 1. Upload Images to Storage
      for (const file of images) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("products")
          .getPublicUrl(filePath);
        
        uploadedUrls.push(publicUrl);
      }

      // 2. Insert Product to Database
      // image_url tetap diisi (foto utama), image_urls diisi array lengkap
      const { error: insertError } = await supabase
        .from("products")
        .insert({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          image_url: uploadedUrls[0],
          image_urls: uploadedUrls,
          category: formData.category,
          sizes: formData.sizes,
          specifications: formData.specifications.filter(s => s.key && s.value),
          is_high_demand: formData.is_high_demand,
          sold_today: parseInt(formData.sold_today.toString()) || 0,
          rating: parseFloat(formData.rating.toString()) || 4.9,
          short_description: formData.short_description,
        });

      if (insertError) throw insertError;

      await Swal.fire({
        title: "Registry Complete",
        text: "Product artifact successfully synchronized to vault.",
        icon: "success",
        confirmButtonColor: "#000",
        customClass: { popup: "rounded-[2rem] font-mono" }
      });

      router.push("/admin/dashboard");
    } catch (error: any) {
      console.error("Full Submission Error Object:", JSON.stringify(error, null, 2));
      console.error("Detailed Error Message:", error.message);
      console.error("Error Code/Status:", error.code || error.status || error.statusCode);
      
      let errorMessage = error.message || "Failed to commit changes to the registry.";
      let errorTitle = "Sync Failure";

      if (error.message?.includes("Bucket not found") || error.statusCode === "404" || error.code === "404") {
        errorTitle = "Storage Configuration Required";
        errorMessage = "The 'products' storage bucket was not found. Please create a public bucket named 'products' in your Supabase Dashboard.";
      } else if (error.message?.includes("row-level security") || error.code === "42501") {
        errorTitle = "Permission Denied";
        errorMessage = "Authentication or RLS policy failure. Ensure the 'products' bucket has public upload permissions or appropriate policies.";
      }

      Swal.fire({
        title: errorTitle,
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#000",
        customClass: { popup: "rounded-[2rem] font-mono" }
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FBFBFD] dark:bg-black flex items-center justify-center font-mono">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-zinc-200 dark:border-zinc-800 border-t-zinc-950 dark:border-t-white rounded-full"
        />
      </div>
    );
  }

  const inputClass = "w-full bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-6 py-4 text-xs font-bold text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700 outline-none focus:border-cyan-500/50 transition-all shadow-sm";
  const labelClass = "block text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-2 italic";

  return (
    <main className="min-h-screen bg-[#FBFBFD] dark:bg-black pt-24 pb-20 px-4 md:px-8 font-mono">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors mb-4 group"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[9px] font-black uppercase tracking-widest">Back to Registry</span>
            </button>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-zinc-950 dark:text-white mb-2 italic">
              New Product<span className="text-cyan-500">.</span>
            </h1>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em]">
              Injecting_New_Product_Into_Vault
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-2 rounded-full border border-zinc-100 dark:border-zinc-800 shadow-sm"
          >
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-600">
              <Zap size={18} />
            </div>
            <div className="pr-6">
              <p className="text-[8px] font-black uppercase text-zinc-400 leading-none mb-1">Status</p>
              <p className="text-[10px] font-black text-zinc-900 dark:text-white uppercase leading-none italic">Active</p>
            </div>
          </motion.div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Visual Assets */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-zinc-950 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-900 shadow-sm"
            >
              <div className="flex items-center justify-between mb-8">
                <label className={labelClass}>Visual Assets ({images.length}/5)</label>
                <ImageIcon className="text-zinc-200" size={16} />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <AnimatePresence>
                  {previews.map((src, i) => (
                    <motion.div
                      key={src}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="aspect-square rounded-3xl overflow-hidden relative border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 group"
                    >
                      <Image 
                        src={src} 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-700" 
                        alt="Artifact preview"
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <X className="text-white" size={24} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {images.length < 5 && (
                  <label 
                    className="aspect-square rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/50 border-2 border-dashed border-zinc-100 dark:border-zinc-800 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500/50 hover:bg-white dark:hover:bg-zinc-900 transition-all group overflow-hidden"
                  >
                    <input type="file" multiple onChange={handleImageChange} className="hidden" accept="image/*" />
                    <Upload size={24} className="text-zinc-300 group-hover:text-cyan-500 transition-all group-hover:-translate-y-1" />
                    <span className="text-[8px] font-black uppercase text-zinc-400 mt-2 tracking-widest group-hover:text-zinc-600 transition-colors">Add Media</span>
                  </label>
                )}
              </div>

              {images.length === 0 && (
                <div className="h-40 rounded-[2rem] bg-zinc-50/30 dark:bg-zinc-900/10 border-2 border-dashed border-zinc-100 dark:border-zinc-900 flex flex-col items-center justify-center text-zinc-300">
                  <ImageIcon size={32} strokeWidth={1} />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] mt-3">No Media</span>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-cyan-500/5 p-8 rounded-[2.5rem] border border-cyan-500/10"
            >
              <h4 className="text-[10px] font-black uppercase tracking-widest text-cyan-600 mb-2 italic">Security Notice</h4>
              <p className="text-[9px] font-bold text-zinc-500 leading-relaxed uppercase">
                All visual assets will be processed and encrypted within the vault storage. Ensure high definition artifacts for optimal display.
              </p>
            </motion.div>
          </div>

          {/* RIGHT: Product Data */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-zinc-950 p-10 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-900 shadow-sm"
            >
              <div className="space-y-8">
                <div>
                  <label className={labelClass}>Product Name</label>
                  <div className="relative">
                    <Package className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300" size={16} />
                    <input 
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`${inputClass} pl-14`}
                      placeholder="Enter Product Name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Price</label>
                    <div className="relative">
                      <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300" size={16} />
                      <input 
                        name="price"
                        type="number"
                        required
                        value={formData.price}
                        onChange={handleInputChange}
                        className={`${inputClass} pl-14`}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Stock Quantity</label>
                    <div className="relative">
                      <Layers className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300" size={16} />
                      <input 
                        name="stock"
                        type="number"
                        required
                        value={formData.stock}
                        onChange={handleInputChange}
                        className={`${inputClass} pl-14`}
                        placeholder="UNITS"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Category</label>
                  <div className="relative">
                    <Tag className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300" size={16} />
                    <select 
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={`${inputClass} pl-14 appearance-none cursor-pointer`}
                    >
                      <option value="APPAREL">APPAREL</option>
                      <option value="ACCESSORIES">ACCESSORIES</option>
                      <option value="FOOTWEAR">FOOTWEAR</option>
                      <option value="LIFESTYLE">LIFESTYLE</option>
                      <option value="Uncategorized">Uncategorized</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Sizes</label>
                  <div className="flex flex-wrap gap-3">
                    {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`min-w-[50px] h-12 rounded-xl text-[10px] font-black transition-all border-2 ${
                          formData.sizes.includes(size)
                            ? "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-zinc-950 dark:border-white shadow-lg"
                            : "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:border-zinc-300"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Detailed Specifications</label>
                  <div className="space-y-4 mb-6">
                    {formData.specifications.map((spec, index) => (
                      <div key={index} className="flex gap-4 items-center">
                        <input 
                          value={spec.key}
                          onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                          placeholder="LABEL (e.g. Material)"
                          className={`${inputClass} !py-3`}
                        />
                        <input 
                          value={spec.value}
                          onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                          placeholder="VALUE (e.g. 100% Cotton)"
                          className={`${inputClass} !py-3`}
                        />
                        <button 
                          type="button"
                          onClick={() => removeSpecification(index)}
                          className="p-3 text-zinc-300 hover:text-red-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <button 
                      type="button"
                      onClick={addSpecification}
                      className="text-[9px] font-black uppercase tracking-widest text-cyan-500 flex items-center gap-2 hover:gap-3 transition-all"
                    >
                      <Plus size={14} /> Add Specification
                    </button>
                  </div>
                </div>

                {/* URGENCY SETTINGS */}
                <div className="p-6 bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl border border-zinc-100 dark:border-zinc-800 space-y-6">
                   <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">High Demand Mode</h4>
                        <p className="text-[8px] text-zinc-400 font-bold uppercase mt-1">Enable urgency UI for this artifact</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="is_high_demand" checked={formData.is_high_demand} onChange={handleInputChange} className="sr-only peer" />
                        <div className="w-11 h-6 bg-zinc-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                   </div>

                   <div>
                      <label className={labelClass}>Total Terjual</label>
                      <input name="sold_today" type="number" value={formData.sold_today} onChange={handleInputChange} className={inputClass} placeholder="0" />
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className={labelClass}>Product Rating</label>
                        <input name="rating" type="number" step="0.1" min="0" max="5" value={formData.rating} onChange={handleInputChange} className={inputClass} placeholder="4.9" />
                      </div>
                      <div className="flex items-center gap-4 pt-6">
                        <span className="text-[10px] font-black text-yellow-500">★ ★ ★ ★ ★</span>
                        <span className="text-[8px] text-zinc-500 font-bold uppercase">Trust Level</span>
                      </div>
                   </div>

                   <div>
                      <label className={labelClass}>Short Description_(Visual Hook)</label>
                      <textarea name="short_description" value={formData.short_description} onChange={handleInputChange} className={`${inputClass} min-h-[80px] py-4`} placeholder="Tactical silhouette engineered for urban survival..." />
                   </div>
                </div>

                <div>
                  <label className={labelClass}>Full Description</label>
                  <div className="relative">
                    <FileText className="absolute left-6 top-8 text-zinc-300" size={16} />
                    <textarea 
                      name="description"
                      required
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={5}
                      className={`${inputClass} pl-14 resize-none`}
                      placeholder="PROVIDE_Detailed Specifications_AND_GENERAL_CONTEXT..."
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-6 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-full font-black uppercase tracking-[0.4em] text-[11px] hover:shadow-2xl hover:shadow-black/20 dark:hover:shadow-white/10 transition-all flex items-center justify-center gap-4 disabled:opacity-50 active:scale-[0.98] group"
                >
                  <Save size={18} className="group-hover:-translate-y-1 transition-transform" />
                  {loading ? "Saving..." : "Save Product"}
                </button>
              </div>
            </motion.div>
          </div>

        </form>
      </div>
    </main>
  );
}
