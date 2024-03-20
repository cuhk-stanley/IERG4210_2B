import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './Login.css';
function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { user, login } = useAuth();
    const navigate = useNavigate();
      
    useEffect(() => {
        if (user && user.userId === 1 && user.name === 'Admin') {
            navigate('/admin');
        } else if (user) {
            navigate('/home');
        }
    }, [user, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            alert('Please enter both email and password');
            return;
        }
        try {
            await login(email, password);
        } catch (error) {
            alert('Incorrect email or password');
            console.error(error.message);
        }
    };

    const handleVisitor = () => {
        navigate('/home');
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleLogin}>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className="btn-container">
                <button type="button" onClick={handleLogin} className="btn">Login</button>
                <button type="button" onClick={handleVisitor} className="btn">Continue as Visitor</button>
                </div>
            </form>
        </div>
    );
}

export default Login;
