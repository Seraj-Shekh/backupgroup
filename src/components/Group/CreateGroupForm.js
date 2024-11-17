import React, { useState } from 'react';
import axios from '../../services/api';

function CreateGroupForm() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        axios.post('/groups/create', { name, description })
            .then((response) => {
                alert('Group created successfully!');
                setName('');
                setDescription('');
            })
            .catch((error) => {
                console.error('Error creating group:', error);
                alert('Failed to create group.');
            });
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Create a New Group</h2>
            <div>
                <label>Name: </label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
                <label>Description: </label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
            <button type="submit">Create Group</button>
        </form>
    );
}

export default CreateGroupForm;
