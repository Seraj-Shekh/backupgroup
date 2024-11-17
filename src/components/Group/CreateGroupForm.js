// CreateGroupForm.js - Create Group Page
import React, { useState } from 'react';
import axios from '../../services/api';

function CreateGroupForm() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState(null);  // Add error state for form validation

    const handleSubmit = (e) => {
        e.preventDefault();

        // Check if name and description are non-empty before sending the request
        if (!name || !description) {
            setError('Both name and description are required');
            return;
        }

        // Make sure to send a POST request to create a group
        axios.post('/groups/create', { name, description })
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
