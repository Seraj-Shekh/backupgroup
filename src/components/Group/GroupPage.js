import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../../services/api';

function GroupPage() {
    const { id } = useParams();
    const [group, setGroup] = useState(null);

    useEffect(() => {
        axios.get(`/groups/${id}`)
            .then((response) => setGroup(response.data))
            .catch((error) => console.error('Error fetching group:', error));
    }, [id]);

    if (!group) return <div>Loading...</div>;

    return (
        <div>
            <h1>{group.name}</h1>
            <p>{group.description}</p>
            {/* Add more group management logic here */}
        </div>
    );
}

export default GroupPage;
