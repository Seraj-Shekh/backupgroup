// GroupPage.js - View Group Page
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../../services/api';

function GroupPage() {
    const { id } = useParams(); // Get group ID from the URL
    const [group, setGroup] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log(`Fetching group with id: ${id}`); // Debugging log

        // Ensure the ID is a valid number (since we're expecting a group ID)
        if (isNaN(id)) {
            setError('Invalid group ID');
            return;
        }

        axios.get(`/groups/${id}`)
            .then((response) => {
                setGroup(response.data);
            })
            .catch((error) => {
                console.error('Error fetching group:', error);
                setError('Failed to fetch group details. Please try again.');
            });
    }, [id]);

    if (error) return <div>{error}</div>;
    if (!group) return <div>Loading...</div>;

    return (
        <div>
            <h1>{group.name}</h1>
            <p>{group.description}</p>
        </div>
    );
}

export default GroupPage;
