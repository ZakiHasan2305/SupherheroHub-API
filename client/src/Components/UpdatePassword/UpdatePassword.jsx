import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './UpdatePassword.css';

import password_icon from '../Assets/password.png';

const UpdatePassword = () => {
    const port = 8000

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [status, setStatus] = useState("");
    const navigate = useNavigate();

    const handleInputChange = (valueSetter,e) => {
        valueSetter(e.target.value);
        setStatus(""); // Clear status when any input changes
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if ((!oldPassword || !newPassword)) {
            setStatus("Please fill in all the required fields for Login.");
            return;
        }
    
        try {
            const response = await fetch(`http://localhost:${port}/account/update_password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        
                    },
                    body: JSON.stringify({
                        email:jwtDecode(localStorage.getItem('jwtToken')).account.email,
                        old_password:oldPassword,
                        new_password:newPassword
                    }),
                }
            );
            console.log(response)
        
            if (response.ok) {
                const contentType = response.headers.get("Content-Type");
        
                if (contentType && contentType.includes("application/json")) {
                    const result = await response.json();
                    setStatus(result.message);
                } else {
                    const result = await response.text();
                    setStatus(result);
                }
            } else {
                const errorMessage = await response.text();
                setStatus(errorMessage);
            }
        } catch (error) {
            console.log(error);
            setStatus(`An error occurred. Please try again later. ${error}`);
        }
    };
    
    return (
        <div className='updatePassword-page'>
            <div className='header'>
                <h1 className='title'>ZuperHero API</h1>
                <h2 className='about-title'>Change Password</h2>
                <p className='about'>
                {jwtDecode(localStorage.getItem('jwtToken')).account.username}, please enter your old password and new password .
                </p>
            </div>
            <div className='updatePassword-background'>
                <div className="updatePassword-container">
                    <div className='tabs'>
                        <div className='active-tab'>Update Password</div>
                    </div>
                    <div className='updatePassword-inputs'>
                        <div className='input'>
                            <img src={password_icon} alt='' />
                            <input type='password' placeholder='Old Password' value={oldPassword} onChange={(e) => handleInputChange(setOldPassword,e)} />
                        </div>
                        <div className='input'>
                            <img src={password_icon} alt='' />
                            <input type='password' placeholder='New Password' value={newPassword} onChange={(e) => handleInputChange(setNewPassword,e)} />
                        </div>
                    </div>
                    <div className='submit-container'>
                        <div className='submit' onClick={(e) => handleSubmit(e)}>
                            Update
                        </div>
                    </div>
                    {status && (
                    <div className='status'>
                        <p className='status_message'>{status}</p>
                    </div>
                )}
                </div>
            </div>
        </div>    
    );
};

export default UpdatePassword;