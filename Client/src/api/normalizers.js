function getInitials(username = "") {
  return (
    username
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  );
}

function formatReleaseDate(date) {
  if (!date) return "TBA";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function formatReleasePeriod(date) {
  if (!date) return "Coming Soon";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function normalizeUser(raw) {
  if (!raw) return null;
  const statistics = raw.statistics || {};

  return {
    ...raw,
    avatarColor: raw.avatar_color || "#8b5cf6",
    initials: getInitials(raw.username),
    joinedYear: raw.joined_year,
    gamesPlayed: statistics.games_played || 0,
    libraryCount: statistics.library_count || 0,
    ratingsCount: statistics.ratings_count || 0,
    hoursLogged: statistics.hours_logged || 0,
    topGenre: raw.favorite_genre || "Action RPG",
    favoriteGameId: raw.favorite_game_id,
  };
}

export function normalizeGame(raw) {
  if (!raw) return null;

  return {
    ...raw,
    name: raw.title,
    color: raw.color || "#8b5cf6",
    initials: raw.initials || getInitials(raw.title),
    releaseDate: formatReleaseDate(raw.release_date),
    releasePeriod: formatReleasePeriod(raw.release_date),
    studio: raw.developer || raw.publisher || "Unknown studio",
    averageRating: raw.average_rating,
    ratingsCount: raw.ratings_count || 0,
    libraryEntry: raw.library_entry,
    currentUserRating: raw.current_user_rating,
  };
}

export function normalizeLibraryEntry(raw) {
  return {
    ...raw,
    game: normalizeGame(raw.game),
  };
}
