export interface UMKMProfile {
  id: string;
  name: string;
  category: string;
  ownerName: string;
  phone: string;
  address: string;
  description: string;
  logo: string;
  banner: string;
  qrisCode: string; // QRIS text/URL for payment
  registeredAt: string;
}

export interface Product {
  id: string;
  umkmId: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  image: string;
  category: string;
}

export interface FinancialLog {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
  items?: {
    name: string;
    qty: number;
    price: number;
  }[];
}

export interface TransactionItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
}

export interface Transaction {
  id: string;
  umkmId: string;
  umkmName: string;
  customerName: string;
  items: TransactionItem[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: "pending" | "success" | "failed";
  date: string;
  qrisUrl?: string;
}

export interface CartItem {
  product: Product;
  qty: number;
}
