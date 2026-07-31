import { Button } from "./Button";

export function DiscoverySections({ games, upcoming, randomGame, onRandom, onOpen }) {
  const featured = randomGame || games[1] || games[0];
  return (
    <section className="section">
      <div className="section-heading"><div><h2>Discover</h2><p>Choose what to play next.</p></div></div>
      <div className="discovery-grid">
        <article className="panel discovery-card">
          <span className="eyebrow">Random game</span>
          {featured && (
            <div className="random-result">
              <span className="game-logo" style={{ backgroundColor: featured.color }}>{featured.initials}</span>
              <div><strong>{featured.name}</strong><div className="game-meta">{featured.genre || featured.studio}</div></div>
            </div>
          )}
          <div className="header-actions">
            <Button onClick={onRandom}>Pick another</Button>
            {featured && <Button variant="secondary" onClick={() => onOpen?.(featured)}>Open</Button>}
          </div>
        </article>
        <article className="panel discovery-card">
          <span className="eyebrow">Upcoming releases</span>
          <div className="upcoming-list">
            {upcoming.map((game) => (
              <div className="upcoming-row" key={game.id || game.slug}>
                <strong>{game.name}</strong><span>{game.releaseDate}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
