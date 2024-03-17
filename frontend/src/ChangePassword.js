import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ChangePassword() {
    const navigate = useNavigate();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Check if new passwords match
        if (newPassword !== confirmNewPassword) {
            alert('New passwords do not match.');
            return;
        }

        // Implement your logic to verify the old password and update the new password in the database

        // If successful, log out the user and redirect to the login page
        navigate('/');
    };

    const handleDiscard = () => {
        navigate('/home'); // Navigate to home page
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" disabled value="user@example.com" />
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
