
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { SettlementStatus } from '../types';

export const useBalance = () => {
  const { state } = useContext(AppContext);
  const { currentUser, expenses, settlements, users } = state;

  const calculateBalances = () => {
    const balances: { [userId: string]: number } = {};

    // Initialize balances for all users
    users.forEach(user => {
      if (user.id !== currentUser.id) {
        balances[user.id] = 0;
      }
    });

    // Process expenses
    expenses.forEach(expense => {
      const share = expense.amount / expense.participants.length;
      if (expense.payerId === currentUser.id) {
        expense.participants.forEach(p => {
          if (p.userId !== currentUser.id) {
            balances[p.userId] = (balances[p.userId] || 0) + share;
          }
        });
      } else {
        const currentUserParticipant = expense.participants.find(p => p.userId === currentUser.id);
        if (currentUserParticipant) {
          balances[expense.payerId] = (balances[expense.payerId] || 0) - share;
        }
      }
    });

    // Process settlements
    settlements.forEach(settlement => {
        if (settlement.status !== SettlementStatus.Confirmed) return;

        if (settlement.fromUserId === currentUser.id) {
            balances[settlement.toUserId] = (balances[settlement.toUserId] || 0) + settlement.amount;
        } else if (settlement.toUserId === currentUser.id) {
            balances[settlement.fromUserId] = (balances[settlement.fromUserId] || 0) - settlement.amount;
        }
    });
    
    return balances;
  };

  const balances = calculateBalances();
  
  const netBalance = Object.values(balances).reduce((acc, val) => acc + val, 0);
  
  const youAreOwed = Object.entries(balances)
    .filter(([, amount]) => amount > 0)
    .sort((a, b) => b[1] - a[1]);

  const youOwe = Object.entries(balances)
    .filter(([, amount]) => amount < 0)
    .sort((a, b) => a[1] - b[1]);

  return { netBalance, youAreOwed, youOwe, balances };
};
