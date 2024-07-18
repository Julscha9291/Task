import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTableList, faPenToSquare, faBell, faMoon, faSun, faUser, faClipboard, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, Divider, Typography, Box, useMediaQuery } from '@mui/material';
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

        console.log('Stored First Name:', storedFirstName); // Debugging
        console.log('Stored Last Name:', storedLastName); // Debugging
        console.log('Stored Color:', storedColor); // Debugging

        setFirstName(storedFirstName);
        setLastName(storedLastName);
        setColor(storedColor);

        const firstInitial = storedFirstName.charAt(0).toUpperCase();
        const lastInitial = storedLastName.charAt(0).toUpperCase();
        setInitials(`${firstInitial}${lastInitial}`);

    }, []);

    return (
        <div className="main-container">
            <nav className={`navbar ${darkMode ? 'dark-mode' : ''}`} style={{ backgroundColor: '#003B46' }}>
                <div className="navbar-container">
                    <Link to="/" className="navbar-logo">
                        <img src="/images/task.png" alt="Task Logo" className="navbar-image" />
                        Task
                    </Link>

                    <div className="notification-icon">
                        <FontAwesomeIcon icon={faBell} className="navbar-icon" />
                    </div>
                    <div className="dark-mode-toggle" onClick={toggleDarkMode}>
                        <FontAwesomeIcon icon={darkMode ? faSun : faMoon} className="dark-mode-icon" />
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
                        { text: 'Contacts', icon: faUser, link: '/contacts' },
                        { text: 'Logout', icon: faSignOutAlt, onClick: handleLogout }
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
        </div>
    );
};

export default Navbar;
