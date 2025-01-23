// VerifyEmailPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const VerifyEmailPage = () => {
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const token = searchParams.get('token');
        
        if (!token) {
          setStatus('error');
          setError('No verification token provided');
          return;
        }

        const response = await api.get(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
        console.log('Verification response:', response);
        
        setStatus('success');
        
        // Store the token if it's in the response
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }

        // Delay redirect to show success message
        setTimeout(() => {
          navigate('/dashboard');
        }, 5000);
      } catch (err) {
        console.error('Verification error:', err);
        setStatus('error');
        setError(err.response?.data?.error || 'An unexpected error occurred');
        
        // If token is invalid, don't redirect
        if (err.response?.status !== 401) {
          setTimeout(() => {
            navigate('/login');
          }, 5000);
        }
      }
    };

    verifyToken();
  }, [navigate]);

  const handleResend = async () => {
    try {
      await api.post('/auth/resend-verification');
      setStatus('resent');
    } catch (err) {
      setError('Не удалось отправить письмо. Попробуйте позже.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin mb-4 mx-auto h-8 w-8 border-4 border-primary-500 rounded-full border-t-transparent"></div>
            <h2 className="text-xl font-bold mb-2">Проверяем ваш email...</h2>
            <p className="text-gray-600">Пожалуйста, подождите</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="mb-4 text-green-500 text-5xl">✓</div>
            <h2 className="text-xl font-bold mb-2">Email подтвержден!</h2>
            <p className="text-gray-600">Вы будете перенаправлены в личный кабинет через 5 секунд</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="mb-4 text-red-500 text-5xl">✗</div>
            <h2 className="text-xl font-bold mb-2">Ошибка верификации</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            
            {error.includes('истек') || error.includes('Invalid') ? (
              <button
                onClick={handleResend}
                className="w-full bg-primary-500 text-white py-2 px-4 rounded-md hover:bg-primary-600 transition-colors"
              >
                Отправить письмо повторно
              </button>
            ) : (
              <a
                href="/support"
                className="text-primary-500 hover:underline"
              >
                Связаться с поддержкой
              </a>
            )}
          </div>
        )}

        {status === 'resent' && (
          <div className="text-center">
            <div className="mb-4 text-green-500 text-5xl">✓</div>
            <h2 className="text-xl font-bold mb-2">Письмо отправлено!</h2>
            <p className="text-gray-600">Проверьте вашу почту</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;