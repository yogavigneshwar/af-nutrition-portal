'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  Customer, Product, Order, OrderStatus, ShakeIntakeLog, 
  SeminarAttendance, Invoice, InventoryLog, User, CartItem,
  PaymentMethod, PaymentStatus, ProgramDuration, CustomerType 
} from '../types';
import { 
  SEED_USERS, SEED_PRODUCTS, SEED_CUSTOMERS, 
  SEED_ORDERS, SEED_SHAKE_LOGS, SEED_SEMINARS, SEED_INVOICES 
} from '../lib/seedData';
import { 
  generateCustomerId, generateOrderId, generateInvoiceNumber, 
  calculateProgramDays, calculateTotalPlanCost 
} from '../lib/utils';

interface AppContextType {
  // Authentication & State
  currentUser: User;
  setCurrentUser: (user: User) => void;
  isAuthenticated: boolean;
  login: (email: string, password?: string, branch?: string) => boolean;
  logout: () => void;
  customers: Customer[];
  products: Product[];
  orders: Order[];
  shakeLogs: ShakeIntakeLog[];
  seminars: SeminarAttendance[];
  invoices: Invoice[];
  inventoryLogs: InventoryLog[];
  cart: CartItem[];
  selectedBranch: string;
  setSelectedBranch: (branch: string) => void;

  // Customer Actions
  addCustomer: (data: Partial<Customer>, paymentInfo: { amountPaid: number; paymentMethod: PaymentMethod; notes?: string }) => Customer;
  renewCustomer: (customerId: string, duration: ProgramDuration, customDays?: number, pricePerDay?: number, amountPaid?: number, paymentMethod?: PaymentMethod) => void;
  updateCustomer: (customerId: string, updates: Partial<Customer>) => void;
  promoteCustomerToAssociate: (customerId: string, notes?: string) => Customer | undefined;
  getCustomerById: (id: string) => Customer | undefined;

  // POS & Cart Actions
  addToCart: (product: Product, quantity?: number, notes?: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  createOrder: (orderInfo: {
    customerId: string;
    customerName: string;
    customerPhone?: string;
    isWalkIn: boolean;
    paymentMethod: PaymentMethod;
    discount?: number;
    remarks?: string;
  }) => Order;

  // Kitchen & Order Actions
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  getOrderById: (orderId: string) => Order | undefined;

  // Shake & Seminar Actions
  logDailyShakeIntake: (customerId: string, shakeCount: number, flavorCombo: string, notes?: string) => ShakeIntakeLog | null;
  logSeminarAttendance: (customerId: string, topic: string, remarks?: string) => SeminarAttendance | null;

  // Catalog & Inventory Actions
  updateProductStock: (productId: string, newStock: number, reason: 'Restock' | 'Damage/Waste' | 'Manual Audit') => void;
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (productId: string, updates: Partial<Product>) => void;

  // Bulk Uploads & System
  bulkImportCustomers: (importedList: Partial<Customer>[]) => number;
  bulkImportProducts: (importedList: Partial<Product>[]) => number;
  resetToSeedData: () => void;

  // Real-time Computed Dashboard & Insight Metrics
  metrics: {
    totalRevenue: number;
    todayRevenue: number;
    weeklyRevenue: number;
    totalOrders: number;
    todayOrders: number;
    pendingOrders: number;
    kitchenActive: number;
    readyOrders: number;
    totalCustomers: number;
    newCustomersCount: number;
    existingProfilesCount: number;
    associatesCount: number;
    jpMembersCount: number;
    preferredCustomersCount: number;
    todayShakesConsumed: number;
    lowStockProducts: Product[];
    recentOrders: Order[];
    bestSellers: { name: string; count: number; revenue: number }[];
    recentShakeVisits: ShakeIntakeLog[];
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CUSTOMERS: 'af_nbos_customers_v1',
  PRODUCTS: 'af_nbos_products_v1',
  ORDERS: 'af_nbos_orders_v1',
  SHAKES: 'af_nbos_shakes_v1',
  SEMINARS: 'af_nbos_seminars_v1',
  INVOICES: 'af_nbos_invoices_v1',
  INVENTORY_LOGS: 'af_nbos_inventory_logs_v1',
  USER: 'af_nbos_user_v1',
  AUTH: 'af_nbos_auth_v1',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(SEED_USERS[0]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [shakeLogs, setShakeLogs] = useState<ShakeIntakeLog[]>([]);
  const [seminars, setSeminars] = useState<SeminarAttendance[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('Ayanavaram Main Branch');
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize from LocalStorage or Seed Data
  useEffect(() => {
    try {
      const storedCustomers = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      const storedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      const storedShakes = localStorage.getItem(STORAGE_KEYS.SHAKES);
      const storedSeminars = localStorage.getItem(STORAGE_KEYS.SEMINARS);
      const storedInvoices = localStorage.getItem(STORAGE_KEYS.INVOICES);
      const storedAuth = localStorage.getItem(STORAGE_KEYS.AUTH);
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

      setCustomers(storedCustomers ? JSON.parse(storedCustomers) : SEED_CUSTOMERS);
      setProducts(storedProducts ? JSON.parse(storedProducts) : SEED_PRODUCTS);
      setOrders(storedOrders ? JSON.parse(storedOrders) : SEED_ORDERS);
      setShakeLogs(storedShakes ? JSON.parse(storedShakes) : SEED_SHAKE_LOGS);
      setSeminars(storedSeminars ? JSON.parse(storedSeminars) : SEED_SEMINARS);
      setInvoices(storedInvoices ? JSON.parse(storedInvoices) : SEED_INVOICES);

      if (storedAuth === 'true') {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch {}
      }
    } catch (e) {
      console.error('Failed to load from storage, using seed data', e);
      setCustomers(SEED_CUSTOMERS);
      setProducts(SEED_PRODUCTS);
      setOrders(SEED_ORDERS);
      setShakeLogs(SEED_SHAKE_LOGS);
      setSeminars(SEED_SEMINARS);
      setInvoices(SEED_INVOICES);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Sync to LocalStorage on changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      localStorage.setItem(STORAGE_KEYS.SHAKES, JSON.stringify(shakeLogs));
      localStorage.setItem(STORAGE_KEYS.SEMINARS, JSON.stringify(seminars));
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
    } catch (e) {
      console.error('Failed to persist to storage', e);
    }
  }, [customers, products, orders, shakeLogs, seminars, invoices, isHydrated]);

  const login = (email: string, _password?: string, branch?: string): boolean => {
    const found = SEED_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    const userToSet: User = found || {
      id: `USR-${Date.now()}`,
      name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email: email,
      role: 'admin',
      branch: branch || selectedBranch || 'Ayanavaram Main Branch',
    };
    if (branch) {
      userToSet.branch = branch;
      setSelectedBranch(branch);
    }
    setCurrentUser(userToSet);
    setIsAuthenticated(true);
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userToSet));
      localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
    } catch (e) {
      console.error(e);
    }
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH, 'false');
    } catch (e) {
      console.error(e);
    }
  };

  // Customer Management
  const addCustomer = (
    data: Partial<Customer>,
    paymentInfo: { amountPaid: number; paymentMethod: PaymentMethod; notes?: string }
  ): Customer => {
    const durationDays = calculateProgramDays(data.programDuration || '30 Days', data.durationInDays);
    const totalCost = data.totalPlanCost !== undefined ? Number(data.totalPlanCost) : calculateTotalPlanCost(durationDays, data.pricePerDay || 150);
    const dailyRate = data.pricePerDay || (durationDays > 0 ? Math.round(totalCost / durationDays) : 150);
    const shakesAllotted = data.allottedShakes || durationDays * (data.dailyShakeFrequency || 1);
    const newId = generateCustomerId(customers.length);
    const today = new Date();
    const startDate = data.startDate || today.toISOString().split('T')[0];
    const end = new Date(startDate);
    end.setDate(end.getDate() + durationDays);
    const endDate = data.endDate || end.toISOString().split('T')[0];

    const amountPaid = paymentInfo.amountPaid !== undefined ? Number(paymentInfo.amountPaid) : totalCost;
    const balanceDue = Math.max(0, totalCost - amountPaid);
    const paymentStatus: PaymentStatus = balanceDue === 0 ? 'Paid' : amountPaid > 0 ? 'Partial' : 'Pending';

    const newCustomer: Customer = {
      id: newId,
      fullName: data.fullName || 'Unknown Customer',
      phone: data.phone || '',
      email: data.email || '',
      gender: data.gender || 'Male',
      age: data.age || 30,
      address: data.address || '',
      emergencyContact: data.emergencyContact || '',
      branch: data.branch || selectedBranch,
      inviterType: data.inviterType || 'Walk-in',
      inviterName: data.inviterName || '',
      inviterContact: data.inviterContact || '',
      counselingBy: data.counselingBy || currentUser.name,
      healthGoals: data.healthGoals || ['Weight Loss'],
      medicalNotes: data.medicalNotes || '',
      customerType: data.customerType || 'New Customer',
      currentProgram: data.currentProgram || `${data.programDuration || '30 Days'} Wellness Transformation`,
      programDuration: data.programDuration || '30 Days',
      durationInDays: durationDays,
      startDate: startDate,
      endDate: endDate,
      allottedShakes: shakesAllotted,
      consumedShakes: 0,
      remainingShakes: shakesAllotted,
      dailyShakeFrequency: data.dailyShakeFrequency || 1,
      pricePerDay: dailyRate,
      totalPlanCost: totalCost,
      amountPaid: amountPaid,
      balanceDue: balanceDue,
      paymentStatus: paymentStatus,
      paymentMethod: paymentInfo.paymentMethod,
      status: 'Active',
      clubVisitsCount: 0,
      seminarAttendanceCount: 0,
      totalOrdersCount: 0,
      totalSpent: amountPaid,
      remarks: data.remarks || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Create Registration Invoice
    const newInvoice: Invoice = {
      id: `INV-${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(invoices.length),
      customerId: newId,
      customerName: newCustomer.fullName,
      customerPhone: newCustomer.phone,
      type: 'PROGRAM_REGISTRATION',
      items: [
        {
          description: `${newCustomer.programDuration} ${newCustomer.currentProgram} (${newCustomer.allottedShakes} Shakes)`,
          quantity: 1,
          unitPrice: totalCost,
          total: totalCost,
        }
      ],
      subtotal: totalCost,
      tax: 0,
      discount: 0,
      total: totalCost,
      amountPaid: amountPaid,
      balanceDue: balanceDue,
      paymentMethod: paymentInfo.paymentMethod,
      paymentStatus: paymentStatus,
      date: startDate,
      branch: newCustomer.branch,
      staffName: currentUser.name,
      notes: paymentInfo.notes || 'Initial program registration and shake allocation',
    };

    setCustomers(prev => [newCustomer, ...prev]);
    setInvoices(prev => [newInvoice, ...prev]);
    return newCustomer;
  };

  const renewCustomer = (
    customerId: string, 
    duration: ProgramDuration, 
    customDays?: number, 
    pricePerDay = 150, 
    amountPaid = 0, 
    paymentMethod: PaymentMethod = 'UPI'
  ) => {
    const cust = customers.find(c => c.id === customerId);
    if (!cust) return;

    const addedDays = calculateProgramDays(duration, customDays);
    const addedShakes = addedDays * cust.dailyShakeFrequency;
    const planCost = calculateTotalPlanCost(addedDays, pricePerDay);
    const balanceDue = Math.max(0, planCost - amountPaid);
    const paymentStatus: PaymentStatus = balanceDue === 0 ? 'Paid' : amountPaid > 0 ? 'Partial' : 'Pending';

    const startDate = new Date().toISOString().split('T')[0];
    const end = new Date();
    end.setDate(end.getDate() + addedDays);
    const endDate = end.toISOString().split('T')[0];

    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        return {
          ...c,
          currentProgram: `${duration} Renewal Package`,
          programDuration: duration,
          durationInDays: c.durationInDays + addedDays,
          startDate: startDate,
          endDate: endDate,
          allottedShakes: c.allottedShakes + addedShakes,
          remainingShakes: c.remainingShakes + addedShakes,
          pricePerDay: pricePerDay,
          totalPlanCost: c.totalPlanCost + planCost,
          amountPaid: c.amountPaid + amountPaid,
          balanceDue: balanceDue,
          paymentStatus: paymentStatus,
          paymentMethod: paymentMethod,
          status: 'Active',
          customerType: 'Existing Customer',
          totalSpent: c.totalSpent + amountPaid,
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    }));

    const newInvoice: Invoice = {
      id: `INV-${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(invoices.length),
      customerId: cust.id,
      customerName: cust.fullName,
      customerPhone: cust.phone,
      type: 'PROGRAM_RENEWAL',
      items: [
        {
          description: `${duration} Renewal Plan (+${addedShakes} Shakes)`,
          quantity: 1,
          unitPrice: planCost,
          total: planCost,
        }
      ],
      subtotal: planCost,
      tax: 0,
      discount: 0,
      total: planCost,
      amountPaid: amountPaid,
      balanceDue: balanceDue,
      paymentMethod: paymentMethod,
      paymentStatus: paymentStatus,
      date: startDate,
      branch: cust.branch,
      staffName: currentUser.name,
      notes: `Program renewal: +${addedDays} days & +${addedShakes} shakes added.`,
    };

    setInvoices(prev => [newInvoice, ...prev]);
  };

  const updateCustomer = (customerId: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => (c.id === customerId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c)));
  };

  const promoteCustomerToAssociate = (customerId: string, notes?: string): Customer | undefined => {
    const today = new Date().toISOString().split('T')[0];
    let updatedCustomer: Customer | undefined;

    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        const associateCode = c.associateId || `ASC-${c.id.replace('AF-', '')}`;
        const newRemarks = [
          c.remarks,
          notes,
          `[Promoted to Associate on ${today} by ${currentUser.name}]`
        ].filter(Boolean).join(' | ');

        updatedCustomer = {
          ...c,
          customerType: 'Associate',
          associateId: associateCode,
          convertedToAssociateAt: c.convertedToAssociateAt || today,
          remarks: newRemarks,
          updatedAt: new Date().toISOString(),
        };
        return updatedCustomer;
      }
      return c;
    }));

    return updatedCustomer;
  };

  const getCustomerById = (id: string) => customers.find(c => c.id === id);

  // Cart & POS
  const addToCart = (product: Product, quantity = 1, notes = '') => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity, customNotes: notes || item.customNotes }
            : item
        );
      }
      return [...prev, { product, quantity, customNotes: notes }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => item.product.id === productId ? { ...item, quantity } : item));
  };

  const clearCart = () => setCart([]);

  const createOrder = (orderInfo: {
    customerId: string;
    customerName: string;
    customerPhone?: string;
    isWalkIn: boolean;
    paymentMethod: PaymentMethod;
    discount?: number;
    remarks?: string;
  }): Order => {
    const isMember = !orderInfo.isWalkIn && !!orderInfo.customerId && orderInfo.customerId !== 'WALK-IN';
    
    // For members, standard shakes are covered under their membership plan (0 chargeable)
    const orderItems = cart.map(item => {
      const isCoveredShake = isMember && item.product.category === 'Shakes';
      const effectivePrice = isCoveredShake ? 0 : item.product.price;
      const itemSubtotal = effectivePrice * item.quantity;
      const displayName = isCoveredShake ? `${item.product.name} (Plan Quota)` : item.product.name;

      return {
        productId: item.product.id,
        productName: displayName,
        category: item.product.category,
        price: effectivePrice,
        quantity: item.quantity,
        subtotal: itemSubtotal,
        notes: item.customNotes,
      };
    });

    const subtotal = orderItems.reduce((acc, item) => acc + item.subtotal, 0);
    const tax = 0; // Tax / GST removed
    const discount = orderInfo.discount || 0;
    const total = Math.max(0, subtotal - discount);
    
    // Determine next token number
    const maxToken = orders.reduce((max, o) => Math.max(max, o.tokenNumber || 100), 100);
    const tokenNumber = maxToken >= 999 ? 101 : maxToken + 1;
    const orderId = generateOrderId(orders.length);

    const newOrder: Order = {
      id: orderId,
      tokenNumber: tokenNumber,
      customerId: orderInfo.customerId,
      customerName: orderInfo.customerName,
      customerPhone: orderInfo.customerPhone,
      isWalkIn: orderInfo.isWalkIn,
      items: orderItems,
      subtotal: subtotal,
      tax: 0,
      discount: discount,
      total: total,
      paymentMethod: orderInfo.paymentMethod,
      paymentStatus: 'Paid',
      orderStatus: 'PENDING',
      branch: selectedBranch,
      staffName: currentUser.name,
      remarks: orderInfo.remarks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Deduct stock for all purchased items
    setProducts(prev => prev.map(p => {
      const cartItem = cart.find(ci => ci.product.id === p.id);
      if (cartItem) {
        const newStock = Math.max(0, p.stock - cartItem.quantity);
        return { ...p, stock: newStock };
      }
      return p;
    }));

    // Generate Invoice for POS Order (only add-on amounts are charged)
    const newInvoice: Invoice = {
      id: `INV-${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(invoices.length),
      orderId: newOrder.id,
      customerId: newOrder.customerId,
      customerName: newOrder.customerName,
      customerPhone: newOrder.customerPhone || 'Walk-in',
      type: 'POS_ORDER',
      items: orderItems.map(item => ({
        description: item.productName,
        quantity: item.quantity,
        unitPrice: item.price,
        total: item.subtotal,
      })),
      subtotal: subtotal,
      tax: 0,
      discount: discount,
      total: total,
      amountPaid: total,
      balanceDue: 0,
      paymentMethod: orderInfo.paymentMethod,
      paymentStatus: 'Paid',
      date: new Date().toISOString().split('T')[0],
      branch: selectedBranch,
      staffName: currentUser.name,
      notes: orderInfo.remarks,
    };

    // Update customer stats if registered customer (and deduct shake count if shake was in cart)
    if (isMember) {
      const shakeCountInOrder = cart
        .filter(ci => ci.product.category === 'Shakes')
        .reduce((sum, ci) => sum + ci.quantity, 0);

      setCustomers(prev => prev.map(c => {
        if (c.id === orderInfo.customerId) {
          const newRemaining = shakeCountInOrder > 0 ? Math.max(0, c.remainingShakes - shakeCountInOrder) : c.remainingShakes;
          const newConsumed = shakeCountInOrder > 0 ? c.consumedShakes + shakeCountInOrder : c.consumedShakes;
          const newVisits = shakeCountInOrder > 0 ? c.clubVisitsCount + 1 : c.clubVisitsCount;

          return {
            ...c,
            remainingShakes: newRemaining,
            consumedShakes: newConsumed,
            clubVisitsCount: newVisits,
            totalOrdersCount: c.totalOrdersCount + 1,
            totalSpent: c.totalSpent + total,
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      }));

      // If shake was ordered, also automatically log the shake visit
      if (shakeCountInOrder > 0) {
        const shakeItem = cart.find(ci => ci.product.category === 'Shakes');
        const flavor = shakeItem ? shakeItem.product.name : 'Daily Shake';
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        const autoShakeLog: ShakeIntakeLog = {
          id: `SHK-POS-${Date.now()}`,
          customerId: orderInfo.customerId,
          customerName: orderInfo.customerName,
          customerPhone: orderInfo.customerPhone || '',
          date: now.toISOString().split('T')[0],
          time: timeStr,
          shakeCount: shakeCountInOrder,
          flavorCombo: flavor,
          notes: `POS order #${orderId} (Plan Quota)`,
          staffName: currentUser.name,
          previousBalance: customers.find(c => c.id === orderInfo.customerId)?.remainingShakes || 0,
          newBalance: Math.max(0, (customers.find(c => c.id === orderInfo.customerId)?.remainingShakes || 0) - shakeCountInOrder),
          createdAt: now.toISOString(),
        };
        setShakeLogs(prev => [autoShakeLog, ...prev]);
      }
    }

    setOrders(prev => [newOrder, ...prev]);
    setInvoices(prev => [newInvoice, ...prev]);
    clearCart();

    return newOrder;
  };

  // Kitchen Status Transitions
  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const now = new Date().toISOString();
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          orderStatus: status,
          readyAt: status === 'READY' ? now : o.readyAt,
          completedAt: status === 'COMPLETED' ? now : o.completedAt,
          updatedAt: now,
        };
      }
      return o;
    }));
  };

  const getOrderById = (orderId: string) => orders.find(o => o.id === orderId);

  // Daily Shake Intake Tracking
  const logDailyShakeIntake = (
    customerId: string, 
    shakeCount: number, 
    flavorCombo: string, 
    notes = ''
  ): ShakeIntakeLog | null => {
    const cust = customers.find(c => c.id === customerId);
    if (!cust) return null;

    const prevBal = cust.remainingShakes;
    const newBal = Math.max(0, prevBal - shakeCount);
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newLog: ShakeIntakeLog = {
      id: `SHK-LOG-${Date.now()}`,
      customerId: cust.id,
      customerName: cust.fullName,
      customerPhone: cust.phone,
      date: now.toISOString().split('T')[0],
      time: timeStr,
      shakeCount: shakeCount,
      flavorCombo: flavorCombo,
      notes: notes,
      staffName: currentUser.name,
      previousBalance: prevBal,
      newBalance: newBal,
      createdAt: now.toISOString(),
    };

    // Update Customer record
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        return {
          ...c,
          consumedShakes: c.consumedShakes + shakeCount,
          remainingShakes: newBal,
          clubVisitsCount: c.clubVisitsCount + 1,
          updatedAt: now.toISOString(),
        };
      }
      return c;
    }));

    setShakeLogs(prev => [newLog, ...prev]);
    return newLog;
  };

  // Wellness Seminar Tracking
  const logSeminarAttendance = (
    customerId: string, 
    topic: string, 
    remarks = ''
  ): SeminarAttendance | null => {
    const cust = customers.find(c => c.id === customerId);
    if (!cust) return null;

    const now = new Date();
    const newAttendance: SeminarAttendance = {
      id: `SEM-${Date.now()}`,
      customerId: cust.id,
      customerName: cust.fullName,
      customerPhone: cust.phone,
      date: now.toISOString().split('T')[0],
      topic: topic,
      remarks: remarks,
      staffName: currentUser.name,
      attended: true,
      createdAt: now.toISOString(),
    };

    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        return {
          ...c,
          seminarAttendanceCount: c.seminarAttendanceCount + 1,
          updatedAt: now.toISOString(),
        };
      }
      return c;
    }));

    setSeminars(prev => [newAttendance, ...prev]);
    return newAttendance;
  };

  // Catalog & Inventory
  const updateProductStock = (
    productId: string, 
    newStock: number, 
    reason: 'Restock' | 'Damage/Waste' | 'Manual Audit'
  ) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const diff = newStock - prod.stock;
    const log: InventoryLog = {
      id: `INVLOG-${Date.now()}`,
      productId: prod.id,
      productName: prod.name,
      changeAmount: diff,
      reason: reason,
      previousStock: prod.stock,
      newStock: newStock,
      timestamp: new Date().toISOString(),
    };

    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
    setInventoryLogs(prev => [log, ...prev]);
  };

  const addProduct = (productData: Omit<Product, 'id'>): Product => {
    const newProduct: Product = {
      ...productData,
      id: `PRD-${Date.now()}`,
    };
    setProducts(prev => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (productId: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updates } : p));
  };

  // Bulk Uploads
  const bulkImportCustomers = (importedList: Partial<Customer>[]): number => {
    let count = 0;
    const newItems: Customer[] = [];
    importedList.forEach((item, index) => {
      if (!item.fullName) return;
      const durationDays = calculateProgramDays(item.programDuration || '30 Days', item.durationInDays);
      const dailyRate = item.pricePerDay || 150;
      const totalCost = calculateTotalPlanCost(durationDays, dailyRate);
      const shakes = item.allottedShakes || durationDays;
      const newCust: Customer = {
        id: generateCustomerId(customers.length + index),
        fullName: item.fullName,
        phone: item.phone || '',
        email: item.email || '',
        gender: item.gender || 'Male',
        age: item.age || 30,
        address: item.address || '',
        branch: selectedBranch,
        inviterType: item.inviterType || 'Walk-in',
        inviterName: item.inviterName || '',
        counselingBy: currentUser.name,
        healthGoals: item.healthGoals || ['Daily Wellness'],
        customerType: item.customerType || 'New Customer',
        currentProgram: item.currentProgram || '30 Days Wellness Plan',
        programDuration: item.programDuration || '30 Days',
        durationInDays: durationDays,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + durationDays * 86400000).toISOString().split('T')[0],
        allottedShakes: shakes,
        consumedShakes: item.consumedShakes || 0,
        remainingShakes: item.remainingShakes !== undefined ? item.remainingShakes : shakes,
        dailyShakeFrequency: 1,
        pricePerDay: dailyRate,
        totalPlanCost: totalCost,
        amountPaid: totalCost,
        balanceDue: 0,
        paymentStatus: 'Paid',
        paymentMethod: 'Cash',
        status: 'Active',
        clubVisitsCount: item.clubVisitsCount || 0,
        seminarAttendanceCount: item.seminarAttendanceCount || 0,
        totalOrdersCount: 0,
        totalSpent: totalCost,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      newItems.push(newCust);
      count++;
    });

    setCustomers(prev => [...newItems, ...prev]);
    return count;
  };

  const bulkImportProducts = (importedList: Partial<Product>[]): number => {
    let count = 0;
    const newItems: Product[] = [];
    importedList.forEach((item, index) => {
      if (!item.name || !item.price) return;
      const newProd: Product = {
        id: `PRD-${Date.now()}-${index}`,
        code: item.code || `PRD-IMP-${index + 1}`,
        name: item.name,
        category: item.category || 'Shakes',
        description: item.description || '',
        price: item.price || 150,
        costPrice: item.costPrice || 60,
        stock: item.stock || 20,
        minStockAlert: item.minStockAlert || 5,
        active: item.active !== undefined ? item.active : true,
        flavor: item.flavor || '',
      };
      newItems.push(newProd);
      count++;
    });
    setProducts(prev => [...newItems, ...prev]);
    return count;
  };

  const resetToSeedData = () => {
    setCustomers(SEED_CUSTOMERS);
    setProducts(SEED_PRODUCTS);
    setOrders(SEED_ORDERS);
    setShakeLogs(SEED_SHAKE_LOGS);
    setSeminars(SEED_SEMINARS);
    setInvoices(SEED_INVOICES);
    setCart([]);
  };

  // Real-time KPI / Operational Control Room Metrics
  const metrics = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Revenue from Orders + Invoices
    const totalRevenue = invoices.reduce((acc, inv) => acc + (inv.amountPaid || 0), 0);
    const todayRevenue = invoices
      .filter(inv => inv.date?.startsWith(todayStr))
      .reduce((acc, inv) => acc + (inv.amountPaid || 0), 0);
    const weeklyRevenue = invoices
      .filter(inv => new Date(inv.date) >= sevenDaysAgo)
      .reduce((acc, inv) => acc + (inv.amountPaid || 0), 0);

    // Orders KPIs
    const totalOrders = orders.length;
    const todayOrders = orders.filter(o => o.createdAt.startsWith(todayStr)).length;
    const pendingOrders = orders.filter(o => o.orderStatus === 'PENDING').length;
    const kitchenActive = orders.filter(o => o.orderStatus === 'PREPARING' || o.orderStatus === 'PENDING').length;
    const readyOrders = orders.filter(o => o.orderStatus === 'READY').length;

    // Customer Demographics
    const totalCustomers = customers.length;
    const newCustomersCount = customers.filter(c => c.customerType === 'New Customer').length;
    const existingProfilesCount = customers.filter(c => c.customerType === 'Existing Customer').length;
    const associatesCount = customers.filter(c => c.customerType === 'Associate' || c.customerType === 'JP Member').length;
    const jpMembersCount = associatesCount;
    const preferredCustomersCount = customers.filter(c => c.customerType === 'Preferred Customer').length;

    // Shake activity today
    const todayShakesConsumed = shakeLogs
      .filter(s => s.date === todayStr)
      .reduce((acc, s) => acc + s.shakeCount, 0);

    // Low stock alerts
    const lowStockProducts = products.filter(p => p.stock <= p.minStockAlert);

    // Recent orders stream
    const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);

    // Best Sellers calculation
    const salesMap: { [name: string]: { count: number; revenue: number } } = {};
    orders.forEach(ord => {
      ord.items.forEach(item => {
        if (!salesMap[item.productName]) {
          salesMap[item.productName] = { count: 0, revenue: 0 };
        }
        salesMap[item.productName].count += item.quantity;
        salesMap[item.productName].revenue += item.subtotal;
      });
    });
    const bestSellers = Object.entries(salesMap)
      .map(([name, data]) => ({ name, count: data.count, revenue: data.revenue }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalRevenue,
      todayRevenue,
      weeklyRevenue,
      totalOrders,
      todayOrders,
      pendingOrders,
      kitchenActive,
      readyOrders,
      totalCustomers,
      newCustomersCount,
      existingProfilesCount,
      associatesCount,
      jpMembersCount,
      preferredCustomersCount,
      todayShakesConsumed,
      lowStockProducts,
      recentOrders,
      bestSellers,
      recentShakeVisits: shakeLogs.slice(0, 6),
    };
  }, [customers, products, orders, shakeLogs, invoices]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthenticated,
        login,
        logout,
        customers,
        products,
        orders,
        shakeLogs,
        seminars,
        invoices,
        inventoryLogs,
        cart,
        selectedBranch,
        setSelectedBranch,
        addCustomer,
        renewCustomer,
        updateCustomer,
        promoteCustomerToAssociate,
        getCustomerById,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        createOrder,
        updateOrderStatus,
        getOrderById,
        logDailyShakeIntake,
        logSeminarAttendance,
        updateProductStock,
        addProduct,
        updateProduct,
        bulkImportCustomers,
        bulkImportProducts,
        resetToSeedData,
        metrics,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
