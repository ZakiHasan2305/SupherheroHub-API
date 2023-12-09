import React, { useState, useEffect, useRef } from 'react';
import './Heroes.css';

import name_icon from '../Assets/name.png';
import power_icon from '../Assets/power.png';
import race_icon from '../Assets/race.png';
import publisher_icon from '../Assets/publisher.png';


const Heroes = () => {
    const port = 8000;

    const [searchCriteria, setSearchCriteria] = useState({
        hero_name: '',
        race: '',
        publisher: '',
        power: '',
    });

    // Using useRef for the elements
    const filteredDivRef = useRef(null);
    const statusDivRef = useRef(null);

    // useEffect hook to handle DOM element references
    useEffect(() => {
        // Assigning the current property of the refs after component mount
        filteredDivRef.current = document.getElementById('some_hero_div');
        statusDivRef.current = document.getElementById('status_div');
    }, []);


    // Create a loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading';

    // references to the ul
    const ul_filtered_heroes = document.createElement('ul');
    ul_filtered_heroes.id = 'ul_filtered_heroes';
    ul_filtered_heroes.className = 'hero_section';

    // references to the status paragraph
    const p_status = document.createElement('p');
    p_status.className = 'status_message';

    // clearElement function
    function clearElement(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    // Populate the div with hero info blocks and display status message
    function populateDiv(heroData = null, message = '') {
        
        // Clear the div from previous events
        clearElement(filteredDivRef.current);
        clearElement(ul_filtered_heroes);
        clearElement(statusDivRef.current);

        p_status.innerText = message;

        if (message.length) {
            statusDivRef.current.appendChild(p_status);
        }

        if (heroData !== null) {
            if (heroData.length) {
                // Add loadingIndicator
                filteredDivRef.current.appendChild(loadingIndicator);

                // Create an array of promises for each hero fetch
                const fetchPromises = heroData.map((id) =>
                    fetch(`http://localhost:${port}/api/hero/${id}`)
                    .then((res) => res.json())
                );

                // Wait for all promises to resolve
                Promise.all(fetchPromises).then((heroes) => {
                    // Fetch hero power for each hero
                    const powerPromises = heroes.map((hero) =>
                        fetch(`http://localhost:${port}/api/hero_power/${hero.id}`)
                        .then((res) => res.json())
                    );

                    // Wait for all power promises to resolve
                    Promise.all(powerPromises).then((powers) => {
                        heroes.forEach((hero, index) => {
                            const li = document.createElement('li');
                            li.className = 'hero_block';

                            const h_power = powers[index];

                            // Basic information (always visible)
                            const basicInfoDiv = document.createElement('div');
                            basicInfoDiv.innerHTML = `
                                <b>Name:</b> ${hero.name}<br>
                                <b>Publisher:</b> ${hero.Publisher}
                            `;

                            li.appendChild(basicInfoDiv);

                            // Additional details container (initially hidden)
                            const detailsContainer = document.createElement('div');
                            detailsContainer.style.display = 'none';

                            detailsContainer.innerHTML = `
                                <b>ID:</b> ${hero.id}<br>
                                <b>Gender:</b> ${hero.Gender}<br>
                                <b>Eye Color:</b> ${hero['Eye color']}<br>
                                <b>Race:</b> ${hero.Race}<br>
                                <b>Hair Color:</b> ${hero['Hair color']}<br>
                                <b>Height:</b> ${hero.Height}<br>
                                <b>Skin Color:</b> ${hero['Skin color']}<br>
                                <b>Alignment:</b> ${hero.Alignment}<br>
                                <b>Weight:</b> ${hero.Weight}<br>
                                <b>Powers:</b> ${h_power.join(', ')}<br>
                            `;

                            // Add a button for DuckDuckGo search
                            const ddgButton = document.createElement('button');
                            ddgButton.className="ddg-btn";
                            ddgButton.innerText = 'Search on DDG';
                            ddgButton.addEventListener('click', () => {
                                // Launch DuckDuckGo search in a new tab
                                window.open(`https://duckduckgo.com/?q=${encodeURIComponent(hero.name)}, ${encodeURIComponent(hero.Publisher)}`, '_blank');
                            });

                            detailsContainer.appendChild(ddgButton);

                            // Expand button
                            const expandButton = document.createElement('button');
                            expandButton.className = 'expand-btn';
                            expandButton.innerText = 'Expand Details';

                            expandButton.addEventListener('click', () => {
                                // Toggle visibility of additional details
                                if (detailsContainer.style.display === 'none') {
                                    detailsContainer.style.display = 'block';
                                    expandButton.innerText = 'Collapse Details';
                                } else {
                                    detailsContainer.style.display = 'none';
                                    expandButton.innerText = 'Expand Details';
                                }
                            });

                            li.appendChild(expandButton);
                            li.appendChild(detailsContainer);

                            ul_filtered_heroes.appendChild(li);
                        });
                        // Remove the loading indicator
                        filteredDivRef.current.removeChild(loadingIndicator);
                        filteredDivRef.current.appendChild(ul_filtered_heroes);
                    });
                });
            } else {
                // If heroData is null or empty, display all heroes
                fetch(`http://localhost:${port}/api/hero`)
                .then((res) => res.json())
                .then((allHeroInfo) => {
                    const allHeroIDs = allHeroInfo.map((hero) => hero.id);
                    populateDiv(allHeroIDs, 'Displaying all heroes');
                })
                .catch((error) => {
                    console.error('Error fetching all heroes:', error);
                });
            }
        }
    }

    const handleInputChange = (field, e) => {
        clearElement(statusDivRef.current)
        setSearchCriteria({ ...searchCriteria, [field]: e.target.value });

        const inputElement = e.target;
        const inputValue = inputElement.value;
        const sanitizedValue = inputValue.replace(/[^a-zA-Z0-9\s!@#$%^&*_=:;,.?~\-+]+/g, '');
        // Update the input element's value directly
        inputElement.value = sanitizedValue;
    };

    

    const handleSearch = () => {
        // Make a request to your server with the searchCriteria
        fetch(`/api/search?name=${searchCriteria.hero_name || ''}&race=${searchCriteria.race || ''}&publisher=${searchCriteria.publisher || ''}&power=${searchCriteria.power || ''}`,{
            headers: {
              'Content-Type': 'application/json',
            },
        })
            .then((res) => res.text())
            .then((text) => {
                console.log('Raw response:', text); // Log the raw response
                return JSON.parse(text);
            })
            .then((heroIDs) => {
                console.log(heroIDs)
                // Handle the results, update component state, or display accordingly
                if (heroIDs.hasOwnProperty('message')) {
                    populateDiv(null, heroIDs.message);
                } else {
                    const baseMessage = 'All Heroes';
                    populateDiv(heroIDs.matchingHeroIDs, `Search ${baseMessage || 'By '+Object.keys(searchCriteria).filter((key) => searchCriteria[key] !== '').join(', ')}`);
                }
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
    };

    return (
        <div className='hero_page'>
            <div className='header'>
                <h1 className='title'>ZuperHero API</h1>
                <h2 className='about-title'>Search All Heroes</h2>
                <p className='about'>
                Search my exquisite library of superheros by Name, Race, Publisher, and/or Power.
                </p>
            </div>
            {localStorage.getItem('jwtToken') && (
            <div className='hero_background'>
                <div className='search-inputs'>
                    <div className='input'>
                        <img src={name_icon} alt='' />
                        <input
                            type='text'
                            placeholder='Name'
                            value={searchCriteria.hero_name}
                            onChange={(e) => handleInputChange('hero_name', e)}
                        />
                    </div>
                    <div className='input'>
                        <img src={race_icon} alt='' />
                        <input
                            type='text'
                            placeholder='Race'
                            value={searchCriteria.race}
                            onChange={(e) => handleInputChange('race', e)}
                        />
                    </div>
                    <div className='input'>
                        <img src={publisher_icon} alt='' />
                        <input
                            type='text'
                            placeholder='Publisher'
                            value={searchCriteria.publisher}
                            onChange={(e) => handleInputChange('publisher', e)}
                        />
                    </div>
                    <div className='input'>
                        <img src={power_icon} alt='' />
                        <input
                            type='text'
                            placeholder='Power'
                            value={searchCriteria.power}
                            onChange={(e) => handleInputChange('power', e)}
                        />
                    </div>
                </div>
                <div className='search-container'>
                    <div className='submit' onClick={handleSearch}>
                        Search
                    </div>
                </div>
                <div id='status_div' className='status'></div>
                <div id='some_hero_div'></div>
            </div>
            )}
            {!localStorage.getItem('jwtToken') && (
                <div>
                    <h1 class="unauthorized">Unauthorized to View!</h1>
                </div>
            )}
        </div>

    );
};
    
export default Heroes;