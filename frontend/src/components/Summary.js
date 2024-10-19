import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'react-calendar/dist/Calendar.css';
import './Summary.css';

const Summary = () => {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [firstName, setFirstName] = useState(''); 
  const [lastName, setLastName] = useState('');   
  const [weather, setWeather] = useState(null);  

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}api/summary/`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => setSummary(data))
      .catch(error => setError(error.toString()));
    
    setFirstName(localStorage.getItem('first_name') || ''); 
    setLastName(localStorage.getItem('last_name') || '');   

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=Dortmund,de&units=metric&appid=${process.env.REACT_APP_WEATHER_API_KEY}`)
      .then(response => response.json())
      .then(data => setWeather(data))
      .catch(error => setError(error.toString()));
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
        return ''; 
      }

      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return ''; 
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

  return (
    <div className="summary-wrapper">
      <div className="summary-greeting">
        <h1 className='h1-summary'>
          {getGreeting()}, <span className='spacer'></span>
          <span className='name'>{firstName} {lastName}</span>!
        </h1>
      </div>
      <div className="first-wrapper">
        <div className="summary-container">
          <h1 className='h2-summary'> First things first</h1>
          <div className="summary-grid-first">
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

        <div className="weather-container">
          <h1 className='h2-summary'>Current Weather in Dortmund</h1>
          {weather && weather.main ? (
            <div className="weather-content">
              <div className="weather-item">
                <span className="weather-label">Temperature</span>
                <span className="weather-value">{weather.main.temp}°C</span>
                <img 
                  src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} 
                  alt={weather.weather[0].description} 
                  className="weather-icon"  
                />
              </div>
             
              <div className="weather-item">
                <span className="weather-label">Humidity</span>
                <span className="weather-value">
                  {weather.main.humidity}%
                  <div className="icon">
                    <i className="fas fa-tint"></i> 
                  </div>
                </span>
              </div>
              
              <div className="weather-item">
                <span className="weather-label">Wind Speed</span>
                <span className="weather-value">
                  {weather.wind.speed} m/s
                  <div className="icon">
                    <i className="fas fa-wind"></i>
                  </div> 
                </span>
              </div>
            </div>
          ) : (
            <p>Loading weather data...</p>
          )}
        </div>
      </div>

      <div className="summary-container-total">
        <h1 className='h2-summary'> Summary Total Tasks</h1>
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
        </div>
      </div>
    </div>
  );
};

export default Summary;
