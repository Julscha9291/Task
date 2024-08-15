import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Summary.css';

const Summary = () => {
  const [date, setDate] = useState(new Date());
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [firstName, setFirstName] = useState(''); // State für den Vornamen
  const [lastName, setLastName] = useState('');   // State für den Nachnamen

  useEffect(() => {
    fetch('http://localhost:8000/api/summary/')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => setSummary(data))
      .catch(error => setError(error.toString()));
      setFirstName(localStorage.getItem('first_name') || ''); // Laden des Vornamens aus dem Local Storage
      setLastName(localStorage.getItem('last_name') || '');   // Optional: Laden des Nachnamens aus dem Local Storage
  }, []);

  const getGreeting = () => {
    const currentTime = new Date().getHours();
    let greeting = '';

    if (currentTime < 12) {
      greeting = 'Good Morning';
    } else if (currentTime < 18) {
      greeting = 'Good Afternoon';
    } else {
      greeting = 'Good Evening';
    }

    return greeting;
  };

  // Function to capitalize the first letter of a string
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!summary) {
    return <div>Loading...</div>;
  }

  const formatDate = (dateString) => {
    if (!dateString) {
      return ''; // Oder einen Standardwert zurückgeben, je nach Anwendungsfall
    }

    const date = new Date(dateString);

    // Überprüfe, ob das Datum gültig ist
    if (isNaN(date.getTime())) {
      return ''; // Oder einen Standardwert zurückgeben, falls das Datum ungültig ist
    }

    return date.toLocaleDateString();
  };

  const mapCategoryName = (category) => {
    switch (category) {
      case 'inProgress':
        return 'in Progress';
      case 'awaitingFeedback':
        return 'awaiting Feedback';
      default:
        return category;
    }
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month' && summary && summary.tasks) {
      const formattedDate = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const tasksForDate = summary.tasks.filter(task => {
        const taskDate = new Date(task.due_date).toISOString().split('T')[0];
        return taskDate === formattedDate;
      });
  
      return (
        <div>
          {tasksForDate.length > 0 && (
            <div className="calendar-mark">
              <span>{tasksForDate.length}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="summary-wrapper">
      <div className="summary-greeting">
        <h2>{getGreeting()}, {firstName} {lastName}!</h2>
        <Calendar onChange={setDate} value={date} tileContent={tileContent} />
      </div>
      <div className="summary-container">
        <h2>Summary</h2>
        <div className="summary-grid">
          <Link to="/board" className="summary-item">
            <span className="summary-number">{summary.total_tasks}</span>
            <span className="summary-label">Tasks in Board</span>
          </Link>
          {summary.tasks_by_category.map(category => (
            <Link to="/board" className="summary-item" key={category.category}>
              <span className="summary-number">{category.count}</span>
              <span className="summary-label">{capitalizeFirstLetter(mapCategoryName(category.category).replace('_', ' '))}</span>
            </Link>
          ))}
          <Link to="/board" className="summary-item urgent">
            <span className="summary-number">{summary.urgent_tasks}</span>
            <span className="summary-label">Urgent</span>
          </Link>
          <Link to="/board" className="summary-item">
            <span className="summary-deadline">{formatDate(summary.next_deadline)}</span>
            <span className="summary-label">Upcoming Deadline</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Summary;
