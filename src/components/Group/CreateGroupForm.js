import React, { useState } from 'react';
import axios from '../../services/api';

function CreateGroupForm() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState(null);  

   
    const currentUser = 1;  // Hardcoded for now, this should be dynamically set based on the logged-in user

    const handleSubmit = (e) => {
        e.preventDefault();
    
        // Check if name and description are non-empty before sending the request
        if (!name || !description) {
            setError('Both name and description are required');
            return;
        }

        // Log the current user and request data to verify
        console.log('currentUser (frontend):', currentUser);
        console.log('Data being sent to backend:', { name, description, userId: currentUser });

        // Send the userId along with the group creation data
        axios.post('/groups/create', { name, description, userId: currentUser })
            .then((response) => {
                alert('Group created successfully!');
                setName('');
                setDescription('');
                setError(null);  // Reset error message if the request was successful
            })
            .catch((error) => {
                console.error('Error creating group:', error);
                setError('Failed to create group. Please try again.');
            });
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Create a New Group</h2>
            {error && <div style={{ color: 'red' }}>{error}</div>}  {/* Show error message if any */}
            <div>
                <label>Name: </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Description: </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
            </div>
            <button type="submit">Create Group</button>
        </form>
    );
}

export default CreateGroupForm;
