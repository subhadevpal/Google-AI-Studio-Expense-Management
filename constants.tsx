import React from 'react';
import { User, Group, Expense, Settlement, Category, SettlementStatus } from './types';

export const USERS: User[] = [
  { id: 'user-1', name: 'You', avatarUrl: 'https://picsum.photos/seed/you/100' },
  { id: 'user-2', name: 'Alice', avatarUrl: 'https://picsum.photos/seed/alice/100' },
  { id: 'user-3', name: 'Bob', avatarUrl: 'https://picsum.photos/seed/bob/100' },
  { id: 'user-4', name: 'Charlie', avatarUrl: 'https://picsum.photos/seed/charlie/100' },
  { id: 'user-5', name: 'Diana', avatarUrl: 'https://picsum.photos/seed/diana/100' },
];

export const CURRENT_USER_ID = 'user-1';

export const GROUPS: Group[] = [
  { id: 'group-1', name: 'Trip to Hawaii', memberIds: ['user-1', 'user-2', 'user-3'] },
  { id: 'group-2', name: 'Apartment Bills', memberIds: ['user-1', 'user-4'] },
];

export const EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    groupId: 'group-1',
    description: 'Dinner',
    amount: 120,
    payerId: 'user-2',
    participants: [
      { userId: 'user-1', share: 40 },
      { userId: 'user-2', share: 40 },
      { userId: 'user-3', share: 40 },
    ],
    category: Category.Food,
    date: new Date('2023-10-26T19:00:00Z').toISOString(),
  },
  {
    id: 'exp-2',
    groupId: 'group-1',
    description: 'Surfboard Rental',
    amount: 90,
    payerId: 'user-1',
    participants: [
      { userId: 'user-1', share: 30 },
      { userId: 'user-2', share: 30 },
      { userId: 'user-3', share: 30 },
    ],
    category: Category.Travel,
    date: new Date('2023-10-27T14:00:00Z').toISOString(),
  },
  {
    id: 'exp-3',
    groupId: 'group-2',
    description: 'Electricity Bill',
    amount: 80,
    payerId: 'user-4',
    participants: [
      { userId: 'user-1', share: 40 },
      { userId: 'user-4', share: 40 },
    ],
    category: Category.Home,
    date: new Date('2023-10-25T10:00:00Z').toISOString(),
  },
  {
    id: 'exp-4',
    groupId: null,
    description: 'Coffee',
    amount: 10,
    payerId: 'user-1',
    participants: [
        { userId: 'user-1', share: 5 },
        { userId: 'user-5', share: 5 },
    ],
    category: Category.Food,
    date: new Date('2023-10-28T11:00:00Z').toISOString(),
  }
];

export const SETTLEMENTS: Settlement[] = [
  {
    id: 'settle-1',
    groupId: null,
    fromUserId: 'user-3',
    toUserId: 'user-1',
    amount: 10,
    status: SettlementStatus.Pending,
    date: new Date('2023-10-28T18:00:00Z').toISOString(),
  }
];

// fix: Changed JSX.Element to React.ReactElement to resolve JSX namespace issue.
export const CATEGORY_ICONS: Record<Category, React.ReactElement> = {
  [Category.Food]: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4z" /></svg>
  ),
  [Category.Travel]: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  [Category.Home]: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
  ),
  [Category.Other]: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
  )
};