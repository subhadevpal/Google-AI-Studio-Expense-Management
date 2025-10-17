
import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Group } from '../types';

const CreateGroupForm: React.FC<{ onCancel: () => void }> = ({ onCancel }) => {
    const { state, dispatch } = useContext(AppContext);
    const [groupName, setGroupName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<string[]>([state.currentUser.id]);

    const handleToggleMember = (userId: string) => {
        setSelectedMembers(prev => 
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleCreateGroup = () => {
        if (groupName.trim() && selectedMembers.length > 1) {
            const newGroup: Group = {
                id: `group-${Date.now()}`,
                name: groupName.trim(),
                memberIds: selectedMembers,
            };
            dispatch({ type: 'ADD_GROUP', payload: newGroup });
            onCancel(); // Close form after creation
        }
    };
    
    const potentialMembers = state.users.filter(u => u.id !== state.currentUser.id);

    return (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-2">Create New Group</h3>
            <input 
                type="text"
                placeholder="Group Name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full p-2 border rounded mb-3"
            />
            <h4 className="font-medium mb-2">Select Members:</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
                {potentialMembers.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-2 bg-white rounded">
                        <label htmlFor={`member-${user.id}`} className="flex items-center cursor-pointer">
                            <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full mr-2" />
                            {user.name}
                        </label>
                        <input
                            id={`member-${user.id}`}
                            type="checkbox"
                            checked={selectedMembers.includes(user.id)}
                            onChange={() => handleToggleMember(user.id)}
                            className="form-checkbox h-5 w-5 text-indigo-600"
                        />
                    </div>
                ))}
            </div>
             <div className="flex justify-end space-x-2 mt-4">
                <button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                <button onClick={handleCreateGroup} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Create</button>
            </div>
        </div>
    );
};


const GroupsScreen: React.FC = () => {
    const { state, dispatch } = useContext(AppContext);
    const [isCreating, setIsCreating] = useState(false);

    const userGroups = state.groups.filter(g => g.memberIds.includes(state.currentUser.id));

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold">Groups</h1>
                {!isCreating && (
                    <button onClick={() => setIsCreating(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700">
                        New Group
                    </button>
                )}
            </div>
            
            {isCreating && <CreateGroupForm onCancel={() => setIsCreating(false)} />}

            <div className="mt-4 space-y-3">
                {userGroups.map(group => (
                    <div 
                        key={group.id} 
                        className="p-4 bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => dispatch({ type: 'SET_ACTIVE_GROUP', payload: group.id })}
                    >
                        <h2 className="text-lg font-semibold">{group.name}</h2>
                        <p className="text-sm text-gray-500">{group.memberIds.length} members</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GroupsScreen;
