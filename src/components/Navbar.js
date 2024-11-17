import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
    return (
        <nav style={{ padding: '10px', background: '#282c34', color: '#fff' }}>
            <Link to="/" style={{ margin: '0 10px', textDecoration: 'none', color: '#fff' }}>
                Groups
            </Link>
            <Link to="/create-group" style={{ margin: '0 10px', textDecoration: 'none', color: '#fff' }}>
                Create Group
            </Link>
        </nav>
    );
}

export default Navbar;
