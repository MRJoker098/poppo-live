export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  coins: number;
  level: number;
  isLive: boolean;
  createdAt: any;
}

export interface Stream {
  id: string;
  hostId: string;
  hostName: string;
  title: string;
  thumbnail: string;
  viewerCount: number;
  startedAt: any;
  status: 'active' | 'ended';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  type: 'text' | 'gift';
  giftName?: string;
  timestamp: any;
}

export interface Gift {
  id: string;
  name: string;
  price: number;
  icon: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'jazzcash', name: 'JazzCash', icon: '📱', color: 'bg-[#ff0000]', description: 'Instant Mobile Wallet' },
  { id: 'easypaisa', name: 'Easypaisa', icon: '🟢', color: 'bg-[#1fb35c]', description: 'Digital Payments' },
  { id: 'crypto', name: 'Crypto', icon: '₿', color: 'bg-[#f7931a]', description: 'USDT / BTC / ETH' },
];

export const POPPO_GIFTS: Gift[] = [
  { id: '1', name: 'Rose', price: 10, icon: '🌹' },
  { id: '2', name: 'Heart', price: 50, icon: '❤️' },
  { id: '3', name: 'Diamond', price: 100, icon: '💎' },
  { id: '4', name: 'Luxury Car', price: 1000, icon: '🏎️' },
  { id: '5', name: 'Private Jet', price: 5000, icon: '🛩️' },
];
