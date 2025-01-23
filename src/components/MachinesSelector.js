import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const MachinesSelector = ({ onChange }) => {
  const [availableMachines, setAvailableMachines] = useState([]);
  const [selectedMachines, setSelectedMachines] = useState([]);
  const [searchAvailable, setSearchAvailable] = useState(''); // Поиск в доступных
  const [searchSelected, setSearchSelected] = useState(''); // Поиск в выбранных

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await api.get('/api/machines-list');
        if (Array.isArray(response.data)) {
          setAvailableMachines(response.data);
        } else {
          console.error('Received non-array data:', response.data);
        }
      } catch (error) {
        console.error('Error fetching machines:', error);
      }
    };

    fetchMachines();
  }, []);

  // Когда selectedMachines меняется, оповещаем родителя
  useEffect(() => {
    onChange(selectedMachines);
  }, [selectedMachines, onChange]);

  // Функции для перемещения машин
  const moveToSelected = (machine) => {
    setAvailableMachines((prev) =>
      prev.filter((m) => m.serialNumber !== machine.serialNumber)
    );
    setSelectedMachines((prev) => [...prev, machine]);
  };

  const moveToAvailable = (machine) => {
    setSelectedMachines((prev) =>
      prev.filter((m) => m.serialNumber !== machine.serialNumber)
    );
    setAvailableMachines((prev) => [...prev, machine]);
  };

  // Функции для выбора/снятия всех машин
  const selectAll = () => {
    setSelectedMachines((prev) => [...prev, ...availableMachines]);
    setAvailableMachines([]);
  };

  const unselectAll = () => {
    setAvailableMachines((prev) => [...prev, ...selectedMachines]);
    setSelectedMachines([]);
  };

  // Функция для фильтрации машин по поисковому запросу
  const filterMachines = (machines, query) => {
    if (!query) return machines;
    return machines.filter(
      (machine) =>
        machine.serialNumber.toLowerCase().includes(query.toLowerCase()) ||
        (machine.humanName &&
          machine.humanName.toLowerCase().includes(query.toLowerCase()))
    );
  };

  // Отфильтрованные списки
  const filteredAvailableMachines = filterMachines(availableMachines, searchAvailable);
  const filteredSelectedMachines = filterMachines(selectedMachines, searchSelected);

  return (
    <div
      id="webcrumbs"
      className="max-w-[1200px] w-full bg-white shadow rounded-lg mx-auto overflow-hidden"
    >
      {/* Заголовок и кнопки «Выбрать все / Снять все» */}
      <div className="px-6 py-4 flex justify-between items-center border-b border-gray-200">
        <div>
          <h2 className="font-title text-lg font-bold">Все машины</h2>
          <button
            onClick={selectAll}
            className="text-primary-500 text-sm hover:underline"
          >
            Выбрать все
          </button>
        </div>
        <div>
          <h2 className="font-title text-lg font-bold">Выбранные машины</h2>
          <button
            onClick={unselectAll}
            className="text-primary-500 text-sm hover:underline"
          >
            Снять все
          </button>
        </div>
      </div>

      {/* Содержимое: две колонки */}
      <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Левая колонка – доступные машины */}
        <div>
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Поиск..."
              value={searchAvailable}
              onChange={(e) => setSearchAvailable(e.target.value)}
              className="w-full py-2 px-4 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <span className="material-symbols-outlined text-neutral-500 absolute top-1/2 right-3 -translate-y-1/2">
              search
            </span>
          </div>
          <ul className="bg-neutral-50 rounded-md divide-y divide-gray-200 max-h-[300px] overflow-y-auto">
            {filteredAvailableMachines.length === 0 && (
              <li className="py-2 px-4 text-sm text-gray-500">
                Нет доступных
              </li>
            )}
            {filteredAvailableMachines.map((machine) => (
              <li
                key={machine.serialNumber}
                className="flex justify-between items-center py-2 px-4 hover:bg-neutral-100 cursor-pointer"
                onClick={() => moveToSelected(machine)}
              >
                <span className="text-sm">
                  {machine.serialNumber} {machine.humanName && `(${machine.humanName})`}
                </span>
                <span className="material-symbols-outlined text-primary-500">
                  arrow_forward
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Правая колонка – выбранные машины */}
        <div>
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Поиск..."
              value={searchSelected}
              onChange={(e) => setSearchSelected(e.target.value)}
              className="w-full py-2 px-4 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <span className="material-symbols-outlined text-neutral-500 absolute top-1/2 right-3 -translate-y-1/2">
              search
            </span>
          </div>
          <ul className="bg-neutral-50 rounded-md divide-y divide-gray-200 max-h-[300px] overflow-y-auto">
            {filteredSelectedMachines.length === 0 && (
              <li className="py-2 px-4 text-sm text-gray-500">
                Нет выбранных
              </li>
            )}
            {filteredSelectedMachines.map((machine) => (
              <li
                key={machine.serialNumber}
                className="flex justify-between items-center py-2 px-4 hover:bg-neutral-100 cursor-pointer"
                onClick={() => moveToAvailable(machine)}
              >
                <span className="text-sm">
                  {machine.serialNumber} {machine.humanName && `(${machine.humanName})`}
                </span>
                <span className="material-symbols-outlined text-neutral-500 rotate-180">
                  arrow_forward
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MachinesSelector;
// import React, { useState, useEffect } from 'react';
// import api from '../api/axios';

// const MachinesSelector = ({ onChange }) => {
//   const [availableMachines, setAvailableMachines] = useState([]);
//   const [selectedMachines, setSelectedMachines] = useState([]);

//   useEffect(() => {
//     const fetchMachines = async () => {
//       try {
//         const response = await api.get('/api/machines-list');
//         if (Array.isArray(response.data)) {
//           setAvailableMachines(response.data);
//         } else {
//           console.error('Received non-array data:', response.data);
//         }
//       } catch (error) {
//         console.error('Error fetching machines:', error);
//       }
//     };

//     fetchMachines();
//   }, []);

//   // Когда selectedMachines меняется, оповещаем родителя
//   useEffect(() => {
//     onChange(selectedMachines);
//   }, [selectedMachines, onChange]);

//   const moveToSelected = (machine) => {
//     setAvailableMachines((prev) =>
//       prev.filter((m) => m.serialNumber !== machine.serialNumber)
//     );
//     setSelectedMachines((prev) => [...prev, machine]);
//   };

//   const moveToAvailable = (machine) => {
//     setSelectedMachines((prev) =>
//       prev.filter((m) => m.serialNumber !== machine.serialNumber)
//     );
//     setAvailableMachines((prev) => [...prev, machine]);
//   };

//   const selectAll = () => {
//     setSelectedMachines((prev) => [...prev, ...availableMachines]);
//     setAvailableMachines([]);
//   };

//   const unselectAll = () => {
//     setAvailableMachines((prev) => [...prev, ...selectedMachines]);
//     setSelectedMachines([]);
//   };

//   return (
//     <div id="webcrumbs" 
//           className="
//           max-w-[1200px] w-full 
//           bg-white shadow rounded-lg
//           mx-auto
//           overflow-hidden
//           ">
//       {/* Заголовок и кнопки «Выбрать все / Снять все» */}
//       <div className="px-6 py-4 flex justify-between items-center border-b border-gray-200">
//         <div>
//           <h2 className="font-title text-lg font-bold">Все активаторы</h2>
//           <button
//             onClick={selectAll}
//             className="text-primary-500 text-sm hover:underline"
//           >
//             Выбрать все
//           </button>
//         </div>
//         <div>
//           <h2 className="font-title text-lg font-bold">Активные участники</h2>
//           <button
//             onClick={unselectAll}
//             className="text-primary-500 text-sm hover:underline"
//           >
//             Снять все
//           </button>
//         </div>
//       </div>

//       {/* Содержимое: две колонки */}
//       <div className="
//                 px-6 py-4 
//                 grid grid-cols-1 md:grid-cols-2 
//                 gap-4
//               ">
//         {/* Левая колонка – доступные машины */}
//         <div>
//           <div className="relative mb-4">
//             <input
//               type="text"
//               placeholder="Поиск..."
//               className="w-full py-2 px-4 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
//             />
//             <span className="material-symbols-outlined text-neutral-500 absolute top-1/2 right-3 -translate-y-1/2">
//               search
//             </span>
//           </div>
//           <ul className="bg-neutral-50 rounded-md divide-y divide-gray-200">
//             {availableMachines.length === 0 && (
//               <li className="py-2 px-4 text-sm text-gray-500">
//                 Нет доступных
//               </li>
//             )}
//             {availableMachines.map((machine) => (
//               <li
//                 key={machine.serialNumber}
//                 className="flex justify-between items-center py-2 px-4 hover:bg-neutral-100 cursor-pointer"
//                 onClick={() => moveToSelected(machine)}
//               >
//                 <span className="text-sm">
//                   {machine.serialNumber} {machine.humanName && `(${machine.humanName})`}
//                 </span>
//                 <span className="material-symbols-outlined text-primary-500">
//                   arrow_forward
//                 </span>
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* Правая колонка – выбранные машины */}
//         <div>
//           <div className="relative mb-4">
//             <input
//               type="text"
//               placeholder="Поиск..."
//               className="w-full py-2 px-4 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
//             />
//             <span className="material-symbols-outlined text-neutral-500 absolute top-1/2 right-3 -translate-y-1/2">
//               search
//             </span>
//           </div>
//           <ul className="bg-neutral-50 rounded-md divide-y divide-gray-200">
//             {selectedMachines.length === 0 && (
//               <li className="py-2 px-4 text-sm text-gray-500">
//                 Нет выбранных
//               </li>
//             )}
//             {selectedMachines.map((machine) => (
//               <li
//                 key={machine.serialNumber}
//                 className="flex justify-between items-center py-2 px-4 hover:bg-neutral-100 cursor-pointer"
//                 onClick={() => moveToAvailable(machine)}
//               >
//                 <span className="text-sm">
//                   {machine.serialNumber} {machine.humanName && `(${machine.humanName})`}
//                 </span>
//                 {/* Развернутая стрелка налево (rotate-180) */}
//                 <span className="material-symbols-outlined text-neutral-500 rotate-180">
//                   arrow_forward
//                 </span>
//               </li>
//             ))}
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MachinesSelector;
// till 16.1.25
// import React, { useState, useEffect } from 'react';
// import api from '../api/axios';

// const MachinesSelector = ({ onChange }) => {
//   const [availableMachines, setAvailableMachines] = useState([]);
//   const [selectedMachines, setSelectedMachines] = useState([]);

//   useEffect(() => {
//     const fetchMachines = async () => {
//       try {
//         const response = await api.get('/api/machines-list');
//         if (Array.isArray(response.data)) {
//           setAvailableMachines(response.data);
//         } else {
//           console.error('Received non-array data:', response.data);
//         }
//       } catch (error) {
//         console.error('Error fetching machines:', error);
//       }
//     };

//     fetchMachines();
//   }, []);

//   // Когда selectedMachines меняется, оповещаем родителя
//   useEffect(() => {
//     onChange(selectedMachines);
//   }, [selectedMachines, onChange]);

//   const moveToSelected = (machine) => {
//     setAvailableMachines(prev => prev.filter(m => m.serialNumber !== machine.serialNumber));
//     setSelectedMachines(prev => [...prev, machine]);
//   };

//   const moveToAvailable = (machine) => {
//     setSelectedMachines(prev => prev.filter(m => m.serialNumber !== machine.serialNumber));
//     setAvailableMachines(prev => [...prev, machine]);
//   };

//   return (
//     <div className="flex space-x-8">
//       <div className="w-1/2 border p-4 rounded">
//         <h3 className="text-xl font-bold mb-2">All Machines</h3>
//         <div className="space-y-2 overflow-auto h-64">
//           {availableMachines.map(machine => (
//             <div key={machine.serialNumber} className="flex justify-between items-center border rounded p-2 bg-white hover:bg-gray-50">
//               <div>
//                 <div className="font-medium">{machine.serialNumber}</div>
//                 <div className="text-sm text-gray-600">{machine.humanName}</div>
//               </div>
//               <button
//                 onClick={() => moveToSelected(machine)}
//                 className="text-blue-500 hover:text-blue-700 text-xl"
//                 title="Add to selected"
//               >
//                 &rarr;
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="w-1/2 border p-4 rounded">
//         <h3 className="text-xl font-bold mb-2">Selected Machines</h3>
//         <div className="space-y-2 overflow-auto h-64">
//           {selectedMachines.map(machine => (
//             <div key={machine.serialNumber} className="flex justify-between items-center border rounded p-2 bg-white hover:bg-gray-50">
//               <div>
//                 <div className="font-medium">{machine.serialNumber}</div>
//                 <div className="text-sm text-gray-600">{machine.humanName}</div>
//               </div>
//               <button
//                 onClick={() => moveToAvailable(machine)}
//                 className="text-red-500 hover:text-red-700 text-xl"
//                 title="Remove from selected"
//               >
//                 &larr;
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MachinesSelector;
