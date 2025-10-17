import React, { createContext, useReducer, Dispatch, ReactNode } from 'react';
// fix: Import SettlementStatus to use its enum members for type safety.
import { AppState, Action, Screen, Group, Expense, Settlement, SettlementStatus } from '../types';
import { USERS, GROUPS, EXPENSES, SETTLEMENTS, CURRENT_USER_ID } from '../constants';

const currentUser = USERS.find(u => u.id === CURRENT_USER_ID);
if (!currentUser) {
  throw new Error("Current user not found in mock data");
}

const initialState: AppState = {
  users: USERS,
  groups: GROUPS,
  expenses: EXPENSES,
  settlements: SETTLEMENTS,
  currentUser: currentUser,
  activeScreen: Screen.Dashboard,
  activeGroupId: null,
  settleUpTarget: null,
  modal: null,
};

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_ACTIVE_SCREEN':
      return { ...state, activeScreen: action.payload, activeGroupId: null };
    case 'SET_ACTIVE_GROUP':
      return { ...state, activeGroupId: action.payload };
    case 'SET_MODAL':
      return { ...state, modal: action.payload };
    case 'ADD_GROUP':
      return { ...state, groups: [...state.groups, action.payload] };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [action.payload, ...state.expenses], modal: null };
    case 'RECORD_SETTLEMENT':
      return { ...state, settlements: [action.payload, ...state.settlements], modal: null };
    case 'CONFIRM_SETTLEMENT':
      return {
        ...state,
        settlements: state.settlements.map(s =>
          // fix: Used SettlementStatus.Confirmed enum member instead of a magic string for type safety.
          s.id === action.payload ? { ...s, status: SettlementStatus.Confirmed } : s
        ),
      };
    case 'SET_SETTLE_UP_TARGET':
        return { ...state, settleUpTarget: action.payload };
    default:
      return state;
  }
};

export const AppContext = createContext<{
  state: AppState;
  dispatch: Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null,
});

export const AppProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};