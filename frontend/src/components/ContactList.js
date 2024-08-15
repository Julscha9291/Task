import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ContactList.css'; // Erstellen Sie eine entsprechende CSS-Datei für das Styling

const ContactList = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8000/api/users/')
      .then(response => {
        const sortedUsers = response.data.sort((a, b) => {
          const nameA = a.last_name.toUpperCase();
          const nameB = b.last_name.toUpperCase();
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          return 0;
        });
        setUsers(sortedUsers);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
      });
  }, []);

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  const renderUsers = () => {
    let currentLetter = '';
    return users.map(user => {
      const userLetter = user.last_name.charAt(0).toUpperCase();
      const showLetter = userLetter !== currentLetter;
      currentLetter = userLetter;

      return (
        <React.Fragment key={user.id}>
          {showLetter && (
            <>
              <div className="letter-header">{userLetter}</div>
              <hr />
            </>
          )}
          <div
            className={`contact-item ${selectedUser && selectedUser.id === user.id ? 'selected' : ''}`}
            onClick={() => handleUserClick(user)}
          >
            <div className="contact-initials" style={{ backgroundColor: user.color }}>
              {user.first_name.charAt(0).toUpperCase()}{user.last_name.charAt(0).toUpperCase()}
            </div>
            <div className="contact-info-container">
              <div className="contact-name">{user.first_name} {user.last_name}</div>
              <div className="contact-email">{user.email}</div>
            </div>
          </div>
        </React.Fragment>
      );
    });
  };

  return (
    <div className="contact-list-container">
      <div className="contact-wrapper">
        <div className="contactlist-list">
        <div className="contact-header">
          <h1>Contacts</h1>
          <div className="header-divider"></div>
          <span className="header-text">better together</span>
        </div>
          {renderUsers()}
        </div>
        {selectedUser && (
          <div className="contact-details">
            <div className="contact-details-header">
              <div className="contact-initials" style={{ backgroundColor: selectedUser.color }}>
                {selectedUser.first_name.charAt(0).toUpperCase()}{selectedUser.last_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="contact-name">{selectedUser.first_name} {selectedUser.last_name}</div>
                <div className="contact-add-task">+ Add Task</div>
              </div>
            </div>
            <div className="contact-info">
              <h3>Contact Information</h3>
              <p>Email: <a href={`mailto:${selectedUser.email}`}>{selectedUser.email}</a></p>
              <p>Phone: {selectedUser.phone}</p>
              <button>Edit Contact</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactList;
