import { supabase } from "@/utils/supabase/client";

/**
 * Interface untuk item keranjang belanja
 */
interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
  is_preorder: boolean;
}

/**
 * Memvalidasi apakah produk Pre-Order masih tersedia untuk dibeli.
 * Jalankan fungsi ini sebelum menambahkan ke keranjang atau saat checkout.
 */
export async function validatePreOrderEligibility(productId: string) {
  const { data: product, error } = await supabase
    .from('products')
    .select('is_preorder, po_start_date, po_end_date, po_quota, po_fulfilled_qty')
    .eq('id', productId)
    .single();

  if (error || !product) {
    return { valid: false, message: "Produk tidak ditemukan di database." };
  }
  
  // Jika bukan produk PO, anggap valid (ready stock)
  if (!product.is_preorder) return { valid: true };

  const now = new Date();
  const start = new Date(product.po_start_date);
  const end = new Date(product.po_end_date);

  // 1. Validasi Rentang Waktu
  if (now < start) {
    return { valid: false, message: "Periode Pre-Order untuk produk ini belum dimulai." };
  }
  if (now > end) {
    return { valid: false, message: "Periode Pre-Order untuk produk ini telah berakhir." };
  }

  // 2. Validasi Kuota
  if (product.po_fulfilled_qty >= product.po_quota) {
    return { valid: false, message: "Maaf, kuota Pre-Order untuk produk ini sudah habis (Sold Out)." };
  }

  return { valid: true };
}

/**
 * Mencegah pencampuran produk PO dan Ready Stock dalam satu transaksi (Cart Guard).
 * Aturan: Satu keranjang hanya boleh berisi PO saja atau Ready Stock saja.
 */
export function validateCartConsistency(cartItems: CartItem[]) {
  if (cartItems.length <= 1) return { valid: true };

  const hasPreOrder = cartItems.some(item => item.is_preorder);
  const hasReadyStock = cartItems.some(item => !item.is_preorder);

  if (hasPreOrder && hasReadyStock) {
    return {
      valid: false,
      message: "Sistem tidak mengizinkan pencampuran produk Pre-Order dan Ready Stock dalam satu pesanan. Mohon pesan secara terpisah."
    };
  }

  return { valid: true };
}
