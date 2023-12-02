import React, { useState } from 'react';
import './LoginSignup.css';

import username_icon from '../Assets/username.png';
import password_icon from '../Assets/password.png';
import email_icon from '../Assets/email.png';
import nickname_icon from '../Assets/nickname.png';

const LoginSignup = () => {
    const [activeTab, setActiveTab] = useState("Login");

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nickname, setNickname] = useState("");

    const switchTab = (tab) => {
        setActiveTab(tab);
    };


    const handleSubmit = (e) => {
        // prevent the form from refreshing the whole page
        e.preventDefault();
        // make a popup alert showing the "submitted" text
        alert("Submited");
    }



    return (
        <div className="container">
            <div className='tabs'>
                <div className={activeTab === 'SignUp' ? 'active-tab' : 'tab'} onClick={() => switchTab('SignUp')}>Sign Up</div>
                <div className={activeTab === 'Login' ? 'active-tab' : 'tab'} onClick={() => switchTab('Login')}>Login</div>
            </div>
            <div className='inputs'>
                {activeTab === "SignUp" && (
                    <div className='input'>
                        <img src={username_icon} alt='' />
                        <input type='text' placeholder='Username' value={username} onChange={(e) => setUsername(e.target.value)}/>
                    </div>
                )}
                <div className='input'>
                    <img src={email_icon} alt='' />
                    <input type='email' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                {activeTab === "SignUp" && (
                    <div className='input'>
                        <img src={nickname_icon} alt='' />
                        <input type='text' placeholder='Nickname' value={nickname} onChange={(e) => setNickname(e.target.value)} />
                    </div>
                )}
                <div className='input'>
                    <img src={password_icon} alt='' />
                    <input type='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
            </div>
            <div className='submit-container'>
                <div className='submit' onClick={(e) => handleSubmit(e)}>
                    {activeTab === "SignUp" ? "Sign Up" : "Login"}
                </div>
            </div>
        </div>
    );
};

export default LoginSignup;