function LoadingSpinner({
  text = "Loading...",
  fullScreen = false,
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${
        fullScreen ? "min-h-screen" : "py-20"
      }`}
    >
      <div className="w-12 h-12 border-4 border-gray-300 border-t-amber-600 rounded-full animate-spin"></div>

      <p className="text-gray-600 font-medium">
        {text}
      </p>
    </div>
  );
}

export default LoadingSpinner;