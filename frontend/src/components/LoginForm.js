import React, { useState, useEffect } from 'react';
import './LoginForm.css';
import RegistrationForm from './RegistrationForm';
import { useNavigate } from 'react-router-dom';


function LoginForm({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showRegistration, setShowRegistration] = useState(false);
    const [logoShrink, setLogoShrink] = useState(false);
    const [showLoginForm, setShowLoginForm] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            console.log('User is logged in');
          
        } else {
            console.log('User is not logged in');
        }
    }, [navigate]);

    useEffect(() => {
        const timer1 = setTimeout(() => {
            setLogoShrink(true);
        }, 1000); // 1 Sekunde warten, bevor die Animation beginnt

        const timer2 = setTimeout(() => {
            setShowLoginForm(true);
        }, 2000); // 2 Sekunden nach dem Shrink das Login-Formular anzeigen

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        }; 
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        fetch('http://localhost:8000/api/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Server response:', data); // Debugging
                if (data.access) {
                    localStorage.setItem('access_token', data.access);
                    localStorage.setItem('user_id', data.user.id);
                    localStorage.setItem('first_name', data.user.first_name);
                    localStorage.setItem('last_name', data.user.last_name);
                    localStorage.setItem('color', data.user.color);
                    onLogin();
            
                    fetch('http://localhost:8000/api/profile/', {
                        headers: {
                            'Authorization': `Bearer ${data.access}`,
                        },
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(profileData => {
                        if (profileData.user) {
                            localStorage.setItem('first_name', profileData.user.first_name);
                            localStorage.setItem('last_name', profileData.user.last_name);
                            localStorage.setItem('color', profileData.user.color);
                        }
                        navigate('/');
                    })
                    .catch(error => {
                        console.error('Error fetching profile data:', error);
                        navigate('/');
                    });
                } else {
                    console.error('Login failed, no access token returned');
                }
            })
            
            .catch((error) => {
                console.error('Fetch error:', error); // Hier werden Fetch-Fehler behandelt
                console.error('Error message:', error.message); // Zeigt die spezifische Fehlermeldung an
            });
    };
    
    
    
    const handleSignUpClick = () => {
        setShowRegistration(true);
    };

    const handleRegistrationSuccess = () => {
        setShowRegistration(false);
        navigate('/board'); // Weiterleiten zur "Board"-Komponente nach erfolgreicher Registrierung
    };

    const handleSwitchToLogin = () => {
        setShowRegistration(false);
    };

    const handleGuestLogin = () => {
        // Hier die Gast-Zugangsdaten, die im Backend erstellt wurden
        const guestEmail = 'guest@example.com';
        const guestPassword = 'guestpassword';
        
        fetch('http://localhost:8000/api/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: guestEmail, password: guestPassword }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Server response:', data);
            if (data.access) {
                localStorage.setItem('access_token', data.access);
                localStorage.setItem('user_id', data.user.id);
                localStorage.setItem('first_name', data.user.first_name);
                localStorage.setItem('last_name', data.user.last_name);
                localStorage.setItem('color', data.user.color);
                onLogin();
                navigate('/');  // Weiterleiten zur Startseite oder zum Dashboard
            } else {
                console.error('Guest login failed, no access token returned');
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
    };
    

    return (
        <div className="login-page">
            {showRegistration ? (
                <RegistrationForm onSuccess={handleRegistrationSuccess} onSwitchToLogin={handleSwitchToLogin} />
            ) : (
                <>
                    <div className={`logo-container ${logoShrink ? 'shrink' : ''}`}>
                        <img src="/images/logo2.png" alt="Task Logo" />
                    </div>
                    <div className={`login-container ${showLoginForm ? 'show' : ''}`}>
                        <div className="header-login">
                        <div className="title-task-container">
                        <h3 className='title-task'>Task</h3>
                        <div className="vertical-line"></div>
                        <div className="text-container">
                        <div className="subtitle">Better</div>
                        <div className="subtitle">Together</div>
                        </div>
                        </div>
                        </div>
                        <div className="form-container-login">
                            <form onSubmit={handleSubmit}>
                                <h2>Login</h2>
                                <input className="login-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-Mail" required /><br />
                                <input className="login-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Passwort" required /><br />
                                <button className="login-button" type="submit">Login</button>
                            </form>
                            <p className="register-text">Not registered yet? 
                                <button onClick={handleSignUpClick} className="sign-button">Sign up!</button>
                            </p>
                            <p className="guest-text">
                                <button onClick={handleGuestLogin} className="guest-button">Guest-Login</button>
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default LoginForm;
