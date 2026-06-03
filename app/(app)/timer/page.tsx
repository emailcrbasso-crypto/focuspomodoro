export default function TimerPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-white rounded-2xl p-10 shadow-sm text-center space-y-4 max-w-sm w-full">
        <p className="text-7xl font-bold text-[#e74c3c]">25:00</p>
        <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Foco</p>
        <p className="text-xs text-gray-400 pt-2">
          Timer completo chegando na próxima fase.
        </p>
      </div>
    </div>
  )
}
