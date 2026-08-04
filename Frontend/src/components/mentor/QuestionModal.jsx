function QuestionModal({
  isOpen,
  onClose,
  title,
  children,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">

      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">

          <h2 className="text-2xl font-bold">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="text-2xl hover:text-red-600"
          >
            ✕
          </button>

        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6">
          {children}
        </div>

      </div>

    </div>
  );
}

export default QuestionModal;