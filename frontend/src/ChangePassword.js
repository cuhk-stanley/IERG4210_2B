import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';


function ChangePassword() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [nonce, setNonce] = useState('');

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


    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,20}$/;

    const validatePassword = (password) => {
        if (!passwordRegex.test(password)) {
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validatePassword(newPassword)) {
            alert('New password does not meet requirements.');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            alert('New passwords do not match.');
            return;
        }
        try {
            const response = await fetch('https://secure.s18.ierg4210.ie.cuhk.edu.hk/api/change-password', { // Adjust the endpoint if necessary
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Include any necessary authentication headers, like a bearer token
                },
                body: JSON.stringify({
                    userId: user.userId, // Ensure you have the user's ID in your user state
                    oldPassword,
                    newPassword,
                    nonce,
                }),
                credentials: 'include',
            });
    
            if (!response.ok) {
                throw new Error(await response.json().then(data => data.message));
            }
    
            alert('Password changed successfully. Please log in with your new password.');
            await logout();
            navigate('/login');
        } catch (error) {
            console.error(error);
            alert(error.message || 'An error occurred while changing the password.');
        }
    };
    

    const handleDiscard = () => {
        navigate('/');
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" disabled value={user?.email || 'Loading...'} /> {/* Show user's email */}
                </div>
                <div className="form-group">
                    <label>Old Password</label>
                    <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>New Password</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                    <div style={{ color: 'grey', fontSize: '0.8em' }}>
                    {'8-20 characters, including 1 uppercase, 1 lowercase, 1 number'}
                    </div>
                    
                </div>
                <div className="form-group">
                    <label>Confirm New Password</label>
                    <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required />
                </div>
                <input type="hidden" name="nonce" value={nonce} />
                <div className="btn-container">
                    <button type="button" onClick={handleDiscard} className="btn">Discard</button>
                    <button type="submit" className="btn">Submit</button>
                </div>
            </form>
        </div>
    );
}

export default ChangePassword;