import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { Settlement, SettlementStatus } from '../types';

const SettleUpModal: React.FC = () => {
    const { state, dispatch } = useContext(AppContext);
    const { settleUpTarget, currentUser } = state;

    const { targetUser, balance, targetName } = useMemo(() => {
        if (!settleUpTarget) return { targetUser: null, balance: 0, targetName: '' };

        if (settleUpTarget.type === 'friend') {
            // Complex P2P balance calculation
             let friendBalance = 0;
             state.expenses.forEach(exp => {
                 if(exp.groupId !== null) return; // Only P2P
                 const isBetweenUsers = exp.participants.length === 2 && exp.participants.some(p => p.userId === currentUser.id) && exp.participants.some(p => p.userId === settleUpTarget.id);
                 if(!isBetweenUsers) return;

                 const share = exp.amount / 2;
                 if(exp.payerId === currentUser.id) {
                     friendBalance += share;
                 } else if (exp.payerId === settleUpTarget.id) {
                     friendBalance -= share;
                 }
             });
             state.settlements.forEach(s => {
                if(s.groupId !== null || s.status !== SettlementStatus.Confirmed) return;
                if(s.fromUserId === currentUser.id && s.toUserId === settleUpTarget.id) friendBalance += s.amount;
                if(s.fromUserId === settleUpTarget.id && s.toUserId === currentUser.id) friendBalance -= s.amount;
             });

            const user = state.users.find(u => u.id === settleUpTarget.id);
            return { targetUser: user, balance: friendBalance, targetName: user?.name || ''};
        }
        
        // Group balance calculation
        const group = state.groups.find(g => g.id === settleUpTarget.id);
        let groupBalance = 0;
        state.expenses.filter(e => e.groupId === settleUpTarget.id).forEach(exp => {
            const share = exp.amount / exp.participants.length;
            if(exp.payerId === currentUser.id) groupBalance += share * (exp.participants.length -1);
            else if (exp.participants.some(p => p.userId === currentUser.id)) groupBalance -= share;
        });

        // fix: Used the calculated `groupBalance` instead of an uninitialized `balance` variable.
        return { targetUser: null, balance: groupBalance, targetName: group?.name || '' };
    }, [settleUpTarget, state.expenses, state.settlements, currentUser.id, state.users, state.groups]);

    const owesMoney = balance < 0;
    const amountToSettle = Math.abs(balance);
    const [settlementAmount, setSettlementAmount] = useState(amountToSettle.toFixed(2));

    const handleSubmit = () => {
        const numericAmount = parseFloat(settlementAmount);
        if (numericAmount <= 0 || !settleUpTarget) return;

        let fromUserId = '';
        let toUserId = '';

        if(owesMoney) { // Current user is paying
            fromUserId = currentUser.id;
            toUserId = settleUpTarget.type === 'friend' ? settleUpTarget.id : ''; // Need logic for group settlement recipient
        } else { // Current user is being paid
            fromUserId = settleUpTarget.type === 'friend' ? settleUpTarget.id : '';
            toUserId = currentUser.id;
        }

        // Simplified: For group settlements, this would need a user selection.
        // For this MVP, we will only fully support friend settlements in the modal.
        if (settleUpTarget.type === 'group') {
            alert("Group settlement requires selecting a user to settle with. This feature is simplified for MVP.");
            return;
        }

        const newSettlement: Settlement = {
            id: `settle-${Date.now()}`,
            // fix: Set groupId to null since this logic path only handles friend settlements, resolving an impossible type comparison.
            groupId: null,
            fromUserId,
            toUserId,
            amount: numericAmount,
            status: SettlementStatus.Pending,
            date: new Date().toISOString(),
        };

        dispatch({ type: 'RECORD_SETTLEMENT', payload: newSettlement });
    };

    if (!settleUpTarget || Math.abs(balance) < 0.01) {
        return null;
    }
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Settle Up</h2>
                        <button onClick={() => dispatch({ type: 'SET_MODAL', payload: null })} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                    </div>
                    
                    <div className="text-center p-4 bg-gray-100 rounded-lg">
                        <p className="text-gray-600">{owesMoney ? `You owe ${targetName}` : `${targetName} owes you`}</p>
                        <p className={`text-3xl font-bold ${owesMoney ? 'text-red-600' : 'text-green-600'}`}>
                            ${amountToSettle.toFixed(2)}
                        </p>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Amount to Settle</label>
                        <input 
                            type="number" 
                            value={settlementAmount} 
                            onChange={(e) => setSettlementAmount(e.target.value)}
                            className="mt-1 block w-full text-2xl p-2 border rounded-md"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        You are recording a payment made outside this app (e.g., cash, Venmo). This will be marked as 'Pending' until {owesMoney ? targetName : 'you'} confirm it.
                    </p>
                    <button onClick={handleSubmit} className="w-full mt-6 py-3 bg-green-500 text-white rounded-lg font-semibold">
                        Record Payment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettleUpModal;