import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini SDK with telemetry header
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("⚠️ Warning: GEMINI_API_KEY is not defined. AI Assistant features will run in fallback mode.");
}

// AI Endpoint to parse transaction or answer financial queries
app.post("/api/ai/process", async (req, res) => {
  const { message, inventory = [], ledger = [] } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Pesan tidak boleh kosong." });
  }

  if (!ai) {
    // Fallback if API key is not present
    return res.json({
      reply: "Maaf, Asisten AI sedang tidak terhubung dengan kunci API. Silakan konfigurasi kunci API Anda di menu Rahasia. Tapi saya bisa membantu Anda mencatat secara manual!",
      transaction: null,
      inventoryAction: null
    });
  }

  try {
    const inventoryContext = inventory.map((item: any) => `- ${item.name} (Stok: ${item.stock}, Harga Jual: Rp ${item.price}, ID: ${item.id})`).join("\n");
    const ledgerContext = ledger.slice(-5).map((log: any) => `- [${log.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}] Rp ${log.amount} - ${log.description} (${log.date})`).join("\n");

    const systemInstruction = `Anda adalah "Asisten Keuangan Pintar" untuk pelaku UMKM (Usaha Mikro, Kecil, dan Menengah) di Indonesia yang masih awam.
Tugas Anda adalah memproses instruksi pencatatan keuangan/inventaris atau memberikan tips bisnis praktis secara ringkas, ramah, dan sangat mudah dipahami.

Gunakan bahasa Indonesia yang hangat, sederhana, dan menyemangati (hindari istilah akademis yang rumit).

Anda harus menganalisis pesan pengguna dan menghasilkan respon terstruktur (JSON) dengan properti:
1. "reply": Pesan balasan tekstual Anda kepada pengguna (maksimal 3 kalimat, sangat ramah, misalnya "Siap bos! Sudah saya siapkan draf pencatatannya ya, silakan diperiksa.").
2. "transaction": Jika pesan pengguna berisi niat mencatat penjualan (pemasukan) atau belanja/biaya (pengeluaran), buat objek transaksi ini. Jika tidak, isi null.
   - "type": "income" (untuk pemasukan/penjualan) atau "expense" (untuk pengeluaran/belanja/operasional)
   - "amount": total nilai transaksi (angka bulat)
   - "description": deskripsi singkat (misalnya "Penjualan Kripik Pisang x2")
   - "category": salah satu dari: "Penjualan Produk", "Belanja Bahan", "Operasional", "Gaji Karyawan", "Lain-lain"
   - "items": daftar barang yang terlibat (jika ada):
     - "name": nama produk (coba cocokkan dengan nama produk di inventaris di bawah jika relevan)
     - "qty": jumlah kuantitas (angka)
     - "price": harga per satuan (angka)
3. "inventoryAction": Jika pesan pengguna berisi niat menambah produk baru ke inventaris atau mengupdate stok produk tertentu, buat objek ini. Jika tidak, isi null.
   - "action": "add" (tambah produk baru) atau "update_stock" (tambah/kurangi stok produk yang sudah ada)
   - "name": nama produk
   - "stock": jumlah stok yang ingin ditambahkan/disesuaikan
   - "price": harga jual produk (jika menambah produk baru, angka bulat)

Daftar Inventaris UMKM Saat Ini:
${inventoryContext || "Belum ada produk di inventaris."}

Pencatatan Keuangan Terakhir:
${ledgerContext || "Belum ada riwayat pencatatan."}

PENTING: Selalu kembalikan JSON yang valid sesuai skema yang ditentukan. Jangan tambahkan penjelasan Markdown di luar JSON tersebut.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: message,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["reply", "transaction", "inventoryAction"],
          properties: {
            reply: {
              type: Type.STRING,
              description: "Jawaban percakapan yang ramah dan sederhana dalam bahasa Indonesia."
            },
            transaction: {
              type: Type.OBJECT,
              description: "Data transaksi jika pengguna bermaksud mencatat pemasukan atau pengeluaran.",
              properties: {
                type: { type: Type.STRING, enum: ["income", "expense"] },
                amount: { type: Type.INTEGER },
                description: { type: Type.STRING },
                category: { type: Type.STRING, enum: ["Penjualan Produk", "Belanja Bahan", "Operasional", "Gaji Karyawan", "Lain-lain"] },
                items: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ["name", "qty", "price"],
                    properties: {
                      name: { type: Type.STRING },
                      qty: { type: Type.INTEGER },
                      price: { type: Type.INTEGER }
                    }
                  }
                }
              }
            },
            inventoryAction: {
              type: Type.OBJECT,
              description: "Data penyesuaian stok atau produk baru jika terdeteksi di pesan.",
              properties: {
                action: { type: Type.STRING, enum: ["add", "update_stock"] },
                name: { type: Type.STRING },
                stock: { type: Type.INTEGER },
                price: { type: Type.INTEGER }
              }
            }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text?.trim() || "{}");
    res.json(parsedData);
  } catch (error) {
    console.error("Error processing AI request:", error);
    res.status(500).json({
      reply: "Aduh maaf bos, otak AI saya sedang sedikit pusing. Mari kita catat secara manual terlebih dahulu, gampang kok tinggal pencet tombol di bawah!",
      transaction: null,
      inventoryAction: null
    });
  }
});

// Setup Vite middleware or Static files serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
