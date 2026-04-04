import WaitlistForm from "./components/WaitlistForm";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0b1020] text-white">
      
      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12">
        <div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-4">
            Still don’t have a real social circle?
          </h1>

          <p className="text-lg text-gray-300 mb-6">
            Vibley matches you into small local groups based on shared interests —
            so you actually meet people, not just scroll.
          </p>

          <div className="bg-purple-500/10 border-l-4 border-purple-500 p-4 rounded mb-6">
            <p>
              🚫 No endless swiping <br />
              🤝 Real people near you <br />
              ☕ Meet within days, not weeks
            </p>
          </div>

          <a
            href="#waitlist"
            className="inline-block bg-gradient-to-r from-purple-600 to-cyan-400 px-6 py-3 rounded-lg font-semibold"
          >
            Get Early Access
          </a>
        </div>

        <div className="bg-[#121a33] p-6 rounded-xl border border-white/10">
          <p className="text-gray-300">
            🎯 Join interest-based groups <br />
            🤝 Get matched with 3–5 people <br />
            ☕ Meet locally in real life
          </p>
        </div>
      </section>

      {/* WAITLIST */}
      <section id="waitlist" className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-4">Join Early Access</h2>
        <p className="text-gray-400 mb-6">
          Be part of the first Vibley groups launching soon.
        </p>

        <WaitlistForm />
      </section>
    </main>
  );
}