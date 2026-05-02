"use client"

export function AdSlot({ slot = "top" }: { slot?: string }) {
  return (
    <div
      className="w-full bg-gray-100 border border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 text-xs py-4"
      data-ad-slot={slot}
    >
      Espacio publicitario
    </div>
  )
}
