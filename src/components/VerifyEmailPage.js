// VerifyEmailPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState({
    status: 'loading',
    message: '',
    error: ''
  });

  useEffect(() => {
    const token = searchParams.get('token');
    console.log('Token from URL:', token);

    if (!token) {
      setState({
        status: 'error',
        error: 'Отсутствует токен верификации',
        message: ''
      });
      setTimeout(() => navigate('/login', { replace: true }), 2000);
      return;
    }

    let mounted = true;

    const verifyEmail = async () => {
      try {
        console.log('Sending verification request...');
        const response = await api.get(`/api/auth/verify-email?token=${token}`);
        console.log('Server response:', response.data);

        if (!mounted) return;

        if (response.data?.token) {
          localStorage.setItem('token', response.data.token);
          
          if (response.data.user) {
            localStorage.setItem('user', JSON.stringify({
              api_key: response.data.user.api_key,
              user_id: response.data.user.user_id
            }));
          }

          setState({
            status: 'success',
            message: response.data.message || 'Email успешно подтверждён',
            error: ''
          });
          setTimeout(() => {
            if (mounted) {
              navigate('/machines', { replace: true });
            }
          }, 2000);
        }
      } catch (err) {
        console.error('Verification failed:', err);
        if (!mounted) return;

        setState({
          status: 'error',
          error: err.response?.data?.error || 'Произошла ошибка при верификации',
          message: ''
        });
        setTimeout(() => {
          if (mounted) {
            navigate('/login', { replace: true });
          }
        }, 5000);
      }
    };

    verifyEmail();

    return () => {
      mounted = false;
    };
  }, []); // Пустой массив зависимостей

  const renderContent = () => {
    switch (state.status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="animate-spin mb-4 mx-auto h-8 w-8 border-4 border-primary-500 rounded-full border-t-transparent"></div>
            <h2 className="text-xl font-bold mb-2">Проверяем ваш email...</h2>
            <p className="text-gray-600">Пожалуйста, подождите</p>
            <p className="text-xs text-gray-400 mt-2">
              Token: {searchParams.get('token')}
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="mb-4 text-green-500 text-5xl">✓</div>
            <h2 className="text-xl font-bold mb-2">Email подтверждён!</h2>
            <p className="text-gray-600">{state.message}</p>
            <p className="text-sm text-gray-500 mt-4">
              Перенаправление в личный кабинет...
            </p>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="mb-4 text-red-500 text-5xl">✗</div>
            <h2 className="text-xl font-bold mb-2">Ошибка верификации</h2>
            <p className="text-gray-600 mb-4">{state.error}</p>
            <p className="text-sm text-gray-500">
              Перенаправление на страницу входа через 5 секунд...
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        {renderContent()}
      </div>
    </div>
  );
};

export default VerifyEmailPage;