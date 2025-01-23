import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000,
  withCredentials: true
});

api.interceptors.request.use(
  (config) => {
    // Логируем
    console.log("Starting Request:", {
      method: config.method,
      url: config.url,
      headers: config.headers,
      data: config.data
    });

    // Добавляем токен (если есть)
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Возвращаем уже измененный config
    return config;
  },
  (error) => {
    // Если произошла ошибка до отправки запроса
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // Успешный ответ
    console.log('Response:', response);
    return response;
  },
  (error) => {
    // Сеть упала или нет ответа
    if (error.code === 'ERR_NETWORK') {
      console.error('Network Error:', error);
      console.error('Probably CORS blocked the response or server not reachable');
      return Promise.reject({
        response: {
          data: {
            error: 'Сервер недоступен. Проверьте, запущен ли сервер на порту 5000.'
          }
        }
      });
    }

    // Только для 401 без верифицированного email не делаем редирект
    if (error.response?.status === 401 && 
        !error.response.data?.error?.includes('verify') &&
        !window.location.pathname.includes('/verify-email')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Не делаем автоматический редирект при ошибках логина
      if (!window.location.pathname.includes('/login')) {
        window.location.replace('/login');
      }
    }

    console.error('API Error:', {
      message: error.message,
      response: error.response,
      config: error.config
    });
    return Promise.reject(error);
  }
);


export default api;
