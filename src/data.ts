import { UMKMProfile, Product, FinancialLog } from "./types";

export const INITIAL_UMKMS: UMKMProfile[] = [
  {
    id: "umkm-1",
    name: "Kripik Tempe Mbah Sri",
    category: "Kuliner & Camilan",
    ownerName: "Ibu Sri Rahayu",
    phone: "081234567890",
    address: "Jl. Merdeka No. 12, Ngawi, Jawa Timur",
    description: "Kripik tempe renyah legendaris yang dibuat secara tradisional dengan resep warisan keluarga sejak 1995. Tanpa bahan pengawet dan menggunakan bumbu rempah asli pilihan.",
    logo: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=200&h=200",
    banner: "https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?auto=format&fit=crop&q=80&w=1200&h=400",
    qrisCode: "00020101021126570014ID.CO.QRIS.WWW011893600012019230512302031230303UMI51190012",
    registeredAt: "2026-01-15T08:00:00Z"
  },
  {
    id: "umkm-2",
    name: "Batik Canting Solo",
    category: "Fashion & Pakaian",
    ownerName: "Bapak Joko Prasetyo",
    phone: "082187654321",
    address: "Kampung Batik Laweyan Gang 3 No. 45, Solo, Jawa Tengah",
    description: "Penyedia batik tulis dan batik cap tradisional bermotif klasik Solo dengan pewarna alami yang ramah lingkungan. Dikerjakan langsung oleh pengrajin lokal profesional.",
    logo: "https://images.unsplash.com/photo-1524295988897-55e7e2cf0222?auto=format&fit=crop&q=80&w=200&h=200",
    banner: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1200&h=400",
    qrisCode: "00020101021126570014ID.CO.QRIS.WWW011893600012019230512302031230303UMI51190013",
    registeredAt: "2026-02-10T10:30:00Z"
  },
  {
    id: "umkm-3",
    name: "Kopi Gayo Serambi",
    category: "Minuman & Biji Kopi",
    ownerName: "Teuku Iskandar",
    phone: "085211223344",
    address: "Jl. Datok Daud No. 8, Takengon, Aceh Tengah",
    description: "Biji kopi Arabika Gayo asli Single Origin kualitas premium. Dipanen langsung dari ketinggian 1.500 mdpl di dataran tinggi tanah Gayo dan dipanggang secara presisi.",
    logo: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=200&h=200",
    banner: "https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&q=80&w=1200&h=400",
    qrisCode: "00020101021126570014ID.CO.QRIS.WWW011893600012019230512302031230303UMI51190014",
    registeredAt: "2026-03-01T09:15:00Z"
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    umkmId: "umkm-1",
    name: "Kripik Tempe Rasa Original (200g)",
    price: 15000,
    stock: 85,
    description: "Kripik tempe super renyah rasa gurih bawang ketumbar alami. Kemasan ziplock kedap udara menjaga kegaringan hingga 3 bulan.",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400&h=400",
    category: "Camilan"
  },
  {
    id: "prod-2",
    umkmId: "umkm-1",
    name: "Kripik Tempe Pedas Jeruk (200g)",
    price: 18000,
    stock: 40,
    description: "Kripik tempe renyah dibalut bubuk cabai pedas alami dengan aroma harum daun jeruk purut segar.",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=400&h=400",
    category: "Camilan"
  },
  {
    id: "prod-3",
    umkmId: "umkm-2",
    name: "Kemeja Batik Tulis Motif Parang",
    price: 175000,
    stock: 12,
    description: "Kemeja batik katun premium pria lengan pendek bermotif Parang Kusumo khas Surakarta. Nyaman dipakai seharian.",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=400&h=400",
    category: "Fashion"
  },
  {
    id: "prod-4",
    umkmId: "umkm-2",
    name: "Syal Batik Sutra Motif Sogan",
    price: 125000,
    stock: 18,
    description: "Syal cantik bahan sutra halus bermotif batik Sogan Solo klasik. Cocok untuk aksesoris pakaian resmi maupun kasual.",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400&h=400",
    category: "Fashion"
  },
  {
    id: "prod-5",
    umkmId: "umkm-3",
    name: "Biji Kopi Arabika Gayo Roast (250g)",
    price: 65000,
    stock: 50,
    description: "Biji kopi Arabika Gayo utuh pilihan dengan profil pemanggangan Medium Roast. Menghadirkan rasa cokelat, rempah, dan keasaman yang seimbang.",
    image: "https://images.unsplash.com/photo-1497515114629-f71d768fd07c?auto=format&fit=crop&q=80&w=400&h=400",
    category: "Kopi & Minuman"
  },
  {
    id: "prod-6",
    umkmId: "umkm-3",
    name: "Kopi Gayo Bubuk Halus (250g)",
    price: 68000,
    stock: 35,
    description: "Kopi Arabika Gayo gilingan halus (Fine Ground) praktis untuk seduhan langsung cangkir tubruk, espresso, atau moka pot.",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=400&h=400",
    category: "Kopi & Minuman"
  }
];

export const INITIAL_LEDGER: FinancialLog[] = [
  {
    id: "log-1",
    type: "income",
    amount: 150000,
    category: "Penjualan Produk",
    description: "Terjual 10 bks Kripik Tempe Original",
    date: "2026-06-25T09:00:00Z",
    items: [{ name: "Kripik Tempe Rasa Original (200g)", qty: 10, price: 15000 }]
  },
  {
    id: "log-2",
    type: "expense",
    amount: 50000,
    category: "Belanja Bahan",
    description: "Beli kedelai dan ragi tempe tambahan",
    date: "2026-06-25T11:30:00Z"
  },
  {
    id: "log-3",
    type: "income",
    amount: 175000,
    category: "Penjualan Produk",
    description: "Pembelian Kemeja Batik Motif Parang",
    date: "2026-06-26T14:15:00Z",
    items: [{ name: "Kemeja Batik Tulis Motif Parang", qty: 1, price: 175000 }]
  },
  {
    id: "log-4",
    type: "expense",
    amount: 25000,
    category: "Operasional",
    description: "Beli bensin motor kirim pesanan batik",
    date: "2026-06-27T10:00:00Z"
  },
  {
    id: "log-5",
    type: "income",
    amount: 130000,
    category: "Penjualan Produk",
    description: "Terjual 2 bks Kopi Gayo Roast",
    date: "2026-06-28T16:45:00Z",
    items: [{ name: "Biji Kopi Arabika Gayo Roast (250g)", qty: 2, price: 65000 }]
  }
];

export const UMKM_CATEGORIES = [
  "Kuliner & Camilan",
  "Fashion & Pakaian",
  "Kriya & Kerajinan",
  "Kopi, Teh & Minuman",
  "Kecantikan & Kesehatan",
  "Pertanian & Kebun",
  "Jasa & Lainnya"
];

export const PRODUCT_CATEGORIES = [
  "Camilan",
  "Makanan Berat",
  "Minuman",
  "Kopi & Minuman",
  "Fashion",
  "Kerajinan",
  "Aksesoris",
  "Lain-lain"
];

export const LEDGER_CATEGORIES_INCOME = [
  "Penjualan Produk",
  "Modal Sendiri",
  "Pinjaman/Kredit",
  "Lain-lain"
];

export const LEDGER_CATEGORIES_EXPENSE = [
  "Belanja Bahan",
  "Operasional",
  "Gaji Karyawan",
  "Sewa Tempat",
  "Listrik, Air & Internet",
  "Pemasaran/Iklan",
  "Pajak & Retribusi",
  "Lain-lain"
];
