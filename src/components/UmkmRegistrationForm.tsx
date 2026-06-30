import React, { useState } from "react";
import { Store, User, Phone, MapPin, AlignLeft, ShieldCheck, Check, Sparkles, RefreshCw } from "lucide-react";
import { UMKMProfile } from "../types";
import { UMKM_CATEGORIES } from "../data";

interface UmkmRegistrationFormProps {
  onRegister: (newUmkm: UMKMProfile) => void;
  onCancel: () => void;
}

const PRESET_LOGOS = [
  "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=200&h=200", // culinary
  "https://images.unsplash.com/photo-1524295988897-55e7e2cf0222?auto=format&fit=crop&q=80&w=200&h=200", // fashion
  "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=200&h=200", // coffee
  "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=200&h=200", // handicraft
  "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=200&h=200", // electronics
  "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&q=80&w=200&h=200"  // generic retail
];

const PRESET_BANNERS = [
  "https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?auto=format&fit=crop&q=80&w=1200&h=400", // culinary
  "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1200&h=400", // fashion
  "https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&q=80&w=1200&h=400", // coffee
  "https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&q=80&w=1200&h=400", // handicraft
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1200&h=400"  // generic product
];

export default function UmkmRegistrationForm({ onRegister, onCancel }: UmkmRegistrationFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    ownerName: "",
    category: UMKM_CATEGORIES[0],
    phone: "",
    address: "",
    description: "",
  });

  const [selectedLogoIdx, setSelectedLogoIdx] = useState(0);
  const [selectedBannerIdx, setSelectedBannerIdx] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.ownerName || !formData.phone || !formData.address) {
      alert("Harap lengkapi semua field utama (Nama Usaha, Pemilik, No. WA, dan Alamat)!");
      return;
    }

    const newUmkm: UMKMProfile = {
      id: `umkm-${Date.now()}`,
      name: formData.name,
      category: formData.category,
      ownerName: formData.ownerName,
      phone: formData.phone,
      address: formData.address,
      description: formData.description || `Kami menyediakan produk ${formData.category} kualitas terbaik untuk Anda.`,
      logo: PRESET_LOGOS[selectedLogoIdx],
      banner: PRESET_BANNERS[selectedBannerIdx],
      qrisCode: `00020101021126570014ID.CO.QRIS.WWW011893600012019230512302031230303UMI${Math.floor(100000 + Math.random() * 900000)}`,
      registeredAt: new Date().toISOString()
    };

    setIsSuccess(true);
    setTimeout(() => {
      onRegister(newUmkm);
    }, 1200);
  };

  const handleSuggestTheme = () => {
    // Dynamically pair logo and banner indices based on category
    const cat = formData.category.toLowerCase();
    if (cat.includes("kuliner") || cat.includes("camilan")) {
      setSelectedLogoIdx(0);
      setSelectedBannerIdx(0);
    } else if (cat.includes("fashion") || cat.includes("pakaian")) {
      setSelectedLogoIdx(1);
      setSelectedBannerIdx(1);
    } else if (cat.includes("kopi") || cat.includes("minuman")) {
      setSelectedLogoIdx(2);
      setSelectedBannerIdx(2);
    } else if (cat.includes("kriya") || cat.includes("kerajinan")) {
      setSelectedLogoIdx(3);
      setSelectedBannerIdx(3);
    } else {
      setSelectedLogoIdx(5);
      setSelectedBannerIdx(4);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl shadow-lg border border-emerald-100 max-w-lg mx-auto my-8">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <ShieldCheck className="w-10 h-10 text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Pendaftaran Berhasil!</h3>
        <p className="text-slate-500 text-sm">
          Selamat! UMKM Anda <span className="font-semibold text-emerald-600">{formData.name}</span> berhasil didaftarkan secara digital. Menyiapkan dasbor Anda...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden max-w-3xl mx-auto">
      {/* Banner / Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white relative">
        <div className="flex items-center gap-3">
          <Store className="w-8 h-8 text-emerald-200" />
          <div>
            <h2 className="text-2xl font-bold">Daftarkan UMKM Anda</h2>
            <p className="text-emerald-100 text-sm mt-0.5">Mulai kelola usaha dan berjualan online hari ini!</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
        {/* Step 1: Profil Bisnis */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <span>1. Profil Usaha</span>
            <span className="h-px bg-slate-100 flex-1"></span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Usaha/Toko <span className="text-red-500">*</span></label>
              <div className="relative">
                <Store className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kripik Tempe Mbah Sri"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50/50 border border-slate-200 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Kategori Usaha</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-50/50 border border-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
              >
                {UMKM_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Pemilik <span className="text-red-500">*</span></label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ibu Sri Rahayu"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full bg-slate-50/50 border border-slate-200 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">No. WhatsApp Aktif <span className="text-red-500">*</span></label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 081234567890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-50/50 border border-slate-200 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Alamat Lengkap Usaha <span className="text-red-500">*</span></label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <textarea
                required
                rows={2}
                placeholder="Jl. Merdeka No. 12, Ngawi, Jawa Timur"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-50/50 border border-slate-200 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors resize-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Deskripsi Singkat Usaha</label>
            <div className="relative">
              <AlignLeft className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <textarea
                rows={3}
                placeholder="Jelaskan secara singkat apa keunikan produk Anda agar pembeli tertarik..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-50/50 border border-slate-200 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Desain Visual */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 flex-1">
              <span>2. Tema & Visual Toko</span>
              <span className="h-px bg-slate-100 flex-1"></span>
            </h3>
            <button
              type="button"
              onClick={handleSuggestTheme}
              className="text-xs text-emerald-600 font-semibold flex items-center gap-1 hover:text-emerald-700 transition-colors cursor-pointer bg-emerald-50 px-2 py-1 rounded-lg"
            >
              <Sparkles className="w-3.5 h-3.5" /> Sesuaikan dengan Kategori
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Pilih Foto Logo Usaha</label>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_LOGOS.map((logo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedLogoIdx(idx)}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                      selectedLogoIdx === idx ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={logo} alt={`Logo preset ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    {selectedLogoIdx === idx && (
                      <div className="absolute inset-0 bg-emerald-600/30 flex items-center justify-center">
                        <Check className="w-6 h-6 text-white drop-shadow-sm" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Pilih Banner Banner Toko</label>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_BANNERS.map((banner, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedBannerIdx(idx)}
                    className={`relative rounded-xl overflow-hidden aspect-video border-2 transition-all cursor-pointer ${
                      selectedBannerIdx === idx ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={banner} alt={`Banner preset ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    {selectedBannerIdx === idx && (
                      <div className="absolute inset-0 bg-emerald-600/30 flex items-center justify-center">
                        <Check className="w-6 h-6 text-white drop-shadow-sm" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-medium rounded-xl border border-slate-200 cursor-pointer transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-600/10 hover:shadow-lg cursor-pointer transition-all flex items-center gap-1.5"
          >
            Daftarkan Sekarang <Check className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
