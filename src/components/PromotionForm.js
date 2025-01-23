import React, { useState } from 'react';
import MachinesSelector from './MachinesSelector';
import { TabsContent } from "./tabs"; 
import api from '../api/axios';

const PromotionForm = ({ showMassGeneration, setShowMassGeneration }) => {
  const [formData, setFormData] = useState({
    promotionName: '',
    discount_type: 'percentage',
    discount: 0,
    expiration_date: '',
    is_renewable: false,
    is_single_use: false,
    promotionMachines: [],
  });
  // const [showMassGeneration, setShowMassGeneration] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCreatePromotion = async () => {
    // Валидация перед отправкой
    if (!formData.promotionName.trim()) {
      alert('Promotion name is required');
      return;
    }
  
    if (formData.discount < 0) {
      alert('Discount cannot be negative');
      return;
    }

    // Формирование даты истечения
    let formattedExpirationDate = null;
    if (formData.expiration_date) {
      const [datePart, timePart] = formData.expiration_date.split('T');
      formattedExpirationDate = `${datePart}T${timePart || '23:59'}`; // Если время не указано, по умолчанию ставим '23:59'
    }
  
    const payload = {
      promotionName: formData.promotionName,
      discount: formData.discount,
      discount_type: formData.discount_type,
      is_single_use: formData.is_single_use,
      is_renewable: formData.is_renewable,
      expiration_date: formattedExpirationDate,
      machines: formData.promotionMachines.map(m => m.serialNumber),
    };
  
    console.log('Payload:', payload);
  
    try {
      const response = await api.post('/api/create_promotion', payload);
      if (response.status === 201) {
        alert('Promotion created successfully');
        setFormData({
          promotionName: '',
          discount_type: 'percentage',
          discount: 0,
          expiration_date: '',
          is_renewable: false,
          is_single_use: false,
          promotionMachines: [],
        });
      } else {
        alert('Failed to create promotion');
      }
    } catch (error) {
      console.error('Error creating promotion:', error);
      alert('Error creating promotion');
    }
  };

  // Когда renewable monthly активен, запрещаем дату истечения
  const handleRenewableChange = (e) => {
    const value = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      is_renewable: value,
      expiration_date: value ? '' : prev.expiration_date, // если renewable, очищаем дату
    }));
  };

  return (
    <TabsContent value="createPromotion">
      <div className="mb-8 p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Add New Promotion</h2>
        <form onSubmit={(e) => { e.preventDefault(); handleCreatePromotion(); }} className="space-y-4">
          {/* Поле для названия промоакции */}
          <div className="relative flex items-center">
            <label
              htmlFor="promotionName"
              className="absolute -top-3 left-3 bg-white px-1 text-neutral-500 text-sm"
            >
              Promotion Name
            </label>
            <input
              id="promotionName"
              name="promotionName"
              type="text"
              placeholder="Promotion Name"
              value={formData.promotionName}
              onChange={handleChange}
              className="w-full border border-neutral-300 rounded-md p-3 pr-12 
                         focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          {/* Выбор типа скидки для акции */}
          <div className="relative flex items-center">
            <label
              htmlFor="discount_type"
              className="absolute -top-3 left-3 bg-white px-1 text-neutral-500 text-sm"
            >
              Discount Type
            </label>
            <select
              id="discount_type"
              name="discount_type"
              value={formData.discount_type}
              onChange={handleChange}
              className="w-full border border-neutral-300 rounded-md p-3 pr-12 
                         focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="percentage">Percentage Discount</option>
              <option value="free_drinks">Free Drinks</option>
            </select>
          </div>

          {/* Если выбрано "Percentage Discount", показываем поле для скидки */}
          {formData.discount_type === 'percentage' && (
            <div className="relative flex items-center">
              <label
                htmlFor="discount"
                className="absolute -top-3 left-3 bg-white px-1 text-neutral-500 text-sm"
              >
                Discount Value (%)
              </label>
              <input
                id="discount"
                name="discount"
                type="number"
                placeholder="Discount Value (%)"
                value={formData.discount}
                onChange={handleChange}
                className="w-full border border-neutral-300 rounded-md p-3 pr-12 
                           focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
                min="0"
                max="100"
              />
            </div>
          )}

          {/* Если выбрано "Free Drinks", показываем поле для количества напитков */}
          {formData.discount_type === 'free_drinks' && (
            <div className="relative flex items-center">
              <label
                htmlFor="discount"
                className="absolute -top-3 left-3 bg-white px-1 text-neutral-500 text-sm"
              >
                Number of Free Drinks
              </label>
              <input
                id="discount"
                name="discount"
                type="number"
                placeholder="Number of Free Drinks"
                value={formData.discount}
                onChange={handleChange}
                className="w-full border border-neutral-300 rounded-md p-3 pr-12 
                           focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
                min="1"
              />
            </div>
          )}

          {/* Поле для даты окончания акции, скрываем если Renewable Monthly */}
          {!formData.is_renewable && (
            <div className="relative flex items-center">
              <label
                htmlFor="expiration_date"
                className="absolute -top-3 left-3 bg-white px-1 text-neutral-500 text-sm"
              >
                Expiration Date
              </label>
              <input
                id="expiration_date"
                name="expiration_date"
                type="date"
                placeholder="Expiration Date"
                value={formData.expiration_date}
                onChange={handleChange}
                className="w-full border border-neutral-300 rounded-md p-3 pr-12 
                           focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}

          {/* Чекбокс Renewable Monthly */}
          <label className="flex items-center">
            <input
              type="checkbox"
              name="is_renewable"
              checked={formData.is_renewable}
              onChange={handleRenewableChange}
              className="mr-2"
            />
            <span>Renewable Monthly</span>
            <span className="text-sm text-gray-500 ml-2">(Auto-renew on the first day of each month)</span>
          </label>

          {/* Чекбокс Single Use */}
          <label className="flex items-center">
            <input
              type="checkbox"
              name="is_single_use"
              checked={formData.is_single_use}
              onChange={handleChange}
              className="mr-2"
            />
            <span>Single Use</span>
            <span className="text-sm text-gray-500 ml-2">(Can be used only once)</span>
          </label>

          {/* Выбор машин для акции */}
          <MachinesSelector onChange={(machines) => setFormData((prev) => ({ ...prev, promotionMachines: machines }))} />

          <button 
            className="w-full bg-blue-500 text-primary-50 text-sm font-bold py-3 rounded-md 
                       hover:bg-primary-600"
            type="submit"
          >
            Create Promotion
          </button>
        </form>

        <button
          onClick={() => setShowMassGeneration(true)}
          className="w-full mt-4 bg-purple-500 text-white text-sm font-bold py-3 rounded-md 
                     hover:bg-purple-600"
        >
          Mass Generation
        </button>
      </div>
    </TabsContent>
  );
};

export default PromotionForm;
