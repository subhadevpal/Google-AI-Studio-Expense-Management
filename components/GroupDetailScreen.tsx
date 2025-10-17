
import React, { useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { SettlementStatus, Expense, Settlement } from '../types';
import { CATEGORY_ICONS } from '../constants';

type ActivityItem = (Expense & { type: 'expense' }) | (Settlement & { type: 'settlement' });

const GroupDetailScreen: React.FC = () => {
    const { state, dispatch } = useContext(AppContext);
    const group = state.groups.find(g => g.id === state.activeGroupId);

    const groupBalance = useMemo(() => {
        if (!group) return 0;
        let balance = 0;
        const groupExpenses = state.expenses.filter(e => e.groupId === group.id);
        const groupSettlements = state.settlements.filter(s => s.groupId === group.id && s.status === SettlementStatus.Confirmed);

        groupExpenses.forEach(exp => {
            const share = exp.amount / exp.participants.length;
            if (exp.payerId === state.currentUser.id) {
                const othersCount = exp.participants.filter(p => p.userId !== state.currentUser.id).length;
                balance += share * othersCount;
            } else if (exp.participants.some(p => p.userId === state.currentUser.id)) {
                balance -= share;
            }
        });
        
        groupSettlements.forEach(settle => {
            if(settle.toUserId === state.currentUser.id) balance -= settle.amount;
            if(settle.fromUserId === state.currentUser.id) balance += settle.amount;
        });

        return balance;
    }, [state.activeGroupId, state.expenses, state.settlements, state.currentUser.id, group]);

    const activityFeed: ActivityItem[] = useMemo(() => {
        if (!group) return [];
        const expenses: ActivityItem[] = state.expenses
            .filter(e => e.groupId === group.id)
            .map(e => ({ ...e, type: 'expense' }));
        const settlements: ActivityItem[] = state.settlements
            .filter(s => s.groupId === group.id)
            .map(s => ({ ...s, type: 'settlement' }));
        return [...expenses, ...settlements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [group, state.expenses, state.settlements]);
    
    if (!group) {
        return <div>Group not found.</div>;
    }
    
    const getUser = (id: string) => state.users.find(u => u.id === id);

    const handleConfirm = (settlementId: string) => {
        dispatch({ type: 'CONFIRM_SETTLEMENT', payload: settlementId });
    };

    const handleSettleUp = () => {
        dispatch({ type: 'SET_SETTLE_UP_TARGET', payload: { type: 'group', id: group.id } });
        dispatch({ type: 'SET_MODAL', payload: 'settleUp' });
    };

    const handleAddExpense = () => {
        dispatch({ type: 'SET_MODAL', payload: 'addExpense' });
    };

    let balanceColor = 'text-gray-600';
    if (groupBalance > 0.01) balanceColor = 'text-green-600';
    if (groupBalance < -0.01) balanceColor = 'text-red-600';
    
    return (
        <div>
            <button onClick={() => dispatch({ type: 'SET_ACTIVE_GROUP', payload: null })} className="mb-4 text-indigo-600">&larr; Back to Groups</button>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold">{group.name}</h1>
                <div className="flex space-x-2">
                    <button onClick={handleAddExpense} className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700">
                        Add Expense
                    </button>
                    <button onClick={handleSettleUp} className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-sm hover:bg-green-600">
                        Settle Up
                    </button>
                </div>
            </div>

            <div className="p-4 bg-gray-100 rounded-lg mb-6">
                <h3 className="text-sm text-gray-500">Your group balance</h3>
                <p className={`text-2xl font-bold ${balanceColor}`}>
                    {groupBalance > 0.01 ? `You are owed $${groupBalance.toFixed(2)}` : groupBalance < -0.01 ? `You owe $${Math.abs(groupBalance).toFixed(2)}` : 'You are settled up'}
                </p>
            </div>

            <h2 className="text-xl font-semibold mb-3">Activity Feed</h2>
            <div className="space-y-4">
                {activityFeed.map(item => {
                    if (item.type === 'expense') {
                         const payer = getUser(item.payerId);
                         const userIsPayer = item.payerId === state.currentUser.id;
                         const userIsParticipant = item.participants.some(p => p.userId === state.currentUser.id);
                         let userAmountText = '';
                         if(userIsPayer) {
                             userAmountText = `You paid $${item.amount.toFixed(2)}`;
                         } else if (userIsParticipant) {
                            userAmountText = `You owe $${(item.amount / item.participants.length).toFixed(2)}`;
                         }
                        return (
                            <div key={item.id} className="flex items-start p-3 bg-white rounded-lg shadow-sm">
                                <div className="mr-3 text-gray-500">{CATEGORY_ICONS[item.category]}</div>
                                <div className="flex-grow">
                                    <p className="font-semibold">{item.description}</p>
                                    <p className="text-sm text-gray-500">{payer?.name} paid ${item.amount.toFixed(2)}</p>
                                </div>
                                <div className={`font-semibold text-right ${userIsPayer ? 'text-green-600' : 'text-red-600'}`}>
                                    {userAmountText}
                                </div>
                            </div>
                        );
                    } else { // settlement
                        const fromUser = getUser(item.fromUserId);
                        const toUser = getUser(item.toUserId);
                        const isPending = item.status === SettlementStatus.Pending;
                        const userIsRecipient = item.toUserId === state.currentUser.id;

                        return (
                             <div key={item.id} className={`p-3 rounded-lg shadow-sm ${isPending ? 'bg-yellow-50' : 'bg-green-50'}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold">{fromUser?.name} paid {toUser?.name}</p>
                                        <p className="text-sm text-gray-500">{new Date(item.date).toLocaleDateString()}</p>
                                    </div>
                                    <p className="text-lg font-bold text-green-700">${item.amount.toFixed(2)}</p>
                                </div>
                                {isPending && (
                                    <div className="mt-2 text-center">
                                        <p className="text-sm font-medium text-yellow-800">Pending Confirmation</p>
                                        {userIsRecipient && (
                                            <div className="mt-2 flex justify-center space-x-2">
                                                <button onClick={() => handleConfirm(item.id)} className="px-3 py-1 bg-green-500 text-white text-xs rounded-full">Confirm</button>

                                                <button className="px-3 py-1 bg-red-500 text-white text-xs rounded-full">Dispute</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    }
                })}
            </div>
        </div>
    );
};

export default GroupDetailScreen;