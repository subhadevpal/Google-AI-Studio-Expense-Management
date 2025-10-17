
import React, { useContext } from 'react';
import { AppContext } from './context/AppContext';
import DashboardScreen from './components/DashboardScreen';
import GroupsScreen from './components/GroupsScreen';
import FriendsScreen from './components/FriendsScreen';
import GroupDetailScreen from './components/GroupDetailScreen';
import AddExpenseModal from './components/AddExpenseModal';
import SettleUpModal from './components/SettleUpModal';
import BottomNav from './components/BottomNav';
import FloatingActionButton from './components/FloatingActionButton';
import { Screen } from './types';

const App: React.FC = () => {
  const { state, dispatch } = useContext(AppContext);

  const renderScreen = () => {
    if (state.activeGroupId) {
      return <GroupDetailScreen />;
    }
    switch (state.activeScreen) {
      case Screen.Dashboard:
        return <DashboardScreen />;
      case Screen.Groups:
        return <GroupsScreen />;
      case Screen.Friends:
        return <FriendsScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <div className="font-sans antialiased text-gray-800 bg-gray-50 min-h-screen">
      <div className="max-w-md mx-auto bg-white shadow-lg min-h-screen relative pb-20">
        <main className="p-4">
          {renderScreen()}
        </main>
        
        {!state.activeGroupId && <BottomNav />}
        
        {state.activeScreen !== Screen.Dashboard && !state.activeGroupId && (
          <FloatingActionButton onClick={() => dispatch({ type: 'SET_MODAL', payload: 'addExpense' })} />
        )}
      </div>

      {state.modal === 'addExpense' && <AddExpenseModal />}
      {state.modal === 'settleUp' && <SettleUpModal />}
    </div>
  );
};

export default App;