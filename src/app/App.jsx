import { useMemo, useState } from "react";
import { AppShell } from "./components/AppShell";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { LibrarySection } from "./components/Library";
import { DiscoverySections } from "./components/DiscoverySections";
import { GameDetails } from "./components/GameDetails";
import { AuthDialog } from "./components/AuthDialog";
import { ArrowButton } from "./components/ArrowButton";



import { mockGames, mockUpcoming } from "./data/mockGames";

export default function App() {
  const [history, setHistory] = useState([{ type: "home" }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const view = history[historyIndex];
  const [randomGame, setRandomGame] = useState(mockGames[1]);
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState(null);
  
  

  function navigate(next) {
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(next);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  }

  const visibleGames = useMemo(() => {
    return mockGames;
  }, []);
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
        
        historyControls={<div className="history-actions"><ArrowButton direction="back" enabled={historyIndex > 0} onClick={() => setHistoryIndex((index) => index - 1)} /><ArrowButton direction="forward" enabled={historyIndex < history.length - 1} onClick={() => setHistoryIndex((index) => index + 1)} /></div>}
      />
      <AppShell>
        
        
        {view.type === "game" ? (
          <GameDetails game={view.game} onHome={() => navigate({ type: "home" })}  />
        ) : (
          <>
            <Hero gamesCount={mockGames.length} libraryCount={mockGames.length} upcomingCount={mockUpcoming.length} />
            
            <LibrarySection games={visibleGames} onOpen={(game) => navigate({ type: "game", game })} />
            <DiscoverySections games={mockGames} upcoming={mockUpcoming} randomGame={randomGame} onRandom={pickRandom} onOpen={(game) => navigate({ type: "game", game })} />
          </>
        )}
      </AppShell>
      <AuthDialog mode={authMode || "login"} open={Boolean(authMode)} onClose={() => setAuthMode(null)} onSubmit={submitAuth} />
      
    </>
  );
}
