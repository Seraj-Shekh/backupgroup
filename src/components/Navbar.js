import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
    return (
        <nav>
            <Link to="/">Groups</Link> {/* Link to GroupList */}
            <Link to="/create-group">Create Group</Link> {/* Link to Create Group Form */}
        </nav>
    );
}

export default Navbar;
