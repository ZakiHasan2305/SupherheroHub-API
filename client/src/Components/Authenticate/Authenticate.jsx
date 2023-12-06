import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import './Authenticate.css';

const Authenticate = () => {
  const { token } = useParams();
  const [verificationMessage, setVerificationMessage] = useState('');
  const navigate = useNavigate();
  const port = 8000;


  useEffect(() => {
    // You can perform backend verification here using the token
    // Call your backend API with the token and handle the response

    fetch(`http://localhost:${port}/account/verify_email/${token}`)
      .then((res) => {
        if (!res.ok) {
          console.log(res)
        }

        // Check if the content type is JSON
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not in JSON format');
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.message) {
          setVerificationMessage(data.message);
        } else {
          setVerificationMessage('Invalid Token');
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setVerificationMessage(`Error during verification ${error}`);
      });
  }, [token]);

  return (
    <div className="verification-container">
      <h2 className='authenticate-h2'>Verification Status</h2>
      <p className='authenticate-p'>{verificationMessage}</p>
      <div className='submit-container'>
          <div className='submit' onClick={() => navigate('/home')}>
              Explore!
          </div>
      </div>
    </div>
  );
};

export default Authenticate;
