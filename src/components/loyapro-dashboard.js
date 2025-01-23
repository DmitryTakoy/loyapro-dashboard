import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs" 
import MachinesSelector from './MachinesSelector';
import PromotionForm from './PromotionForm';
import { useNavigate } from "react-router-dom";


const LoyaltyProgramDashboard = () => {
  const [filters, setFilters] = useState({
    created_after: '',
    created_before: '',
    is_used: '',
    is_reusable: '',
    is_expired: '',
    is_indefinite: '',
    mass_generation_id: ''
  });
  const [promotionName, setPromotionName] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promotionMachines, setPromotionMachines] = useState([]);
  const [showMassGeneration, setShowMassGeneration] = useState(false);
  const [promotions, setPromotions] = useState([]);
  const [massGenerationData, setMassGenerationData] = useState({
    num_codes: 1,
    discount_type: 'percentage',
    discount_value: 0,
    is_single_use: false,
    is_renewable: false,
    expiration_date: '',
    name: ''
  });

  const [activeTab, setActiveTab] = useState('employees');
  const [massGenerations, setMassGenerations] = useState([]);
  const [selectedMassGeneration, setSelectedMassGeneration] = useState(null);
  const [expandedPromotionId, setExpandedPromotionId] = useState(null);
  const [showAddMachinesModal, setShowAddMachinesModal] = useState(false);
  const [tempSelectedMachines, setTempSelectedMachines] = useState([]);
  const [discount_type, setDiscountType] = useState('percentage'); // или 'free_drinks'
  const [is_single_use, setIsSingleUse] = useState(false);
  const [is_renewable, setIsRenewable] = useState(false);
  const [expiration_date, setExpirationDate] = useState(''); // строка в формате "YYYY-MM-DDTHH:MM:SS"
  const [error, setError] = useState(null);
  const [machines, setMachines] = useState([]);
  const navigate = useNavigate();

  const fetchPromotions = useCallback(async () => {
    try {
      const response = await api.get('/api/promotions', { params: filters });
      if (Array.isArray(response.data)) {
        setPromotions(response.data);
      } else {
        console.error('Received non-array data:', response.data);
        setPromotions([]);
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
      setPromotions([]);
    }
  }, [filters]);

  useEffect(() => {
    if (activeTab === 'promotions') {
      fetchPromotions();
    }
  }, [activeTab, filters, fetchPromotions]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Если нет токена, сразу на логин
      navigate('/login');
      return;
    }
    // иначе — делаем запрос
    api.get('/api/machines') 
      .then((resp) => setMachines(resp.data))
      .catch((err) => {
        console.error(err);
        setError("Failed to load machines");
      });
  }, [navigate]);

  const fetchMassGenerations = useCallback(async () => {
    try {
      const response = await api.get('/api/mass_generations');
      if (Array.isArray(response.data)) {
        setMassGenerations(response.data);
      } else {
        console.error('Received non-array data:', response.data);
        setMassGenerations([]);
      }
    } catch (error) {
      console.error('Error fetching mass generations:', error);
      setMassGenerations([]);
    }
  }, []);

  useEffect(() => {
    // Загружаем массовые генерации, когда переключаем вкладку на "Mass Generations"
    if (activeTab === 'massGenerations') {
      fetchMassGenerations();
    }
  }, [activeTab, fetchMassGenerations]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleRemoveMachine = async (promotionId, serialNumber) => {
    try {
      await api.delete(`/api/promotion/${promotionId}/machines/${serialNumber}`);
      // После успешного удаления на бэке, обновляем фронт
      setPromotionMachines(prev => prev.filter(m => m.serialNumber !== serialNumber));
    } catch (error) {
      console.error('Error removing machine:', error);
    }
  };

  const handleAddMachines = () => {
    if (!expandedPromotionId) return;
    // tempSelectedMachines - это массив машин, выбранных в MachinesSelector
    // Отправляем их на бэк:
    api.post(`/api/promotion/${expandedPromotionId}/add-machines`, {
        machines: tempSelectedMachines.map(m => ({
          serialNumber: m.serialNumber,
          humanName: m.humanName
        }))
      })
      .then(response => {
        // Добавляем новые машины к promotionMachines
        setPromotionMachines(prev => [...prev, ...tempSelectedMachines]);
        // Закрываем модалку и очищаем tempSelectedMachines
        setShowAddMachinesModal(false);
        setTempSelectedMachines([]);
      })
      .catch(error => {
        console.error('Error adding machines:', error);
      });
  };
  

  const handleShowMachines = async (promotionId) => {
    if (expandedPromotionId === promotionId) {
      // если уже раскрыто, значит сворачиваем
      setExpandedPromotionId(null);
      setPromotionMachines([]);
    } else {
      // раскрываем новую акцию
      setExpandedPromotionId(promotionId);
      try {
        // вызовем бэкенд за машинами для этой акции
        const response = await api.get(`/api/promotion/${promotionId}/machines`);
        setPromotionMachines(response.data);
      } catch (error) {
        console.error('Error fetching promotion machines:', error);
        setPromotionMachines([]);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleDeactivatePromotion = async (promotionId) => {
    try {
      await api.put(`/api/promotion/${promotionId}/deactivate`);
      // Обновляем список акций
      fetchPromotions();
    } catch (error) {
      console.error('Error deactivating promotion:', error);
    }
  };

  // В файле loyapro-dashboard.js (или как он у вас называется)
  const handleRenewPromotion = async (promotionId) => {
    try {
      // Пусть у нас есть эндпоинт PUT /api/promotion/<id>/renew
      await api.put(`/api/promotion/${promotionId}/renew`);
      // После успешного запроса обновляем список промо (фильтры, если нужно)
      fetchPromotions();
    } catch (error) {
      console.error('Error renewing promotion:', error);
    }
  };

  const handleDownloadQR = async (promotionId) => {
    try {
      const response = await api.get(`/api/promotion/${promotionId}/download_qr`, {
        responseType: 'blob'
      });
      // Теперь response.data — это Blob (например, image/png)
      
      // Генерируем временную ссылку (URL) из Blob:
      const blob = new Blob([response.data], { type: 'image/png' });
      const blobUrl = window.URL.createObjectURL(blob);
  
      // Создаём временный <a>, который "скачивает" blobUrl
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `qr_promo_${promotionId}.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
  
      // Освобождаем blobUrl
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading QR:', error);
      alert('Failed to download QR code');
    }
  };

  const handleMassGeneration = async (e) => {
    e.preventDefault();
  
    // 1) Валидация
    if (!massGenerationData.name.trim()) {
      alert('Please enter a name (even if temporary) or indicate it is optional.');
      return;
    }
  
    if (massGenerationData.num_codes < 1) {
      alert('Number of codes must be at least 1.');
      return;
    }
  
    // Формируем expiration_date в нужном формате
    let formattedExpiration = null;
    if (massGenerationData.expiration_date) {
      const [datePart, timePart] = massGenerationData.expiration_date.split('T');
      formattedExpiration = `${datePart}T${timePart || '23:59'}`;
    }
  
    // Собираем итоговый payload
    const payload = {
      name: massGenerationData.name,
      discount_type: massGenerationData.discount_type,        // 'percentage' или 'free_drink'
      discount_value: massGenerationData.discount_value,      // величина скидки/число напитков
      num_codes: massGenerationData.num_codes,
      is_single_use: massGenerationData.is_single_use,
      is_renewable: massGenerationData.is_renewable,
      expiration_date: formattedExpiration,                   // может быть null
      machines: tempSelectedMachines.map(m => ({
        serialNumber: m.serialNumber,
        humanName: m.humanName,}))
    };
  
    console.log('Mass Gen payload:', payload);
  
    try {
      // 2) Отправка запроса
      const response = await api.post('/api/generate_codes', payload, {
        responseType: 'blob', // т.к. ожидаем zip-архив
      });
  
      // 3) Формируем Blob для скачивания
      const blob = new Blob([response.data], { type: 'application/zip' });
      const blobUrl = window.URL.createObjectURL(blob);
  
      // 4) Создаем <a> для скачивания
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'codes_and_images.zip';
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
  
      // 5) Закрываем модалку и сбрасываем поля
      setShowMassGeneration(false);
      setMassGenerationData({
        name: '',
        discount_type: 'percentage',
        discount_value: 0,
        num_codes: 1,
        expiration_date: '',
        is_renewable: false,
        is_single_use: false
      });
  
      // 6) Если нужно — обновляем список промо (или mass_generations)
      fetchPromotions(); 
      // fetchMassGenerations(); // при желании
    } catch (error) {
      console.error('Error generating codes:', error);
      alert('An error occurred while generating codes. Please try again.');
    }
  };

  const handleDownloadArchive = async (massGenerationId) => {
    try {
      const response = await api.get(`/api/download_archive/${massGenerationId}`, {
        responseType: 'blob', // Ожидаем файл (например, zip-архив)
      });
  
      // Создаем временную ссылку для скачивания
      const blob = new Blob([response.data], { type: 'application/zip' });
      const blobUrl = window.URL.createObjectURL(blob);
  
      // Создаем временный <a> элемент для скачивания
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `mass_generation_${massGenerationId}.zip`);
      document.body.appendChild(link);
      link.click();
  
      // Удаляем элемент и освобождаем URL
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading archive:', error);
      alert('Failed to download archive');
    }
  };

  const handleAddMachinesToMassGeneration = async () => {
    console.log("selectedMassGeneration =", selectedMassGeneration);
    if (!selectedMassGeneration) {
      alert("No mass generation selected!");
      return;
    }
    try {
      const response = await api.post(`/api/mass_generation/${selectedMassGeneration.id}/add-machines`, {
        machines: tempSelectedMachines.map(machine => ({
          serialNumber: machine.serialNumber,
          humanName: machine.humanName
        }))
      });
      setMassGenerations(prevGenerations => prevGenerations.map(mg => 
        mg.id === selectedMassGeneration.id ? { ...mg, machines: response.data } : mg
      ));
      setShowAddMachinesModal(false); // Закрыть модальное окно
      setTempSelectedMachines([]);
    } catch (error) {
      console.error('Error adding machines to mass generation:', error);
    }
  };

  const handleRenewableChangeMassGen = (e) => {
    const checked = e.target.checked;
    setMassGenerationData((prev) => ({
      ...prev,
      is_renewable: checked,
      expiration_date: checked ? '' : prev.expiration_date
    }));
  };
  

  return (
    <div
      style={{ backgroundImage: "url('/images/bg1.jpg')" }}
      className="min-h-screen bg-cover bg-no-repeat bg-center flex items-start justify-center"
    >
    <div className="container mx-auto p-4 ">
      {/* Верхняя панель с кнопками Dashboard и Promotions */}
      <div className="flex justify-between mb-4">
        <h1 className="text-3xl font-bold text-blue-600">Loyalty Program Dashboard</h1>
        <div className="space-x-4">
          <button 
            onClick={() => setActiveTab('employees')} 
            className="bg-blue-500 text-white px-8 py-3 rounded-full shadow hover:bg-blue-600"
          >
            Dashboard
          </button>
          <button 
            onClick={() => navigate('/machines')} 
            className="bg-purple-500 text-white px-8 py-3 rounded-full shadow hover:bg-purple-600"
          >
            Machines
          </button>
          <button 
            onClick={handleLogout}
            className="bg-red-500 text-white px-8 py-3 rounded-full shadow hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="w-full max-w-[1600px] bg-white shadow-md rounded-md p-8 my-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList className="inline-flex bg-gray-100 p-1 rounded-lg">
              <TabsTrigger 
                value="createPromotion" 
                className="px-4 py-2 rounded-md text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-blue-500"
              >
                Create Promotion
              </TabsTrigger>
              <TabsTrigger 
                value="massGenerations" 
                className="px-4 py-2  rounded-md text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-blue-500"
              >
                Mass Generations
              </TabsTrigger>
              <TabsTrigger 
                value="promotions" 
                className="px-4 py-2 rounded-md text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-blue-500"
              >
                Promotions
              </TabsTrigger>
            </TabsList>
          </div>

          <PromotionForm 
            showMassGeneration={showMassGeneration}
            setShowMassGeneration={setShowMassGeneration}
          />
          <TabsContent value="massGenerations" className="h-full" >
            <div id="webcrumbs" className=" bg-neutral-100 shadow-lg rounded-lg p-8 mx-auto">

              {/* Основная белая карточка внутри серого блока */}
              <section className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-title text-neutral-800 mb-6">
                  Mass Generations
                </h2>

                {/* Пример дополнительного блока фильтров (если нужно) */}
                {/* <div className="flex flex-wrap gap-4 mb-6">
                  ... фильтры ...
                </div> */}

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse rounded-lg overflow-hidden shadow">
                    <thead className="bg-primary-500 text-white">
                      <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Creation Date</th>
                        <th className="px-6 py-4">Discount Type</th>
                        <th className="px-6 py-4">Discount Value</th>
                        <th className="px-6 py-4">QR Count</th>
                        <th className="px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-neutral-50 text-neutral-800">
                      {massGenerations.map((mg) => (
                        <tr
                          key={mg.id}
                          className="hover:bg-neutral-100 cursor-pointer transition-colors duration-150"
                        >
                          <td className="px-6 py-4 border border-neutral-300">{mg.name}</td>
                          <td className="px-6 py-4 border border-neutral-300">
                            {new Date(mg.creation_date).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 border border-neutral-300">{mg.discount_type}</td>
                          <td className="px-6 py-4 border border-neutral-300">{mg.discount_value}</td>
                          <td className="px-6 py-4 border border-neutral-300">{mg.promotion_count}</td>
                          <td className="px-6 py-4 border border-neutral-300">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMassGeneration(mg);        // <-- ВАЖНО
                                setShowAddMachinesModal(true);        // Открываем модалку
                              }}
                              className="px-4 py-2 bg-green-500 ..."
                            >
                              Add Machines
                            </button>

                            {mg.archive_filename && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDownloadArchive(mg.id)  }}
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                              >
                                Download
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

          </TabsContent> 

          <TabsContent value="promotions">
            <div id="webcrumbs" className="max-w-[1600px] w-full bg-neutral-100 shadow-lg rounded-lg p-4 mx-auto">
                {/* Основная "карточка" */}
                <section className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-2xl font-title text-neutral-800 mb-6">Promotions</h2>

                  {/* Блок фильтров или любая другая панель */}
                  <div className="flex flex-wrap gap-4 mb-6">
                    {/* Пример одного поля (дата, фильтр, селект) */}
                    <input
                      type="date"
                      name="created_after"
                      value={filters.created_after}
                      onChange={handleFilterChange}
                      className="p-2 border rounded"
                      placeholder="Created After"
                  />
                  <input
                      type="date"
                      name="created_before"
                      value={filters.created_before}
                      onChange={handleFilterChange}
                      className="p-2 border rounded"
                      placeholder="Created Before"
                  />
                  <select
                      name="is_used"
                      value={filters.is_used}
                      onChange={handleFilterChange}
                      className="p-2 border rounded"
                  >
                      <option value="">Used/Unused</option>
                      <option value="true">Used</option>
                      <option value="false">Unused</option>
                  </select>
                  <select
                      name="is_reusable"
                      value={filters.is_reusable}
                      onChange={handleFilterChange}
                      className="p-2 border rounded"
                  >
                      <option value="">Reusable/Disposable</option>
                      <option value="true">Reusable</option>
                      <option value="false">Disposable</option>
                  </select>
                  <select
                      name="is_expired"
                      value={filters.is_expired}
                      onChange={handleFilterChange}
                      className="p-2 border rounded"
                  >
                      <option value="">Expired/Current</option>
                      <option value="true">Expired</option>
                      <option value="false">Current</option>
                  </select>
                  <select
                      name="is_indefinite"
                      value={filters.is_indefinite}
                      onChange={handleFilterChange}
                      className="p-2 border rounded"
                  >
                      <option value="">Indefinite/Not Indefinite</option>
                      <option value="true">Indefinite</option>
                      <option value="false">Not Indefinite</option>
                  </select>
                  <select
                    name="mass_generation_id"
                    value={filters.mass_generation_id}
                    onChange={handleFilterChange}
                    className="p-2 border rounded"
                  >
                    <option value="">All Mass Generations</option>
                    <option value="none">No Mass Generation</option>
                    {massGenerations.map((mg) => (
                      <option key={mg.id} value={mg.id}>{mg.name}</option>
                    ))}
                  </select>
                  </div>

                  {/* ВАЖНО: обёртка overflow-x-auto для горизонтального скролла */}
                  <div className="w-full overflow-x-auto">
                    <table className="table-auto w-full text-left border-collapse rounded-lg overflow-hidden shadow text-sm">
                      <thead className="bg-primary-500 text-white whitespace-nowrap">
                        <tr>
                          <th className="px-6 py-4">Creation Date</th>
                          <th className="px-6 py-4">Name</th>
                          {/* <th className="px-6 py-4">ID</th> */}
                          <th className="px-6 py-4">Discount Type</th>
                          <th className="px-6 py-4">Discount/Free</th>
                          <th className="px-6 py-4">Expiration</th>
                          <th className="px-6 py-4">One-time</th>
                          <th className="px-6 py-4">Renewable</th>
                          <th className="px-6 py-4">Used</th>
                          <th className="px-6 py-4">Uses Left</th>
                          <th className="px-6 py-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-neutral-50 text-neutral-800">
                        {promotions.map((promo) => (
                          <React.Fragment key={promo.id}>
                            <tr className="hover:bg-neutral-100 transition-colors">
                              <td className="px-6 py-4 border border-neutral-300 whitespace-nowrap">
                                {new Date(promo.creation_date).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 border border-neutral-300">
                                {promo.name}
                              </td>
                              {/* <td className="px-6 py-4 border border-neutral-300">
                                {promo.id}
                              </td> */}
                              <td className="px-6 py-4 border border-neutral-300">
                                {promo.discount_type === 'percentage' ? 'Discount' : 'Free Drink'}
                              </td>
                              <td className="px-6 py-4 border border-neutral-300 whitespace-nowrap">
                                {promo.discount_type === 'percentage'
                                  ? `${promo.discount_value}%`
                                  : `${promo.discount_value} drink${promo.discount_value !== 1 ? 's' : ''}`}
                              </td>
                              <td className="px-6 py-4 border border-neutral-300">
                                {promo.expiration_date
                                  ? new Date(promo.expiration_date).toLocaleString()
                                  : 'N/A'}
                              </td>
                              <td className="px-6 py-4 border border-neutral-300">
                                {promo.is_single_use ? 'Yes' : 'No'}
                              </td>
                              <td className="px-6 py-4 border border-neutral-300">
                                {promo.is_renewable ? 'Yes' : 'No'}
                              </td>
                              <td className="px-6 py-4 border border-neutral-300">
                                {promo.activation_count}
                              </td>
                              <td className="px-6 py-4 border border-neutral-300">
                                {promo.remaining_uses !== null ? promo.remaining_uses : 'Unlimited'}
                              </td>
                              <td className="px-6 py-4 border border-neutral-300 whitespace-nowrap">
                                <button
                                  onClick={() => handleShowMachines(promo.id)}
                                  className="mr-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                  Machines
                                </button>
                                <button
                                  onClick={() => handleDeactivatePromotion(promo.id)}
                                  className="mr-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                  Deactivate
                                </button>
                                <button
                                  onClick={() => handleDownloadQR(promo.id)}
                                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                  QR
                                </button>
                              </td>
                            </tr>
                            {expandedPromotionId === promo.id && (
                              <tr>
                                <td colSpan={11} className="bg-gray-50 p-4">
                                  <h3 className="text-xl font-semibold mb-2">
                                    Machines for {promo.name}
                                  </h3>
                                  {/* Вывод списка машин, кнопка Add Machines */}
                                  <div className="space-y-2">
                                    {promotionMachines.map(machine => (
                                      <div key={machine.serialNumber} className="flex justify-between items-center border p-2 rounded bg-white">
                                        <div>
                                          <div className="font-medium">{machine.serialNumber}</div>
                                          <div className="text-sm text-gray-600">{machine.humanName}</div>
                                        </div>
                                        <button
                                          onClick={() => handleRemoveMachine(promo.id, machine.serialNumber)}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                  {/* Здесь добавим кнопку Add Machines */}
                                  <button
                                    onClick={() => setShowAddMachinesModal(true)}
                                    className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                  >
                                    Add Machines
                                  </button>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
          </TabsContent>
        </Tabs>
        </div>
      {showAddMachinesModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-4">Add Machines to Mass Generation</h2>
            <MachinesSelector onChange={setTempSelectedMachines} /> {/* Компонент выбора машин */}

            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={() => { setShowAddMachinesModal(false); setTempSelectedMachines([]); }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedMassGeneration) {
                    handleAddMachinesToMassGeneration(); // Для массовой генерации
                  } else {
                    handleAddMachines(); // Для обычной промоакции
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}           
      {showMassGeneration && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-semibold mb-4">Mass Code Generation</h2>
          <form onSubmit={handleMassGeneration} className="space-y-4">
            {/* Название акции */}
            <input
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Name (optional)"
              value={massGenerationData.name}
              onChange={(e) =>
                setMassGenerationData((prev) => ({ ...prev, name: e.target.value }))
              }
            />

            {/* Количество промо-кодов */}
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="number"
              min="1"
              placeholder="Number of IDs"
              value={massGenerationData.num_codes}
              onChange={(e) =>
                setMassGenerationData((prev) => ({
                  ...prev,
                  num_codes: parseInt(e.target.value) || 1,
                }))
              }
            />

            {/* Тип скидки */}
            <select
              className="w-full p-2 border border-gray-300 rounded"
              value={massGenerationData.discount_type}
              onChange={(e) =>
                setMassGenerationData((prev) => ({ ...prev, discount_type: e.target.value }))
              }
            >
              <option value="percentage">Percentage Discount</option>
              <option value="free_drink">Free Drink</option>
            </select>

            {/* Если Percentage Discount, показываем поле для % */}
            {massGenerationData.discount_type === 'percentage' && (
              <input
                className="w-full p-2 border border-gray-300 rounded"
                type="number"
                placeholder="Discount Value (%)"
                value={massGenerationData.discount_value}
                onChange={(e) =>
                  setMassGenerationData((prev) => ({
                    ...prev,
                    discount_value: parseInt(e.target.value) || 0,
                  }))
                }
              />
            )}

            {/* Если Free Drink, показываем поле для кол-ва напитков */}
            {massGenerationData.discount_type === 'free_drink' && (
              <input
                className="w-full p-2 border border-gray-300 rounded"
                type="number"
                placeholder="Number of Free Drinks"
                value={massGenerationData.discount_value}
                onChange={(e) =>
                  setMassGenerationData((prev) => ({
                    ...prev,
                    discount_value: parseInt(e.target.value) || 1,
                  }))
                }
              />
            )}

            {/* Single use */}
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={massGenerationData.is_single_use}
                onChange={(e) =>
                  setMassGenerationData((prev) => ({
                    ...prev,
                    is_single_use: e.target.checked,
                  }))
                }
                className="mr-2"
              />
              <span>Single Use</span>
            </label>

            {/* Renewable Monthly */}
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={massGenerationData.is_renewable}
                onChange={handleRenewableChangeMassGen}
                className="mr-2"
              />
              <span>Renewable Monthly</span>
            </label>

            {/* Дата истечения (если не renewable) */}
            {!massGenerationData.is_renewable && (
              <input
                className="w-full p-2 border border-gray-300 rounded"
                type="datetime-local"
                placeholder="Expiration Date (optional)"
                value={massGenerationData.expiration_date}
                onChange={(e) =>
                  setMassGenerationData((prev) => ({
                    ...prev,
                    expiration_date: e.target.value,
                  }))
                }
              />
            )}
            
            <label className="block text-sm font-medium text-gray-700">
              Machines for this Mass Generation
            </label>
            <MachinesSelector onChange={setTempSelectedMachines} />
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowMassGeneration(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Generate
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    </div>
    </div>
  );
};

export default LoyaltyProgramDashboard;
