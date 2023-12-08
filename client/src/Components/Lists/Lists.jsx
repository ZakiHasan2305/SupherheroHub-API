import React, { useState, useEffect, useRef } from 'react';
import './Lists.css';
import { jwtDecode } from 'jwt-decode';


const Lists = () => {
    const port = 8000

    const [lists, setLists] = useState([]);
    const [authLists, setAuthLists] = useState([]);
    const [expandedLists, setExpandedLists] = useState({});
    const [isPrivate, setIsPrivate] = useState(true);
    const [newListName, setNewListName] = useState('');
    const [newListDescription, setNewListDescription] = useState('');
    const [newListIDs, setNewListIDs] = useState('');

    const [isPrivateUpdate, setIsPrivateUpdate] = useState(true);
    const [newListNameUpdate, setNewListNameUpdate] = useState('');
    const [newListDescriptionUpdate, setNewListDescriptionUpdate] = useState('');
    const [newListIDsUpdate, setNewListIDsUpdate] = useState('');
    const [inputDataList, setInputDataList] = useState('')
    const [inputDataListDelete, setInputDataListDelete] = useState('')

    const [inputDataListReview, setInputDataListReview] = useState('')
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');

    const statusDivRef = useRef(null);
    const inputFieldRef = useRef(null);
    const inputFieldUpdateRef = useRef(null);
    const datalistRef = useRef(null)
    const publicDataListRef = useRef(null)
    const inputRatingRef = useRef(null)

    useEffect(() => {
        // Assigning the current property of the refs after component mount
        statusDivRef.current = document.getElementById('status');
        inputFieldRef.current = document.getElementById("heroid_input");
        inputFieldUpdateRef.current = document.getElementById("heroid_input_update");
        inputRatingRef.current = document.getElementById('rating')
        datalistRef.current = document.getElementById('my_list');
        publicDataListRef.current = document.getElementById('public_list');
        addToDatalist();
        addPublicToDatalist();
    }, []);


    // Inside your React component
    const updateStatus = (message) => {
        if (statusDivRef.current) {
            console.log("reference to div");
            statusDivRef.current.innerText = message;
            statusDivRef.current.style.display = 'block'; // Show the status element
            setTimeout(() => {
                statusDivRef.current.style.display = 'none'; // Hide the status element after some time (e.g., 3000 milliseconds)
            }, 10000);
        } else {
            console.log("No reference to div");
        }
    };

    // clearElement function
    function clearElement(element) {
        if (element) {
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
        }
    }

    //add list names to dropdown
    function addToDatalist() {
        fetch(`http://localhost:${port}/api/list_name/${jwtDecode(localStorage.getItem('jwtToken')).account.email}`)
            .then(res => res.json()
            .then(list_names => {
                if (list_names.hasOwnProperty('message')) {
                    updateStatus(list_names.message);
                } else {
                    if (datalistRef.current) {
                        clearElement(datalistRef.current);
                        for (const nm of list_names) {
                            const opt = document.createElement('option');
                            opt.value = nm;
                            datalistRef.current.appendChild(opt);
                        }
                    }
                }
        }));
    }

    //add public list names to dropdown
    async function addPublicToDatalist() {
        try {
            const response = await fetch(`http://localhost:${port}/api/lists`);
            const data = await response.json();

            // Filter the lists by visibilityFlag="public"
            const publicLists = data.filter((list) => list.visibilityFlag === "public");
            const publicListNames = publicLists.map((list) => list.list_name);

            if (publicDataListRef.current) {
                clearElement(publicDataListRef.current);
                for (const nm of publicListNames) {
                    const opt = document.createElement('option');
                    opt.value = nm;
                    publicDataListRef.current.appendChild(opt);
                }
            }
            console.log(publicDataListRef.current)
            console.log(publicListNames);
        } catch (error) {
            console.error(error);
            updateStatus(error)
        }

    }

    //input sanitization for searchbar
    function restrictInput(event) {
        const value = inputFieldRef.current.value;
        const newValue = value.replace(/[^0-9,]/g, ''); // Remove non-numeric characters
        inputFieldRef.current.value = newValue;
    }

    //input sanitization for searchbar
    function restrictInputUpdate(event) {
        const value = inputFieldUpdateRef.current.value;
        const newValue = value.replace(/[^0-9,]/g, ''); // Remove non-numeric characters
        inputFieldUpdateRef.current.value = newValue;
    }

    //input sanitization for searchbar
    function restrictInputRating(event) {
        let value = inputRatingRef.current.value;

        // Remove non-numeric characters
        value = value.replace(/[^1-5]/g, '');

        // Ensure the value is between 1 and 5
        const intValue = parseInt(value, 10);
        const clampedValue = Math.min(Math.max(intValue, 1), 5);

        // Update the input field with the clamped value
        inputRatingRef.current.value = clampedValue.toString();
    }

    const handleVisibilityToggle = () => {
        setIsPrivate((prevIsPrivate) => !prevIsPrivate);
    };

    const handleVisibilityToggleUpdate = () => {
        setIsPrivateUpdate((prevIsPrivateUpdate) => !prevIsPrivateUpdate);
    };

    // Function to fetch average rating for a list
    const fetchAverageRating = async (listName) => {
        try {
            const response = await fetch(`http://localhost:${port}/api/average_rating/${listName}`);
            const data = await response.json();

            return data.averageRating;
        } catch (error) {
            console.error(error);
            updateStatus(error);
        }
    };

    useEffect(() => {
        const fetchLists = async () => {
            try {
                const response = await fetch(`http://localhost:${port}/api/lists`);
                const data = await response.json();
    
                // Filter the lists by visibilityFlag="public"
                const publicLists = data.filter((list) => list.visibilityFlag === "public");

                // Sort the public lists based on lastDateModified in descending order
                const sortedPublicLists = publicLists.sort((a, b) => new Date(b.dateModified) - new Date(a.dateModified));

                // Take the top 10 public lists
                const top10PublicLists = sortedPublicLists.slice(0, 10);
    
                console.log(sortedPublicLists);
                console.log(top10PublicLists);

                // Fetch average rating for each list
                const promises = top10PublicLists.map(async (list) => {
                    const avg_rat = await fetchAverageRating(list.list_name);
                    list.avg_rating = avg_rat;
                });

                // Wait for all promises to resolve
                await Promise.all(promises);


                setLists(top10PublicLists);
            } catch (error) {
                console.error(error);
                updateStatus(error)
            }
        };

        const fetchAuthLists = async () => {
            try {
                const response = await fetch(`http://localhost:${port}/api/lists`);
                const data = await response.json();

                // Sort the public lists based on lastDateModified in descending order
                const sortedLists = data.sort((a, b) => new Date(b.dateModified) - new Date(a.dateModified));

                // Take the top 20 lists
                const top20Lists = sortedLists.slice(0, 20);
    
                console.log(top20Lists);

                // Fetch average rating for each list
                const promises = top20Lists.map(async (list) => {
                    const avg_rat = await fetchAverageRating(list.list_name);
                    list.avg_rating = avg_rat;
                });

                // Wait for all promises to resolve
                await Promise.all(promises);

                setAuthLists(top20Lists);
            } catch (error) {
                console.error(error);
                updateStatus(error)
            }
        };

        fetchLists();
        fetchAuthLists();
    }, []);

    const handleExpandList = (listName) => {
        setExpandedLists((prevExpandedLists) => ({
            ...prevExpandedLists,
            [listName]: !prevExpandedLists[listName],
        }));
    };

    const handleCreateList = async () => {
        if ((!newListName || !newListIDs)) {
            updateStatus("Please fill in all the required fields.");
            return;
        }
        try {
            const response = await fetch(`http://localhost:${port}/api/create_list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    accountEmail: jwtDecode(localStorage.getItem('jwtToken')).account.email,
                    list: {
                        list_name: newListName,
                        description: newListDescription,
                        visibilityFlag: isPrivate ? 'private' : 'public',
                        Heroes: newListIDs
                    },
                }),
            });

            const result = await response.text();

            console.log(result);
            updateStatus(result)
        } catch (error) {
            console.error(error);
            updateStatus(error)
        }
    };

    const handleUpdateList = async () => {
        if ((!inputDataList)) {
            updateStatus("Please fill in all the required field.");
            return;
        }
        try {
            const listInfo = {
                accountEmail: jwtDecode(localStorage.getItem('jwtToken')).account.email,
                list_name: inputDataList,
                updateFields:{}
            };

            if (newListNameUpdate !== '') {
                listInfo.updateFields.name = newListNameUpdate;
            }
            if (newListDescription !== '') {
                listInfo.updateFields.description = newListDescriptionUpdate;
            }
            listInfo.updateFields.visibilityFlag = isPrivateUpdate ? 'private' : 'public';

            if (newListIDs.length > 0) {
                listInfo.hero_ids = newListIDsUpdate;
            }
            const response = await fetch(`http://localhost:${port}/api/update_list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(listInfo),
            });

            const result = await response.text();

            console.log(result);
            updateStatus(result)
        } catch (error) {
            console.error(error);
            updateStatus(error)
        }
    };

    const handleDeleteList = async () => {
        if ((!inputDataListDelete)) {
            updateStatus("Please fill in all the required field.");
            return;
        }
        try {
            const response = await fetch(`http://localhost:${port}/api/delete_list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    accountEmail: jwtDecode(localStorage.getItem('jwtToken')).account.email,
                    list_name:inputDataListDelete
                }),
            });

            const result = await response.text();

            console.log(result);
            updateStatus(result)
        } catch (error) {
            console.error(error);
            updateStatus(error)
        }
    }

    const handleReviews = async () => {
        if (!inputDataListReview || !reviewRating) {
            updateStatus("Please fill in all the required fields");
            return;
        }

        try {
            const accountEmail = jwtDecode(localStorage.getItem('jwtToken')).account.email;
    
            const response = await fetch(`http://localhost:${port}/api/create_review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    accountEmail,
                    list_name: inputDataListReview,
                    rating: reviewRating,
                    comment: reviewComment,
                }),
            });
    
            const result = await response.text();
    
            console.log(result);
            updateStatus(result);
        } catch (error) {
            console.error(error);
            updateStatus("Error creating review");
        }
        

    }

    // Function to render hero blocks
    const renderHeroBlocks = (heroData) => {
        if (!heroData) {
            return null;
        }
    
        // If heroData is an object, convert it to an array
        const heroArray = Array.isArray(heroData) ? heroData : Object.values(heroData);
    
        const heroBlocks = heroArray.map((hero) => (
            <li key={hero.id} className='hero_list_block'>
                <div>
                    <b>Name:</b> {hero.name}<br />
                    <b>Publisher:</b> {hero.Publisher}
                </div>
                <div style={{ display: expandedLists[hero.name] ? 'block' : 'none' }}>
                    <b>ID:</b> {hero.id}<br />
                    <b>Gender:</b> {hero.Gender}<br />
                    <b>Eye Color:</b> {hero['Eye color']}<br />
                    <b>Race:</b> {hero.Race}<br />
                    <b>Hair Color:</b> {hero['Hair color']}<br />
                    <b>Height:</b> {hero.Height}<br />
                    <b>Skin Color:</b> {hero['Skin color']}<br />
                    <b>Alignment:</b> {hero.Alignment}<br />
                    <b>Weight:</b> {hero.Weight}<br />
                    <b>Powers:</b> {hero.Power.join(', ')}<br />
                    <button
                        className='ddg-btn'
                        onClick={() => {
                            window.open(
                                `https://duckduckgo.com/?q=${encodeURIComponent(hero.name)}, ${encodeURIComponent(hero.Publisher)}`,
                                '_blank'
                            );
                        }}
                    >
                        Search on DDG
                    </button>
                </div>
                <button
                    className='expand-btn'
                    onClick={() => handleExpandList(hero.name)}
                >
                    {expandedLists[hero.name] ? 'Collapse Details' : 'Expand Details'}
                </button>
            </li>
        ));

        return <ul>{heroBlocks}</ul>;
    };


    return (
        <div className='list_page'>
            <div className='header'>
                <h1 className='title'>ZuperHero API</h1>
                <h2 className='about-title'>View and Manage Lists</h2>
                <p className='about'>
                View information about lists. Create and Manage lists based on permission.
                </p>
            </div>
            {localStorage.getItem('jwtToken') && (
                <div className='list_background'>
                <div id='status' className='floating-status'></div>
                <div className="list-container">
                <div className='tabs'>
                    <div className='active-tab'>Public Lists (Max 10)</div>
                </div>
                    {lists.map((list) => (
                    <div className='list-info' key={list.list_name}>
                        <ul>
                            <li><h2>{list.list_name}</h2></li>
                            <li>Creator Nickname: {list.nickname}</li>
                            <li>Total Heroes: {list.Heroes ? Object.keys(list.Heroes).length : '-'}</li>
                            <li>Last Modified Date: {list.dateModified}</li>
                            <li>Average Rating: {list.avg_rating}</li>
                            <li>
                                <button className='expand-btn' onClick={() => handleExpandList(list.list_name)}>
                                    {expandedLists[list.list_name] ? 'Collapse List' : 'Expand List'}
                                </button>
                            </li>
                            {expandedLists[list.list_name] && (
                                <>
                                    <li>Description: {list.description}</li>
                                    <li>
                                        <h3>Reviews:</h3>
                                        {Object.values(list.reviews)
                                            .filter(review => review.reviewVisibility !== false)
                                            .map((review, index) => (
                                            <div key={index}>
                                                <p>User: {review.userName}</p>
                                                <p>Comment: {review.comment}</p>
                                                <p>Rating: {review.rating}</p>
                                                <p>Created: {review.createdDate}</p>
                                                <br></br>
                                            </div>
                                        ))}
                                    </li>
                                    <li>
                                        All Heroes: {renderHeroBlocks(list.Heroes)}
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                    ))}
                </div>

                {jwtDecode(localStorage.getItem('jwtToken')).account.isAuth && (
                    <>
                        <div className="list-container">
                            <div className='tabs'>
                                <div className='active-tab'>Create List</div>
                            </div>
                            <div className='search-inputs'>
                                <div className='input'>
                                    <input
                                        type='text'
                                        placeholder='List Name'
                                        onChange={(e) => setNewListName(e.target.value)}
                                    />
                                </div>
                                <div className='input'>
                                    <input
                                        id='heroid_input'
                                        type='text'
                                        placeholder='Input IDs [seperated by ,]'
                                        onChange={(e) => {
                                            restrictInput(e);
                                            setNewListIDs(e.target.value.split(',').map(key => parseInt(key, 10)).filter(id => !isNaN(id)));
                                        }}
                                    />
                                </div>
                                <div className='input'>
                                    <input
                                        type='text'
                                        placeholder='Description (Optional)'
                                        onChange={(e) => setNewListDescription(e.target.value)}
                                    />
                                </div>
                                <div className='input'>
                                    <label>
                                        Visibility: {isPrivate ? 'Private' : 'Public'}
                                        <input
                                            id='heroid_input'
                                            type='checkbox'
                                            checked={isPrivate}
                                            onChange={handleVisibilityToggle}
                                        />
                                    </label>
                                </div>
                            </div>
                            <div className='search-container'>
                                <div className='submit' onClick={handleCreateList}>
                                    Create
                                </div>
                            </div>
                        </div>




                        <div className="list-container">
                            <div className='tabs'>
                                <div className='active-tab'>Update List</div>
                            </div>
                            <div className='search-inputs'>
                                <div className='input'>
                                    <input 
                                    list="my_list" 
                                    id="my_list_input" 
                                    name="my_list" 
                                    onChange={(e) => 
                                        setInputDataList(e.target.value)
                                    }
                                    onClick={addToDatalist} 
                                    placeholder="Input/Choose List to Update" />
                                    <datalist id="my_list"></datalist>
                                </div>
                                <div className='input'>
                                    <input
                                        type='text'
                                        placeholder='New List Name'
                                        onChange={(e) => 
                                            setNewListNameUpdate(e.target.value)
                                        }
                                    />
                                </div>
                                <div className='input'>
                                    <input
                                        id='heroid_input_update'
                                        type='text'
                                        placeholder='Input New IDs [seperated by ,]'
                                        onChange={(e) => {
                                            restrictInputUpdate(e);
                                            setNewListIDsUpdate(e.target.value.split(',').map(key => parseInt(key, 10)).filter(id => !isNaN(id)));
                                        }}
                                    />
                                </div>
                                <div className='input'>
                                    <input
                                        type='text'
                                        placeholder='Description'
                                        onChange={(e) => setNewListDescriptionUpdate(e.target.value)}
                                    />
                                </div>
                                <div className='input'>
                                    <label>
                                        Visibility: {isPrivateUpdate ? 'Private' : 'Public'}
                                        <input
                                            id='heroid_input'
                                            type='checkbox'
                                            checked={isPrivateUpdate}
                                            onChange={handleVisibilityToggleUpdate}
                                        />
                                    </label>
                                </div>
                            </div>
                            <div className='search-container'>
                                <div className='submit' onClick={handleUpdateList}>
                                    Update
                                </div>
                            </div>


                        </div>


                        <div className="list-container">
                            <div className='tabs'>
                                <div className='active-tab'>Delete List</div>
                            </div>
                            <div className='search-inputs'>
                                <div className='input'>
                                    <input 
                                    list="my_list" 
                                    name="my_list" 
                                    onChange={(e) => 
                                        setInputDataListDelete(e.target.value)
                                    }
                                    onClick={addToDatalist} 
                                    placeholder="Input/Choose List to Delete" />
                                    <datalist id="my_list"></datalist>
                                </div>
                                <div className='search-container'>
                                    <div className='submit' onClick={handleDeleteList}>
                                        Delete
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div className="list-container">
                            <div className='tabs'>
                                <div className='active-tab'>Add Review</div>
                            </div>
                            <div className='search-inputs'>
                                <div className='input'>
                                    <input 
                                    list="public_list" 
                                    name="public_list" 
                                    onChange={(e) => 
                                        setInputDataListReview(e.target.value)
                                    }
                                    onClick={addPublicToDatalist} 
                                    placeholder="Input/Choose Public List to Review" />
                                    <datalist id="public_list"></datalist>
                                </div>
                                <div className='input'>
                                    <input
                                        type='number'
                                        id='rating'
                                        placeholder='Review Rating (1-5)'
                                        onChange={(e) => {
                                            restrictInputRating(e);
                                            setReviewRating(parseInt(e.target.value,10));
                                        }}
                                    />
                                </div>
                                <div className='input'>
                                    <input
                                        type='text'
                                        placeholder='Comment'
                                        onChange={(e) => 
                                            setReviewComment(e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                            <div className='search-container'>
                                <div className='submit' onClick={handleReviews}>
                                    Add Review
                                </div>
                            </div>
                        </div>



                        <div className="list-container">
                            <div className='tabs'>
                                <div className='active-tab'>Display All Lists (Max 20)</div>
                            </div>
                            <div>
                                {authLists.map((list) => (
                                <div className='list-info' key={list.list_name}>
                                    <ul>
                                        <li><h2>{list.list_name}</h2></li>
                                        <li>Creator Nickname: {list.nickname}</li>
                                        <li>Total Heroes: {list.Heroes ? Object.keys(list.Heroes).length : '-'}</li>
                                        <li>Last Modified Date: {list.dateModified}</li>
                                        <li>Average Rating: {list.avg_rating}</li>
                                        <li>
                                            <button className='expand-btn' onClick={() => handleExpandList(list.list_name)}>
                                                {expandedLists[list.list_name] ? 'Collapse List' : 'Expand List'}
                                            </button>
                                        </li>
                                        {expandedLists[list.list_name] && (
                                            <>
                                                <li>Description: {list.description}</li>
                                                <li>
                                                    <h3>Reviews:</h3>
                                                    {Object.values(list.reviews)
                                                        .filter(review => review.reviewVisibility !== false)
                                                        .map((review, index) => (
                                                        <div key={index}>
                                                            <p>User: {review.userName}</p>
                                                            <p>Comment: {review.comment}</p>
                                                            <p>Rating: {review.rating}</p>
                                                            <p>Created: {review.createdDate}</p>
                                                            <br></br>
                                                        </div>
                                                        ))}
                                                    </li>
                                                <li>
                                                    All Heroes: {renderHeroBlocks(list.Heroes)}
                                                </li>
                                            </>
                                        )}
                                    </ul>
                                </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
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
    
export default Lists;