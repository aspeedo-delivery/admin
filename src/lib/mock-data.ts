
import { User, UserProfile, RestaurantOrder, Restaurant, MenuItemWithCategory, RestaurantCategory, Product, ProductCategory } from "@/types";

export const mockAuthUsers: (User & { password?: string })[] = [
  { id: 'usr_admin', email: 'a@gmail.com', password: '123456', role: 'admin' },
  { id: 'usr_restaurant', email: 'a@gmail.com', password: '123456', role: 'restaurant' },
  { id: 'usr_warehouse', email: 'a@gmail.com', password: '123456', role: 'warehouse' },
];

export const mockUserProfiles: UserProfile[] = [
  { id: 'usr_1', full_name: 'John Doe', email: 'john@example.com', phone: '123-456-7890', address: null, aadhaar: null, role: 'user', kyc_status: 'approved', created_at: new Date().toISOString(), wallet_balance: 150.75 },
  { id: 'usr_2', full_name: 'Jane Smith', email: 'jane@example.com', phone: '234-567-8901', address: null, aadhaar: null, role: 'user', kyc_status: 'pending', created_at: new Date().toISOString(), wallet_balance: 50.00 },
  { id: 'usr_3', full_name: 'Admin User', email: 'admin@example.com', phone: '345-678-9012', address: null, aadhaar: null, role: 'admin', kyc_status: 'approved', created_at: new Date().toISOString(), wallet_balance: 1000.00 },
  { id: 'usr_4', full_name: 'Delivery Pro', email: 'delivery@example.com', phone: '456-789-0123', address: null, aadhaar: null, role: 'delivery', kyc_status: 'rejected', created_at: new Date().toISOString(), wallet_balance: 25.50 },
  { id: 'usr_5', full_name: 'Emily White', email: 'emily@example.com', phone: '567-890-1234', address: null, aadhaar: null, role: 'user', kyc_status: 'approved', created_at: new Date().toISOString(), wallet_balance: 300.20 },
  { id: 'usr_6', full_name: 'Michael Green', email: 'michael@example.com', phone: '678-901-2345', address: null, aadhaar: null, role: 'user', kyc_status: 'pending', created_at: new Date().toISOString(), wallet_balance: 0 },
  { id: 'usr_7', full_name: 'Samantha Blue', email: 'samantha@example.com', phone: '789-012-3456', address: null, aadhaar: null, role: 'delivery', kyc_status: 'approved', created_at: new Date().toISOString(), wallet_balance: 75.00 },
  { id: 'usr_8', full_name: 'David Black', email: 'david@example.com', phone: '890-123-4567', address: null, aadhaar: null, role: 'user', kyc_status: 'approved', created_at: new Date().toISOString(), wallet_balance: 550.00 },
];

export const mockDashboardStats = {
  users: 1254,
  restaurants: 78,
  delivery_partners: 152,
  totalRevenue: 125678.90,
  pendingOrders: 12,
};

export const mockRecentOrders: (Partial<RestaurantOrder> & { user_profiles: Partial<UserProfile> | null })[] = [
  { id: 'ORD-001', total_amount: 45.50, status: 'delivered', created_at: new Date().toISOString(), user_profiles: { full_name: 'John Doe' } },
  { id: 'ORD-002', total_amount: 22.00, status: 'pending', created_at: new Date().toISOString(), user_profiles: { full_name: 'Jane Smith' } },
  { id: 'ORD-003', total_amount: 89.99, status: 'preparing', created_at: new Date().toISOString(), user_profiles: { full_name: 'Peter Jones' } },
  { id: 'ORD-004', total_amount: 15.20, status: 'out_for_delivery', created_at: new Date().toISOString(), user_profiles: { full_name: 'Mary Poppins' } },
  { id: 'ORD-005', total_amount: 30.00, status: 'delivered', created_at: new Date().toISOString(), user_profiles: { full_name: 'Clark Kent' } },
];


export const mockFoodOrders: RestaurantOrder[] = [
  { id: 'ord_1', user_id: 'usr_1', restaurant_id: 'res_1', total_amount: 45.50, taxes: 4.55, packaging_fee: 2.00, delivery_fee: 5.00, status: 'delivered', payment_method: 'online', delivery_partner_id: 'dp_1', created_at: new Date('2023-10-27T10:00:00Z').toISOString(), user_profiles: { full_name: 'John Doe' }, restaurants: { name: 'The Gourmet Place' } },
  { id: 'ord_2', user_id: 'usr_2', restaurant_id: 'res_2', total_amount: 22.00, taxes: 2.20, packaging_fee: 1.50, delivery_fee: 4.00, status: 'pending', payment_method: 'cod', delivery_partner_id: null, created_at: new Date('2023-10-27T11:30:00Z').toISOString(), user_profiles: { full_name: 'Jane Smith' }, restaurants: { name: 'Taco Town' } },
  { id: 'ord_3', user_id: 'usr_3', restaurant_id: 'res_3', total_amount: 89.99, taxes: 9.00, packaging_fee: 3.00, delivery_fee: 7.00, status: 'preparing', payment_method: 'online', delivery_partner_id: 'dp_2', created_at: new Date('2023-10-27T12:15:00Z').toISOString(), user_profiles: { full_name: 'Admin User' }, restaurants: { name: 'Curry House' } },
  { id: 'ord_4', user_id: 'usr_4', restaurant_id: 'res_4', total_amount: 15.20, taxes: 1.52, packaging_fee: 1.00, delivery_fee: 3.50, status: 'cancelled', payment_method: 'online', delivery_partner_id: null, created_at: new Date('2023-10-27T13:00:00Z').toISOString(), user_profiles: { full_name: 'Delivery Pro' }, restaurants: { name: 'Sushi Central' } },
  { id: 'ord_5', user_id: 'usr_5', restaurant_id: 'res_5', total_amount: 30.00, taxes: 3.00, packaging_fee: 1.50, delivery_fee: 4.50, status: 'out_for_delivery', payment_method: 'cod', delivery_partner_id: 'dp_3', created_at: new Date('2023-10-27T14:00:00Z').toISOString(), user_profiles: { full_name: 'Emily White' }, restaurants: { name: 'Burger Barn' } },
];


export const mockRestaurants: Restaurant[] = [
  { id: 'res_1', name: 'The Gourmet Place', logo_url: 'https://placehold.co/100x100.png', cuisine_types: ['Italian', 'Pizza'], address: '123 Main St', avg_price: 25, rating: 4.5, is_active: true, created_at: new Date().toISOString() },
  { id: 'res_2', name: 'Taco Town', logo_url: 'https://placehold.co/100x100.png', cuisine_types: ['Mexican'], address: '456 Oak Ave', avg_price: 15, rating: 4.2, is_active: true, created_at: new Date().toISOString() },
  { id: 'res_3', name: 'Curry House', logo_url: 'https://placehold.co/100x100.png', cuisine_types: ['Indian'], address: '789 Pine Ln', avg_price: 20, rating: 4.8, is_active: false, created_at: new Date().toISOString() },
  { id: 'res_4', name: 'Sushi Central', logo_url: null, cuisine_types: ['Japanese', 'Sushi'], address: '101 Maple Dr', avg_price: 35, rating: 4.6, is_active: true, created_at: new Date().toISOString() },
  { id: 'res_5', name: 'Burger Barn', logo_url: 'https://placehold.co/100x100.png', cuisine_types: ['American', 'Burgers'], address: '212 Birch Rd', avg_price: 18, rating: 4.0, is_active: true, created_at: new Date().toISOString() },
];

export const mockRestaurantCategories: RestaurantCategory[] = [
  { id: 'cat_1', restaurant_id: 'res_1', category_name: 'Appetizers' },
  { id: 'cat_2', restaurant_id: 'res_1', category_name: 'Main Course' },
  { id: 'cat_3', restaurant_id: 'res_2', category_name: 'Tacos' },
  { id: 'cat_4', restaurant_id: 'res_2', category_name: 'Burritos' },
];

export const mockMenuItemsWithCategory: MenuItemWithCategory[] = [
  { id: 'item_1', restaurant_id: 'res_1', category_id: 'cat_1', name: 'Bruschetta', description: 'Grilled bread with tomatoes, garlic, and olive oil.', image_url: 'https://placehold.co/100x100.png', price: 8.99, half_price: null, is_veg: true, in_stock: true, created_at: new Date().toISOString(), restaurant_categories: { category_name: 'Appetizers' } },
  { id: 'item_2', restaurant_id: 'res_1', category_id: 'cat_2', name: 'Spaghetti Carbonara', description: 'Pasta with eggs, cheese, pancetta, and pepper.', image_url: 'https://placehold.co/100x100.png', price: 15.50, half_price: null, is_veg: false, in_stock: true, created_at: new Date().toISOString(), restaurant_categories: { category_name: 'Main Course' } },
  { id: 'item_3', restaurant_id: 'res_2', category_id: 'cat_3', name: 'Carne Asada Taco', description: 'Grilled steak in a corn tortilla.', image_url: 'https://placehold.co/100x100.png', price: 4.50, half_price: null, is_veg: false, in_stock: true, created_at: new Date().toISOString(), restaurant_categories: { category_name: 'Tacos' } },
  { id: 'item_4', restaurant_id: 'res_2', category_id: 'cat_4', name: 'Bean and Cheese Burrito', description: 'A classic burrito with beans and cheese.', image_url: 'https://placehold.co/100x100.png', price: 7.99, half_price: null, is_veg: true, in_stock: false, created_at: new Date().toISOString(), restaurant_categories: { category_name: 'Burritos' } },
];


export const mockProductCategories: ProductCategory[] = [
  { id: 'cat_prod_1', name: 'Electronics' },
  { id: 'cat_prod_2', name: 'Books' },
];

export const mockProductsWithCategory: (Product & { category?: { name: string } })[] = [
  { id: 'prod_1', title: 'Smartphone', description: 'Latest model smartphone', price: 699.99, stock: 150, category_id: 'cat_prod_1', image_url: 'https://placehold.co/100x100.png', created_at: new Date().toISOString(), category_name: 'Electronics', category: { name: 'Electronics' } },
  { id: 'prod_2', title: 'Laptop', description: 'High-performance laptop', price: 1200.00, stock: 75, category_id: 'cat_prod_1', image_url: 'https://placehold.co/100x100.png', created_at: new Date().toISOString(), category_name: 'Electronics', category: { name: 'Electronics' } },
  { id: 'prod_3', title: 'The Great Novel', description: 'A best-selling novel.', price: 19.99, stock: 300, category_id: 'cat_prod_2', image_url: 'https://placehold.co/100x100.png', created_at: new Date().toISOString(), category_name: 'Books', category: { name: 'Books' } },
];


export const mockWarehouseProducts = [
  {
    "productId": "PRD-98231",
    "name": "Laptop Package",
    "status": "In Transit",
    "sourceAgent": "Warehouse (Delhi)",
    "destinationAgent": "Warehouse (Mumbai)",
    "currentLocation": "In Transport Van TR-101",
    "warehouseRack": "N/A",
    "qrCode": "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PRD-98231",
    "receiverName": "Aman Verma",
    "receiverPhone": "+91 9876543210",
    "otp": "1984"
  },
  {
    "productId": "PRD-77321",
    "name": "Mobile Box",
    "status": "Stored in Warehouse",
    "sourceAgent": "Warehouse (Pune)",
    "destinationAgent": "Warehouse (Bangalore)",
    "currentLocation": "Warehouse",
    "warehouseRack": "R1-A2",
    "qrCode": "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PRD-77321",
    "receiverName": "Rohit Sharma",
    "receiverPhone": "+91 9988776655",
    "otp": "4567"
  },
  {
    "productId": "PRD-12456",
    "name": "Documents Folder",
    "status": "Delivered",
    "sourceAgent": "Warehouse (Delhi)",
    "destinationAgent": "Warehouse (Mumbai)",
    "currentLocation": "Delivered",
    "warehouseRack": "N/A",
    "qrCode": "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PRD-12456",
    "receiverName": "Priya Singh",
    "receiverPhone": "+91 9123456789",
    "otp": "9876"
  },
  {
    "productId": "PRD-33445",
    "name": "Artisan Goods",
    "status": "Reached Destination Agent",
    "sourceAgent": "Warehouse (Pune)",
    "destinationAgent": "Warehouse (Bangalore)",
    "currentLocation": "Bangalore Hub",
    "warehouseRack": "N/A",
    "qrCode": "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PRD-33445",
    "receiverName": "Sameer Khan",
    "receiverPhone": "+91 8877665544",
    "otp": "3322"
  },
  {
    "productId": "PRD-55667",
    "name": "Book Crate",
    "status": "Stored in Warehouse",
    "sourceAgent": "Warehouse (Delhi)",
    "destinationAgent": "Warehouse (Bangalore)",
    "currentLocation": "Warehouse",
    "warehouseRack": "R4-C1",
    "qrCode": "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PRD-55667",
    "receiverName": "Anjali Mehta",
    "receiverPhone": "+91 7766554433",
    "otp": "1122"
  },
  {
    "productId": "PRD-88990",
    "name": "Electronics Kit",
    "status": "Assigned to Transport",
    "sourceAgent": "Warehouse (Pune)",
    "destinationAgent": "Warehouse (Mumbai)",
    "currentLocation": "Warehouse",
    "warehouseRack": "R3-D4",
    "qrCode": "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PRD-88990",
    "receiverName": "Vikram Rathore",
    "receiverPhone": "+91 6655443322",
    "otp": "8899"
  }
];

export const mockTransport = [
  { "vehicleId": "TR-101", "driver": "Rajesh Kumar", "status": "Active", "route": "Delhi → Mumbai" },
  { "vehicleId": "TR-202", "driver": "Suraj Singh", "status": "Idle", "route": "Pune → Bangalore" },
  { "vehicleId": "TR-103", "driver": "Anil Yadav", "status": "Active", "route": "Mumbai → Delhi" },
  { "vehicleId": "TR-204", "driver": "Manoj Patil", "status": "Idle", "route": "Bangalore → Pune" }
];
