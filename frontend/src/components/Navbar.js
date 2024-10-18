import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTableList, faPenToSquare, faBell, faUser, faClipboard, faSignOutAlt, faInfoCircle, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, Divider, Typography, Box, useMediaQuery, Snackbar, Alert } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import './Navbar.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Calendar from 'react-calendar'; 

const Navbar = ({ darkMode, toggleDarkMode }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [color, setColor] = useState('#6c757d');
    const [initials, setInitials] = useState('');
    const isMobile = useMediaQuery('(max-width:1024px)');
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [newNotificationCount, setNewNotificationCount] = useState(0);
    const [notificationDetails, setNotificationDetails] = useState([]);
    const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const location = useLocation(); 

    const notificationDropdownRef = useRef(null);
    const profileDropdownRef = useRef(null);

    const [calendarVisible, setCalendarVisible] = useState(false);
    const [date, setDate] = useState(new Date());

    const handleCalendarClick = () => {
        setCalendarVisible(!calendarVisible); 
    };

    const processedTaskIds = useRef(new Set());

    useEffect(() => {
        const ws = new WebSocket('wss://task.julianschaepermeier.com/ws/notifications/');
    
        ws.onopen = () => {
            console.log("WebSocket is open now.");
        };
    
        ws.onmessage = async function(event) {
            console.log('Received WebSocket message:', event.data);  // Log the incoming message
    
            const data = JSON.parse(event.data);
    
            if (data.type === 'new_task_notification') {
                const { task: taskId } = data.notification;
    
                if (!processedTaskIds.current.has(taskId)) {
                    processedTaskIds.current.add(taskId);
    
                    // Fetch Task Details
                    try {
                        const response = await fetch(`${process.env.REACT_APP_API_URL}api/tasks/${taskId}`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        });
                        if (!response.ok) {
                            const errorDetails = await response.json();  // Log additional error details
                            console.error('Error fetching task details:', errorDetails);
                            throw new Error('Network response was not ok');
                        }
                        const taskDetails = await response.json();
                        console.log('Task Details fetched successfully:', taskDetails);  // Log fetched details
                        setNotificationDetails(prevDetails => [...prevDetails, taskDetails]);
    
                        // Update notifications and increment counter
                        setNotifications(prev => [data.notification, ...prev.filter(n => n.task !== taskId)]);
                        setNewNotificationCount(prevCount => prevCount + 1);
    
                        setSnackbarOpen(true);
                    } catch (error) {
                        console.error('Error fetching task details:', error);
                    }
                }
            }
        };
    
        ws.onclose = function(e) {
            console.log('WebSocket closed unexpectedly');
        };
    
        ws.onerror = function(err) {
            console.error('WebSocket encountered an error:', err.message || err);  // Improved error log
        };
    
        return () => {
            ws.close();
        };
    }, []);
    

    useEffect(() => {
        function handleClickOutside(event) {
            if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
                setNotificationDropdownOpen(false);
            }
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setProfileDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const storedFirstName = localStorage.getItem('first_name') || '';
        const storedLastName = localStorage.getItem('last_name') || '';
        const storedColor = localStorage.getItem('color') || '#6c757d';

        setFirstName(storedFirstName);
        setLastName(storedLastName);
        setColor(storedColor);

        const firstInitial = storedFirstName.charAt(0).toUpperCase();
        const lastInitial = storedLastName.charAt(0).toUpperCase();
        setInitials(`${firstInitial}${lastInitial}`);
    }, []);

    const toggleMenu = () => setMenuOpen(!menuOpen);

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbarOpen(false);
    };

    const handleBellClick = () => {
        setNotificationDropdownOpen(prevState => !prevState);
        setNewNotificationCount(0);
    };

    const handleProfileClick = () => {
        setProfileDropdownOpen(prevState => !prevState);
    };

    const handleGoToBoard = () => {
        setNotificationDropdownOpen(false);
        setNotificationDetails([]);
        setNotifications([]);
        navigate('/board');
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('first_name');
        localStorage.removeItem('last_name');
        localStorage.removeItem('color');
        navigate('/login');
        window.location.reload();

    };

    return (
        <div className="main-container">
            <nav className={`navbar ${darkMode ? 'dark-mode' : ''}`} style={{ backgroundColor: '#f1f7fa' }}>
                <Link to="/" className="media-logo">
                        <img src="https://task.julianschaepermeier.com/static/task.png" alt="Task Logo" className="task-logo" />
                    </Link>
            <div className="navbar-container">
                <div className="calendar-container">
                        <div className="calendar-icon" onClick={handleCalendarClick}>
                            <FontAwesomeIcon icon={faCalendarAlt} className="navbar-icon" />
                        </div>
                        {calendarVisible && (
                            <div className="calendar-dropdown">
                                <div className="dropdown-arrow"></div>
                                <Calendar onChange={setDate} value={date} />
                            </div>
                        )}
                    </div> 

                    <div className="notification-icon" onClick={handleBellClick}>
                        <FontAwesomeIcon icon={faBell} className="navbar-icon" />
                        {newNotificationCount > 0 && (
                            <span className="notification-count">{newNotificationCount}</span>
                        )}
                        {notificationDropdownOpen && (
                            <div ref={notificationDropdownRef} className="notification-dropdown">
                                <div className="dropdown-arrow-bell"></div>
                                <Typography variant="h6" className="dropdown-header">
                                    Notification
                                </Typography>
                                {notifications.length > 0 ? (
                                    notifications.map((task, index) => {
                                        const taskDetail = notificationDetails.find(detail => detail.id === task.task);

                                        return (
                                            <div key={index} className="notification-item">
                                                <div className="notification-content">

                                                    {/* Initialen des Kontakts links */}
                                                    <div className="contact-initials-board" style={{ backgroundColor: color }}>
                                                        {initials}
                                                    </div>
                                                    {/* Task-Details rechts */}
                                                    <div>
                                                        <Typography variant="subtitle2" className="notification-title" style={{ fontWeight: 'bold' }}>
                                                            {firstName} {lastName} assigned a new task.
                                                        </Typography>
                                                        {taskDetail ? (
                                                            <Box className="notification-box" sx={{ marginBottom: 2 }}>
                                                                <Typography variant="subtitle2" className="notification-title">Title: {taskDetail.title || 'N/A'}</Typography>
                                                                <Typography variant="subtitle2" className="notification-title">Category: {taskDetail.category || 'N/A'}</Typography>
                                                            </Box>
                                                        ) : (
                                                            <Typography variant="body2" className="text-dropdown">
                                                                Keine Aufgaben verfügbar.
                                                            </Typography>
                                                        )}
                                                    </div>
                                                </div>
                                                {index < notifications.length - 1}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <Typography variant="body2" className="no-notifications">
                                        No new notifications
                                    </Typography>
                                )}

                                <div className="button">
                                    <button type="submit" className="create-button" onClick={handleGoToBoard}>View tasks</button>
                                </div>
                            </div>
                        )}
                    </div>
                    

                    <div className="user" onClick={handleProfileClick} ref={profileDropdownRef} >
                        <div className="profile-container" >
                            <div className="contact-initials-nav" style={{ backgroundColor: color }} >
                                {initials}
                            </div>
                        </div>
                        <div className="user-name" >
                            {firstName} {lastName}
                        </div>

                        {profileDropdownOpen && (
                            <div className="profile-dropdown" >
                                <div className="dropdown-arrow-profile"></div>
                                <div className="dropdown-item" onClick={handleLogout}>
                                    <FontAwesomeIcon icon={faSignOutAlt} className="dropdown-icon" />
                                    <span>Logout</span>
                                </div>
                            </div>
                        )}
                    </div>
                
                    {isMobile && (
                        <div className="menu-icon" onClick={toggleMenu}>
                            <IconButton edge="start" color="inherit" aria-label="menu">
                                <MenuIcon />
                            </IconButton>
                        </div>
                    )}
                </div>
            </nav>

            <Drawer
                variant={isMobile ? "temporary" : "permanent"}
                open={isMobile ? menuOpen : true}
                onClose={toggleMenu}
                className={isMobile ? "mobile-drawer" : "drawer"}
                classes={{ paper: 'drawer-paper' }}
                anchor="left"
                style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}
                >
                <Box sx={{ padding: 2, textAlign: 'center' }}>
                <Link to="/" className="navbar-logo">
                        <img src="https://task.julianschaepermeier.com/static/task.png" alt="Task Logo" className="navbar-image" />
                        <div className="title-task-container">
                        <h3 className='title-task'>Task</h3>
                        <div className="vertical-line"></div>
                        <div className="text-container">
                        <div className="subtitle">Better</div>
                        <div className="subtitle">Together</div>
                        </div>
                        </div>
                    </Link>
                
                </Box>
                <Divider sx={{ backgroundColor: '#ffffff' }} />
                <List>
                {[
                { text: 'Summary', icon: faTableList, link: '/' },
                { text: 'Board', icon: faClipboard, link: '/board' },
                { text: 'Add Task', icon: faPenToSquare, link: '/task' },
                { text: 'Contacts', icon: faUser, link: '/contactList' },
                { text: 'Impressum', icon: faInfoCircle, link: '/impressum' },
                    ].map((item, index) => (
                <ListItem 
                    button 
                    key={index} 
                    component={Link} 
                    to={item.link} 
                    selected={location.pathname === item.link} // Set selected if path matches
                    className={location.pathname === item.link ? 'selected' : ''} // Apply selected class
                >
                    <ListItemIcon className="sidebar-icon">
                        <FontAwesomeIcon icon={item.icon} style={{ color: '#ffffff' }} />
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                </ListItem>
            ))}
        </List>
            </Drawer>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
            >
                <Alert onClose={handleSnackbarClose} severity="info" sx={{ width: '100%' }}>
                    New Task available
                </Alert>
            </Snackbar>
        </div>
    );
};

export default Navbar;
