import { useMemo, useState } from "react";
import { AppShell } from "./components/AppShell";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { LibrarySection } from "./components/Library";
import { DiscoverySections } from "./components/DiscoverySections";
import { GameDetails } from "./components/GameDetails";
import { AuthDialog } from "./components/AuthDialog";
import { ArrowButton } from "./components/ArrowButton";
import { CatalogToolbar } from "./components/Toolbar";
import { ProfilePanel } from "./components/Profile";
import { ActionDialog } from "./components/Action";

import { mockGames, mockUpcoming } from "./data/mockGames";

export default function App() {
  const [history, setHistory] = useState([{ type: "home" }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const view = history[historyIndex];
  const [randomGame, setRandomGame] = useState(mockGames[1]);
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState(null);
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("");
  const [action, setAction] = useState(null);
  const [notice, setNotice] = useState("");

  function navigate(next) {
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(next);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  }

  const visibleGames = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return mockGames.filter((game) => (!normalized || game.name.toLowerCase().includes(normalized)) && (!genre || game.genre === genre));
  }, [query, genre]);
  const genres = [...new Set(mockGames.map((game) => game.genre))];

  function pickRandom() {
    setRandomGame(mockGames[Math.floor(Math.random() * mockGames.length)]);
  }

  function submitAuth(form) {
    const username = form.username || form.email.split("@")[0] || "player";
    setUser({ username, email: form.email, initials: username.slice(0, 2).toUpperCase(), topGenre: "Action RPG", gamesPlayed: 2, bio: "Building a personal game history." });
    setAuthMode(null);
  }

  return (
    <>
      <Header
        user={user} onLogin={() => setAuthMode("login")} onRegister={() => setAuthMode("register")} onLogout={() => setUser(null)}
        onHome={() => navigate({ type: "home" })}
        onProfile={() => navigate({ type: "profile" })}
        historyControls={<div className="history-actions"><ArrowButton direction="back" enabled={historyIndex > 0} onClick={() => setHistoryIndex((index) => index - 1)} /><ArrowButton direction="forward" enabled={historyIndex < history.length - 1} onClick={() => setHistoryIndex((index) => index + 1)} /></div>}
      />
      <AppShell>
        {notice && <div className="notice" role="status">{notice}</div>}
        view.type === "profile" && user ? (
          <ProfilePanel user={user} libraryCount={mockGames.length} ratingsCount={2} onEdit={() => setAction("edit")} onFavourite={() => setAction("favourite")} />
        ) : 
        {view.type === "game" ? (
          <GameDetails game={view.game} onHome={() => navigate({ type: "home" })} onAdd={() => setAction("add")} />
        ) : (
          <>
            <Hero gamesCount={mockGames.length} libraryCount={mockGames.length} upcomingCount={mockUpcoming.length} />
            <section className="section"><CatalogToolbar query={query} genre={genre} genres={genres} onQuery={setQuery} onGenre={setGenre} /></section>
            <LibrarySection games={visibleGames} onOpen={(game) => navigate({ type: "game", game })} />
            <DiscoverySections games={mockGames} upcoming={mockUpcoming} randomGame={randomGame} onRandom={pickRandom} onOpen={(game) => navigate({ type: "game", game })} />
          </>
        )}
      </AppShell>
      <AuthDialog mode={authMode || "login"} open={Boolean(authMode)} onClose={() => setAuthMode(null)} onSubmit={submitAuth} />
      <ActionDialog open={Boolean(action)} title={action === "edit" ? "Edit profile" : action === "favourite" ? "Choose favourite game" : "Add game"} onClose={() => setAction(null)} onConfirm={() => { setNotice("Action saved in the frontend prototype."); setAction(null); }}>
        {action === "edit" ? <label className="field">Bio<textarea defaultValue={user?.bio || ""} /></label> : <label className="field">Game<select defaultValue={mockGames[0].id}>{mockGames.map((game) => <option key={game.id} value={game.id}>{game.name}</option>)}</select></label>}
      </ActionDialog>
    </>
  );
}