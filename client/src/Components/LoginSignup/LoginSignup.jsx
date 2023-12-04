import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import './LoginSignup.css';

import username_icon from '../Assets/username.png';
import password_icon from '../Assets/password.png';
import email_icon from '../Assets/email.png';
import nickname_icon from '../Assets/nickname.png';

const LoginSignup = () => {
    const port = 8000

    const [activeTab, setActiveTab] = useState("SignUp");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nickname, setNickname] = useState("");
    const [status, setStatus] = useState("");
    const [token, setToken] = useState(null);
    const [registered,setRegistered] = useState(false);
    const navigate = useNavigate();

    const switchTab = (tab) => {
        setStatus("");
        setActiveTab(tab);
    };

    const handleInputChange = (valueSetter,e) => {
        valueSetter(e.target.value);
        setStatus(""); // Clear status when any input changes
    };

    const openVerificationLink = () => {
        if (token) {
            // Navigate to the Authenticate component
            navigate(`/authenticate/${token}`);
            // window.open(`http://localhost:${port}/account/verify_email/${token}`, '_blank');
        }
    };

    const handleSubmit = async (e) => {
        setRegistered(false);
        e.preventDefault();
    
        if (activeTab === "SignUp" && (!username || !email || !password || !nickname)) {
            setStatus("Please fill in all the required fields for Sign Up.");
            return;
        }
    
        if (activeTab === "Login" && (!email || !password)) {
            setStatus("Please fill in all the required fields for Login.");
            return;
        }
    
        try {
            const response = await fetch(
                activeTab === "SignUp" ? `http://localhost:${port}/account/create_account` : `http://localhost:${port}/account/logIn`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                        username,
                        nickname,
                    }),
                }
            );
            console.log(response)
        
            if (response.ok) {
                const contentType = response.headers.get("Content-Type");
        
                if (contentType && contentType.includes("application/json")) {
                    const result = await response.json();

                    // Handle the verification process for SignUp
                    if (result.token) {
                        // Display the verification link
                        setStatus(result.message);
                        setToken(String(result.token));
                        setRegistered(true);
                    } else {
                        setStatus(result.message);
                    }

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
        <div className='home_page'>
            <div className='header'>
                <h1 className='title'>Welcome to my ZuperHero API</h1>
                <h2 className='about-title'>About Us</h2>
                <p className='about'>
                This sophisticated RESTful API, crafted with the powerful combination of Node.js and Express.js, offers an immersive exploration of superheroes and their intricacies.
                From creating personalized accounts to seamlessly navigating through a rich repository of superhero information, users can effortlessly sort, search, and curate superhero lists tailored to their preferences.
                The journey begins with the creation of an account, unlocking a realm of possibilities upon logging in.
                Dive into the world of superheroes, where every detail is at your fingertips.
                </p>
            </div>
            <div className='background'>
                <div className="container">
                    <div className='tabs'>
                        <div className={activeTab === 'SignUp' ? 'active-tab' : 'tab'} onClick={() => switchTab('SignUp')}>Sign Up</div>
                        <div className={activeTab === 'Login' ? 'active-tab' : 'tab'} onClick={() => switchTab('Login')}>Login</div>
                    </div>
                    <div className='inputs'>
                        {activeTab === "SignUp" && (
                            <div className='input'>
                                <img src={username_icon} alt='' />
                                <input type='text' placeholder='Username' value={username} onChange={(e) => handleInputChange(setUsername,e)}/>
                            </div>
                        )}
                        <div className='input'>
                            <img src={email_icon} alt='' />
                            <input type='email' placeholder='Email' value={email} onChange={(e) => handleInputChange(setEmail,e)} />
                        </div>
                        {activeTab === "SignUp" && (
                            <div className='input'>
                                <img src={nickname_icon} alt='' />
                                <input type='text' placeholder='Nickname' value={nickname} onChange={(e) => handleInputChange(setNickname,e)} />
                            </div>
                        )}
                        <div className='input'>
                            <img src={password_icon} alt='' />
                            <input type='password' placeholder='Password' value={password} onChange={(e) => handleInputChange(setPassword,e)} />
                        </div>
                    </div>
                    <div className='submit-container'>
                        <div className='submit' onClick={(e) => handleSubmit(e)}>
                            {activeTab === "SignUp" ? "Sign Up" : "Login"}
                        </div>
                    </div>
                    {status && (
                    <div className='status'>
                        <p className='status_message'>{status}</p>
                        {registered && token && (
                            <div className='submit-container'>
                                <div className='submit' onClick={openVerificationLink}>
                                    Authenticate Account
                                </div>
                                <div className='submit'>
                                    Don't Authenticate
                                </div>
                            </div>
                        )}
                    </div>
                )}
                </div>
            </div>
        </div>    
    );
};

export default LoginSignup;