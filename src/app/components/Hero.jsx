export function Hero({ gamesCount = 0, upcomingCount = 0, libraryCount = 0 }) {
  return (
    <section className="hero panel">
      <span className="eyebrow">Your games. Your journey.</span>
      <h1>Keep every adventure in one <span className="accent">game diary</span>.</h1>
      <p className="hero-copy">
        Browse the catalog, remember what you played, choose what comes next,
        and keep personal ratings close to every game.
      </p>
      <div className="hero-stats">
        <div className="stat-pill"><strong>{gamesCount}</strong><span>catalog games</span></div>
        <div className="stat-pill"><strong>{libraryCount}</strong><span>in your library</span></div>
        <div className="stat-pill"><strong>{upcomingCount}</strong><span>upcoming</span></div>
      </div>
    </section>
  );
}
