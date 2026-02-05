// Shared types and interfaces for clinic monorepo

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  count: number;
  category: string;
  img?: string;
  createdAt?: Date;
}

export interface Service {
  _id: string;
  name: string;
  description?: string;
  img?: string;
}

export interface Category {
  _id: string;
  name: string;
  categoryCode: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
}

export interface TeamMember {
  _id: string;
  name: string;
  img?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Doctor {
  _id: string;
  name: string;
  img?: string;
  description?: string;
  specialties: Array<{ _id: string; specialtyName: string }> | string[];
  workingHours: Array<{
    day: string;
    workStart: string;
    workEnd: string;
  }>;
}

export interface Appointment {
  _id: string;
  doctorId: string;
  specialtyId?: string;
  patientId: string;
  date: Date;
  startTime: string;
  duration: number;
  status: "הושלם" | "בוטל" | "נקבע";
}

export interface Specialty {
  _id: string;
  specialtyName: string;
  appointmentDuration: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface Referral {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  reason: string;
  content: string;
  status: "new" | "read" | "responded";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderItem {
  productId: string | Product;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  userId: string | User;
  items: OrderItem[];
  total: number;
  status: "pending" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed";
  paymentMethod: string;
  transactionId?: string;
  paypalOrderId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
