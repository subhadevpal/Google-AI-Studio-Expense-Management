
import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useBalance } from '../hooks/useBalance';

const BalanceCard: React.FC<{ netBalance: number }> = ({ netBalance }) => {
    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-600';
    let message = "You are all settled up.";

    if (netBalance > 0.01) {
        bgColor = 'bg-green-100';
        textColor = 'text-green-700';
        message = `You are owed $${netBalance.toFixed(2)}`;
    } else if (netBalance < -0.01) {
        bgColor = 'bg-red-100';
        textColor = 'text-red-700';
        message = `You owe $${Math.abs(netBalance).toFixed(2)}`;
    }

    return (
        <div className={`p-6 rounded-lg shadow-md text-center mb-6 ${bgColor}`}>
            <h2 className={`text-2xl font-bold ${textColor}`}>{message}</h2>
        </div>
    );
};

const BalanceListItem: React.FC<{ userId: string, amount: number }> = ({ userId, amount }) => {
    const { state } = useContext(AppContext);
    const user = state.users.find(u => u.id === userId);

    if (!user) return null;

    return (
        <div className="flex items-center justify-between p-3 bg-white rounded-lg mb-2 shadow-sm">
            <div className="flex items-center">
                <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full mr-3" />
                <span className="font-medium">{user.name}</span>
            </div>
            {amount > 0 ? (
                <span className="font-semibold text-green-600">owes you ${amount.toFixed(2)}</span>
            ) : (
                <span className="font-semibold text-red-600">you owe ${Math.abs(amount).toFixed(2)}</span>
            )}
        </div>
    );
};


const DashboardScreen: React.FC = () => {
    const { netBalance, youAreOwed, youOwe } = useBalance();

    const topBalances = [...youAreOwed, ...youOwe]
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .slice(0, 5);
      
    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
            <BalanceCard netBalance={netBalance} />
            
            <h2 className="text-xl font-semibold mb-3">Your Balances</h2>
            {topBalances.length > 0 ? (
                <div>
                    {topBalances.map(([userId, amount]) => (
                        <BalanceListItem key={userId} userId={userId} amount={amount} />
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 text-center mt-4">No outstanding balances.</p>
            )}
        </div>
    );
};

export default DashboardScreen;
