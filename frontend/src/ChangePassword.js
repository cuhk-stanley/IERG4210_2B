import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';


function ChangePassword() {
    const { user, logout } = useAuth(); // Destructure user and logout from useAuth
    const navigate = useNavigate();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(user.userId);
        if (newPassword !== confirmNewPassword) {
            alert('New passwords do not match.');
            return;
        }
        try {
            const response = await fetch('http://localhost:8000/change-password', { // Adjust the endpoint if necessary
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Include any necessary authentication headers, like a bearer token
                },
                body: JSON.stringify({
                    userId: user.userId, // Ensure you have the user's ID in your user state
                    oldPassword,
                    newPassword,
                }),
            });
    
            if (!response.ok) {
                throw new Error(await response.json().then(data => data.message));
            }
    
            alert('Password changed successfully. Please log in with your new password.');
            logout();
            navigate('/');
        } catch (error) {
            console.error(error);
            alert(error.message || 'An error occurred while changing the password.');
        }
    };
    

    const handleDiscard = () => {
        navigate('/home'); // Navigate to home page
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
                </div>
                <div className="form-group">
                    <label>Confirm New Password</label>
                    <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required />
                </div>
                <div className="btn-container">
                    <button type="button" onClick={handleDiscard} className="btn">Discard</button>
                    <button type="submit" className="btn">Submit</button>
                </div>
            </form>
        </div>
    );
}

export default ChangePassword;