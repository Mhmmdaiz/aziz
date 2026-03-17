-- TABEL PESANAN (ORDERS)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id TEXT UNIQUE NOT NULL, -- Format: CHCKT-XXXX
  status TEXT NOT NULL DEFAULT 'pending', -- pending, settlement, cancel, expire
  total_price BIGINT NOT NULL,
  snap_token TEXT,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  shipping_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- TABEL ITEM PESANAN (ORDER_ITEMS)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  price BIGINT NOT NULL,
  quantity INTEGER NOT NULL,
  size TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS POLICIES
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Pengguna hanya bisa melihat pesanan mereka sendiri
CREATE POLICY "Users can view their own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);

-- Admin bisa melihat semua pesanan
CREATE POLICY "Admins can view all orders"
ON orders FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- Kebijakan untuk order_items
CREATE POLICY "Users can view their own order items"
ON order_items FOR SELECT
USING (EXISTS (
  SELECT 1 FROM orders 
  WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
));

CREATE POLICY "Admins can view all order items"
ON order_items FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));
