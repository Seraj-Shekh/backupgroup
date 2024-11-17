import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../services/api';

function GroupList() {
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        axios.get('/groups')
            .then((response) => setGroups(response.data))
            .catch((error) => console.error('Error fetching groups:', error));
    }, []);

    return (
        <div>
            <h1>Groups</h1>
            <ul>
                {groups.map((group) => (
                    <li key={group.id}>
                        <Link to={`/groups/${group.id}`}>{group.name}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default GroupList;
