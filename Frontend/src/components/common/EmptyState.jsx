function EmptyState({
  icon = "📂",
  title = "Nothing here",
  description = "There's nothing to display.",
  buttonText,
  onButtonClick,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">

      <div className="text-6xl mb-4">
        {icon}
      </div>

      <h2 className="text-2xl font-bold text-gray-700">
        {title}
      </h2>

      <p className="text-gray-500 mt-2 max-w-md">
        {description}
      </p>

      {buttonText && (
        <button
          onClick={onButtonClick}
          className="mt-6 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition"
        >
          {buttonText}
        </button>
      )}

    </div>
  );
}

export default EmptyState;