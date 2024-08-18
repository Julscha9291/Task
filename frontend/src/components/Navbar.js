import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTableList, faPenToSquare, faBell, faUser, faClipboard, faSignOutAlt, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, Divider, Typography, Box, useMediaQuery, Snackbar, Alert, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import './Navbar.css';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ darkMode, toggleDarkMode }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [color, setColor] = useState('#6c757d'); // Standardfarbe, falls keine Farbe im Local Storage gefunden wird
    const [initials, setInitials] = useState('');
    const isMobile = useMediaQuery('(max-width:1024px)');
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [newNotificationCount, setNewNotificationCount] = useState(0);
    const [notificationDetails, setNotificationDetails] = useState([]); 
    const [dropdownOpen, setDropdownOpen] = useState(false);


    // Snackbar Zustände
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8000/ws/notifications/');


        ws.onopen = () => {
            console.log("WebSocket is open now.");
        };

        ws.onmessage = async function(event) {
            console.log("Event received:", event); // Ausgabe des gesamten Events
            const data = JSON.parse(event.data);
            console.log("Parsed data:", data);
        
            if (data.type === 'new_task_notification') {
                console.log("Processing notification:", data.notification);
        
                const { task: taskId } = data.notification; // ID des Tasks aus der Benachrichtigung
                // Fetch Task Details
                try {
                    const response = await fetch(`http://localhost:8000/api/tasks/${taskId}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const taskDetails = await response.json();
                    console.log("Fetched Task Details:", taskDetails);
                    
                    // Füge die neuen Task-Details zur Liste hinzu
                    setNotificationDetails(prevDetails => [...prevDetails, taskDetails]);
                    
                    // Aktualisiere die Benachrichtigungen
                    setNotifications(prev => [data.notification, ...prev]);
                    setNewNotificationCount(prevCount => prevCount + 1);
                    
                    setSnackbarOpen(true);
                } catch (error) {
                    console.error('Error fetching task details:', error);
                }
            } else {
                console.log("Unexpected message type:", data.type);
            }
        };
        

        ws.onclose = function(e) {
            console.log('WebSocket closed unexpectedly');
        };

        ws.onerror = function(err) {
            console.error('WebSocket encountered an error: ', err);
        };

        return () => {
            ws.close();
        };
    }, []);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('first_name');
        localStorage.removeItem('last_name');
        localStorage.removeItem('color'); // Farbe ebenfalls entfernen
        navigate('/login');
        window.location.reload();
    };

    useEffect(() => {
        const storedFirstName = localStorage.getItem('first_name') || '';
        const storedLastName = localStorage.getItem('last_name') || '';
        const storedColor = localStorage.getItem('color') || '#6c757d'; // Standardfarbe setzen, falls keine Farbe gefunden wird

        setFirstName(storedFirstName);
        setLastName(storedLastName);
        setColor(storedColor);

        const firstInitial = storedFirstName.charAt(0).toUpperCase();
        const lastInitial = storedLastName.charAt(0).toUpperCase();
        setInitials(`${firstInitial}${lastInitial}`);

    }, []);

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const handleBellClick = () => {
        setDropdownOpen(!dropdownOpen);
        setNewNotificationCount(0); // Benachrichtigungszähler zurücksetzen
    };
    
    const handleCloseDropdown = () => {
        setDropdownOpen(false);
    };

    const handleGoToBoard = () => {
        handleCloseDropdown(); // Schließt das Dropdown-Menü
        setNotificationDetails([]); // Löscht die Task-Details
        setNotifications([]); // Löscht die Benachrichtigungen
        navigate('/board');
    };

    return (
        <div className="main-container">
            <nav className={`navbar ${darkMode ? 'dark-mode' : ''}`} style={{ backgroundColor: '#003B46' }}>
                <div className="navbar-container">
                    <Link to="/" className="navbar-logo">
                        <img src="/images/task.png" alt="Task Logo" className="navbar-image" />
                        Task
                    </Link>
    
                    <div className="notification-icon" onClick={handleBellClick}>
                        <FontAwesomeIcon icon={faBell} className="navbar-icon" />
                        {newNotificationCount > 0 && (
                            <span className="notification-count">{newNotificationCount}</span>
                        )}
                  {dropdownOpen && (
                        <Box className="dropdown-menu" sx={{ padding: 2, borderRadius: 1, boxShadow: 3, backgroundColor: 'background.paper' }}>
                            <Typography variant="h6" sx={{ paddingBottom: 1 }}>
                                New Task Details
                            </Typography>
                            {notificationDetails.length > 0 ? (
                                notificationDetails.map((task, index) => (
                                    <Box key={index} sx={{ marginBottom: 2 }}>
                                        <Typography variant="subtitle1">Name: {task.title || 'N/A'}</Typography>
                                        <Typography variant="subtitle1">Description: {task.description || 'N/A'}</Typography>
                                        <button onClick={handleGoToBoard}>Go to Board</button>
                                    </Box>
                                ))
                            ) : (
                                <Typography variant="subtitle1">No details available</Typography>
                            )}
                        </Box>
                    )}
                                     </div>
    
                    <div className="logout-icon" onClick={handleLogout}>
                        <FontAwesomeIcon icon={faSignOutAlt} className="dark-mode-icon" />
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
                    <Typography variant="h6" sx={{ mt: 1 }}>
                        Welcome {firstName} {lastName}! <br />
                        <Typography variant="body2" color="textSecondary">
                            <div className="profile-initials" style={{ backgroundColor: color }}>
                                {initials}
                            </div>
                        </Typography>
                    </Typography>
                </Box>
                <Divider />
                <List>
                    {[
                        { text: 'Summary', icon: faTableList, link: '/' },
                        { text: 'Board', icon: faClipboard, link: '/board' },
                        { text: 'Add Task', icon: faPenToSquare, link: '/task' },
                        { text: 'Contacts', icon: faUser, link: '/contactList' },
                        { text: 'Impressum', icon: faInfoCircle, link: '/impressum' },
                    ].map((item, index) => (
                        <ListItem button key={index} component={Link} to={item.link} onClick={item.onClick}>
                            <ListItemIcon>
                                <FontAwesomeIcon icon={item.icon} className="fa-icon" />
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItem>
                    ))}
                </List>
            </Drawer>
    
            {/* Snackbar für Benachrichtigungen */}
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
