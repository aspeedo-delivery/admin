
// This is a generic User type for the mock setup
export type User = {
  id: string;
  email: string;
  role: 'admin' | 'restaurant' | 'warehouse';
};

export type UserProfile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  email: string | null;
  aadhaar: string | null;
  role: 'user' | 'admin' | 'delivery' | null;
  kyc_status: 'pending' | 'approved' | 'rejected' | null;
  created_at: string;
  wallet_balance?: number;
};

export type Product = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  stock: number;
  category_id: string;
  image_url: string | null;
  created_at: string;
  category_name: string;
};

export type ProductCategory = {
  id: string;
  name: string;
};

export type CourierOrder = {
  id: string;
  user_id: string;
  product_id: string | null;
  pickup_address: string;
  drop_address: string;
  amount: number;
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';
  accepted_by: string | null; // delivery partner id
  notes: string | null;
  created_at: string;
};

export type Restaurant = {
  id: string;
  name: string;
  logo_url: string | null;
  cuisine_types: string[] | null;
  address: string | null;
  avg_price: number | null;
  rating: number | null;
  is_active: boolean;
  created_at: string;
};

export type RestaurantCategory = {
  id: string;
  restaurant_id: string;
  category_name: string;
};

export type MenuItem = {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number;
  half_price: number | null;
  is_veg: boolean;
  in_stock: boolean;
  created_at: string;
};

export type MenuItemWithCategory = MenuItem & {
  restaurant_categories: { category_name: string } | null;
};

export type RestaurantOrder = {
  id: string;
  user_id: string;
  restaurant_id: string;
  total_amount: number;
  taxes: number | null;
  packaging_fee: number | null;
  delivery_fee: number | null;
  status: 'pending' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  payment_method: 'cod' | 'online' | null;
  delivery_partner_id: string | null;
  created_at: string;
  user_profiles: { full_name: string | null } | null;
  restaurants: { name: string | null } | null;
};

export type OrderItem = {
  id: string;
  order_id: string;
  item_id: string;
  quantity: number;
  price_per_unit: number;
  special_instruction: string | null;
  menu_items?: { name: string }; // For joins
};

export type DeliveryAssignment = {
  id: string;
  order_id: string;
  delivery_partner_id: string;
  accept_time: string | null;
  complete_time: string | null;
};

export type Bid = {
  id: string;
  order_id: string;
  delivery_partner_id: string;
  bid_amount: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
};

export type WalletBalance = {
  user_id: string;
  balance: number;
};

export type WalletTransaction = {
  id: string;
  user_id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string | null;
  timestamp: string;
};

export type RestaurantReview = {
  id: string;
  order_id: string;
  user_id: string;
  restaurant_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};
