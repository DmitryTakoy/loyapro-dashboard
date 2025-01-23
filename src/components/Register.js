import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: credentials, 2: user info

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirmation: '',
    api_key: '',
    user_id: ''
  });

  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [machines, setMachines] = useState([]);
  const [machinesConfirmed, setMachinesConfirmed] = useState(false);

  // Для ошибок валидации или прочих
  const [error, setError] = useState(null);

  // Показ/скрытие пароля
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setApiError(null); // Сбрасываем ошибку при каждом изменении
  };

  // Шаг 1: Проверка данных API
  const checkCredentials = async () => {
    setIsVerifying(true);
    setApiError(null);

    const requestData = {
      api_key: formData.api_key,
      user_id: formData.user_id
    };

    try {
      // 1) Проверяем, что наш сервер вообще доступен
      const testResponse = await api.get('/api/auth/test');
      console.log('Test endpoint response:', testResponse.data);

      // 2) Проверяем «валидность» API-ключа и user_id
      const response = await api.post('/api/auth/check-credentials', requestData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Check credentials response:', response.data);

      if (response.data.success && response.data.machines?.length > 0) {
        setMachines(response.data.machines);
        setStep(2); // Переходим к вводу email / password
      } else {
        setApiError(response.data.error || 'No vending machines found');
      }
    } catch (error) {
      console.error('Error details:', error);
      setApiError(
        error.response?.data?.error ||
          error.message ||
          'Failed to verify credentials. Please check your API key and User ID.'
      );
    } finally {
      setIsVerifying(false);
    }
  };

  // Доп. кнопка: тестовый запрос
  const testConnection = async () => {
    try {
      console.log('Testing connection...');
      const response = await api.post('/api/auth/test-api', {
        api_key: formData.api_key,
        user_id: formData.user_id,
      });
      console.log('Test response:', response.data);
    } catch (err) {
      console.error('Test error:', err);
    }
  };

  // Шаг 2: Регистрация (email/password)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!machinesConfirmed) {
      setApiError('Please confirm your vending machines first');
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setApiError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      // Добавляем признак подтверждения автоматов
      const requestData = {
        ...formData,
        machines_confirmed: machinesConfirmed
      };

      // Отправляем запрос на регистрацию
      const response = await api.post('/api/auth/register', requestData);
      
      // Don't save token yet since email isn't verified
      // Instead, show verification required message
      setApiError('Registration successful! Please check your email to verify your account.');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      console.error('Registration error:', error);
      setApiError(error.response?.data?.error || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="webcrumbs" style={{ backgroundImage: "url('/images/bg.jpg')" }} className="min-h-screen bg-cover bg-no-repeat bg-center flex items-center justify-center">
      <form className="w-[500px] bg-white shadow-lg rounded-lg p-8 flex flex-col gap-6" onSubmit={handleSubmit}>
        {/* Заголовок */}
        {step === 1 ? (
          <h1 className="text-neutral-950 font-title text-2xl mb-4">Create your account</h1>
        ) : (
          <h1 className="text-neutral-950 font-title text-2xl mb-4">Create your account</h1>
        )}

        {step === 1 ? (
          /* ШАГ 1: Проверка API Key, User ID */
          <>
            <div className="space-y-4">
              {/* API Key */}
              <div className="relative flex items-center">
                <label htmlFor="api_key" className="absolute -top-3 left-3 bg-white px-1 text-neutral-500 text-sm">
                  API Key
                </label>
                <input
                  type="text"
                  name="api_key"
                  value={formData.api_key}
                  onChange={handleChange}
                  disabled={isVerifying}
                  className="w-full border border-neutral-300 rounded-md p-3 pr-12 focus:ring-2 focus:ring-primary-500"
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 group cursor-pointer z-10">
                  <span className="material-symbols-outlined text-neutral-500">help</span>
                  <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 w-64 p-2 bg-white border border-gray-300 rounded shadow-md text-sm text-gray-700 z-50">
                    Вставьте ваш API Key.<br />
                    Найти его можно в Личном кабинете SmartVend: Настройки → Интеграции.<br />
                    Если этого раздела нет, свяжитесь с поставщиком оборудования.
                  </div>
                </div>
              </div>

              {/* User ID */}
              <div className="relative flex items-center">
                <label htmlFor="user_id" className="absolute -top-3 left-3 bg-white px-1 text-neutral-500 text-sm">
                  User ID
                </label>
                <input
                  type="text"
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleChange}
                  disabled={isVerifying}
                  className="w-full border border-neutral-300 rounded-md p-3 pr-12 focus:ring-2 focus:ring-primary-500"
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 group cursor-pointer">
                  <span className="material-symbols-outlined text-neutral-500">help</span>
                  <div className="hidden group-hover:block absolute top-full left-0 mt-2 w-64 p-2 bg-white border border-gray-300 rounded shadow-md text-sm text-gray-700">
                    Вставьте ваш ID.<br />
                    Для этого зайдите в личный кабинет SmartVend:<br />
                    Профиль → скопируйте содержимое поля ID и вставьте сюда.
                  </div>
                </div>
              </div>

              {/* Кнопка Verify Credentials */}
              <button
                type="button"
                onClick={checkCredentials}
                disabled={isVerifying || !formData.api_key || !formData.user_id}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md text-sm font-bold text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-400"
              >
                {isVerifying ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291 A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  'Verify Credentials'
                )}
              </button>
            </div>
          </>
        ) : (
          /* ШАГ 2: Подтверждение аппаратов + ввод Email/Password */
          <>
            <div className="space-y-4">
            {!machinesConfirmed && (
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-bold text-neutral-950 mb-4">Confirm Your Vending Machines</h3>
                  <div className="max-h-[500px] max-w-full overflow-y-auto pr-2">  
                    <div className="space-y-3">
                      {machines.map((machine) => (
                        <div
                          key={machine.serialNumber}
                          className="flex justify-between items-center p-3 bg-white rounded-md border border-neutral-200 shadow-sm"
                        >
                          <span className="font-medium text-neutral-950">{machine.serialNumber}</span>
                          <span className="text-neutral-500">{machine.humanName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 flex justify-center space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setMachines([]);
                      }}
                      className="px-4 py-2 text-sm font-bold text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      ✗ No, try again
                    </button>
                    <button
                      type="button"
                      onClick={() => setMachinesConfirmed(true)}
                      className="px-4 py-2 text-sm font-bold text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      ✓ Yes, these are mine
                    </button>
                  </div>
              </div>
              )}

              {machinesConfirmed && (
                <>
                  {/* Email */}
                  <div className="relative flex items-center">
                    <label htmlFor="email" className="absolute -top-3 left-3 bg-white px-1 text-neutral-500 text-sm">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border border-neutral-300 rounded-md p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                    <span className="material-symbols-outlined absolute right-3 text-neutral-500">mail</span>
                  </div>

                  {/* Password */}
                  <div className="relative flex items-center">
                    <label htmlFor="password" className="absolute -top-3 left-3 bg-white px-1 text-neutral-500 text-sm">
                      Password
                    </label>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full border border-neutral-300 rounded-md p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                      minLength={8}
                    />
                    <span
                      className="material-symbols-outlined absolute right-3 text-neutral-500 cursor-pointer"
                      onMouseDown={() => setShowPassword(true)}
                      onMouseUp={() => setShowPassword(false)}
                    >
                      visibility
                    </span>
                  </div>

                  {/* Confirm Password */}
                  <div className="relative flex items-center">
                    <label htmlFor="password_confirmation" className="absolute -top-3 left-3 bg-white px-1 text-neutral-500 text-sm">
                      Confirm Password
                    </label>
                    <input
                      id="password_confirmation"
                      type={showPassword ? 'text' : 'password'}
                      name="password_confirmation"
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      className="w-full border border-neutral-300 rounded-md p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                    <span
                      className="material-symbols-outlined absolute right-3 text-neutral-500 cursor-pointer"
                      onMouseDown={() => setShowPassword(true)}
                      onMouseUp={() => setShowPassword(false)}
                    >
                      visibility
                    </span>
                  </div>

                  {/* Кнопка Create Account */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-4 w-full flex justify-center py-3 px-4 border border-transparent rounded-md text-sm font-bold text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-400"
                  >
                    {isSubmitting ? 'Creating account...' : 'Create account'}
                  </button>
                </>
              )}
            </div>
          </>
        )}

        {/* Блок для вывода ошибок */}
        {apiError && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{apiError}</h3>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default Register;
