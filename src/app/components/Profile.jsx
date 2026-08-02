import { Button } from "./Button";

export function ProfilePanel({ user, libraryCount, ratingsCount = 0, onEdit, onFavourite }) {
  if (!user) return null;
  const initials = user.initials || user.username?.slice(0, 2).toUpperCase();
  return (
    <section className="section profile">
      <aside className="panel profile-card">
        <div className="profile-avatar" style={{ backgroundColor: user.avatarColor || "#8b5cf6" }}>{initials}</div>
        <h2>{user.username}</h2>
        <p className="game-meta">{user.email}</p>
        <p>{user.bio || "A player building a personal history one game at a time."}</p>
      </aside>
      <article className="panel profile-main">
        <span className="eyebrow">Player profile</span>
        <h1>Your GamerDiary</h1>
        <p className="hero-copy">Favourite genre: <strong>{user.topGenre || "Action RPG"}</strong></p>
        <div className="profile-stats">
          <div className="profile-stat"><strong>{libraryCount}</strong><span>library games</span></div>
          <div className="profile-stat"><strong>{ratingsCount}</strong><span>ratings</span></div>
          <div className="profile-stat"><strong>{user.gamesPlayed || 0}</strong><span>completed</span></div>
        </div>
        <div className="details-actions">
          {onEdit && <Button onClick={onEdit}>Edit profile</Button>}
          {onFavourite && <Button variant="secondary" onClick={onFavourite}>Choose favourite</Button>}
        </div>
      </article>
    </section>
  );
}