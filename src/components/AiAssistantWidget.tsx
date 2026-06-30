import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Sparkles, X, ChevronRight, CornerDownLeft, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product, FinancialLog } from "../types";

interface AiAssistantWidgetProps {
  inventory: Product[];
  ledger: FinancialLog[];
  onApplyTransaction: (transaction: any) => void;
  onApplyInventoryAction: (action: any) => void;
  currentUmkmId: string;
}

export default function AiAssistantWidget({
  inventory,
  ledger,
  onApplyTransaction,
  onApplyInventoryAction,
  currentUmkmId,
}: AiAssistantWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ sender: "user" | "ai"; text: string; action?: any }>>([
    {
      sender: "ai",
      text: "Halo bos! Saya Asisten Pintar UMKM. Tulis atau katakan apa saja, saya bisa bantu catat penjualan, belanja, sesuaikan stok, atau berikan tips bisnis lho! 😊",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "Jual 2 Kripik Tempe Original",
    "Belanja minyak goreng Rp 35.000",
    "Tambah stok Kopi Gayo 10 bungkus",
    "Berikan tips meningkatkan penjualan",
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message
    setChatHistory((prev) => [...prev, { sender: "user", text: textToSend }]);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          inventory: inventory.filter(p => p.umkmId === currentUmkmId),
          ledger: ledger,
        }),
      });

      const data = await response.json();

      setChatHistory((prev) => [
        ...prev,
        {
          sender: "ai",
          text: data.reply,
          action: data.transaction || data.inventoryAction ? {
            transaction: data.transaction,
            inventoryAction: data.inventoryAction,
          } : undefined,
        },
      ]);
    } catch (error) {
      console.error("AI Error:", error);
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Aduh bos, koneksi AI saya sedang sedikit tersendat. Silakan coba sesaat lagi ya!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const executeAction = (action: any, index: number) => {
    if (action.transaction) {
      onApplyTransaction(action.transaction);
      setChatHistory((prev) => {
        const copy = [...prev];
        copy[index] = {
          ...copy[index],
          text: copy[index].text + " \n\n✅ [Transaksi Berhasil Dicatat!]",
          action: undefined, // remove button after applying
        };
        return copy;
      });
    } else if (action.inventoryAction) {
      onApplyInventoryAction(action.inventoryAction);
      setChatHistory((prev) => {
        const copy = [...prev];
        copy[index] = {
          ...copy[index],
          text: copy[index].text + " \n\n✅ [Inventaris Berhasil Diperbarui!]",
          action: undefined, // remove button after applying
        };
        return copy;
      });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Trigger Button */}
      <motion.button
        id="ai-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-4 rounded-full shadow-2xl shadow-emerald-600/30 cursor-pointer border-none"
      >
        <Sparkles className="w-5 h-5 animate-pulse text-emerald-100" />
        <span className="text-sm font-semibold tracking-wide">Tanya Asisten AI</span>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="ai-chat-window"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="absolute bottom-16 right-0 w-96 max-w-[calc(100vw-2rem)] h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Sparkles className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Asisten Keuangan Pintar</h3>
                  <p className="text-[11px] text-emerald-100">Bisa catat otomatis lewat chat!</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {chatHistory.map((chat, idx) => (
                <div
                  key={idx}
                  className={`flex ${chat.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${
                      chat.sender === "user"
                        ? "bg-emerald-600 text-white rounded-br-none"
                        : "bg-white text-slate-800 border border-slate-100 rounded-bl-none"
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{chat.text}</p>

                    {/* Interactive Action Blocks parsed from AI */}
                    {chat.action && (
                      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2">
                        <div className="flex items-start gap-1.5 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
                          <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-slate-700">Draf Aksi Terdeteksi:</span>
                            {chat.action.transaction && (
                              <p>
                                {chat.action.transaction.type === "income" ? "Pemasukan" : "Pengeluaran"}:{" "}
                                <span className="font-semibold text-emerald-600">
                                  Rp {chat.action.transaction.amount.toLocaleString("id-ID")}
                                </span>{" "}
                                ({chat.action.transaction.description})
                              </p>
                            )}
                            {chat.action.inventoryAction && (
                              <p>
                                {chat.action.inventoryAction.action === "add" ? "Tambah Produk" : "Update Stok"}:{" "}
                                <span className="font-semibold text-slate-700">{chat.action.inventoryAction.name}</span>{" "}
                                ({chat.action.inventoryAction.stock > 0 ? "+" : ""}{chat.action.inventoryAction.stock} pcs)
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => executeAction(chat.action, idx)}
                          className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer transition-all flex items-center justify-center gap-1"
                        >
                          Terapkan Sekarang <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 text-slate-400 rounded-2xl rounded-bl-none p-3 shadow-sm text-xs flex items-center gap-2">
                    <span className="flex gap-1">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-100"></span>
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-200"></span>
                    </span>
                    <span>Asisten sedang mengetik...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="p-2 bg-slate-100/50 border-t border-slate-100 overflow-x-auto flex gap-1.5 scrollbar-thin">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isLoading}
                  className="shrink-0 text-[11px] font-medium bg-white hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 border border-slate-200 rounded-full px-3 py-1 cursor-pointer transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(message);
              }}
              className="p-3 border-t border-slate-100 flex items-center gap-2 bg-white"
            >
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tulis pesan atau catat transaksi..."
                disabled={isLoading}
                className="flex-1 bg-slate-50 border border-slate-200 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl cursor-pointer transition-colors"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
