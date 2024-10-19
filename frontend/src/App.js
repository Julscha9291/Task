import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Board from './components/Board';
import Summary from './components/Summary';
import Task from './components/Task';
import LoginForm from './components/LoginForm'; 
import ContactList from './components/ContactList'; 
import Impressum from './components/Impressum'; 
import Footer from './components/Footer'; 

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false); 
  const [taskToEdit, setTaskToEdit] = useState(null);
  
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setLoggedIn(true);
    }
  }, []);

  const handleCloseTask = () => {
    setTaskToEdit(null);
    window.history.pushState({}, '', '/board');
  };

  const handleEditTask = (task) => {
    setTaskToEdit(task);
    window.history.pushState({}, '', '/task');
  
  };

  const handleLogin = (token) => {
    localStorage.setItem('access_token', token); 
    setLoggedIn(true); 
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setLoggedIn(false);
    window.history.pushState({}, '', '/login');
  };

  return (
    <Router>
      <div>
        {!loggedIn ? ( 
          <LoginForm onLogin={handleLogin} />
        ) : (
          <>
            <Navbar onLogout={handleLogout} />
            <Routes>
              <Route exact path="/" element={<Summary />} />
              <Route exact path="/board" element={<Board onEditTask={handleEditTask} />} />
              <Route
                exact
                path="/task"
                element={
                  <Task show={true} onClose={handleCloseTask} taskToEdit={taskToEdit} />
                }
              />
              <Route exact path="/contactList" element={<ContactList />} />
              <Route exact path="/impressum" element={<Impressum />} />
            </Routes>
         <Footer></Footer>
          </>
        )}
      </div>
    </Router>
  );
}

export default App;
