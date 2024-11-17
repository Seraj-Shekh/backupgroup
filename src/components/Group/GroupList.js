// GroupList.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../services/api';

function GroupList() {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);  // Add loading state

    useEffect(() => {
        axios.get('/groups')
            .then((response) => {
                setGroups(response.data);
                setLoading(false);  // Set loading to false after fetching data
            })
            .catch((error) => {
                console.error('Error fetching groups:', error);
                setLoading(false);  // Handle error by setting loading to false
            });
    }, []);

    if (loading) {
        return <div>Loading groups...</div>;  // Show loading message while data is being fetched
    }

    return (
        <div>
            <h1>Groups</h1>
            <ul>
                {groups.map((group) => (
                    <li key={group.id}>
                        <h3>{group.name}</h3>
                        <p>{group.description}</p>
                        <Link to={`/groups/${group.id}`}>View Details</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default GroupList;
