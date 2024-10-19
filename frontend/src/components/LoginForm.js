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
        }, 1000); 

        const timer2 = setTimeout(() => {
            setShowLoginForm(true);
        }, 2000); 

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        }; 
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        fetch(`${process.env.REACT_APP_API_URL}api/login/`, {
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
                if (data.access) {
                    localStorage.setItem('access_token', data.access);
                    localStorage.setItem('user_id', data.user.id);
                    localStorage.setItem('first_name', data.user.first_name);
                    localStorage.setItem('last_name', data.user.last_name);
                    localStorage.setItem('color', data.user.color);
                    onLogin();

                    fetch(`${process.env.REACT_APP_API_URL}api/profile/`, {
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
                        navigate('/');
                    });
                }
            })          
            .catch((error) => {
                console.error('Login error:', error);
            });
    };

    const handleSignUpClick = () => {
        setShowRegistration(true);
    };

    const handleRegistrationSuccess = () => {
        setShowRegistration(false);
        navigate('/board'); 
    };

    const handleSwitchToLogin = () => {
        setShowRegistration(false);
    };

    const handleGuestLogin = () => {
        const guestEmail = 'guest@example.com';
        const guestPassword = 'guestpassword';
        
        fetch(`${process.env.REACT_APP_API_URL}api/login/`, {
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
            if (data.access) {
                localStorage.setItem('access_token', data.access);
                localStorage.setItem('user_id', data.user.id);
                localStorage.setItem('first_name', data.user.first_name);
                localStorage.setItem('last_name', data.user.last_name);
                localStorage.setItem('color', data.user.color);
                onLogin();
                navigate('/'); 
            }
        })
        .catch(error => {
            console.error('Guest login error:', error);
        });
    };

    return (
        <div className="login-page">
            {showRegistration ? (
                <RegistrationForm 
                    onSuccess={handleRegistrationSuccess} 
                    onSwitchToLogin={handleSwitchToLogin} 
                />
            ) : (
                <>
                    <div className={`logo-container ${logoShrink ? 'shrink' : ''}`}>
                        <img src="https://task.julianschaepermeier.com/static/logo2.png" alt="Task Logo" />
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
                                <input 
                                    className="login-input" 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    placeholder="E-Mail" 
                                    required 
                                /><br />
                                <input 
                                    className="login-input" 
                                    type="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    placeholder="Passwort" 
                                    required 
                                /><br />
                                <button className="login-button" type="submit">Login</button>
                            </form>
                            <p className="register-text">
                                Not registered yet? 
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
