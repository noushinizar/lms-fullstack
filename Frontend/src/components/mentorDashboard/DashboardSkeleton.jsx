function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">

      <div className="h-52 bg-gray-200 rounded-3xl"></div>

      <div className="grid md:grid-cols-4 gap-6">
        {[1,2,3,4].map((item) => (
          <div
            key={item}
            className="h-32 rounded-2xl bg-gray-200"
          />
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="h-96 bg-gray-200 rounded-2xl"></div>
        <div className="h-96 bg-gray-200 rounded-2xl"></div>
      </div>

    </div>
  );
}

export default DashboardSkeleton;