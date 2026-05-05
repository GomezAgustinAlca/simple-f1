export function PremiumBanner() {
  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-sm text-gray-600 text-center sm:text-left">
        Simple F1 es gratis. Si te sirve, podés apoyar el proyecto:
      </p>
      <a
        href="https://cafecito.app/simplef1"
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors text-sm"
      >
        Apoyar el proyecto →
      </a>
    </div>
  )
}
