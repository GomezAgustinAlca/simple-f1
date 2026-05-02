export default function DriverPageLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full" />
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-48" />
            <div className="h-4 bg-gray-100 rounded w-36" />
          </div>
        </div>
        <div className="text-right space-y-1">
          <div className="h-9 bg-gray-200 rounded w-16 ml-auto" />
          <div className="h-3 bg-gray-100 rounded w-12 ml-auto" />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <div className="h-3 bg-gray-100 rounded w-20" />
            <div className="h-7 bg-gray-200 rounded w-24" />
          </div>
        ))}
      </div>

      {/* Conclusion */}
      <div className="bg-gray-100 rounded-2xl p-5 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-28" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>

      {/* Evolution chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="h-5 bg-gray-200 rounded w-44" />
        <div className="h-44 bg-gray-100 rounded-xl" />
      </div>

      {/* Recent race table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="h-5 bg-gray-200 rounded w-32" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
