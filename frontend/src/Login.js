import React, { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './Login.css';
function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nonce, setNonce] = useState('');
    const { user, login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNonce = async () => {
            const response = await fetch('https://secure.s18.ierg4210.ie.cuhk.edu.hk/api/get-nonce', {
                credentials: 'include',
            });
            const data = await response.json();
            setNonce(data.nonce);
        };
    
        fetchNonce();
    }, []);
    

    useEffect(() => {
        if (user && user.adminFlag === 1) {
            navigate('/admin');
        } else if (user) {
            navigate('/');
        }
        // This effect should depend on `user` and `navigate`
    }, [user, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            alert('Please enter both email and password');
            return;
        }
        try {
            // Just call login, navigation will be handled by useEffect
            await login(email, password, nonce);
        } catch (error) {
            alert('Incorrect email or password');
            console.error(error.message);
        }
    };

    const handleVisitor = () => {
        navigate('/');
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
                <input type="hidden" name="nonce" value={nonce} />
                <div className="btn-container">
                <button type="button" onClick={handleLogin} className="btn">Login</button>
                <button type="button" onClick={handleVisitor} className="btn">Continue as Visitor</button>
                </div>
            </form>
        </div>
    );
}

export default Login;
