import React, { useState, useEffect, useRef } from 'react';
import './Admin.css';
import { jwtDecode } from 'jwt-decode';


const Admin = () => {
    const port = 8000

    const [inputUserAdmin, setInputUserAdmin] = useState('');
    const [inputUserDisable, setInputUserDisable] = useState('')
    const [inputListHidden, setInputListHidden] = useState('')
    const [inputReviewHidden, setInputReviewHidden] = useState('')
    const [inputEmailHidden, setInputEmailHidden] = useState('')

    const [isAdmin, setIsAdmin] = useState(Boolean);
    const [isHidden, setIsHidden] = useState(Boolean);
    const [isDisabled, setIsDisabled] = useState(Boolean);

    const statusDivRef = useRef(null);
    const userDataListRef = useRef(null)

    useEffect(() => {
        statusDivRef.current = document.getElementById('status');
        userDataListRef.current = document.getElementById("user_list")
        addUserToDatalist();
    })

    const handleAdminToggle = () => {
        setIsAdmin((prevIsAdmin) => !prevIsAdmin);
    };

    const handleDisableToggle = () => {
        setIsDisabled((prevIsDisable) => !prevIsDisable);
    };

    const handleHiddenToggle = () => {
        setIsHidden((prevIsHidden) => !prevIsHidden);
    };

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

    async function addUserToDatalist() {
        try {
            const response = await fetch(`http://localhost:${port}/api/users`);
            const data = await response.json();
            
            const userEmails = data.map((user) => user.email);
            if (userDataListRef.current) {
                clearElement(userDataListRef.current);
                for (const e of userEmails) {
                    const opt = document.createElement('option');
                    opt.value = e;
                    userDataListRef.current.appendChild(opt);
                }
            }

        } catch (error) {
            console.error(error);
            updateStatus(error);
        }
    }

    const handleAdminPerm = async () => {
        if ((!inputUserAdmin)) {
            updateStatus("Please fill in the required field.");
            return;
        }
        try {
            const email = inputUserAdmin;
            const adminEmail = jwtDecode(localStorage.getItem('jwtToken')).account.email;
            const response = await fetch(`http://localhost:${port}/admin/admin_perm`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email, adminEmail }),
            });
      
            if (response.ok) {
              const result = await response.text();
              console.log(result); // Display success message
              updateStatus(result);
            } else {
              const errorMessage = await response.text();
              console.error(errorMessage); // Display error message
              updateStatus(errorMessage);
            }
          } catch (error) {
            console.error('An error occurred:', error);
          }
    };

    const handleDisablePerm = async () => {
        if ((!inputUserDisable)) {
            updateStatus("Please fill in the required field.");
            return;
        }
        try {
            const email = inputUserDisable;
            const adminEmail = jwtDecode(localStorage.getItem('jwtToken')).account.email;
            const response = await fetch(`http://localhost:${port}/admin/disable_user`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email, adminEmail }),
            });
      
            if (response.ok) {
              const result = await response.text();
              console.log(result); // Display success message
              updateStatus(result);
            } else {
              const errorMessage = await response.text();
              console.error(errorMessage); // Display error message
              updateStatus(errorMessage);
            }
          } catch (error) {
            console.error('An error occurred:', error);
          }
    };

    const handleReviewVisibility = async () => {
        if ((!inputEmailHidden) || (!inputListHidden) || (!inputReviewHidden)) {
            updateStatus("Please fill in the required fields.");
            return;
        }
        try {
            const hiddenEmail = inputEmailHidden;
            const hiddenList = inputListHidden;
            const hiddenReview = inputReviewHidden;
            const adminEmail = jwtDecode(localStorage.getItem('jwtToken')).account.email;
            const response = await fetch(`http://localhost:${port}/admin/hide_review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    list_name: hiddenList, 
                    reviewID: hiddenReview,
                    adminEmail,
                    email: hiddenEmail
                }),
            });
            if (response.ok) {
                const result = await response.text();
                console.log(result); // Display success message
                updateStatus(result);
            } else {
                const errorMessage = await response.text();
                console.error(errorMessage); // Display error message
                updateStatus(errorMessage);
            }

        } catch (error) {
            console.error('An error occurred:', error);
        }
    }


    return (
        <div className='admin_page'>
            <div className='header'>
                <h1 className='title'>ZuperHero API</h1>
                <h2 className='about-title'>Administrator Settings</h2>
                <p className='about'>
                Admin is able to grant others as admin, mark users as disabled, and mark reviews as hidden 
                </p>
            </div>
            {jwtDecode(localStorage.getItem('jwtToken')).account.isAdmin && (
                <div className='admin_background'>
                <div id='status' className='floating-status'></div>
                <div className="admin-container">
                    <div className='tabs'>
                        <div className='active-tab'>Grant Site Permissions</div>
                    </div>
                    <div className='admin-inputs'>
                        <div className='input'>
                            <input 
                            list="user_list" 
                            name="user_list" 
                            onChange={(e) => 
                                setInputUserAdmin(e.target.value)
                            }
                            onClick={addUserToDatalist} 
                            placeholder="Input/Choose User" />
                            <datalist id="user_list"></datalist>
                        </div>
                        <div className='input'>
                            <label>
                                Give Admin Perms: {isAdmin ? 'Yes' : 'No'}
                                <input
                                    id='admin_input'
                                    type='checkbox'
                                    checked={isAdmin}
                                    onChange={handleAdminToggle}
                                />
                            </label>
                        </div>
                    </div>
                    <div className='search-container'>
                            <div className='submit' onClick={handleAdminPerm}>
                                Submit
                            </div>
                    </div>
                </div>

                <div className="admin-container">
                    <div className='tabs'>
                        <div className='active-tab'>User Disabling</div>
                    </div>
                    <div className='admin-inputs'>
                        <div className='input'>
                            <input 
                            list="user_list" 
                            name="user_list" 
                            onChange={(e) => 
                                setInputUserDisable(e.target.value)
                            }
                            onClick={addUserToDatalist} 
                            placeholder="Input/Choose User" />
                            <datalist id="user_list"></datalist>
                        </div>
                        <div className='input'>
                            <label>
                                Disbale User: {isDisabled ? 'Yes' : 'No'}
                                <input
                                    id='disable_input'
                                    type='checkbox'
                                    checked={isDisabled}
                                    onChange={handleDisableToggle}
                                />
                            </label>
                        </div>
                        
                    </div>
                    <div className='search-container'>
                            <div className='submit' onClick={handleDisablePerm}>
                                Submit
                            </div>
                    </div>

                </div>

                <div className="admin-container">
                    <div className='tabs'>
                        <div className='active-tab'>Review Visibility</div>
                    </div>
                    <div className='admin-inputs'>
                        <div className='input'>
                            <input 
                            list="user_list" 
                            name="user_list" 
                            onChange={(e) => 
                                setInputEmailHidden(e.target.value)
                            }
                            onClick={addUserToDatalist} 
                            placeholder="Input/Choose User" />
                            <datalist id="user_list"></datalist>
                        </div>
                        <div className='input'>
                        <input 
                            onChange={(e) => 
                                setInputListHidden(e.target.value)
                            }
                            placeholder="Enter List" />
                        </div>
                        <div className='input'>
                        <input 
                            type='number'
                            onChange={(e) => 
                                setInputReviewHidden(e.target.value)
                            }
                            placeholder="Enter Review ID" />
                        </div>
                        <div className='input'>
                            <label>
                                Review Hidden: {isHidden ? 'Yes' : 'No'}
                                <input
                                    id='disable_input'
                                    type='checkbox'
                                    checked={isHidden}
                                    onChange={handleHiddenToggle}
                                />
                            </label>
                        </div>
                    </div>
                    <div className='search-container'>
                            <div className='submit' onClick={handleReviewVisibility}>
                                Submit
                            </div>
                    </div>
                </div>


                </div>

            )}
            {!jwtDecode(localStorage.getItem('jwtToken')).account.isAdmin || !localStorage.getItem('jwtToken') && (
                <div>
                    <h1 class="unauthorized">Unauthorized to View!</h1>
                </div>
            )}
        </div>
    );
};
    
export default Admin;