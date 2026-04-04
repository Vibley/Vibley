import WaitlistForm from "./components/WaitlistForm";

export default function HomePage() {
  return (
    <main>
      {/* HERO */}
      <section className="grid-2">
        <div>
          <h1>Still don’t have a real social circle?</h1>

          <p>
            Vibley matches you into small local groups based on shared interests —
            so you actually meet people, not just scroll.
          </p>

          <div className="card" style={{ borderLeft: "4px solid #6c4ef7" }}>
            <p>
              🚫 No endless swiping <br />
              🤝 Real people near you <br />
              ☕ Meet within days, not weeks
            </p>
          </div>

          <br />

          <a href="#waitlist">Get Early Access</a>
        </div>

        <div className="card">
          <p>
            🎯 Join interest-based groups <br />
            🤝 Get matched with 3–5 people <br />
            ☕ Meet locally in real life
          </p>
        </div>
      </section>

      {/* WAITLIST */}
      <section id="waitlist">
        <h2>Join Early Access</h2>

        <p>
          Be part of the first Vibley groups launching soon.
        </p>

        <br />

        <WaitlistForm />
      </section>
    </main>
  );
}