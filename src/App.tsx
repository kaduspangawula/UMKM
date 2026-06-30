import React, { useState, useEffect } from "react";
import {
  Store,
  TrendingUp,
  Package,
  FileText,
  Search,
  ShoppingCart,
  User,
  Plus,
  ArrowRightLeft,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Smartphone,
  ChevronRight,
  MessageSquare,
  Sparkles,
  DollarSign,
  Briefcase,
  X,
  PlusCircle,
  MinusCircle,
  Clock,
  Filter,
  Trash2,
  Settings,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { UMKMProfile, Product, FinancialLog, Transaction, CartItem } from "./types";
import {
  INITIAL_UMKMS,
  INITIAL_PRODUCTS,
  INITIAL_LEDGER,
  UMKM_CATEGORIES,
  PRODUCT_CATEGORIES,
  LEDGER_CATEGORIES_INCOME,
  LEDGER_CATEGORIES_EXPENSE,
} from "./data";

import AiAssistantWidget from "./components/AiAssistantWidget";
import UmkmRegistrationForm from "./components/UmkmRegistrationForm";

export default function App() {
  // --- Persistent State ---
  const [umkms, setUmkms] = useState<UMKMProfile[]>(() => {
    const saved = localStorage.getItem("umkm_list");
    return saved ? JSON.parse(saved) : INITIAL_UMKMS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem("product_list");
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [ledger, setLedger] = useState<FinancialLog[]>(() => {
    const saved = localStorage.getItem("ledger_list");
    return saved ? JSON.parse(saved) : INITIAL_LEDGER;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("transaction_list");
    return saved ? JSON.parse(saved) : [];
  });

  // Active UMKM Profile for Merchant view
  const [activeUmkmId, setActiveUmkmId] = useState<string>(() => {
    const saved = localStorage.getItem("active_umkm_id");
    return saved || "umkm-1";
  });

  // --- UI Navigation State ---
  const [appMode, setAppMode] = useState<"buyer" | "merchant">("buyer");
  const [merchantTab, setMerchantTab] = useState<"dashboard" | "inventory" | "ledger" | "settings">("dashboard");
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  // --- Buyer / Marketplace State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [selectedUmkmFilter, setSelectedUmkmFilter] = useState<string>("Semua");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // --- Checkout / Order state ---
  const [customerName, setCustomerName] = useState("");
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<"QRIS" | "Tunai">("QRIS");
  const [activeCheckoutTx, setActiveCheckoutTx] = useState<Transaction | null>(null);
  const [paymentSimulationStep, setPaymentSimulationStep] = useState<"pending" | "scanning" | "success">("pending");

  // --- Add Transaction manually in Merchant view ---
  const [isManualTxOpen, setIsManualTxOpen] = useState(false);
  const [manualTxType, setManualTxType] = useState<"income" | "expense">("income");
  const [manualTxData, setManualTxData] = useState({
    amount: "",
    category: "",
    description: "",
  });

  // --- Add Product manually in Merchant view ---
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [newProductData, setNewProductData] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
    category: PRODUCT_CATEGORIES[0],
    imageIdx: 0,
  });

  // Sample placeholder images for new products
  const PRODUCT_IMAGE_PRESETS = [
    "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=300&h=300", // Craft
    "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=300&h=300", // Culinary
    "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&q=80&w=300&h=300", // Retail
    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=300&h=300", // Drink
    "https://images.unsplash.com/photo-1524295988897-55e7e2cf0222?auto=format&fit=crop&q=80&w=300&h=300", // Clothes
  ];

  // Sync to LocalStorage on changes
  useEffect(() => {
    localStorage.setItem("umkm_list", JSON.stringify(umkms));
  }, [umkms]);

  useEffect(() => {
    localStorage.setItem("product_list", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("ledger_list", JSON.stringify(ledger));
  }, [ledger]);

  useEffect(() => {
    localStorage.setItem("transaction_list", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("active_umkm_id", activeUmkmId);
  }, [activeUmkmId]);

  // Default category on manual transactions when toggle types
  useEffect(() => {
    setManualTxData((prev) => ({
      ...prev,
      category: manualTxType === "income" ? LEDGER_CATEGORIES_INCOME[0] : LEDGER_CATEGORIES_EXPENSE[0],
    }));
  }, [manualTxType]);

  const activeUmkm = umkms.find((u) => u.id === activeUmkmId) || umkms[0];

  // --- Handlers ---
  const handleRegisterUmkm = (newUmkm: UMKMProfile) => {
    setUmkms((prev) => [newUmkm, ...prev]);
    setActiveUmkmId(newUmkm.id);
    setShowRegisterForm(false);
    setAppMode("merchant");
    setMerchantTab("dashboard");
  };

  const handleApplyTransactionFromAi = (aiTx: any) => {
    const newLog: FinancialLog = {
      id: `log-${Date.now()}`,
      type: aiTx.type,
      amount: Number(aiTx.amount),
      category: aiTx.category || (aiTx.type === "income" ? "Penjualan Produk" : "Belanja Bahan"),
      description: aiTx.description,
      date: new Date().toISOString(),
      items: aiTx.items,
    };

    setLedger((prev) => [newLog, ...prev]);

    // If there are specific items and it's a sale, reduce stock
    if (aiTx.type === "income" && aiTx.items) {
      aiTx.items.forEach((item: any) => {
        setProducts((prevProd) =>
          prevProd.map((p) => {
            if (p.umkmId === activeUmkmId && p.name.toLowerCase().includes(item.name.toLowerCase())) {
              const newStock = Math.max(0, p.stock - item.qty);
              return { ...p, stock: newStock };
            }
            return p;
          })
        );
      });
    }
  };

  const handleApplyInventoryActionFromAi = (aiInv: any) => {
    if (aiInv.action === "add") {
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        umkmId: activeUmkmId,
        name: aiInv.name,
        price: Number(aiInv.price) || 10000,
        stock: Number(aiInv.stock) || 10,
        description: `Produk baru ${aiInv.name} yang ditambahkan via Asisten AI.`,
        image: PRODUCT_IMAGE_PRESETS[0],
        category: "Lain-lain",
      };
      setProducts((prev) => [newProduct, ...prev]);
    } else if (aiInv.action === "update_stock") {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.umkmId === activeUmkmId && p.name.toLowerCase().includes(aiInv.name.toLowerCase())) {
            const updatedStock = Math.max(0, p.stock + aiInv.stock);
            return { ...p, stock: updatedStock };
          }
          return p;
        })
      );
    }
  };

  const handleAddManualTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTxData.amount || isNaN(Number(manualTxData.amount))) {
      alert("Harap masukkan nilai uang yang valid!");
      return;
    }

    const newLog: FinancialLog = {
      id: `log-${Date.now()}`,
      type: manualTxType,
      amount: Number(manualTxData.amount),
      category: manualTxData.category,
      description: manualTxData.description || `${manualTxType === "income" ? "Pemasukan" : "Pengeluaran"} Manual`,
      date: new Date().toISOString(),
    };

    setLedger((prev) => [newLog, ...prev]);
    setIsManualTxOpen(false);
    setManualTxData({ amount: "", category: "", description: "" });
  };

  const handleAddManualProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductData.name || !newProductData.price || !newProductData.stock) {
      alert("Harap lengkapi nama produk, harga, dan stok!");
      return;
    }

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      umkmId: activeUmkmId,
      name: newProductData.name,
      price: Number(newProductData.price),
      stock: Number(newProductData.stock),
      description: newProductData.description || "Tidak ada deskripsi produk.",
      category: newProductData.category,
      image: PRODUCT_IMAGE_PRESETS[newProductData.imageIdx],
    };

    setProducts((prev) => [newProd, ...prev]);
    setIsNewProductOpen(false);
    setNewProductData({
      name: "",
      price: "",
      stock: "",
      description: "",
      category: PRODUCT_CATEGORIES[0],
      imageIdx: 0,
    });
  };

  const updateProductStockDirectly = (productId: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return { ...p, stock: Math.max(0, p.stock + delta) };
        }
        return p;
      })
    );
  };

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert("Maaf, stok produk ini sedang habis!");
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) {
          alert(`Maksimal pembelian untuk stok yang tersedia: ${product.stock} pcs`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const adjustCartQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.qty + delta;
            // Check stock boundary
            if (newQty > item.product.stock) {
              alert(`Maaf, stok hanya tersedia ${item.product.stock} unit.`);
              return item;
            }
            return { ...item, qty: newQty };
          }
          return item;
        })
        .filter((item) => item.qty > 0)
    );
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (!customerName.trim()) {
      alert("Harap masukkan Nama Anda untuk melanjutkan pemesanan!");
      return;
    }

    const firstProduct = cart[0].product;
    const sellerUmkm = umkms.find((u) => u.id === firstProduct.umkmId) || umkms[0];
    const total = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      umkmId: sellerUmkm.id,
      umkmName: sellerUmkm.name,
      customerName: customerName,
      items: cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        qty: item.qty,
        price: item.product.price,
      })),
      totalAmount: total,
      paymentMethod: checkoutPaymentMethod,
      paymentStatus: "pending",
      date: new Date().toISOString(),
      qrisUrl: sellerUmkm.qrisCode,
    };

    setTransactions((prev) => [newTx, ...prev]);
    setActiveCheckoutTx(newTx);
    setPaymentSimulationStep("pending");
    setIsCartOpen(false);
  };

  const simulatePaymentProcess = () => {
    if (!activeCheckoutTx) return;

    setPaymentSimulationStep("scanning");
    setTimeout(() => {
      setPaymentSimulationStep("success");

      // 1. Update checkout transaction status
      setTransactions((prev) =>
        prev.map((t) => (t.id === activeCheckoutTx.id ? { ...t, paymentStatus: "success" } : t))
      );

      // 2. Reduce products stock
      activeCheckoutTx.items.forEach((item) => {
        setProducts((prev) =>
          prev.map((p) => {
            if (p.id === item.productId) {
              return { ...p, stock: Math.max(0, p.stock - item.qty) };
            }
            return p;
          })
        );
      });

      // 3. Add to Merchant Financial Ledger automatically!
      const buyerLog: FinancialLog = {
        id: `log-${Date.now()}`,
        type: "income",
        amount: activeCheckoutTx.totalAmount,
        category: "Penjualan Produk",
        description: `Penjualan Online (${activeCheckoutTx.customerName}): ${activeCheckoutTx.items
          .map((i) => `${i.name} x${i.qty}`)
          .join(", ")}`,
        date: new Date().toISOString(),
        items: activeCheckoutTx.items.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
      };

      setLedger((prev) => [buyerLog, ...prev]);
      setCart([]);
    }, 2200);
  };

  // --- Calculations for Current active UMKM Dashboard ---
  const activeLedger = ledger; // Showing all logs or we can filter based on active UMKM items. Let's make it easy and smart:
  // In a multi-merchant mock setup, we can filter ledger records containing items sold by this UMKM or manual entries categorized.
  // To keep it super practical and fully cohesive for a single-device-first user, we let the ledger track the general logs of the Active Merchant profile.
  const activeUmkmProducts = products.filter((p) => p.umkmId === activeUmkmId);

  // Financial Stats
  const totalIncome = activeLedger
    .filter((log) => log.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpense = activeLedger
    .filter((log) => log.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const netProfit = totalIncome - totalExpense;

  // Search/Filter logic for Buyer Marketplace
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Semua" || p.category === selectedCategory;
    const matchesUmkm = selectedUmkmFilter === "Semua" || p.umkmId === selectedUmkmFilter;
    return matchesSearch && matchesCategory && matchesUmkm;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased flex flex-col pb-20">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md shadow-emerald-600/20">
              <Store className="w-5 h-5 text-emerald-50" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Platform Digital</span>
              <h1 className="font-bold text-slate-800 text-sm md:text-base leading-none">Asisten UMKM Pintar</h1>
            </div>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              id="switch-buyer-btn"
              onClick={() => {
                setAppMode("buyer");
                setShowRegisterForm(false);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                appMode === "buyer" && !showRegisterForm
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Belanja (Pasar)
            </button>
            <button
              id="switch-merchant-btn"
              onClick={() => {
                setAppMode("merchant");
                setShowRegisterForm(false);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                appMode === "merchant" && !showRegisterForm
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Kelola Toko Saya
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Stage */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* --- REGISTRATION FORM ACTIVE MODE --- */}
        {showRegisterForm ? (
          <UmkmRegistrationForm
            onRegister={handleRegisterUmkm}
            onCancel={() => setShowRegisterForm(false)}
          />
        ) : appMode === "buyer" ? (
          /* ========================================================================= */
          /*                       BUYER VIEW (MARKETPLACE)                            */
          /* ========================================================================= */
          <div className="space-y-6">
            {/* Promo / Hero Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_right,rgba(16,185,129,0.15),transparent_50%)] pointer-events-none" />
              <div className="max-w-lg space-y-3 relative z-10">
                <span className="bg-emerald-500/20 text-emerald-300 font-bold text-xs px-3 py-1 rounded-full border border-emerald-500/30">
                  Dukung Produk Lokal 🇮🇩
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  Beli Langsung Dari Produsen UMKM Terbaik
                </h2>
                <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                  Semua transaksi diproses secara aman menggunakan sistem QRIS digital otomatis. Mudah digunakan tanpa ribet!
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setShowRegisterForm(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer shadow-md transition-all flex items-center gap-1.5"
                  >
                    Miliki Toko Online Anda Sendiri <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative w-full md:max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Cari camilan renyah, batik tulis, kopi asli..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Advanced Filter Selectors */}
              <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Filter:
                </span>

                {/* Filter UMKM */}
                <select
                  value={selectedUmkmFilter}
                  onChange={(e) => setSelectedUmkmFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="Semua">Semua Toko UMKM</option>
                  {umkms.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>

                {/* Filter Kategori */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="Semua">Semua Kategori</option>
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 p-8">
                <p className="text-slate-400 text-sm">Tidak ditemukan produk yang cocok dengan pencarian Anda.</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("Semua");
                    setSelectedUmkmFilter("Semua");
                  }}
                  className="mt-3 text-emerald-600 text-xs font-semibold hover:underline"
                >
                  Reset Semua Filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((product) => {
                  const seller = umkms.find((u) => u.id === product.umkmId) || umkms[0];
                  return (
                    <motion.div
                      key={product.id}
                      layout
                      className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-lg hover:border-slate-200 transition-all flex flex-col group relative"
                    >
                      {/* Product image */}
                      <div className="aspect-square bg-slate-50 overflow-hidden relative">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        {product.stock <= 3 && product.stock > 0 && (
                          <span className="absolute top-2.5 left-2.5 bg-orange-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase">
                            Sisa {product.stock}!
                          </span>
                        )}
                        {product.stock === 0 && (
                          <span className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center text-white text-xs font-extrabold uppercase tracking-wider">
                            Habis
                          </span>
                        )}
                      </div>

                      {/* Content details */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                        <div>
                          {/* Seller badge */}
                          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                            <Store className="w-3 h-3 text-slate-400" />
                            <span className="truncate">{seller.name}</span>
                          </div>
                          {/* Product name */}
                          <h3
                            onClick={() => setSelectedProduct(product)}
                            className="font-bold text-slate-800 text-sm line-clamp-2 mt-1 hover:text-emerald-600 cursor-pointer"
                          >
                            {product.name}
                          </h3>
                        </div>

                        <div>
                          {/* Price */}
                          <div className="font-black text-emerald-700 text-base">
                            Rp {(product?.price ?? 0).toLocaleString("id-ID")}
                          </div>

                          {/* Quick Action Button */}
                          <button
                            onClick={() => addToCart(product)}
                            disabled={product.stock <= 0}
                            className="w-full mt-3 py-2 px-3 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white disabled:bg-slate-100 disabled:text-slate-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            Tambah
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /*                     MERCHANT VIEW (ADMIN/DASHBOARD)                       */
          /* ========================================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Merchant Left Sidebar Options */}
            <div className="lg:col-span-3 space-y-4">
              {/* Selected Profile selector */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Profil Usaha Aktif
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 shrink-0">
                    <img src={activeUmkm.logo} alt={activeUmkm.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 text-sm truncate leading-tight">{activeUmkm.name}</h3>
                    <p className="text-[11px] text-slate-400 truncate">{activeUmkm.category}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-50 flex flex-col gap-2">
                  <label className="text-[11px] text-slate-400 font-medium">Ganti Toko atau Tambah Toko:</label>
                  <div className="flex gap-1.5">
                    <select
                      value={activeUmkmId}
                      onChange={(e) => setActiveUmkmId(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 text-xs font-medium rounded-lg px-2 py-1.5 focus:outline-none"
                    >
                      {umkms.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setShowRegisterForm(true)}
                      title="Daftarkan UMKM Baru"
                      className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigation Menu */}
              <div className="bg-white rounded-2xl border border-slate-100 p-2.5 shadow-xs space-y-1">
                <button
                  onClick={() => setMerchantTab("dashboard")}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                    merchantTab === "dashboard"
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <TrendingUp className="w-4 h-4 shrink-0" />
                  Ringkasan Usaha (Dasbor)
                </button>
                <button
                  onClick={() => setMerchantTab("inventory")}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                    merchantTab === "inventory"
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <Package className="w-4 h-4 shrink-0" />
                  Stok & Inventaris
                </button>
                <button
                  onClick={() => setMerchantTab("ledger")}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                    merchantTab === "ledger"
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  Buku Kas Digital
                </button>
                <button
                  onClick={() => setMerchantTab("settings")}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                    merchantTab === "settings"
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <Settings className="w-4 h-4 shrink-0" />
                  Profil & Kode QRIS
                </button>
              </div>
            </div>

            {/* Merchant Content Area */}
            <div className="lg:col-span-9 space-y-6">
              {/* SUB TAB: DASHBOARD */}
              {merchantTab === "dashboard" && (
                <div className="space-y-6">
                  {/* Financial Stats Bento Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Income */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-slate-400 block">Total Pemasukan</span>
                        <span className="text-xl font-black text-emerald-600 block">
                          Rp {(totalIncome ?? 0).toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                        <ArrowUpRight className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Expense */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-slate-400 block">Total Pengeluaran</span>
                        <span className="text-xl font-black text-red-600 block">
                          Rp {(totalExpense ?? 0).toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                        <ArrowDownRight className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Net Profit */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-slate-400 block">Untung Bersih (Surplus)</span>
                        <span className={`text-xl font-black block ${netProfit >= 0 ? "text-teal-600" : "text-amber-600"}`}>
                          Rp {(netProfit ?? 0).toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Visual Chart and Business Health Health Advice Card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* SVG Interactive Chart */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                      <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                        Grafik Neraca Keuangan
                      </h3>
                      {/* Simple Responsive SVG Chart */}
                      <div className="relative h-44 w-full flex items-end justify-around pt-6 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                        {/* Bar Income */}
                        <div className="flex flex-col items-center gap-1.5 w-1/4">
                          <div className="text-[10px] font-bold text-emerald-600">
                            Rp {(totalIncome / 1000).toFixed(0)}k
                          </div>
                          <div
                            style={{ height: `${Math.min(100, Math.max(10, (totalIncome / (totalIncome + totalExpense || 1)) * 100))}%` }}
                            className="w-12 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all"
                          />
                          <div className="text-[10px] text-slate-400 font-bold">Pemasukan</div>
                        </div>

                        {/* Bar Expense */}
                        <div className="flex flex-col items-center gap-1.5 w-1/4">
                          <div className="text-[10px] font-bold text-red-500">
                            Rp {(totalExpense / 1000).toFixed(0)}k
                          </div>
                          <div
                            style={{ height: `${Math.min(100, Math.max(10, (totalExpense / (totalIncome + totalExpense || 1)) * 100))}%` }}
                            className="w-12 bg-gradient-to-t from-red-500 to-red-400 rounded-t-lg transition-all"
                          />
                          <div className="text-[10px] text-slate-400 font-bold">Pengeluaran</div>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 text-center">
                        * Grafik perbandingan total nilai transaksi aktif saat ini.
                      </p>
                    </div>

                    {/* AI Coach Card */}
                    <div className="bg-gradient-to-br from-emerald-600 via-emerald-800 to-teal-800 p-6 rounded-2xl text-white space-y-4 shadow-md relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-emerald-300 animate-pulse" />
                        <h4 className="font-extrabold text-sm uppercase tracking-wider text-emerald-200">
                          Analisis Kesehatan Bisnis
                        </h4>
                      </div>

                      <div className="space-y-3">
                        <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                          <p className="text-xs font-semibold">Status Arus Kas:</p>
                          <p className="text-sm font-bold text-emerald-200 mt-0.5">
                            {netProfit > 0
                              ? "📈 Arus Kas Sehat & Surplus!"
                              : netProfit < 0
                              ? "⚠️ Peringatan: Pengeluaran melebihi pemasukan!"
                              : "⚖️ Arus Kas Seimbang / Break Even"}
                          </p>
                        </div>

                        <p className="text-xs text-emerald-50/90 leading-relaxed">
                          {netProfit > 0
                            ? `Bagus sekali bos! Anda memiliki sisa dana aman sebesar Rp ${(netProfit ?? 0).toLocaleString(
                                "id-ID"
                              )}. Pertahankan harga jual Anda dan optimalkan stok barang terlaris.`
                            : "Saran: Periksa kembali log pengeluaran Anda. Gunakan Asisten AI di pojok bawah untuk menganalisis mana biaya operasional yang bisa dikurangi demi kelangsungan usaha."}
                        </p>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => {
                            setMerchantTab("ledger");
                            setIsManualTxOpen(true);
                          }}
                          className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer border border-white/20 flex items-center gap-1"
                        >
                          Mulai Catat Transaksi <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Recent Logs & Stock Alert Panel */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Alert low stocks */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3">
                      <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-emerald-600" />
                        Peringatan Stok Tipis (≤ 15)
                      </h3>

                      <div className="space-y-2.5 max-h-48 overflow-y-auto">
                        {activeUmkmProducts.filter((p) => p.stock <= 15).length === 0 ? (
                          <p className="text-slate-400 text-xs py-4 text-center">🎉 Semua stok barang aman!</p>
                        ) : (
                          activeUmkmProducts
                            .filter((p) => p.stock <= 15)
                            .map((p) => (
                              <div
                                key={p.id}
                                className="flex items-center justify-between p-2.5 bg-amber-50/50 rounded-xl border border-amber-100"
                              >
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-800 truncate">{p.name}</p>
                                  <p className="text-[10px] text-amber-600 font-semibold">
                                    Tinggal {p.stock} unit tersisa
                                  </p>
                                </div>
                                <button
                                  onClick={() => updateProductStockDirectly(p.id, 20)}
                                  className="text-[10px] bg-amber-600 hover:bg-amber-700 text-white font-bold px-2.5 py-1 rounded-lg cursor-pointer"
                                >
                                  Tambah +20
                                </button>
                              </div>
                            ))
                        )}
                      </div>
                    </div>

                    {/* Quick Logs */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3">
                      <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        Pencatatan Keuangan Terakhir
                      </h3>

                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {activeLedger.slice(0, 4).map((log) => (
                          <div key={log.id} className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl">
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">{log.description}</p>
                              <p className="text-[10px] text-slate-400">
                                {new Date(log.date).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                            <span
                              className={`text-xs font-black shrink-0 ${
                                log.type === "income" ? "text-emerald-600" : "text-red-500"
                              }`}
                            >
                              {log.type === "income" ? "+" : "-"} Rp {(log?.amount ?? 0).toLocaleString("id-ID")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB TAB: INVENTORY */}
              {merchantTab === "inventory" && (
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">Manajemen Inventaris & Stok</h2>
                      <p className="text-xs text-slate-400">
                        Atur jumlah ketersediaan produk marketplace Anda dengan mudah.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsNewProductOpen(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Plus className="w-4 h-4" /> Tambah Produk Baru
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-slate-100 rounded-xl">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold text-xs uppercase">
                          <th className="p-3.5">Produk</th>
                          <th className="p-3.5">Kategori</th>
                          <th className="p-3.5">Harga</th>
                          <th className="p-3.5 text-center">Stok Saat Ini</th>
                          <th className="p-3.5 text-right">Aksi Cepat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activeUmkmProducts.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-8 text-slate-400 text-xs">
                              Belum ada produk. Klik tombol di atas untuk menambah produk perdana Anda!
                            </td>
                          </tr>
                        ) : (
                          activeUmkmProducts.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                  </div>
                                  <span className="font-bold text-slate-800 block text-xs md:text-sm max-w-[200px] truncate">
                                    {p.name}
                                  </span>
                                </div>
                              </td>
                              <td className="p-3.5">
                                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md">
                                  {p.category}
                                </span>
                              </td>
                              <td className="p-3.5 font-bold text-slate-700">
                                Rp {(p?.price ?? 0).toLocaleString("id-ID")}
                              </td>
                              <td className="p-3.5 text-center">
                                <div className="inline-flex items-center gap-1.5">
                                  <span
                                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                      p.stock > 15
                                        ? "bg-emerald-500"
                                        : p.stock > 0
                                        ? "bg-amber-500 animate-pulse"
                                        : "bg-red-500"
                                    }`}
                                  />
                                  <span className="font-semibold text-slate-800">{p.stock} unit</span>
                                </div>
                              </td>
                              <td className="p-3.5 text-right">
                                <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                                  <button
                                    onClick={() => updateProductStockDirectly(p.id, -1)}
                                    title="Kurangi 1"
                                    disabled={p.stock <= 0}
                                    className="p-1 hover:bg-white disabled:opacity-30 rounded-md text-slate-600 cursor-pointer"
                                  >
                                    <MinusCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => updateProductStockDirectly(p.id, 1)}
                                    title="Tambah 1"
                                    className="p-1 hover:bg-white rounded-md text-emerald-600 cursor-pointer"
                                  >
                                    <PlusCircle className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUB TAB: LEDGER */}
              {merchantTab === "ledger" && (
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">Buku Kas Keuangan Digital</h2>
                      <p className="text-xs text-slate-400">
                        Catat pemasukan modal, pengeluaran belanja bahan baku, operasional secara berkala.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsManualTxOpen(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Plus className="w-4 h-4" /> Catat Transaksi Baru
                    </button>
                  </div>

                  {/* Summary row */}
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Pemasukan</span>
                      <span className="text-lg font-black text-emerald-600 block">
                        Rp {(totalIncome ?? 0).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="border-l border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Pengeluaran</span>
                      <span className="text-lg font-black text-red-500 block">
                        Rp {(totalExpense ?? 0).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  {/* Ledger entries list */}
                  <div className="space-y-3">
                    <span className="text-xs text-slate-400 font-bold uppercase block tracking-wider">
                      Riwayat Buku Kas
                    </span>

                    {activeLedger.length === 0 ? (
                      <p className="text-slate-400 text-xs py-8 text-center bg-slate-50 rounded-xl">
                        Belum ada riwayat keuangan tercatat.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {activeLedger.map((log) => (
                          <div
                            key={log.id}
                            className="flex items-center justify-between p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all"
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                  log.type === "income" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                }`}
                              >
                                {log.type === "income" ? (
                                  <ArrowUpRight className="w-4.5 h-4.5" />
                                ) : (
                                  <ArrowDownRight className="w-4.5 h-4.5" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate">{log.description}</p>
                                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-medium">
                                  <span>{log.category}</span>
                                  <span>•</span>
                                  <span>
                                    {new Date(log.date).toLocaleDateString("id-ID", {
                                      day: "numeric",
                                      month: "short",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <span
                              className={`font-extrabold text-sm shrink-0 whitespace-nowrap ml-2 ${
                                log.type === "income" ? "text-emerald-600" : "text-red-500"
                              }`}
                            >
                              {log.type === "income" ? "+" : "-"} Rp {(log?.amount ?? 0).toLocaleString("id-ID")}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SUB TAB: SETTINGS & QRIS */}
              {merchantTab === "settings" && (
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Detail Toko & Pembayaran QRIS</h2>
                    <p className="text-xs text-slate-400">
                      Sesuaikan data kontak WhatsApp pembeli serta periksa kode QRIS aman yang diterbitkan sistem.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* QRIS card */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200">
                        {/* Interactive QR code mock container */}
                        <div className="w-44 h-44 bg-slate-900 text-white rounded-lg flex flex-col items-center justify-center p-3 relative">
                          <QrCode className="w-32 h-32 text-white" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center">
                              <Store className="w-5 h-5 text-emerald-600" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase block tracking-widest">
                          SISTEM PEMBAYARAN DIGITAL
                        </span>
                        <h4 className="font-extrabold text-slate-800 text-base">QRIS GPN NASIONAL</h4>
                        <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
                          Sistem otomatis telah mengaitkan merchant <span className="font-bold text-emerald-600">{activeUmkm.name}</span> dengan rekening QRIS Bank Mandiri/BCA digital secara aman.
                        </p>
                      </div>
                    </div>

                    {/* Profile review */}
                    <div className="space-y-4 text-xs">
                      <div>
                        <span className="font-bold text-slate-400 uppercase tracking-wide text-[10px] block mb-1">
                          Nama Toko UMKM
                        </span>
                        <p className="text-sm font-bold text-slate-800">{activeUmkm.name}</p>
                      </div>

                      <div>
                        <span className="font-bold text-slate-400 uppercase tracking-wide text-[10px] block mb-1">
                          Kategori Usaha
                        </span>
                        <p className="text-sm font-bold text-slate-800">{activeUmkm.category}</p>
                      </div>

                      <div>
                        <span className="font-bold text-slate-400 uppercase tracking-wide text-[10px] block mb-1">
                          Nama Pemilik
                        </span>
                        <p className="text-sm font-semibold text-slate-800">{activeUmkm.ownerName}</p>
                      </div>

                      <div>
                        <span className="font-bold text-slate-400 uppercase tracking-wide text-[10px] block mb-1">
                          No. WhatsApp Toko
                        </span>
                        <p className="text-sm font-semibold text-emerald-700">{activeUmkm.phone}</p>
                      </div>

                      <div>
                        <span className="font-bold text-slate-400 uppercase tracking-wide text-[10px] block mb-1">
                          Alamat Toko
                        </span>
                        <p className="text-sm text-slate-600 leading-relaxed">{activeUmkm.address}</p>
                      </div>

                      <div>
                        <span className="font-bold text-slate-400 uppercase tracking-wide text-[10px] block mb-1">
                          Deskripsi Toko
                        </span>
                        <p className="text-sm text-slate-500 leading-relaxed italic">{activeUmkm.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Floating Sticky Buyer Cart Tab (Only in Buyer Mode) */}
      {appMode === "buyer" && cart.length > 0 && (
        <div className="fixed bottom-6 left-6 z-50">
          <motion.button
            id="floating-cart-btn"
            onClick={() => setIsCartOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-4 rounded-full shadow-2xl shadow-emerald-600/30 cursor-pointer border-none"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="text-sm">{cart.reduce((sum, item) => sum + item.qty, 0)} Barang</span>
          </motion.button>
        </div>
      )}

      {/* ========================================================================= */
      /*                         MODAL & POPUP OVERLAYS                            */
      /* ========================================================================= */}

      {/* 1. PRODUCT DETAIL MODAL */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative border border-slate-100"
            >
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 p-2 rounded-full shadow-md z-10 transition-all cursor-pointer border-none"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="aspect-video bg-slate-100 relative">
                <img
                  src={selectedProduct?.image}
                  alt={selectedProduct?.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {selectedProduct?.category}
                  </span>
                  <h3 className="font-extrabold text-slate-800 text-lg mt-1">{selectedProduct?.name}</h3>
                  <div className="font-black text-emerald-700 text-xl mt-1">
                    Rp {(selectedProduct?.price ?? 0).toLocaleString("id-ID")}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Deskripsi Produk
                  </span>
                  <p className="text-xs text-slate-500 leading-relaxed">{selectedProduct?.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Ketersediaan Stok</span>
                    <span className="font-bold text-slate-800 text-xs">{selectedProduct?.stock} unit</span>
                  </div>

                  <button
                    onClick={() => {
                      if (selectedProduct) {
                        addToCart(selectedProduct);
                        setSelectedProduct(null);
                      }
                    }}
                    disabled={!selectedProduct || selectedProduct.stock <= 0}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer shadow-sm border-none disabled:bg-slate-200"
                  >
                    Tambah ke Keranjang
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. CART SHEET / CHECKOUT SLIDEOVER */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex justify-end">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl relative"
            >
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-extrabold text-sm">Keranjang Belanja</h3>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-white/80 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 text-xs">
                    Keranjang kosong. Pilih barang lezat dan unik di pasar!
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100"
                    >
                      <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 overflow-hidden shrink-0">
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="font-bold text-slate-800 text-xs truncate">{item.product?.name}</p>
                        <p className="text-emerald-700 text-xs font-semibold">
                          Rp {(item.product?.price ?? 0).toLocaleString("id-ID")}
                        </p>

                        <div className="flex items-center justify-between pt-1">
                          {/* Quantity control */}
                          <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-0.5">
                            <button
                              onClick={() => adjustCartQty(item.product.id, -1)}
                              className="p-1 hover:bg-slate-50 rounded-md text-slate-500 cursor-pointer"
                            >
                              <MinusCircle className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-bold text-slate-800 px-1">{item.qty}</span>
                            <button
                              onClick={() => adjustCartQty(item.product.id, 1)}
                              className="p-1 hover:bg-slate-50 rounded-md text-emerald-600 cursor-pointer"
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => adjustCartQty(item.product.id, -item.qty)}
                            title="Hapus barang"
                            className="text-slate-400 hover:text-red-500 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Checkout Form */}
              {cart.length > 0 && (
                <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Nama Pemesan <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="Masukkan nama Anda..."
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Metode Pembayaran</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCheckoutPaymentMethod("QRIS")}
                        className={`py-2 px-3 border text-xs font-bold rounded-lg cursor-pointer transition-all ${
                          checkoutPaymentMethod === "QRIS"
                            ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                            : "bg-white border-slate-200 text-slate-500"
                        }`}
                      >
                        QRIS Aman (Instant)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCheckoutPaymentMethod("Tunai")}
                        className={`py-2 px-3 border text-xs font-bold rounded-lg cursor-pointer transition-all ${
                          checkoutPaymentMethod === "Tunai"
                            ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                            : "bg-white border-slate-200 text-slate-500"
                        }`}
                      >
                        Tunai di Toko (COD)
                      </button>
                    </div>
                  </div>

                  {/* Calculations */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-200 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal</span>
                      <span>
                        Rp {cart.reduce((sum, item) => sum + (item.product?.price ?? 0) * item.qty, 0).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>PPN Keamanan (0%)</span>
                      <span>Rp 0</span>
                    </div>
                    <div className="flex justify-between font-black text-sm text-slate-800 pt-1 border-t border-dashed border-slate-200">
                      <span>Total Biaya</span>
                      <span className="text-emerald-700">
                        Rp {cart.reduce((sum, item) => sum + (item.product?.price ?? 0) * item.qty, 0).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    Pesan Sekarang <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. QRIS PAYMENT SIMULATOR DIALOG */}
      <AnimatePresence>
        {activeCheckoutTx && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-100"
            >
              {/* Header */}
              <div className="bg-slate-900 p-4 text-white text-center relative">
                <h3 className="font-bold text-sm tracking-wide">Gerbang Pembayaran Aman</h3>
                <p className="text-[10px] text-slate-400">QRIS GPN Terverifikasi Otomatis</p>
                <button
                  onClick={() => {
                    setActiveCheckoutTx(null);
                    setPaymentSimulationStep("pending");
                  }}
                  className="absolute right-4 top-4 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content body based on simulation steps */}
              <div className="p-6 space-y-5 text-center">
                {paymentSimulationStep === "pending" && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Silakan selesaikan pembayaran tagihan belanja Anda melalui QRIS resmi di bawah.
                    </p>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center">
                      <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-150 mb-3">
                        {/* Simulated QR block */}
                        <div className="w-36 h-36 bg-slate-900 rounded-lg flex items-center justify-center relative">
                          <QrCode className="w-28 h-28 text-white" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center">
                              <Store className="w-4 h-4 text-emerald-600" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                          TOTAL PEMBAYARAN
                        </span>
                        <span className="text-base font-black text-slate-800">
                          Rp {(activeCheckoutTx?.totalAmount ?? 0).toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={simulatePaymentProcess}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-colors"
                    >
                      Konfirmasi / Simulasikan Bayar Sukses
                    </button>
                  </div>
                )}

                {paymentSimulationStep === "scanning" && (
                  <div className="py-8 flex flex-col items-center space-y-4">
                    <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center relative">
                      <Smartphone className="w-7 h-7 text-emerald-600 animate-bounce" />
                      <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-800 text-sm">Sedang Memverifikasi Saldo...</h4>
                      <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                        Sistem mendeteksi transaksi digital aman Anda secara real-time.
                      </p>
                    </div>
                  </div>
                )}

                {paymentSimulationStep === "success" && (
                  <div className="py-4 space-y-4">
                    <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-800 text-base">Pembayaran Berhasil!</h4>
                      <p className="text-xs text-slate-500">
                        Pesan dikirim langsung ke WhatsApp penjual untuk dikirim.
                      </p>
                    </div>

                    {/* Invoice detail */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left text-[11px] space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Pembeli:</span>
                        <span className="text-slate-700 font-bold">{activeCheckoutTx?.customerName ?? ""}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Metode:</span>
                        <span className="text-slate-700 font-semibold">{activeCheckoutTx?.paymentMethod ?? ""}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Status:</span>
                        <span className="text-emerald-600 font-bold">LUNAS</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200/60 pt-1.5 font-bold">
                        <span className="text-slate-500">Total:</span>
                        <span className="text-slate-800 text-xs">
                          Rp {(activeCheckoutTx?.totalAmount ?? 0).toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveCheckoutTx(null);
                        setPaymentSimulationStep("pending");
                      }}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Selesai
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. MANUAL TRANSACTION ADD MODAL (MERCHANT VIEW) */}
      <AnimatePresence>
        {isManualTxOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative border border-slate-100"
            >
              <div className="bg-slate-950 p-4 text-white flex items-center justify-between">
                <h3 className="font-bold text-sm">Catat Transaksi Manual</h3>
                <button
                  onClick={() => setIsManualTxOpen(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddManualTransaction} className="p-5 space-y-4">
                {/* Type toggle */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Jenis Transaksi</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setManualTxType("income")}
                      className={`py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                        manualTxType === "income"
                          ? "bg-emerald-600 text-white"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Pemasukan
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualTxType("expense")}
                      className={`py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                        manualTxType === "expense"
                          ? "bg-red-600 text-white"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Pengeluaran
                    </button>
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Nilai Uang (Rp) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 15000"
                    value={manualTxData.amount}
                    onChange={(e) => setManualTxData({ ...manualTxData, amount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Kategori</label>
                  <select
                    value={manualTxData.category}
                    onChange={(e) => setManualTxData({ ...manualTxData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {manualTxType === "income"
                      ? LEDGER_CATEGORIES_INCOME.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))
                      : LEDGER_CATEGORIES_EXPENSE.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Deskripsi Tambahan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Penjualan produk atau beli plastik bungkus"
                    value={manualTxData.description}
                    onChange={(e) => setManualTxData({ ...manualTxData, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                {/* Action buttons */}
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsManualTxOpen(false)}
                    className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Simpan Transaksi
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. MANUAL PRODUCT ADD MODAL (MERCHANT VIEW) */}
      <AnimatePresence>
        {isNewProductOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative border border-slate-100"
            >
              <div className="bg-slate-950 p-4 text-white flex items-center justify-between">
                <h3 className="font-bold text-sm">Tambah Produk Baru</h3>
                <button
                  onClick={() => setIsNewProductOpen(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddManualProduct} className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Nama Produk <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Kripik Tempe Rasa Keju"
                      value={newProductData.name}
                      onChange={(e) => setNewProductData({ ...newProductData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Kategori</label>
                    <select
                      value={newProductData.category}
                      onChange={(e) => setNewProductData({ ...newProductData, category: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2"
                    >
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Harga Jual (Rp) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      required
                      placeholder="Contoh: 18000"
                      value={newProductData.price}
                      onChange={(e) => setNewProductData({ ...newProductData, price: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2"
                    />
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Jumlah Stok Perdana <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      required
                      placeholder="Contoh: 50"
                      value={newProductData.stock}
                      onChange={(e) => setNewProductData({ ...newProductData, stock: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Deskripsi Singkat Produk</label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Gurih, renyah, dan lezat tanpa MSG..."
                    value={newProductData.description}
                    onChange={(e) => setNewProductData({ ...newProductData, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 resize-none"
                  />
                </div>

                {/* Image preset */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Pilih Sampel Foto Produk</label>
                  <div className="grid grid-cols-5 gap-2">
                    {PRODUCT_IMAGE_PRESETS.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setNewProductData({ ...newProductData, imageIdx: idx })}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer ${
                          newProductData.imageIdx === idx ? "border-emerald-600 ring-2 ring-emerald-500/10" : "border-transparent opacity-60"
                        }`}
                      >
                        <img src={img} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsNewProductOpen(false)}
                    className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Tambah Produk
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- SERVER-SIDE GEMINI AI INTEGRATION WIDGET --- */}
      <AiAssistantWidget
        inventory={products}
        ledger={ledger}
        onApplyTransaction={handleApplyTransactionFromAi}
        onApplyInventoryAction={handleApplyInventoryActionFromAi}
        currentUmkmId={activeUmkmId}
      />
    </div>
  );
}
