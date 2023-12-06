import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import './Home.css';


const Home = () => {
    const port = 8000

    const navigate = useNavigate();


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
            <div className='home-background'>
                <div className="home-container">
                    {localStorage.getItem('jwtToken') && (
                        <div>
                            <h2 className='explore'>Explore By Navigating through the Nav Bar</h2>
                        </div>
                    )}
                    {!localStorage.getItem('jwtToken') && (
                        <div className='submit' onClick={() => navigate('/register')}>
                            Click Here to Register!
                        </div>
                    )}
                </div>
            </div>
        </div>    
    );
};

export default Home;