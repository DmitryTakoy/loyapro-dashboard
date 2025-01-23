// prod by DEEPSEEK
import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const MachinesPage = () => {
  const [machines, setMachines] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchMachines();
  }, [navigate]);

  const handleLogout = () => {
    // стираем токен, редирект
    localStorage.removeItem('token');
    navigate('/login');
  };

  const fetchMachines = async () => {
    setError(null);
    setEmailNotConfirmed(false);
    setLoading(true);

    try {
      const response = await api.get('/api/machines');
      setMachines(response.data);
    } catch (err) {
      console.error('Error loading machines:', err);
      console.error('Response data:', err.response?.data);

      if (err.response) {
        if (err.response.status === 403) {
          setEmailNotConfirmed(true);
          setError('Please confirm your e-mail.');
        } else if (
          err.response?.status === 422 &&
          err.response?.data?.error?.includes("Signature verification failed")
        ) {
          setError("Ваш токен невалиден. Перелогиньтесь, пожалуйста.");
        } else if (
          err.response.status === 401 &&
          err.response.data?.msg === 'Signature verification failed'
        ) {
          setError('Token is invalid or expired. Please log in again.');
        } else {
          setError('Failed to load machines');
        }
      } else {
        setError('Network error or server is unavailable');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      await api.post('/api/auth/resend-confirmation');
      alert('Confirmation email has been re-sent to your inbox.');
    } catch (err) {
      console.error('Failed to resend confirmation email', err);
      alert('Failed to resend. Please contact support.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (emailNotConfirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            {error}
          </h2>
          <p className="text-neutral-600 mb-6">
            You must confirm your email before accessing this page.
          </p>
          <button
            onClick={handleResendEmail}
            className="w-full px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            Resend Confirmation
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            {error}
          </h2>
          <button
            onClick={fetchMachines}
            className="mb-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 z-10 opacity-100 visible"
            >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!Array.isArray(machines)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600">
            Unexpected data format from server
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto p-4">
        {/* Верхняя панель с кнопками (как в другом месте) */}
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold text-blue-600">
            Loyalty Program Dashboard
          </h1>
          <div className="space-x-4">

            <button
              onClick={() => navigate('/dashboard')}
              className="bg-purple-500 text-white px-8 py-3 rounded-full shadow hover:bg-purple-600"
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-8 py-3 rounded-full shadow hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Заголовок и кнопка для обновления списка машин */}
        <h2 className="text-3xl font-bold text-neutral-950 mb-6">
          Your Machines
        </h2>
        <button
          onClick={fetchMachines}
          className="mb-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Refresh Machines
        </button>

        {/* Список машин */}
        <ul className="space-y-4">
          {machines.map((machine, index) => (
            <li
              key={index}
              className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200 hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-bold text-neutral-950 mb-2">
                {machine.humanName}
              </h2>
              <p className="text-neutral-600">
                Serial Number: {machine.serialNumber}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default MachinesPage;
