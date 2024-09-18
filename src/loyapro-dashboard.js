import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const LoyaltyProgramDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({
    employee_id: '',
    name: '',
    discount_type: 'percentage',
    discount_value: 0,
    drinks_limit: null,
    is_renewable: false,
    expiration_date: '',
    is_single_use: false,
  });
  const [filters, setFilters] = useState({
    created_after: '',
    created_before: '',
    is_used: '',
    is_reusable: '',
    is_expired: '',
    is_indefinite: ''
  });

  const [showMassGeneration, setShowMassGeneration] = useState(false);
  const [massGenerationData, setMassGenerationData] = useState({
    num_codes: 1,
    discount_type: 'percentage', // 'percentage' or 'free_drink'
    discount_value: 0, // Percentage or number of free drinks
    is_single_use: false,
    is_renewable: false,
    expiration_date: '', // ISO format string
    name: '' 
  });

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/employees', { params: filters });
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  }, [filters]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/add_employee', newEmployee);
      setNewEmployee({
        employee_id: '',
        name: '',
        discount_type: 'percentage',
        discount_value: 0,
        drinks_limit: null,
        is_renewable: false,
        expiration_date: '',
        is_single_use: false,
      });
      fetchEmployees();
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  const handleDeactivateEmployee = async (employeeId) => {
    try {
      await axios.put(`http://localhost:5000/deactivate_employee/${employeeId}`);
      fetchEmployees();
    } catch (error) {
      console.error('Error deactivating employee:', error);
    }
  };

  const handleRenewEmployee = async (employeeId) => {
    try {
      await axios.put(`http://localhost:5000/renew_employee/${employeeId}`);
      fetchEmployees();
    } catch (error) {
      console.error('Error renewing employee:', error);
    }
  };

  const handleMassGeneration = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/generate_codes', massGenerationData, {
        responseType: 'blob', // Important to handle binary data
      });
      const blob = new Blob([response.data], { type: 'application/zip' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'codes_and_images.zip';
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(link.href);
      setShowMassGeneration(false);
      fetchEmployees();
    } catch (error) {
      console.error('Error generating codes:', error);
      alert('An error occurred while generating codes. Please try again.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Loyalty Program Dashboard</h1>
      
      <div className="mb-8 p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Add New Employee</h2>
        <form onSubmit={handleAddEmployee} className="space-y-4">
          <input
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Employee ID"
            value={newEmployee.employee_id}
            onChange={(e) => setNewEmployee({...newEmployee, employee_id: e.target.value})}
          />
          <input
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Name"
            value={newEmployee.name}
            onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
          />
          <select
            className="w-full p-2 border border-gray-300 rounded"
            value={newEmployee.discount_type}
            onChange={(e) => setNewEmployee({...newEmployee, discount_type: e.target.value})}
          >
            <option value="percentage">Percentage Discount</option>
            <option value="free_drinks">Free Drinks</option>
          </select>
          <input
            className="w-full p-2 border border-gray-300 rounded"
            type="number"
            placeholder="Discount Value"
            value={newEmployee.discount_value}
            onChange={(e) => setNewEmployee({...newEmployee, discount_value: parseInt(e.target.value)})}
          />
          {newEmployee.discount_type === 'free_drinks' && (
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="number"
              placeholder="Drinks Limit"
              value={newEmployee.drinks_limit || ''}
              onChange={(e) => setNewEmployee({...newEmployee, drinks_limit: parseInt(e.target.value)})}
            />
          )}
          <input
            className="w-full p-2 border border-gray-300 rounded"
            type="datetime-local"
            placeholder="Expiration Date (optional)"
            value={newEmployee.expiration_date}
            onChange={(e) => setNewEmployee({...newEmployee, expiration_date: e.target.value})}
          />
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={newEmployee.is_renewable}
              onChange={(e) => setNewEmployee({...newEmployee, is_renewable: e.target.checked})}
              className="mr-2"
            />
            <span>Renewable Monthly</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={newEmployee.is_single_use}
              onChange={(e) => setNewEmployee({...newEmployee, is_single_use: e.target.checked})}
              className="mr-2"
            />
            <span>Single Use</span>
          </label>
          <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600">Add Employee</button>
        </form>
        {/* Mass Generation Button */}
        <button
          onClick={() => setShowMassGeneration(true)}
          className="w-full mt-4 p-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Mass Generation
        </button>
      </div>
      {/* Mass Generation Modal */}
      {showMassGeneration && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-4">Mass Code Generation</h2>
            <form onSubmit={handleMassGeneration} className="space-y-4">
              <input
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Name (optional)"
                value={massGenerationData.name || ''}
                onChange={(e) => setMassGenerationData({ ...massGenerationData, name: e.target.value })}
              />
              <input
                className="w-full p-2 border border-gray-300 rounded"
                type="number"
                min="1"
                placeholder="Number of IDs"
                value={massGenerationData.num_codes}
                onChange={(e) => setMassGenerationData({ ...massGenerationData, num_codes: parseInt(e.target.value) })}
              />
              <select
                className="w-full p-2 border border-gray-300 rounded"
                value={massGenerationData.discount_type}
                onChange={(e) => setMassGenerationData({ ...massGenerationData, discount_type: e.target.value })}
              >
                <option value="percentage">Percentage Discount</option>
                <option value="free_drink">Free Drink</option>
              </select>
              {massGenerationData.discount_type === 'percentage' && (
                <input
                  className="w-full p-2 border border-gray-300 rounded"
                  type="number"
                  placeholder="Discount Value (%)"
                  value={massGenerationData.discount_value}
                  onChange={(e) => setMassGenerationData({ ...massGenerationData, discount_value: parseFloat(e.target.value) })}
                />
              )}
              {massGenerationData.discount_type === 'free_drink' && (
                <input
                  className="w-full p-2 border border-gray-300 rounded"
                  type="number"
                  placeholder="Number of Free Drinks"
                  value={massGenerationData.discount_value}
                  onChange={(e) => setMassGenerationData({ ...massGenerationData, discount_value: parseInt(e.target.value) })}
                />
              )}
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={massGenerationData.is_single_use}
                  onChange={(e) => setMassGenerationData({ ...massGenerationData, is_single_use: e.target.checked })}
                  className="mr-2"
                />
                <span>Single Use</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={massGenerationData.is_renewable}
                  onChange={(e) => setMassGenerationData({ ...massGenerationData, is_renewable: e.target.checked })}
                  className="mr-2"
                />
                <span>Renewable Monthly</span>
              </label>
              <input
                className="w-full p-2 border border-gray-300 rounded"
                type="datetime-local"
                placeholder="Expiration Date (optional)"
                value={massGenerationData.expiration_date}
                onChange={(e) => setMassGenerationData({ ...massGenerationData, expiration_date: e.target.value })}
              />
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
      <div className="bg-white shadow-md rounded-lg overflow-hidden mt-8">
          <h2 className="text-2xl font-semibold p-6 bg-gray-50">Employee Table</h2>
          {/* Filters */}
          <div className="p-4 bg-gray-100 flex flex-wrap gap-4">
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
              </div>
          {/* Employee Table */}
          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creation Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount/Free Drinks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiration Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">One-time?</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Renewable</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activated (times)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining Uses</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(employee.creation_date).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{employee.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{employee.employee_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {employee.discount_type === 'percentage' ? 'Discount' : 'Free Drink'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {employee.discount_type === 'percentage'
                      ? `${employee.discount_value}%`
                      : `${employee.discount_value} drink${employee.discount_value !== 1 ? 's' : ''}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{employee.expiration_date ? new Date(employee.expiration_date).toLocaleString() : 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{employee.is_single_use ? 'Yes' : 'No'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{employee.is_renewable ? 'Yes' : 'No'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{employee.activation_count}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{employee.remaining_uses !== null ? employee.remaining_uses : 'Unlimited'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => handleDeactivateEmployee(employee.employee_id)} 
                      className="mr-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Deactivate
                    </button>
                    {employee.is_renewable && (
                      <button 
                        onClick={() => handleRenewEmployee(employee.employee_id)} 
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Renew
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyProgramDashboard;