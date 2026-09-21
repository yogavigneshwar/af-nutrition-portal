export type Role = 'admin' | 'coach' | 'cashier' | 'kitchen';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  branch: string;
  avatar?: string;
}

export type CustomerType = 'New Customer' | 'Existing Customer' | 'Associate' | 'JP Member' | 'Preferred Customer' | 'Walk-in';
export type ProgramDuration = '3 Day Trial' | '15 Days' | '21 Days' | '30 Days' | '60 Days' | 'Custom';
export type CustomerStatus = 'Active' | 'Completed' | 'Pending Renewal' | 'Inactive';
export type PaymentStatus = 'Paid' | 'Partial' | 'Pending';
export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Plan Credit';

export interface Customer {
  id: string; // e.g., AF-2026-001
  fullName: string;
  phone: string;
  email?: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  dob?: string;
  address?: string;
  emergencyContact?: string;
  branch: string;
  
  // Referral & Counseling
  inviterType: 'Friend/Family' | 'Walk-in' | 'Digital/Social Media' | 'Coach' | 'Member';
  inviterName?: string;
  inviterContact?: string;
  counselingBy: string; // Coach/Counselor name
  healthGoals: string[]; // e.g. Weight Loss, Muscle Gain, Energy Boost
  medicalNotes?: string;
  
  // Program Details
  customerType: CustomerType;
  currentProgram: string;
  programDuration: ProgramDuration;
  durationInDays: number;
  startDate: string;
  endDate: string;
  
  // Shake Allocation
  allottedShakes: number;
  consumedShakes: number;
  remainingShakes: number;
  dailyShakeFrequency: number;
  pricePerDay: number;
  totalPlanCost: number;
  amountPaid: number;
  balanceDue: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  
  // Lifecycle Metrics
  status: CustomerStatus;
  clubVisitsCount: number;
  seminarAttendanceCount: number;
  totalOrdersCount: number;
  totalSpent: number;
  remarks?: string;
  associateId?: string;
  convertedToAssociateAt?: string;
  
  createdAt: string;
  updatedAt: string;
}

export type ProductCategory = 'Shakes' | 'Combos' | 'Energy Teas' | 'Protein Snacks' | 'Add-ons' | 'Supplements';

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Product {
  id: string;
  code: string; // SKU e.g. SHK-01
  name: string;
  category: ProductCategory;
  description: string;
  price: number;
  costPrice: number;
  stock: number;
  minStockAlert: number;
  active: boolean;
  image?: string;
  flavor?: string;
  nutritionInfo?: NutritionInfo;
  isCombo?: boolean;
  comboItems?: string[];
}

export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

export interface CartItem {
  product: Product;
  quantity: number;
  customNotes?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  category: ProductCategory;
  price: number;
  quantity: number;
  subtotal: number;
  notes?: string;
}

export interface Order {
  id: string; // e.g. ORD-2026-1001
  tokenNumber: number; // e.g. 101
  customerId: string;
  customerName: string;
  customerPhone?: string;
  isWalkIn: boolean;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  branch: string;
  staffName: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  readyAt?: string;
  completedAt?: string;
}

export interface ShakeIntakeLog {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  shakeCount: number;
  flavorCombo: string;
  notes?: string;
  staffName: string;
  previousBalance: number;
  newBalance: number;
  createdAt: string;
}

export interface SeminarAttendance {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  date: string;
  topic: string;
  remarks?: string;
  staffName: string;
  attended: boolean;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. INV-2026-0089
  orderId?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  type: 'POS_ORDER' | 'PROGRAM_REGISTRATION' | 'PROGRAM_RENEWAL';
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  date: string;
  branch: string;
  staffName: string;
  notes?: string;
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  changeAmount: number;
  reason: 'POS Sale' | 'Restock' | 'Damage/Waste' | 'Manual Audit';
  previousStock: number;
  newStock: number;
  timestamp: string;
}
