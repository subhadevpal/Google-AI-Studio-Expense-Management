import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { Category, Expense, ExpenseParticipant, Group, User } from '../types';
import { CATEGORY_ICONS } from '../constants';

const AddExpenseModal: React.FC = () => {
    const { state, dispatch } = useContext(AppContext);
    
    const activeGroupFromContext = useMemo(() => 
        state.activeGroupId ? state.groups.find(g => g.id === state.activeGroupId) : null,
        [state.activeGroupId, state.groups]
    );

    const [step, setStep] = useState(1);
    
    // Step 1 state
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [payerId, setPayerId] = useState(state.currentUser.id);
    const [category, setCategory] = useState<Category>(Category.Other);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(activeGroupFromContext);
    const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
    const [splitWith, setSplitWith] = useState<'group' | 'friend' | null>(activeGroupFromContext ? 'group' : null);

    // Step 2 state
    const [participants, setParticipants] = useState<string[]>([]);
    const [splitMethod, setSplitMethod] = useState<'equal' | 'unequal'>('equal');
    const [customShares, setCustomShares] = useState<Record<string, string>>({});
    
    const userGroups = state.groups.filter(g => g.memberIds.includes(state.currentUser.id));
    const userFriends = state.users.filter(u => u.id !== state.currentUser.id);
    
    const handleNext = () => {
        if (parseFloat(amount) > 0 && description.trim() !== '') {
            let initialParticipants: string[] = [];
            if(splitWith === 'group' && selectedGroup) {
                initialParticipants = selectedGroup.memberIds;
            } else if (splitWith === 'friend' && selectedFriend) {
                initialParticipants = [state.currentUser.id, selectedFriend.id];
            }
            setParticipants(initialParticipants);
            const initialShares: Record<string, string> = {};
            initialParticipants.forEach(id => {
                initialShares[id] = '';
            });
            setCustomShares(initialShares);

            setStep(2);
        }
    };

    const handleParticipantToggle = (userId: string) => {
        setParticipants(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleCustomShareChange = (userId: string, value: string) => {
        if (/^\d*\.?\d{0,2}$/.test(value)) {
            setCustomShares(prev => ({
                ...prev,
                [userId]: value,
            }));
        }
    };
    
    const totalCustomShares = useMemo(() => {
        return Object.values(customShares).reduce((sum, share) => sum + (parseFloat(share) || 0), 0);
    }, [customShares]);
    
    const numericAmount = parseFloat(amount) || 0;
    const remainingAmount = numericAmount - totalCustomShares;
    const isBalanced = Math.abs(remainingAmount) < 0.01;

    const handleSubmit = () => {
        if (numericAmount <= 0) return;

        let expenseParticipants: ExpenseParticipant[];

        if (splitMethod === 'equal') {
            if (participants.length === 0) return;
            const share = numericAmount / participants.length;
            expenseParticipants = participants.map(userId => ({
                userId,
                share,
            }));
        } else { // 'unequal'
            if (!isBalanced) {
                alert("The total shares must equal the expense amount.");
                return;
            }
            expenseParticipants = Object.entries(customShares)
                // fix: Added 'share' property name to correctly create ExpenseParticipant objects. This fixes numerous cascading compilation errors.
                .map(([userId, shareStr]) => ({ userId, share: parseFloat(shareStr) || 0 }))
                .filter(p => p.share > 0);
            
            if (expenseParticipants.length === 0) return;
        }

        const newExpense: Expense = {
            id: `exp-${Date.now()}`,
            groupId: splitWith === 'group' ? selectedGroup!.id : null,
            description,
            amount: numericAmount,
            payerId,
            participants: expenseParticipants,
            category,
            // fix: Corrected a typo from `new single()` to `new Date()` to get the current timestamp.
            date: new Date().toISOString(),
        };
        dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
    };

    const getSplitMembers = (): User[] => {
        let memberIds: string[] = [];
        if (splitWith === 'group' && selectedGroup) {
            memberIds = selectedGroup.memberIds;
        } else if (splitWith === 'friend' && selectedFriend) {
            memberIds = [state.currentUser.id, selectedFriend.id];
        }
        return state.users.filter(u => memberIds.includes(u.id));
    };

    const splitMembers = getSplitMembers();
    const sharePerPerson = participants.length > 0 ? (parseFloat(amount) || 0) / participants.length : 0;
    
    const confirmButtonDisabled = splitMethod === 'unequal' && !isBalanced;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Add Expense</h2>
                        <button onClick={() => dispatch({ type: 'SET_MODAL', payload: null })} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                    </div>

                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Amount</label>
                                <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 block w-full text-3xl p-2 border-b-2 border-gray-300 focus:border-indigo-500 outline-none" autoFocus/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <input type="text" placeholder="e.g., Dinner with friends" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full p-2 border rounded-md" />
                            </div>
                            
                            {activeGroupFromContext ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Splitting with Group</label>
                                    <div className="mt-1 block w-full p-2 border rounded-md bg-gray-100 font-medium">{activeGroupFromContext.name}</div>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Split with</label>
                                        <select onChange={(e) => {
                                            const val = e.target.value;
                                            if(val === 'group') {setSplitWith('group'); setSelectedFriend(null)}
                                            else if (val === 'friend') {setSplitWith('friend'); setSelectedGroup(null)}
                                            else {setSplitWith(null); setSelectedFriend(null); setSelectedGroup(null)}
                                        }} className="mt-1 block w-full p-2 border rounded-md">
                                            <option value="">Select...</option>
                                            <option value="group">Group</option>
                                            <option value="friend">Friend</option>
                                        </select>
                                    </div>
                                    {splitWith === 'group' && (
                                        <select onChange={(e) => setSelectedGroup(state.groups.find(g => g.id === e.target.value) || null)} className="mt-1 block w-full p-2 border rounded-md">
                                            <option value="">Select group...</option>
                                            {userGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                        </select>
                                    )}
                                    {splitWith === 'friend' && (
                                        <select onChange={(e) => setSelectedFriend(state.users.find(u => u.id === e.target.value) || null)} className="mt-1 block w-full p-2 border rounded-md">
                                            <option value="">Select friend...</option>
                                            {userFriends.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                        </select>
                                    )}
                                </>
                            )}
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <div className="flex justify-around mt-2">
                                    {Object.values(Category).map(cat => (
                                        <button key={cat} onClick={() => setCategory(cat)} className={`p-3 rounded-full ${category === cat ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                            {CATEGORY_ICONS[cat]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                             <button onClick={handleNext} disabled={!splitWith || !(selectedGroup || selectedFriend) || !(parseFloat(amount) > 0)} className="w-full mt-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold disabled:bg-gray-300">Next</button>
                        </div>
                    )}
                    
                    {step === 2 && (
                         <div className="space-y-4">
                            <div className="flex border border-gray-300 rounded-md">
                                <button onClick={() => setSplitMethod('equal')} className={`w-1/2 p-2 rounded-l-md ${splitMethod === 'equal' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}>Split Equally</button>
                                <button onClick={() => setSplitMethod('unequal')} className={`w-1/2 p-2 rounded-r-md ${splitMethod === 'unequal' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}>Split Unequally</button>
                            </div>

                            {splitMethod === 'equal' && (
                                <>
                                    <h3 className="text-lg font-semibold">Split equally among:</h3>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {splitMembers.map(user => (
                                            <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                <label htmlFor={`part-${user.id}`} className="flex items-center cursor-pointer">
                                                    <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full mr-3" />
                                                    {user.name}
                                                </label>
                                                <input
                                                    id={`part-${user.id}`}
                                                    type="checkbox"
                                                    checked={participants.includes(user.id)}
                                                    onChange={() => handleParticipantToggle(user.id)}
                                                    className="form-checkbox h-5 w-5 text-indigo-600"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-3 bg-indigo-50 text-indigo-800 rounded-lg text-center font-medium">
                                        Total: ${numericAmount.toFixed(2)} / {participants.length} people = <strong>${sharePerPerson.toFixed(2)} per person</strong>
                                    </div>
                                </>
                            )}
                            
                            {splitMethod === 'unequal' && (
                                <>
                                    <h3 className="text-lg font-semibold">Enter custom shares:</h3>
                                     <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {splitMembers.map(user => (
                                            <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                <div className="flex items-center">
                                                    <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full mr-3" />
                                                    {user.name}
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="mr-1 text-gray-500">$</span>
                                                    <input
                                                        type="text"
                                                        placeholder="0.00"
                                                        value={customShares[user.id] || ''}
                                                        onChange={(e) => handleCustomShareChange(user.id, e.target.value)}
                                                        className="w-24 p-1 border rounded-md text-right"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className={`p-3 rounded-lg text-center font-medium ${isBalanced ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        <p>Total: ${totalCustomShares.toFixed(2)} of ${numericAmount.toFixed(2)}</p>
                                        <p className="text-sm">{isBalanced ? 'All balanced!' : `${remainingAmount.toFixed(2)} remaining`}</p>
                                    </div>
                                </>
                            )}

                             <div className="flex justify-between mt-6">
                                <button onClick={() => setStep(1)} className="py-2 px-6 bg-gray-200 rounded-lg">Back</button>
                                <button onClick={handleSubmit} disabled={confirmButtonDisabled} className="py-2 px-6 bg-green-500 text-white rounded-lg font-semibold disabled:bg-gray-300">Confirm Expense</button>
                             </div>
                         </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddExpenseModal;