export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#05070b] text-white flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="inline-block rounded-xl bg-red-600 px-4 py-2 text-sm font-black tracking-[0.28em]">HRAVO</div>
        <h1 className="mt-5 text-3xl font-black tracking-[0.18em]">404</h1>
        <p className="mt-3 text-sm text-slate-300">Page a awm lo.</p>
        <a href="/" className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-black">Back Home</a>
      </div>
    </div>
  );
}
