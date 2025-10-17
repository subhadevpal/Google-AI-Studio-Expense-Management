
import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useBalance } from '../hooks/useBalance';

const FriendsScreen: React.FC = () => {
  const { state, dispatch } = useContext(AppContext);
  const { balances } = useBalance();

  const friends = state.users.filter(u => u.id !== state.currentUser.id);

  const handleSettleUp = (friendId: string) => {
    dispatch({ type: 'SET_SETTLE_UP_TARGET', payload: { type: 'friend', id: friendId } });
    dispatch({ type: 'SET_MODAL', payload: 'settleUp' });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Friends</h1>
      <div className="space-y-3">
        {friends.map(friend => {
          const balance = balances[friend.id] || 0;
          let balanceText;
          let textColor = 'text-gray-500';

          if (balance > 0.01) {
            balanceText = `owes you $${balance.toFixed(2)}`;
            textColor = 'text-green-600';
          } else if (balance < -0.01) {
            balanceText = `you owe $${Math.abs(balance).toFixed(2)}`;
            textColor = 'text-red-600';
          } else {
            balanceText = 'settled up';
          }

          return (
            <div key={friend.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
              <div className="flex items-center">
                <img src={friend.avatarUrl} alt={friend.name} className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <h2 className="text-lg font-semibold">{friend.name}</h2>
                  <p className={`text-sm ${textColor}`}>{balanceText}</p>
                </div>
              </div>
              {Math.abs(balance) > 0.01 && (
                 <button onClick={() => handleSettleUp(friend.id)} className="px-3 py-1 bg-green-500 text-white text-sm rounded-full">
                   Settle Up
                 </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FriendsScreen;
