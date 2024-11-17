import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from '../../services/api';

function GroupPage() {
    const { id } = useParams(); // Get group ID from the URL
    const navigate = useNavigate(); // Use useNavigate instead of useHistory
    const [group, setGroup] = useState(null);
    const [error, setError] = useState(null);
    const [isOwner, setIsOwner] = useState(false); // To track if the user is the owner of the group
    const [loading, setLoading] = useState(true);

    // Dynamically get the current user (hardcoded for now)
    const currentUser = 1;  // Hardcoded to 3 for now, later we will use real user ID

    useEffect(() => {
        console.log(`Fetching group with id: ${id}`);
    
        // Fetch the group details
        axios.get(`/groups/${id}`)
            .then((response) => {
                setGroup(response.data);
                // Check if the current user is the owner
                if (response.data.owners_id === currentUser) {
                    setIsOwner(true); // Simulate that this user is the owner
                }
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching group:', error);
                setError('Failed to fetch group details. Please try again.');
                setLoading(false);
            });
    }, [id]);

    // Function to delete the group
    const handleDeleteGroup = () => {
        axios.delete(`/groups/${id}`)
            .then(() => {
                alert('Group deleted successfully');
                navigate('/groups'); // Redirect to a list of groups or the homepage
            })
            .catch((error) => {
                console.error('Error deleting group:', error);
                setError('Failed to delete group. Please try again.');
            });
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!group) return <div>Group not found!</div>;

    return (
        <div>
            <h1>{group.name}</h1>
            <p>{group.description}</p>
            <p>Owner: {group.owners_id}</p>

            {/* Display members */}
            <h3>Members:</h3>
            <ul>
                {group.members && group.members.length > 0
                    ? group.members.map((member) => (
                        <li key={member.id}>{member.name}</li>
                    ))
                    : <li>No members</li>}
            </ul>

            {/* Show Edit and Delete buttons only if the user is the owner */}
            {isOwner && (
                <>
                    <button>Edit Group</button>
                    <button onClick={handleDeleteGroup}>Delete Group</button>
                </>
            )}
        </div>
    );
}

export default GroupPage;
