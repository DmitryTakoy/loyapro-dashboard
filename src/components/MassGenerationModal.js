const MassGenerationModal = ({ isOpen, onClose, ...props }) => {
  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      {/* Затемненный фон */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Контейнер модального окна */}
      <div className="fixed inset-0 overflow-y-auto">
        {/* Центрирование содержимого */}
        <div className="flex min-h-full items-center justify-center p-4">
          {/* Само модальное окно */}
          <div className="relative w-full max-w-2xl transform rounded-lg bg-white shadow-xl transition-all">
            {/* Кнопка закрытия всегда видна сверху */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <XIcon className="h-6 w-6" />
            </button>

            {/* Заголовок */}
            <div className="p-6 border-b">
              <h3 className="text-lg font-medium">Mass Generation</h3>
            </div>

            {/* Скроллируемое содержимое */}
            <div className="max-h-[calc(100vh-16rem)] overflow-y-auto p-6">
              {/* Ваше содержимое */}
            </div>

            {/* Футер всегда виден внизу */}
            <div className="border-t p-6 flex justify-end gap-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 