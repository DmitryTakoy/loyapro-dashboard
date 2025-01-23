import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from './api/axios';

const VerifyEmailPage = () => {
  const { token } = useParams();
  const [message, setMessage] = useState('Verifying...');
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/api/auth/verify-email/${token}`)
      .then(response => {
        setMessage(response.data.message);
        setError(null);
      })
      .catch(err => {
        const errorMsg = err.response?.data?.error || 'Something went wrong';
        setError(errorMsg);
      });
  }, [token]);

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return <div className="p-4 text-green-600">{message}</div>;
};

export default VerifyEmailPage;
