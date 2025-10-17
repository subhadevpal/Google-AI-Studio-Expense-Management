
export interface User {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface Group {
  id: string;
  name: string;
  memberIds: string[];
}

export enum Category {
  Food = 'Food',
  Travel = 'Travel',
  Home = 'Home',
  Other = 'Other',
}

export interface ExpenseParticipant {
  userId: string;
  share: number;
}

export interface Expense {
  id: string;
  groupId: string | null; // null for P2P expenses
  description: string;
  amount: number;
  payerId: string;
  participants: ExpenseParticipant[];
  category: Category;
  receiptUrl?: string;
  date: string;
}

export enum SettlementStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
}

export interface Settlement {
  id: string;
  groupId: string | null;
  fromUserId: string;
  toUserId: string;
  amount: number;
  status: SettlementStatus;
  date: string;
}

export enum Screen {
  Dashboard = 'Dashboard',
  Groups = 'Groups',
  Friends = 'Friends',
}

export type ModalType = 'addExpense' | 'settleUp' | null;

export interface AppState {
  users: User[];
  groups: Group[];
  expenses: Expense[];
  settlements: Settlement[];
  currentUser: User;
  activeScreen: Screen;
  activeGroupId: string | null;
  settleUpTarget: { type: 'group' | 'friend'; id: string } | null;
  modal: ModalType;
}

export type Action =
  | { type: 'SET_ACTIVE_SCREEN'; payload: Screen }
  | { type: 'SET_ACTIVE_GROUP'; payload: string | null }
  | { type: 'SET_MODAL'; payload: ModalType }
  | { type: 'ADD_GROUP'; payload: Group }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'RECORD_SETTLEMENT'; payload: Settlement }
  | { type: 'CONFIRM_SETTLEMENT'; payload: string }
  | { type: 'SET_SETTLE_UP_TARGET'; payload: { type: 'group' | 'friend'; id: string } | null };
