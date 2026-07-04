// ─── Auth ────────────────────────────────────────────────────────────────────
export interface WorkerUser {
  id: string;
  phone: string;
  email?: string;
  name?: string;
  avatar?: string;
  role: 'WORKER';
  isActive: boolean;
  bio?: string;
  rating: number;
  totalReviews: number;
  totalJobs: number;
  experience: number;
  isOnline: boolean;
  isApproved?: boolean;
  serviceRadius: number;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  worker: WorkerUser;
  isNew?: boolean;
}

// ─── Booking / Job ───────────────────────────────────────────────────────────
export type BookingStatus =
  | 'PENDING' | 'ACCEPTED' | 'REJECTED'
  | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Booking {
  id: string;
  bookingNumber: string;
  status: BookingStatus;
  scheduledDate: string;
  scheduledTime: string;
  description?: string;
  images: string[];
  totalAmount: number;
  finalAmount: number;
  cancelReason?: string;
  completedAt?: string;
  createdAt: string;
  user?: { id: string; name?: string; phone: string; avatar?: string };
  address?: Address;
  items?: BookingItem[];
}

export interface BookingItem {
  id: string;
  serviceId: string;
  quantity: number;
  price: number;
  service?: { id: string; name: string; duration: number };
}

export interface Address {
  id: string;
  label: string;
  fullAddress: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
}

// ─── Earnings / Wallet ───────────────────────────────────────────────────────
export interface WorkerWallet {
  id: string;
  balance: number;
}

export interface Transaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  createdAt: string;
}

export interface EarningsSummary {
  total: number;
  jobsCount: number;
  period: 'today' | 'week' | 'month';
}

// ─── Schedule ────────────────────────────────────────────────────────────────
export interface WorkingHour {
  day: string;
  isOpen: boolean;
  startTime: string;
  endTime: string;
}

// ─── Review ──────────────────────────────────────────────────────────────────
export interface Review {
  id: string;
  rating: number;
  comment?: string;
  images: string[];
  createdAt: string;
  user?: { name?: string; avatar?: string };
}

// ─── Chat ────────────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  bookingId: string;
  senderId: string;
  senderType: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ChatThread {
  bookingId: string;
  bookingNumber: string;
  customerName?: string;
  lastMessage?: string;
  unreadCount: number;
  updatedAt: string;
}

// ─── Notification ────────────────────────────────────────────────────────────
export interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

// ─── Support ─────────────────────────────────────────────────────────────────
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  createdAt: string;
}

// ─── Skills / Documents ──────────────────────────────────────────────────────
export interface WorkerDocument {
  id: string;
  type: string;
  url: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}
