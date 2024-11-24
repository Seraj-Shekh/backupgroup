import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../services/api';

function GroupPage() {
    const { id } = useParams(); // Get group ID from the URL
    const navigate = useNavigate(); // Use useNavigate for navigation
    const [group, setGroup] = useState(null);
    const [error, setError] = useState(null);
    const [isOwner, setIsOwner] = useState(false); // To track if the user is the owner of the group
    const [isMember, setIsMember] = useState(false); // To track if the user is a member of the group
    const [joinRequestSent, setJoinRequestSent] = useState(false); // To check if the user has already sent a join request
    const [loading, setLoading] = useState(true);
    const [joinRequests, setJoinRequests] = useState([]); // For displaying join requests

    // Dynamically get the current user (hardcoded for now)
    const currentUser = 4; 
    useEffect(() => {
        console.log(`Fetching group with id: ${id}`);

        // Fetch the group details
        axios.get(`/groups/${id}`)
            .then((response) => {
                setGroup(response.data);

                // Check if the current user is the owner
                if (response.data.owners_id === currentUser) {
                    setIsOwner(true);
                }

                // Check if the current user is a member of the group
                const isMember = response.data.members.some(member => member.id === currentUser);
                setIsMember(isMember);

                // Ensure joinRequests is always an array, even if it's missing
                const joinRequests = response.data.joinRequests || [];

                // Check if a join request has already been sent
                const joinRequest = joinRequests.find(req => req.users_id === currentUser);
                if (joinRequest) {
                    setJoinRequestSent(true);
                }

                setJoinRequests(joinRequests);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching group:', error);
                setError('Failed to fetch group details. Please try again.');
                setLoading(false);
            });
    }, [id]);

    // Function to send a join request
    const handleJoinRequest = () => {
        axios.post('/groups/join-request', { groupId: id, userId: currentUser })
            .then(() => {
                setJoinRequestSent(true);
                alert('Join request sent successfully!');
            })
            .catch((error) => {
                console.error('Error sending join request:', error);
                setError(`Failed to send join request: ${error.response ? error.response.data.message : 'Unknown error'}`);
            });
    };

    // Function to accept a join request
    const handleAcceptJoinRequest = (userId) => {
        axios.post('/groups/accept-request', {
            groupId: id, // Group ID from URL
            userId: userId, // User ID of the requester
            currentUserId: currentUser // Owner's ID (current logged-in user)
        })
            .then(() => {
                setJoinRequests(joinRequests.filter(req => req.users_id !== userId)); // Remove accepted request
                alert('Join request accepted!');
            })
            .catch((error) => {
                console.error('Error accepting join request:', error);
                setError('Failed to accept join request. Please try again.');
            });
    };
    

    // Function to reject a join request
    const handleRejectJoinRequest = (userId) => {
        axios.post('/groups/reject-request', {
            groupId: id, // Group ID from URL
            userId: userId, // User ID of the requester
            currentUserId: currentUser // Owner's ID (current logged-in user)
        })
            .then(() => {
                setJoinRequests(joinRequests.filter(req => req.users_id !== userId)); // Remove rejected request
                alert('Join request rejected!');
            })
            .catch((error) => {
                console.error('Error rejecting join request:', error);
                setError('Failed to reject join request. Please try again.');
            });
    };

    // Function to remove a member from the group (only for the owner)
    const handleRemoveMember = (userId) => {
        axios.post('/groups/remove-member', {
            groupId: id, // Group ID from URL
            userId: userId, // User ID of the member to be removed
            currentUserId: currentUser // Owner's ID (current logged-in user)
        })
            .then(() => {
                setGroup(prevGroup => ({
                    ...prevGroup,
                    members: prevGroup.members.filter(member => member.id !== userId) // Remove member from the UI
                }));
                alert('Member removed successfully!');
            })
            .catch((error) => {
                console.error('Error removing member:', error);
                setError('Failed to remove member. Please try again.');
            });
    };

    // Function for a member to leave the group (only for the member)
    const handleLeaveGroup = () => {
        axios.post('/groups/leave-group', {
            groupId: id, // Group ID from URL
            userId: currentUser // Current user ID
        })
            .then(() => {
                setGroup(prevGroup => ({
                    ...prevGroup,
                    members: prevGroup.members.filter(member => member.id !== currentUser) // Remove the member from the group
                }));
                setIsMember(false);
                alert('You have left the group.');
                navigate('/groups'); // Redirect to the groups list after leaving
            })
            .catch((error) => {
                console.error('Error leaving group:', error);
                setError('Failed to leave the group. Please try again.');
            });
    };

    // Function to delete the group
    const handleDeleteGroup = () => {
        axios.delete(`/groups/${id}`, { data: { userId: currentUser } })
            .then(() => {
                alert('Group deleted successfully');
                navigate('/groups'); // Redirect to the groups list after deletion
            })
            .catch((error) => {
                console.error('Error deleting group:', error);
                setError('Failed to delete the group.');
            });
    };

    // Function to handle group edit (this can be expanded if needed)
    const handleEditGroup = () => {
        navigate(`/edit-group/${id}`); 
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
                        <li key={member.id}>
                            {member.name}
                            {isOwner && (
                                <button onClick={() => handleRemoveMember(member.id)}>Remove</button>
                            )}
                            {isMember && member.id === currentUser && (
                                <button onClick={handleLeaveGroup}>Leave Group</button>
                            )}
                        </li>
                    ))
                    : <li>No members</li>}
            </ul>

            {/* Show join requests for the owner */}
            {isOwner && (
                <>
                    <h3>Join Requests:</h3>
                    <ul>
                        {joinRequests.length > 0 ? (
                            joinRequests.map((request) => (
                                <li key={request.users_id}>
                                    {request.user_name}
                                    <button onClick={() => handleAcceptJoinRequest(request.users_id)}>Accept</button>
                                    <button onClick={() => handleRejectJoinRequest(request.users_id)}>Reject</button>
                                </li>
                            ))
                        ) : (
                            <li>No pending requests</li>
                        )}
                    </ul>
                </>
            )}

            {/* Show Edit and Delete buttons only if the user is the owner */}
            {isOwner && (
                <>
                    <button onClick={handleEditGroup}>Edit Group</button>
                    <button onClick={handleDeleteGroup}>Delete Group</button>
                </>
            )}

            {/* Show the Join Request button if the user is not a member and has not sent a join request */}
            {!isOwner && !isMember && !joinRequestSent && (
                <button onClick={handleJoinRequest}>Send Join Request</button>
            )}
            {joinRequestSent && <p>Your join request is pending.</p>}
        </div>
    );
}

export default GroupPage;
