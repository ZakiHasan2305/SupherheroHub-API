import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import './Heroes.css';


const Heroes = () => {
    const port = 8000

    return (
        <div className='hero_page'>
            <div className='header'>
                <h1 className='title'>ZuperHero API</h1>
                <h2 className='about-title'>Search All Heroes</h2>
                <p className='about'>
                Search my exquisite library of superheros by Name, Race, Publisher, <b>and</b>/or Power. <br />
                P.S. By "and" I mean you can search using multiple fields 👀
                </p>
            </div>
            <div className='background'>

            </div>
        </div>
    );
};
    
export default Heroes;