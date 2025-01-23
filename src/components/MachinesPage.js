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
//   return (
    
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="container mx-auto px-4">
//         <h1 className="text-3xl font-bold text-neutral-950 mb-6">Your Machines</h1>

//         <button
//           onClick={fetchMachines}
//           className="mb-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 z-10 opacity-100 visible"
//         >
//           Refresh Machines
//         </button>

//         <ul className="space-y-4">
//           {machines.map((machine, index) => (
//             <li
//               key={index}
//               className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200 hover:shadow-md transition-shadow"
//             >
//               <h2 className="text-xl font-bold text-neutral-950 mb-2">
//                 {machine.humanName}
//               </h2>
//               <p className="text-neutral-600">
//                 Serial Number: {machine.serialNumber}
//               </p>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default MachinesPage;
// PREV BY o1 PRO

// import React, { useState, useEffect } from 'react';
// import api from '../api/axios'; 
// import { useNavigate } from 'react-router-dom';

// const MachinesPage = () => {
//   const [machines, setMachines] = useState([]);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  
//   const navigate = useNavigate();

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       navigate('/login');
//       return;
//     }
//     // Иначе пробуем загрузить
//     fetchMachines();
//   }, [navigate]);

//   // Функция загрузки
//   const fetchMachines = async () => {
//     setError(null);
//     setEmailNotConfirmed(false);
//     setLoading(true);

//     try {
//       const response = await api.get('/api/machines');
//       setMachines(response.data);
//     } catch (err) {
//       console.error('Error loading machines:', err);
//       console.error('Response data:', err.response?.data);

//       // Проверяем коды/сообщения
//       if (err.response) {
//         // Например, 401 (Unauthorized) или 403 (Forbidden)
//         if (err.response.status === 403) {
//           // Предположим, что 403 значит: e-mail не подтверждён
//           setEmailNotConfirmed(true);
//           setError('Please confirm your e-mail.');
//         } 
//         // Если 401 с сообщением "Signature verification failed"
//         else if (
//           err.response?.status === 422 &&
//           err.response?.data?.error?.includes("Signature verification failed")
//         ) {
//           // или где-то в msg
//           setError("Ваш токен невалиден. Перелогиньтесь, пожалуйста.");
//           // И, возможно, сбрасываем localStorage и редиректим на /login
//         }
//         else if (
//           err.response.status === 401 &&
//           err.response.data?.msg === 'Signature verification failed'
//         ) {
//           // Значит токен недействителен (подпись не прошла), просим снова войти
//           setError('Token is invalid or expired. Please log in again.');
//           // Можно дополнительно очистить localStorage и перекинуть на /login
//           // localStorage.removeItem('token');
//           // navigate('/login');
//         } 
//         else {
//           // Иначе показываем общую ошибку
//           setError('Failed to load machines');
//         }
//       } else {
//         // Если err.response вовсе не пришёл, возможно, проблемы с сетью
//         setError('Network error or server is unavailable');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Допустим, у нас есть эндпоинт /api/auth/resend-confirmation для повторной отправки письма
//   const handleResendEmail = async () => {
//     try {
//       await api.post('/api/auth/resend-confirmation'); 
//       // показываем сообщение, что письмо отправлено
//       alert('Confirmation email has been re-sent to your inbox.');
//     } catch (err) {
//       console.error('Failed to resend confirmation email', err);
//       alert('Failed to resend. Please contact support.');
//     }
//   };

//   if (loading) {
//     return <div>Loading machines...</div>;
//   }

//   if (emailNotConfirmed) {
//     // Показываем специальное окно, что почта не подтверждена
//     return (
//       <div className="p-4 flex flex-col items-center">
//         <h2 className="text-lg font-medium text-red-600 mb-2">
//           {error /* "Please confirm your E-mail." */}
//         </h2>
//         <p className="mb-4">
//           You must confirm your email before accessing this page.
//         </p>
//         <button
//           onClick={handleResendEmail}
//           className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//         >
//           Resend Confirmation
//         </button>
//       </div>
//     );
//   }

  

//   // Если произошла другая ошибка
//   if (error) {
//     return (
//       <div className="p-4 text-red-600">
//         {error}
//         <button
//           onClick={fetchMachines}
//           className="block mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//         >
//           Try again
//         </button>
//       </div>
//     );
//   }

//   // Если сервер вернул не массив (вдруг?)
//   if (!Array.isArray(machines)) {
//     return <div style={{ color: 'red' }}>Unexpected data format from server</div>;
//   }

//   // Нормальный рендер списка
//   return (
//     <div className="container mx-auto py-4">
//       <h1 className="text-2xl font-bold mb-4">Your Machines</h1>

//       {/* Кнопка ручного обновления */}
//       <button
//         onClick={fetchMachines}
//         className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//       >
//         Refresh Machines
//       </button>

//       {/* Список машин */}
//       <ul className="space-y-2">
//         {machines.map((machine, index) => (
//           <li key={index} className="border p-2 rounded shadow-sm">
//             <h2 className="font-medium">{machine.humanName}</h2>
//             <p>Serial Number: {machine.serialNumber}</p>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default MachinesPage;

// import React, { useState, useEffect } from 'react';
// import api from '../api/axios'; // ваш Axios-инстанс c интерцептором
// import { useNavigate } from "react-router-dom";

// const MachinesPage = () => {
//   const [machines, setMachines] = useState([]);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       // Если нет токена, сразу на логин
//       navigate('/login');
//       return;
//     }
//     // иначе — делаем запрос
//     api.get('/api/machines') 
//       .then((resp) => setMachines(resp.data))
//       .catch((err) => {
//         console.error(err);
//         setError("Failed to load machines");
//       });
//   }, [navigate]);

//   // Функция загрузки
//   const fetchMachines = async () => {
//     setError(null);
//     setLoading(true);

//     try {
//       // Если у вас нет интерцептора, вы можете вручную передать заголовок Authorization
//       // но при наличии интерцептора обычно достаточно просто `api.get('/api/machines')`.
//       const response = await api.get('/api/machines');
//       setMachines(response.data);
//     } catch (err) {
//       console.error('Error loading machines:', err);
//       setError('Пожалуйста подтвердите ваш e-mail');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // При монтировании (первом рендере) сразу загружаем
//   useEffect(() => {
//     fetchMachines();
//   }, []);

//   // Если идет загрузка
//   if (loading) {
//     return <div>Loading machines...</div>;
//   }

//   // Если произошла ошибка
//   if (error) {
//     return <div style={{ color: 'red' }}>{error}</div>;
//   }

//   // Если сервер вернул не массив (вдруг?)
//   if (!Array.isArray(machines)) {
//     return <div style={{ color: 'red' }}>Unexpected data format from server</div>;
//   }

//   return (
//     <div className="container mx-auto py-4">
//       <h1 className="text-2xl font-bold mb-4">Your Machines</h1>

//       {/* Кнопка ручного обновления */}
//       <button
//         onClick={fetchMachines}
//         className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//       >
//         Refresh Machines
//       </button>

//       {/* Список машин */}
//       <ul className="space-y-2">
//         {machines.map((machine, index) => (
//           <li key={index} className="border p-2 rounded shadow-sm">
//             <h2 className="font-medium">{machine.humanName}</h2>
//             <p>Serial Number: {machine.serialNumber}</p>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default MachinesPage;

// import React, { useEffect, useState } from 'react';
// import api from '../api/axios';

// const MachinesPage = () => {
//   const [machines, setMachines] = useState([]);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Функция загрузки
//   const fetchMachines = async () => {
//     setError(null);
//     setLoading(true);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     const headers = token ? { Authorization: `Bearer ${token}` } : {};

//     api.get('/api/machines', { headers })
//       .then(response => {
//         console.log('Machines data:', response.data);
//         setMachines(response.data);
//       })
//       .catch(err => {
//         console.error('Error loading machines:', err);
//         setError('Failed to load machines');
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   }, []);

//   if (loading) {
//     return <div>Loading machines...</div>;
//   }

//   if (error) {
//     return <div style={{color: 'red'}}>{error}</div>;
//   }

//   if (!Array.isArray(machines)) {
//     return <div style={{color: 'red'}}>Unexpected data format from server</div>;
//   }

//   return (
//     <div className="container mx-auto py-4">
//       <h1 className="text-2xl font-bold mb-4">Your Machines</h1>
//       <ul className="space-y-2">
//         {machines.map((machine, index) => (
//           <li key={index} className="border p-2 rounded shadow-sm">
//             <h2 className="font-medium">{machine.humanName}</h2>
//             <p>Serial Number: {machine.serialNumber}</p>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default MachinesPage;


// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../api/axios';

// const MachinesPage = () => {
//   const [machines, setMachines] = useState([]);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Достаем токен из localStorage, если он нужен
//     const token = localStorage.getItem('token');
    
//     // Если у вас нужна авторизация, вы можете добавить заголовок Authorization:
//     // const headers = token ? { Authorization: `Bearer ${token}` } : {};

//     api.get('/api/machines', {
//       // headers: headers
//     })
//     .then(response => {
//       setMachines(response.data);
//     })
//     .catch(err => {
//       setError('Failed to load machines');
//     })
//     .finally(() => {
//       setLoading(false);
//     });
//   }, []);

//   if (loading) {
//     return <div>Loading machines...</div>;
//   }

//   if (error) {
//     return <div>{error}</div>;
//   }

//   return (
//     <div className="container mx-auto py-4">
//       <h1 className="text-2xl font-bold mb-4">Machines</h1>
//       <ul className="space-y-2">
//         {machines.map(machine => (
//           <li key={machine.id} className="border p-2 rounded shadow-sm">
//             <h2 className="font-medium">{machine.humanName}</h2>
//             <p>Serial Number: {machine.serialNumber}</p>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default MachinesPage;
