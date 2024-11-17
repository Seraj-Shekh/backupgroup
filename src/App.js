import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import GroupList from './components/Group/GroupList';
import GroupPage from './components/Group/GroupPage';
import CreateGroupForm from './components/Group/CreateGroupForm';

function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<GroupList />} />
                <Route path="/groups/:id" element={<GroupPage />} />
                <Route path="/create-group" element={<CreateGroupForm />} />
            </Routes>
        </Router>
    );
}

export default App;
