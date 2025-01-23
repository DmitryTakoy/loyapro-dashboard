
// o1 ver 16.1.25
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../styles/global.css';


const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Обработка изменений в полях ввода
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Обработка отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await api.post('/api/auth/login', formData);
      if (response.data.token) {
        // Сохраняем токен и пользователя
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Переходим на нужную страницу
        navigate('/machines');
      } else {
        setErrors({
          submit: 'No token returned from server. Please try again.',
        });
      }
    } catch (error) {
      setErrors({
        submit:
          error.response?.data?.error ||
          'Login failed. Please check your credentials.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{ backgroundImage: "url('/images/bg.jpg')" }}
      className="min-h-screen bg-cover bg-no-repeat bg-center flex items-center justify-center"
    >
    <div id="webcrumbs" className=" flex items-center justify-center">
      {/* Оборачиваем всю карточку в <form>, чтобы при кнопке "Log in" отправлялась форма */}
      <form onSubmit={handleSubmit}>
        <div className="w-[500px] bg-white shadow-lg rounded-lg p-8 flex flex-col gap-6">
          <h1 className="text-neutral-950 font-title text-2xl">Log in</h1>

          <div className="flex flex-col gap-4">
            {/* Поле E-mail */}
            <div className="relative flex items-center">
              <label
                htmlFor="email"
                className="absolute -top-3 left-3 bg-white px-1 text-neutral-500 text-sm"
              >
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="E-mail"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-neutral-300 rounded-md p-3 pr-12 
                           focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span className="material-symbols-outlined absolute right-3 text-neutral-500">
                person
              </span>
            </div>

            {/* Поле Password */}
            <div className="relative flex items-center">
              <label
                htmlFor="password"
                className="absolute -top-3 left-3 bg-white px-1 text-neutral-500 text-sm"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-neutral-300 rounded-md p-3 pr-12
                           focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {/* Иконка глаза (для примера), можно сделать функционал показа/скрытия пароля */}
              <span className="material-symbols-outlined absolute right-3 text-neutral-500">
                visibility
              </span>
            </div>
          </div>

          {/* Если есть ошибка (например, невалидные данные) */}
          {errors.submit && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {errors.submit}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <a href="#" className="text-primary-500 text-sm self-start focus:underline">
            Forgot your password?
          </a>

          {/* Кнопка входа */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary-500 text-primary-50 text-sm font-bold py-3 rounded-md 
                       disabled:bg-gray-400"
          >
            {isSubmitting ? 'Signing in...' : 'Log in'}
          </button>

          <p className="text-sm text-neutral-500 text-center">
            Don't have an account?{' '}
            {/* Вместо href="#" можно сделать onClick, чтобы переходить на /register */}
            <a
              className="text-primary-500 font-bold cursor-pointer"
              onClick={() => navigate('/register')}
            >
              Sign up
            </a>
          </p>
        </div>
      </form>
    </div>
    </div>
  );
};

export default Login;
