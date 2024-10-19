import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ContactList.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const ContactList = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [taskSummary, setTaskSummary] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const navigate = useNavigate(); 

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}api/users/`)
      .then(response => {
        const sortedUsers = response.data.sort((a, b) => {
          const nameA = a.last_name.toUpperCase();
          const nameB = b.last_name.toUpperCase();
          return nameA.localeCompare(nameB);
        });
        setUsers(sortedUsers);
      })
      .catch(error => {
      });

    const checkScreenSize = () => {
      setIsMobileView(window.innerWidth <= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleAddTaskClick = () => {
    navigate('/task'); 
  };

  const handleUserClick = (user) => {
    fetch(`${process.env.REACT_APP_API_URL}api/users/${user.id}/user-summary/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      setSelectedUser(user);
      setTaskSummary(data);
    })
    .catch(error => {
    });
  };

  const handleBackClick = () => {
    setSelectedUser(null);
  };

  const mapCategoryName = (category) => {
    switch (category) {
      case 'inProgress':
        return 'in Progress';
      case 'awaitingFeedback':
        return 'awaiting Feedback';
      default:
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

  const sortCategories = (categories) => {
    const order = ['toDo', 'inProgress', 'awaitingFeedback', 'done'];
    return categories.sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category));
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="contact-list-container">
      <div className="contact-header">
        <h1>Contacts</h1>
      </div>
      <div className={`contact-wrapper ${isMobileView && selectedUser ? 'mobile-details-view' : ''}`}>
        {!selectedUser || !isMobileView ? (
          <div className="contactlist-list">
            {renderUsers()}
          </div>
        ) : null}
        
        {selectedUser && (
          <div className="contact-details">
            {isMobileView && (
              <div className="back-button-container">
                <div className="back-button" onClick={handleBackClick}>
                  <FontAwesomeIcon icon={faArrowLeft} />
                </div>
              </div>
            )}
            <div className="contact-details-header">
              <div className="contact-initials-big" style={{ backgroundColor: selectedUser.color }}>
                {selectedUser.first_name.charAt(0).toUpperCase()}{selectedUser.last_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="contact-name-big">{selectedUser.first_name} {selectedUser.last_name}</div>
              </div>
            </div>
            <hr className="header-divider-line" />
            <div className="contact-info-box">
              <h3 className="h3-box">Contact Information</h3>
              <p>Email: <a href={`mailto:${selectedUser.email}`}>{selectedUser.email}</a></p>
              <div className="info-box"> 
                <div className="info-box-header"> 
                  <h3 className="h3-box">Tasks Information</h3>
                  <div className="contact-add-task" onClick={handleAddTaskClick}>+ Add Task</div>
                </div>
                <p className='p-box'>Tasks in Board: {taskSummary?.total_tasks}</p>
                {taskSummary && sortCategories(taskSummary.tasks_by_category).map(category => (
                  <p key={category.category}>{mapCategoryName(category.category)}: {category.count}</p>
                ))}
                {taskSummary?.next_deadline && (
                  <p>Next Deadline: {formatDate(taskSummary.next_deadline)}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactList;
