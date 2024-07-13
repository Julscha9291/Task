import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTableList, faPenToSquare, faBell, faMoon, faSun, faUser, faClipboard, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, Divider, Typography, Box, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import './Navbar.css';
import { Link, useNavigate } from 'react-router-dom'; // useHistory aus react-router-dom importieren

const Navbar = ({ darkMode, toggleDarkMode }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const isMobile = useMediaQuery('(max-width:1024px)');
    const navigate = useNavigate(); // useHistory aus react-router-dom verwenden

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        navigate('/login');
        window.location.reload(); // Nach dem Logout zur Login-Seite navigieren
    };

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
                        Welcome John! <br />
                        <Typography variant="body2" color="textSecondary">
                            <img src={"/images/unknown.png"} alt="Profile" className="profile-picture" />
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
