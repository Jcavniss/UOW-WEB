import { useState, useRef, useEffect } from "react";
import {
  Search,
  Library,
  Shuffle,
  CalendarDays,
  CheckCircle2,
  Gamepad2,
  Star,
  Plus,
  Check,
  ChevronDown,
  Play,
  ListPlus,
  Edit3,
  User as UserIcon,
  LogOut,
  BarChart2,
  Trophy,
} from "lucide-react";
import { Button } from "./components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./components/ui/dialog";
import { Label } from "./components/ui/label";
import { cn } from "./components/ui/utils";
import { ArrowButton } from "./components/ArrowButton";
import { GameCard } from "./components/GameCard";
import { GuestHeader } from "./components/GuestHeader";
import { LoginDialog } from "./components/LoginDialog";
import { RegisterDialog } from "./components/RegisterDialog";
import { UserHeader } from "./components/UserHeader";
import { FIELD_CLASS } from "./ui-constants";
import { authApi } from "../api/authApi";
import {
  getAuthToken,
  getErrorMessage,
  setAuthToken,
} from "../api/apiClient";
import { gamesApi } from "../api/gamesApi";
import { libraryApi } from "../api/libraryApi";
import { ratingsApi } from "../api/ratingsApi";

const API_TO_UI_STATUS = {
  playing: "Playing",
  completed: "Played",
  planned: "Want to Play",
  dropped: "Dropped",
  on_hold: "On Hold",
};
const UI_TO_API_STATUS = {
  Playing: "playing",
  Played: "completed",
  "Want to Play": "planned",
  Dropped: "dropped",
  "On Hold": "on_hold",
};

function getInitials(username) {
  const initials = username
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return initials || "U";
}

const PLATFORM_COLORS = {
  PC: "bg-secondary text-secondary-foreground",
  PS5: "bg-[#003087]/20 text-[#006fff]",
  Xbox: "bg-[#107c10]/20 text-[#52b043]",
  Switch: "bg-[#e4000f]/20 text-[#e4000f]",
};
const NAV_CARDS = [
  {
    id: "library",
    label: "Game Library",
    icon: Library,
    image:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=700&h=420&fit=crop&auto=format",
    description: "Browse your collection",
  },
  {
    id: "random",
    label: "Pick a Random Game",
    icon: Shuffle,
    image:
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=700&h=420&fit=crop&auto=format",
    description: "Let fate decide your next play",
  },
  {
    id: "upcoming",
    label: "Upcoming",
    icon: CalendarDays,
    image:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=700&h=420&fit=crop&auto=format",
    description: "What is coming next",
  },
];
export default function App() {
  const [user, setUser] = useState(null);
  const [games, setGames] = useState([]);
  const [upcomingGames, setUpcomingGames] = useState([]);
  const [userGameData, setUserGameData] = useState({});
  const [favouriteId, setFavouriteId] = useState(null);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [filteredCatalog, setFilteredCatalog] = useState(null);
  const [catalogFilters, setCatalogFilters] = useState({
    genre: "",
    platform: "",
    sort: "title",
  });
  const [authLoading, setAuthLoading] = useState(true);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [appError, setAppError] = useState("");
  const [appNotice, setAppNotice] = useState("");
  const [authError, setAuthError] = useState("");
  const noticeTimer = useRef(null);
  const isLoggedIn = user !== null;

  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const searchRef = useRef(null);
  const filteredGames = query.trim() ? searchResults : [];
  const visibleGames = filteredCatalog ?? games;
  const genreOptions = Array.from(
    new Set(games.map((game) => game.genre).filter(Boolean)),
  ).sort();
  const platformOptions = Array.from(
    new Set(games.flatMap((game) => game.platforms || [])),
  ).sort();

  const [history, setHistory] = useState([null]);
  const [histIndex, setHistIndex] = useState(0);
  const section = history[histIndex];

  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [epUsername, setEpUsername] = useState("");
  const [epDateOfBirth, setEpDateOfBirth] = useState("");
  const [epBio, setEpBio] = useState("");
  const [epNewPassword, setEpNewPassword] = useState("");
  const [epConfirmPassword, setEpConfirmPassword] = useState("");
  const [epAvatarColor, setEpAvatarColor] = useState("#8b5cf6");
  const [epAvatarInitials, setEpAvatarInitials] = useState("U");
  const [epAvatarData, setEpAvatarData] = useState(null);
  const [epAvatarPreview, setEpAvatarPreview] = useState(null);
  const avatarInputRef = useRef(null);

  const [openDropdown, setOpenDropdown] = useState(null);
  const [favouriteGenre, setFavouriteGenre] = useState("Action RPG");
  const [genreModalOpen, setGenreModalOpen] = useState(false);
  const [genreQuery, setGenreQuery] = useState("");
  const [genreSelected, setGenreSelected] = useState("Action RPG");
  const [favGameModalOpen, setFavGameModalOpen] = useState(false);
  const [favGameSelected, setFavGameSelected] = useState(null);
  const [addGameOpen, setAddGameOpen] = useState(false);
  const [addGameQuery, setAddGameQuery] = useState("");
  const [addGameSelected, setAddGameSelected] = useState(null);

  const [randomGame, setRandomGame] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const rollTimer = useRef(null);

  const AVATAR_PALETTE = [
    "#8b5cf6",
    "#06b6d4",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#ec4899",
    "#3b82f6",
    "#f97316",
  ];
  const ALL_GENRES = [
    "Action",
    "Action RPG",
    "Action Adventure",
    "Adventure",
    "Co-op Adventure",
    "FPS",
    "Metroidvania",
    "Open World",
    "Open World RPG",
    "Platformer",
    "Puzzle",
    "Racing",
    "RPG",
    "Roguelite",
    "Shooting",
    "Simulation",
    "Survival Horror",
    "Strategy",
    "Fighting",
    "Horror",
    "Sports",
    "Visual Novel",
  ];

  const addedGames = games.filter((game) => userGameData[game.id]?.inList);
  const addGameResults = addGameQuery.trim()
    ? games.filter((game) =>
        game.name.toLowerCase().includes(addGameQuery.toLowerCase()),
      )
    : games;
  const filteredGenres = genreQuery.trim()
    ? ALL_GENRES.filter((genre) =>
        genre.toLowerCase().includes(genreQuery.toLowerCase()),
      )
    : ALL_GENRES;
  const epUsernameEmpty = epUsername.trim() === "";
  const epPasswordMismatch =
    epNewPassword !== "" &&
    epConfirmPassword !== "" &&
    epNewPassword !== epConfirmPassword;
  const epHasChanges =
    user !== null &&
    (epUsername.trim() !== user.username ||
      epDateOfBirth !== (user.date_of_birth || "") ||
      epBio !== (user.bio || "") ||
      epNewPassword !== "" ||
      epAvatarColor !== user.avatarColor ||
      epAvatarData !== null);
  const epCanSave =
    epHasChanges &&
    !epUsernameEmpty &&
    !epPasswordMismatch &&
    (epNewPassword === "" || epNewPassword === epConfirmPassword);

  function notify(message) {
    setAppNotice(message);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setAppNotice(""), 3500);
  }

  function showError(error) {
    setAppError(getErrorMessage(error));
  }

  function applyUser(apiUser) {
    setUser(apiUser);
    setFavouriteId(apiUser.favoriteGameId ?? null);
    setFavouriteGenre(apiUser.topGenre || "Action RPG");
    setGenreSelected(apiUser.topGenre || "Action RPG");
  }

  function resetAuthenticatedState(message = "") {
    setUser(null);
    setUserGameData({});
    setFavouriteId(null);
    setFavouriteGenre("Action RPG");
    setGenreSelected("Action RPG");
    setEditProfileOpen(false);
    setAddGameOpen(false);
    setFavGameModalOpen(false);
    setGenreModalOpen(false);
    setHistory([null]);
    setHistIndex(0);
    if (message) setAppError(message);
  }

  function mergeCatalogGames(nextGames) {
    setGames((current) => {
      const merged = new Map(current.map((game) => [game.id, game]));
      nextGames.forEach((game) => {
        merged.set(game.id, { ...merged.get(game.id), ...game });
      });
      return Array.from(merged.values());
    });
  }

  function gameDataFromEntry(entry, previous = {}) {
    return {
      ...previous,
      inList: true,
      status: API_TO_UI_STATUS[entry.status] || "On Hold",
      score: entry.game.currentUserRating
        ? String(entry.game.currentUserRating.score)
        : previous.score || "",
      libraryId: entry.id,
      ratingId:
        entry.game.currentUserRating?.id ?? previous.ratingId ?? null,
      personalNotes: entry.personal_notes || "",
    };
  }

  function syncGameContext(game) {
    setUserGameData((previous) => {
      const current = previous[game.id] || {
        inList: false,
        status: "On Hold",
        score: "",
      };
      return {
        ...previous,
        [game.id]: {
          ...current,
          inList: Boolean(game.libraryEntry),
          status: game.libraryEntry
            ? API_TO_UI_STATUS[game.libraryEntry.status] || "On Hold"
            : current.status,
          libraryId: game.libraryEntry?.id ?? null,
          personalNotes:
            game.libraryEntry?.personal_notes ?? current.personalNotes ?? "",
          score: game.currentUserRating
            ? String(game.currentUserRating.score)
            : "",
          ratingId: game.currentUserRating?.id ?? null,
        },
      };
    });
  }

  async function loadLibrary() {
    const entries = await libraryApi.list({ per_page: 50 });
    const mapped = {};
    entries.forEach((entry) => {
      mapped[entry.game_id] = gameDataFromEntry(entry);
    });
    setUserGameData(mapped);
    mergeCatalogGames(entries.map((entry) => entry.game));
  }

  useEffect(() => {
    function handleUnauthorized() {
      resetAuthenticatedState(
        "Your session has expired. Please log in again.",
      );
    }
    window.addEventListener("gamerdiary:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("gamerdiary:unauthorized", handleUnauthorized);
  }, []);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      setCatalogLoading(true);
      setAppError("");

      const catalogPromise = Promise.all([
        gamesApi.list({ per_page: 50 }),
        gamesApi.upcoming(50),
      ])
        .then(([catalog, upcoming]) => {
          if (!active) return;
          setGames(catalog.games);
          setUpcomingGames(upcoming);
        })
        .catch((error) => {
          if (active) showError(error);
        })
        .finally(() => {
          if (active) setCatalogLoading(false);
        });

      if (getAuthToken()) {
        try {
          const currentUser = await authApi.currentUser();
          if (active) {
            applyUser(currentUser);
            await loadLibrary();
          }
        } catch (error) {
          if (active && error.status !== 401) showError(error);
        }
      }

      if (active) setAuthLoading(false);
      await catalogPromise;
    }

    bootstrap();
    return () => {
      active = false;
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    };
  }, []);

  useEffect(() => {
    const term = query.trim();
    if (!term) {
      setSearchResults([]);
      return undefined;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const result = await gamesApi.list(
          { search: term, per_page: 8 },
          { signal: controller.signal },
        );
        setSearchResults(result.games);
      } catch (error) {
        if (error.name !== "AbortError") showError(error);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    const hasFilters =
      catalogFilters.genre ||
      catalogFilters.platform ||
      catalogFilters.sort !== "title";
    if (!hasFilters) {
      setFilteredCatalog(null);
      return undefined;
    }

    const controller = new AbortController();
    setFilterLoading(true);
    gamesApi
      .list(
        {
          ...catalogFilters,
          order:
            catalogFilters.sort === "average_rating" ? "desc" : "asc",
          per_page: 50,
        },
        { signal: controller.signal },
      )
      .then((result) => setFilteredCatalog(result.games))
      .catch((error) => {
        if (error.name !== "AbortError") showError(error);
      })
      .finally(() => setFilterLoading(false));

    return () => controller.abort();
  }, [catalogFilters]);

  useEffect(() => {
    function handleClick(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    function handleOutside(event) {
      if (!event.target.closest("[data-dropdown]")) setOpenDropdown(null);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(
    () => () => {
      if (rollTimer.current) clearInterval(rollTimer.current);
    },
    [],
  );

  function navigateTo(destination) {
    if (destination === "profile" && !isLoggedIn) {
      setLoginOpen(true);
      return;
    }
    const next = history.slice(0, histIndex + 1);
    next.push(destination);
    setHistory(next);
    setHistIndex(next.length - 1);
  }

  function goBack() {
    if (histIndex <= 0) return;
    if (history[histIndex - 1] === "profile" && !isLoggedIn) {
      setLoginOpen(true);
      return;
    }
    setHistIndex((index) => index - 1);
  }

  function goForward() {
    if (histIndex >= history.length - 1) return;
    if (history[histIndex + 1] === "profile" && !isLoggedIn) {
      setLoginOpen(true);
      return;
    }
    setHistIndex((index) => index + 1);
  }

  async function handleGameClick(game) {
    setSelectedGame(game);
    setQuery(game.name);
    setSearchOpen(false);
    navigateTo("game");
    setActionBusy(true);
    try {
      const detail = await gamesApi.get(game.slug);
      setSelectedGame(detail);
      mergeCatalogGames([detail]);
      if (isLoggedIn) syncGameContext(detail);
    } catch (error) {
      showError(error);
    } finally {
      setActionBusy(false);
    }
  }

  function getGameData(id) {
    return (
      userGameData[id] ?? { inList: false, status: "On Hold", score: "" }
    );
  }

  async function refreshGame(game) {
    const detail = await gamesApi.get(game.slug);
    mergeCatalogGames([detail]);
    if (selectedGame?.id === detail.id) setSelectedGame(detail);
    syncGameContext(detail);
  }

  async function patchGameData(id, patch) {
    if (!isLoggedIn) {
      setLoginOpen(true);
      return false;
    }

    const game = games.find((item) => item.id === id) || selectedGame;
    if (!game) return false;

    const current = getGameData(id);
    let next = { ...current, ...patch };
    setActionBusy(true);
    setAppError("");

    try {
      if (patch.inList === false) {
        if (current.libraryId) {
          await libraryApi.remove(current.libraryId);
        }
        next = { ...next, inList: false, libraryId: null };
        if (favouriteId === id) {
          const updatedUser = await authApi.updateProfile({
            favorite_game_id: null,
          });
          applyUser(updatedUser);
        }
        notify("Game removed from your library.");
      } else if (
        (patch.inList === true || patch.status !== undefined) &&
        !current.libraryId
      ) {
        const entry = await libraryApi.create({
          game_id: id,
          status: UI_TO_API_STATUS[patch.status || "On Hold"],
        });
        next = gameDataFromEntry(entry, next);
        notify("Game added to your library.");
      } else if (patch.status !== undefined && current.libraryId) {
        const entry = await libraryApi.update(current.libraryId, {
          status: UI_TO_API_STATUS[patch.status],
        });
        next = gameDataFromEntry(entry, next);
        notify("Game status updated.");
      }

      if (patch.score !== undefined) {
        if (patch.score === "" && current.ratingId) {
          await ratingsApi.remove(game.slug, current.ratingId);
          next.score = "";
          next.ratingId = null;
          notify("Rating removed.");
        } else if (patch.score !== "") {
          const rating = current.ratingId
            ? await ratingsApi.update(game.slug, current.ratingId, {
                score: Number(patch.score),
              })
            : await ratingsApi.create(game.slug, {
                score: Number(patch.score),
              });
          next.score = String(rating.score);
          next.ratingId = rating.id;
          notify(current.ratingId ? "Rating updated." : "Rating saved.");
        }
      }

      setUserGameData((previous) => ({ ...previous, [id]: next }));
      await refreshGame(game);
      return true;
    } catch (error) {
      showError(error);
      return false;
    } finally {
      setActionBusy(false);
    }
  }

  async function addToList(id) {
    if (!isLoggedIn) {
      setLoginOpen(true);
      return false;
    }
    return patchGameData(id, { inList: true, status: "On Hold" });
  }

  async function toggleFavourite(id) {
    if (!isLoggedIn) {
      setLoginOpen(true);
      return;
    }
    if (favouriteId !== id && !getGameData(id).inList) {
      setAppError("Add the game to your library before making it a favorite.");
      return;
    }

    setActionBusy(true);
    try {
      const updatedUser = await authApi.updateProfile({
        favorite_game_id: favouriteId === id ? null : id,
      });
      applyUser(updatedUser);
      notify(
        favouriteId === id
          ? "Favorite game cleared."
          : "Favorite game updated.",
      );
    } catch (error) {
      showError(error);
    } finally {
      setActionBusy(false);
    }
  }

  function openEditProfile() {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    setEpUsername(user.username);
    setEpDateOfBirth(user.date_of_birth || "");
    setEpBio(user.bio || "");
    setEpNewPassword("");
    setEpConfirmPassword("");
    setEpAvatarColor(user.avatarColor);
    setEpAvatarInitials(user.initials);
    setEpAvatarData(null);
    setEpAvatarPreview(user.avatar || null);
    setEditProfileOpen(true);
  }

  async function handleEditProfileSave(event) {
    event.preventDefault();
    if (!epCanSave) return;
    setActionBusy(true);
    try {
      const payload = {
        username: epUsername.trim(),
        date_of_birth: epDateOfBirth || null,
        bio: epBio.trim() || null,
        avatar_color: epAvatarColor,
      };
      if (epNewPassword) {
        payload.password = epNewPassword;
        payload.password_confirmation = epConfirmPassword;
      }
      if (epAvatarData) payload.avatar = epAvatarData;

      const updatedUser = await authApi.updateProfile(payload);
      applyUser(updatedUser);
      setEditProfileOpen(false);
      notify("Profile updated.");
    } catch (error) {
      showError(error);
    } finally {
      setActionBusy(false);
    }
  }

  function handleAvatarChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setAppError("Avatar must be a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAppError("Avatar must not exceed 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setEpAvatarData(reader.result);
      setEpAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function openGenreModal() {
    if (!isLoggedIn) {
      setLoginOpen(true);
      return;
    }
    setGenreSelected(favouriteGenre);
    setGenreQuery("");
    setGenreModalOpen(true);
  }

  async function saveFavoriteGenre() {
    if (!genreSelected) return;
    setActionBusy(true);
    try {
      const updatedUser = await authApi.updateProfile({
        favorite_genre: genreSelected,
      });
      applyUser(updatedUser);
      setGenreModalOpen(false);
      notify("Favorite genre updated.");
    } catch (error) {
      showError(error);
    } finally {
      setActionBusy(false);
    }
  }

  function openFavGameModal() {
    if (!isLoggedIn) {
      setLoginOpen(true);
      return;
    }
    setFavGameSelected(favouriteId);
    setFavGameModalOpen(true);
  }

  async function saveFavoriteGame() {
    setActionBusy(true);
    try {
      const updatedUser = await authApi.updateProfile({
        favorite_game_id: favGameSelected,
      });
      applyUser(updatedUser);
      setFavGameModalOpen(false);
      notify("Favorite game updated.");
    } catch (error) {
      showError(error);
    } finally {
      setActionBusy(false);
    }
  }

  function openAddGame() {
    if (!isLoggedIn) {
      setLoginOpen(true);
      return;
    }
    setAddGameQuery("");
    setAddGameSelected(null);
    setAddGameOpen(true);
  }

  async function handleAddGame() {
    if (!isLoggedIn) {
      setAddGameOpen(false);
      setLoginOpen(true);
      return;
    }
    if (!addGameSelected) return;
    const succeeded = await addToList(addGameSelected.id);
    if (succeeded) setAddGameOpen(false);
  }

  async function handleLogin(credentials) {
    setAuthSubmitting(true);
    setAuthError("");
    try {
      const result = await authApi.login(credentials);
      applyUser(result.user);
      await loadLibrary();
      setLoginOpen(false);
      notify("Welcome back.");
      return true;
    } catch (error) {
      setAuthError(getErrorMessage(error));
      return false;
    } finally {
      setAuthSubmitting(false);
    }
  }

  async function handleRegister(data) {
    setAuthSubmitting(true);
    setAuthError("");
    try {
      const result = await authApi.register(data);
      applyUser(result.user);
      setUserGameData({});
      setRegisterOpen(false);
      setSuccessOpen(true);
      return true;
    } catch (error) {
      setAuthError(getErrorMessage(error));
      return false;
    } finally {
      setAuthSubmitting(false);
    }
  }

  async function handleLogout() {
    setActionBusy(true);
    try {
      await authApi.logout();
    } catch (error) {
      showError(error);
    } finally {
      setAuthToken(null);
      resetAuthenticatedState();
      notify("You have been logged out.");
      setActionBusy(false);
    }
  }

  function openProfile() {
    if (!isLoggedIn) {
      setLoginOpen(true);
      return;
    }
    navigateTo("profile");
  }

  const canBack = histIndex > 0;
  const canForward = histIndex < history.length - 1;

  async function pickRandom() {
    if (isRolling || games.length === 0) return;
    setIsRolling(true);
    setSuggestions([]);
    let ticks = 0;
    rollTimer.current = setInterval(() => {
      setRandomGame(games[ticks % games.length]);
      ticks += 1;
    }, 75);

    try {
      const [finalGame] = await Promise.all([
        gamesApi.random({
          source:
            isLoggedIn && addedGames.length > 0 ? "library" : "catalog",
        }),
        new Promise((resolve) => setTimeout(resolve, 900)),
      ]);
      setRandomGame(finalGame);
      mergeCatalogGames([finalGame]);
      setSuggestions(
        games.filter((game) => game.id !== finalGame.id).slice(0, 3),
      );
    } catch (error) {
      showError(error);
    } finally {
      clearInterval(rollTimer.current);
      setIsRolling(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ── HEADER ── */}
      <header className="w-full border-b border-border bg-card/40 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto px-10 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Gamepad2 className="size-5 text-primary" />
            </div>
            <span
              className="text-[22px] font-bold tracking-wide leading-none"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="text-foreground">Gamer</span>
              <span className="text-primary">Diary</span>
            </span>
          </div>

          {user ? (
            <UserHeader
              user={user}
              onProfile={openProfile}
              onLogout={handleLogout}
            />
          ) : (
            <GuestHeader
              onLogin={() => {
                setAuthError("");
                setLoginOpen(true);
              }}
              onRegister={() => {
                setAuthError("");
                setRegisterOpen(true);
              }}
            />
          )}
        </div>
      </header>

      {(authLoading || catalogLoading || filterLoading || actionBusy) && (
        <div
          role="status"
          className="w-full bg-primary/10 border-b border-primary/20 px-10 py-2 text-center text-sm text-primary"
        >
          {authLoading || catalogLoading || filterLoading
            ? "Loading GamerDiary data..."
            : "Saving changes..."}
        </div>
      )}
      {appError && (
        <div
          role="alert"
          className="w-full bg-rose-500/10 border-b border-rose-500/20 px-10 py-2.5 flex items-center justify-center gap-4 text-sm text-rose-300"
        >
          <span>{appError}</span>
          <button
            type="button"
            onClick={() => setAppError("")}
            className="text-rose-200 underline underline-offset-2"
          >
            Dismiss
          </button>
        </div>
      )}
      {appNotice && (
        <div
          role="status"
          className="w-full bg-emerald-500/10 border-b border-emerald-500/20 px-10 py-2.5 text-center text-sm text-emerald-300"
        >
          {appNotice}
        </div>
      )}

      {/* ── SEARCH ── */}
      <div className="w-full border-b border-border bg-muted/30 px-10 py-5">
        <div className="max-w-[1440px] mx-auto">
          <div className="relative" ref={searchRef}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground pointer-events-none z-10" />
            <input
              type="text"
              placeholder="Search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => {
                if (query.trim()) setSearchOpen(true);
              }}
              className="w-full h-13 bg-secondary/50 border border-border rounded-2xl pl-12 pr-5 text-base text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              style={{ height: "52px" }}
            />

            {/* Dropdown */}
            {searchOpen && filteredGames.length > 0 && (
              <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden">
                {filteredGames.map((game, idx) => (
                  <button
                    key={game.id}
                    onClick={() => handleGameClick(game)}
                    className={cn(
                      "w-full flex items-center gap-4 px-5 py-3.5 hover:bg-secondary/70 transition-colors text-left group",
                      idx !== filteredGames.length - 1 &&
                        "border-b border-border/50",
                    )}
                  >
                    {/* Game logo */}
                    <div
                      className="size-10 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-md"
                      style={{
                        backgroundColor: game.color,
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {game.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {game.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {game.genre}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {searchOpen && query.trim() && filteredGames.length === 0 && (
              <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-card border border-border rounded-2xl shadow-2xl z-50 px-5 py-4 text-sm text-muted-foreground">
                No games found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── NAVIGATION CARDS ── */}
      <div className="w-full px-10 py-10">
        <div className="max-w-[1440px] mx-auto">
          {/* Cards */}
          <div className="grid grid-cols-3 gap-5">
            {NAV_CARDS.map((card) => {
              const Icon = card.icon;
              const isActive = section === card.id;
              return (
                <button
                  key={card.id}
                  onClick={() => navigateTo(card.id)}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border text-left transition-all duration-300 focus:outline-none",
                    isActive
                      ? "border-primary ring-2 ring-primary/30 shadow-lg shadow-primary/10"
                      : "border-border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5",
                  )}
                  style={{ height: "240px" }}
                >
                  {/* Background image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    style={{
                      backgroundImage: `url(${card.image})`,
                      backgroundColor: "#1c1e2e",
                    }}
                  />
                  {/* Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/5" />
                  {/* Active tint */}
                  {isActive && (
                    <div className="absolute inset-0 bg-primary/12" />
                  )}

                  {/* Content */}
                  <div className="relative h-full flex flex-col justify-end p-6">
                    <div
                      className={cn(
                        "size-9 rounded-xl flex items-center justify-center mb-3 transition-colors",
                        isActive
                          ? "bg-primary"
                          : "bg-white/10 group-hover:bg-primary/70",
                      )}
                    >
                      <Icon className="size-4 text-white" />
                    </div>
                    <h3
                      className="text-white text-xl font-bold leading-tight"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {card.label}
                    </h3>
                    <p className="text-white/55 text-sm mt-1 leading-snug">
                      {card.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── SECTION CONTENT ── */}
      {section && (
        <div className="w-full px-10 pb-20 flex-1">
          <div className="max-w-[1440px] mx-auto">
            {/* ── GAME LIBRARY ── */}
            {section === "library" && (
              <div>
                {/* Section header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-primary/15 flex items-center justify-center">
                      <Library className="size-5 text-primary" />
                    </div>
                    <h2
                      className="text-2xl font-bold text-foreground"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Game Library
                    </h2>
                    <span className="text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full border border-border">
                      {visibleGames.length} games
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowButton
                      direction="left"
                      enabled={canBack}
                      onClick={goBack}
                    />
                    <ArrowButton
                      direction="right"
                      enabled={canForward}
                      onClick={goForward}
                    />
                  </div>
                </div>

                {/* Game grid */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <select
                    aria-label="Filter games by genre"
                    value={catalogFilters.genre}
                    onChange={(event) =>
                      setCatalogFilters((current) => ({
                        ...current,
                        genre: event.target.value,
                      }))
                    }
                    className="bg-secondary/60 border border-border rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:border-primary/60"
                  >
                    <option value="">All genres</option>
                    {genreOptions.map((genre) => (
                      <option key={genre} value={genre}>
                        {genre}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="Filter games by platform"
                    value={catalogFilters.platform}
                    onChange={(event) =>
                      setCatalogFilters((current) => ({
                        ...current,
                        platform: event.target.value,
                      }))
                    }
                    className="bg-secondary/60 border border-border rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:border-primary/60"
                  >
                    <option value="">All platforms</option>
                    {platformOptions.map((platform) => (
                      <option key={platform} value={platform}>
                        {platform}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="Sort games"
                    value={catalogFilters.sort}
                    onChange={(event) =>
                      setCatalogFilters((current) => ({
                        ...current,
                        sort: event.target.value,
                      }))
                    }
                    className="bg-secondary/60 border border-border rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:border-primary/60"
                  >
                    <option value="title">Title</option>
                    <option value="release_date">Release date</option>
                    <option value="average_rating">Rating</option>
                  </select>
                </div>

                {catalogLoading || filterLoading ? (
                  <div className="rounded-2xl border border-border bg-card/40 py-16 text-center text-muted-foreground">
                    Loading games...
                  </div>
                ) : visibleGames.length === 0 ? (
                  <div className="rounded-2xl border border-border bg-card/40 py-16 text-center text-muted-foreground">
                    No games match the selected filters.
                  </div>
                ) : (
                  <div className="grid grid-cols-5 gap-5">
                    {visibleGames.map((game) => (
                      <GameCard
                        key={game.id}
                        game={game}
                        onClick={() => handleGameClick(game)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── RANDOM GAME ── */}
            {section === "random" && (
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-primary/15 flex items-center justify-center">
                      <Shuffle className="size-5 text-primary" />
                    </div>
                    <h2
                      className="text-2xl font-bold text-foreground"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Pick a Random Game
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowButton
                      direction="left"
                      enabled={canBack}
                      onClick={goBack}
                    />
                    <ArrowButton
                      direction="right"
                      enabled={canForward}
                      onClick={goForward}
                    />
                  </div>
                </div>

                {/* Empty state */}
                {!randomGame && !isRolling && (
                  <div className="rounded-2xl border border-border bg-card/40 py-20 flex flex-col items-center gap-5 text-center">
                    <div className="relative">
                      <div className="size-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Shuffle className="size-10 text-primary" />
                      </div>
                      <div className="absolute inset-0 rounded-3xl bg-primary/5 blur-xl scale-150 -z-10" />
                    </div>
                    <div>
                      <h3
                        className="text-xl font-bold text-foreground mb-2"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        Let fate choose your next game
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {isLoggedIn && addedGames.length > 0
                          ? `From your library of ${addedGames.length} games`
                          : `From the catalog of ${games.length} games`}
                      </p>
                    </div>
                    <Button
                      className="bg-primary hover:bg-primary/90 text-white px-8 h-11 text-base gap-2"
                      onClick={pickRandom}
                      disabled={catalogLoading || games.length === 0}
                    >
                      <Shuffle className="size-4" />
                      Pick a Random Game
                    </Button>
                  </div>
                )}

                {/* Result state */}
                {(randomGame || isRolling) && (
                  <div className="flex flex-col gap-6">
                    {/* Featured card */}
                    <div
                      className={cn(
                        "rounded-2xl border bg-card overflow-hidden flex transition-all duration-150",
                        isRolling
                          ? "border-primary/40 opacity-80"
                          : "border-border",
                      )}
                    >
                      {/* Logo panel */}
                      <div
                        className="relative flex-none w-64 flex items-center justify-center"
                        style={{
                          backgroundColor: randomGame
                            ? randomGame.color + "22"
                            : "#1c1e2e",
                        }}
                      >
                        {randomGame && (
                          <div
                            className={cn(
                              "size-24 rounded-3xl flex items-center justify-center text-3xl font-bold text-white shadow-xl transition-transform duration-100",
                              isRolling ? "scale-90 blur-[1px]" : "scale-100",
                            )}
                            style={{
                              backgroundColor: randomGame.color,
                              fontFamily: "var(--font-display)",
                            }}
                          >
                            {randomGame.initials}
                          </div>
                        )}
                        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-r from-transparent to-card" />
                      </div>

                      {/* Info panel */}
                      <div className="flex-1 flex flex-col justify-center gap-5 px-10 py-10">
                        <div>
                          <span className="inline-block text-xs text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-3">
                            {randomGame?.genre ?? "—"}
                          </span>
                          <h3
                            className={cn(
                              "text-4xl font-bold text-foreground leading-tight transition-all duration-100",
                              isRolling && "blur-[2px] opacity-60",
                            )}
                            style={{ fontFamily: "var(--font-display)" }}
                          >
                            {randomGame?.name ?? "—"}
                          </h3>
                        </div>

                        <div className="h-px bg-border" />

                        <div className="flex items-center gap-3">
                          <Button
                            className="bg-primary hover:bg-primary/90 text-white gap-2"
                            onClick={pickRandom}
                            disabled={isRolling}
                          >
                            <Shuffle className="size-4" />
                            {isRolling ? "Rolling…" : "Pick Again"}
                          </Button>
                          <Button
                            variant="outline"
                            className="border-border text-foreground hover:bg-secondary hover:text-foreground gap-2"
                            disabled={isRolling || !randomGame}
                            onClick={() =>
                              randomGame && handleGameClick(randomGame)
                            }
                          >
                            View Game
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-4">
                          You might also enjoy
                        </p>
                        <div className="grid grid-cols-3 gap-5">
                          {suggestions.map((game) => (
                            <GameCard
                              key={game.id}
                              game={game}
                              onClick={() => handleGameClick(game)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── UPCOMING games ── */}
            {section === "upcoming" &&
              (() => {
                const periods = upcomingGames.map(
                  (g) => g.releasePeriod,
                ).filter((p, i, arr) => arr.indexOf(p) === i);
                return (
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-primary/15 flex items-center justify-center">
                          <CalendarDays className="size-5 text-primary" />
                        </div>
                        <h2
                          className="text-2xl font-bold text-foreground"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          Upcoming Games
                        </h2>
                        <span className="text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full border border-border">
                          {upcomingGames.length} releases
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowButton
                          direction="left"
                          enabled={canBack}
                          onClick={goBack}
                        />
                        <ArrowButton
                          direction="right"
                          enabled={canForward}
                          onClick={goForward}
                        />
                      </div>
                    </div>

                    {!catalogLoading && upcomingGames.length === 0 && (
                      <div className="rounded-2xl border border-border bg-card/40 py-16 text-center text-muted-foreground">
                        No upcoming releases are available.
                      </div>
                    )}

                    {/* Release groups */}
                    <div className="flex flex-col gap-8">
                      {periods.map((period) => {
                        const periodGames = upcomingGames.filter(
                          (g) => g.releasePeriod === period,
                        );
                        const isComingSoon = period === "Coming Soon";
                        return (
                          <div key={period}>
                            {/* Period label */}
                            <div className="flex items-center gap-3 mb-4">
                              <span
                                className="text-sm font-semibold text-foreground"
                                style={{ fontFamily: "var(--font-display)" }}
                              >
                                {period}
                              </span>
                              <div className="flex-1 h-px bg-border" />
                              {isComingSoon && (
                                <span className="text-xs text-muted-foreground bg-secondary border border-border px-2.5 py-0.5 rounded-full">
                                  TBD
                                </span>
                              )}
                            </div>

                            {/* Game rows */}
                            <div className="flex flex-col gap-3">
                              {periodGames.map((game) => (
                                <button
                                  key={game.id}
                                  onClick={() => handleGameClick(game)}
                                  className="group w-full flex items-center gap-5 bg-card border border-border rounded-2xl px-6 py-4 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/8 transition-all duration-200 text-left"
                                >
                                  {/* Logo */}
                                  <div
                                    className="size-12 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-none shadow-md group-hover:scale-105 transition-transform duration-200"
                                    style={{
                                      backgroundColor: game.color,
                                      fontFamily: "var(--font-display)",
                                    }}
                                  >
                                    {game.initials}
                                  </div>

                                  {/* Name + studio */}
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className="font-bold text-foreground group-hover:text-primary transition-colors truncate"
                                      style={{
                                        fontFamily: "var(--font-display)",
                                      }}
                                    >
                                      {game.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {game.genre} · {game.studio}
                                    </p>
                                  </div>

                                  {/* Platforms */}
                                  <div className="flex items-center gap-1.5 flex-none">
                                    {game.platforms.map((p) => (
                                      <span
                                        key={p}
                                        className={cn(
                                          "text-xs px-2 py-0.5 rounded-md font-medium border border-transparent",
                                          PLATFORM_COLORS[p] ??
                                            "bg-secondary text-secondary-foreground",
                                        )}
                                      >
                                        {p}
                                      </span>
                                    ))}
                                  </div>

                                  {/* Release date */}
                                  <div className="flex-none text-right min-w-[100px]">
                                    <span
                                      className={cn(
                                        "text-sm font-semibold",
                                        isComingSoon
                                          ? "text-muted-foreground"
                                          : "text-primary",
                                      )}
                                      style={{
                                        fontFamily: "var(--font-display)",
                                      }}
                                    >
                                      {game.releaseDate}
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

            {/* ── GAME PAGE ── */}
            {section === "game" &&
              selectedGame &&
              (() => {
                const gd = getGameData(selectedGame.id);
                const isFav = favouriteId === selectedGame.id;
                const SELECT_CLASS =
                  "appearance-none w-full bg-secondary/60 border border-border rounded-xl pl-4 pr-10 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer";
                return (
                  <div>
                    {/* Section header */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="size-8 rounded-lg flex-none flex items-center justify-center text-xs font-bold text-white"
                          style={{
                            backgroundColor: selectedGame.color,
                            fontFamily: "var(--font-display)",
                          }}
                        >
                          {selectedGame.initials}
                        </div>
                        <h2
                          className="text-2xl font-bold text-foreground truncate"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {selectedGame.name}
                        </h2>
                        <span className="text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full border border-border flex-none">
                          {selectedGame.genre}
                        </span>
                        <span className="text-sm text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20 flex-none">
                          <Star className="size-3.5 inline mr-1" />
                          {selectedGame.averageRating ?? "—"} (
                          {selectedGame.ratingsCount ?? 0})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-none">
                        <ArrowButton
                          direction="left"
                          enabled={canBack}
                          onClick={goBack}
                        />
                        <ArrowButton
                          direction="right"
                          enabled={canForward}
                          onClick={goForward}
                        />
                      </div>
                    </div>

                    {/* Main two-column layout */}
                    <div className="grid grid-cols-[380px_1fr] gap-7">
                      {/* ── LEFT COLUMN ── */}
                      <div className="flex flex-col gap-5">
                        {/* Logo panel */}
                        <div
                          className="rounded-2xl border border-border overflow-hidden flex flex-col items-center justify-center gap-4 py-10"
                          style={{ backgroundColor: selectedGame.color + "14" }}
                        >
                          <div
                            className="size-28 rounded-3xl flex items-center justify-center text-4xl font-bold text-white shadow-2xl"
                            style={{
                              backgroundColor: selectedGame.color,
                              fontFamily: "var(--font-display)",
                            }}
                          >
                            {selectedGame.initials}
                          </div>
                          <div className="text-center px-6">
                            <h3
                              className="text-xl font-bold text-foreground"
                              style={{ fontFamily: "var(--font-display)" }}
                            >
                              {selectedGame.name}
                            </h3>
                            <span className="inline-block mt-2 text-xs text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
                              {selectedGame.genre}
                            </span>
                          </div>
                        </div>

                        {/* User Diary panel */}
                        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-5">
                          <h4 className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">
                            Your Diary
                          </h4>

                          {/* Action buttons */}
                          <div className="flex items-center gap-3">
                            {!gd.inList ? (
                              <Button
                                className="flex-1 bg-primary hover:bg-primary/90 text-white gap-2"
                                onClick={() => addToList(selectedGame.id)}
                                disabled={actionBusy}
                              >
                                <ListPlus className="size-4" />
                                Add to List
                              </Button>
                            ) : (
                              <Button
                                className="flex-1 bg-primary/15 hover:bg-primary/20 text-primary border border-primary/30 gap-2"
                                variant="ghost"
                                disabled={actionBusy}
                                onClick={() =>
                                  patchGameData(selectedGame.id, {
                                    inList: false,
                                  })
                                }
                              >
                                <Check className="size-4" />
                                In Your List
                              </Button>
                            )}

                            <button
                              onClick={() => toggleFavourite(selectedGame.id)}
                              disabled={actionBusy}
                              className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200",
                                isFav
                                  ? "bg-yellow-500/15 border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/20"
                                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground bg-secondary/40",
                              )}
                            >
                              <Star
                                className="size-4"
                                fill={isFav ? "currentColor" : "none"}
                              />
                              {isFav ? "Favourite" : "Make Favourite"}
                            </button>
                          </div>

                          {/* Divider */}
                          <div className="h-px bg-border" />

                          {/* Status */}
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                              Status
                            </label>
                            <div className="relative">
                              <select
                                value={gd.status}
                                disabled={actionBusy}
                                onChange={(e) =>
                                  patchGameData(selectedGame.id, {
                                    status: e.target.value,
                                  })
                                }
                                className={SELECT_CLASS}
                              >
                                <option value="Playing">Playing</option>
                                <option value="Played">Played</option>
                                <option value="Want to Play">
                                  Want to Play
                                </option>
                                <option value="On Hold">On Hold</option>
                                <option value="Dropped">Dropped</option>
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                            </div>
                          </div>

                          {/* Score */}
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                              Score
                            </label>
                            <div className="relative">
                              <select
                                value={gd.score}
                                disabled={actionBusy}
                                onChange={(e) =>
                                  patchGameData(selectedGame.id, {
                                    score: e.target.value,
                                  })
                                }
                                className={SELECT_CLASS}
                              >
                                <option value="">— No score yet</option>
                                {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((n) => (
                                  <option key={n} value={String(n)}>
                                    {n} —{" "}
                                    {
                                      [
                                        "",
                                        "Appalling",
                                        "Horrible",
                                        "Very Bad",
                                        "Bad",
                                        "Average",
                                        "Fine",
                                        "Good",
                                        "Very Good",
                                        "Great",
                                        "Masterpiece",
                                      ][n]
                                    }
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                            </div>
                          </div>

                          {/* Status summary pill — shown when added */}
                          {gd.inList && (
                            <div className="flex items-center gap-2 bg-secondary/40 border border-border rounded-xl px-4 py-3">
                              <div className="size-2 rounded-full bg-primary flex-none" />
                              <span className="text-xs text-muted-foreground">
                                Status:{" "}
                                <span className="text-foreground font-medium">
                                  {gd.status}
                                </span>
                                {gd.score && (
                                  <>
                                    {" "}
                                    · Score:{" "}
                                    <span className="text-foreground font-medium">
                                      {gd.score}/10
                                    </span>
                                  </>
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ── RIGHT COLUMN ── */}
                      <div className="flex flex-col gap-5">
                        {/* YouTube Trailer placeholder */}
                        <div className="rounded-2xl border border-border overflow-hidden bg-card">
                          <div
                            className="relative w-full flex items-center justify-center"
                            style={{
                              aspectRatio: "16/9",
                              backgroundColor: selectedGame.color + "12",
                            }}
                          >
                            {/* Scanline texture overlay */}
                            <div
                              className="absolute inset-0 opacity-5"
                              style={{
                                backgroundImage:
                                  "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.6) 2px, rgba(255,255,255,0.6) 3px)",
                              }}
                            />
                            {/* Subtle vignette */}
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.5)_100%)]" />
                            {/* Play button */}
                            <div className="relative group flex flex-col items-center gap-4">
                              <div className="size-20 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center backdrop-blur-sm group-hover:bg-primary/30 group-hover:border-primary/60 transition-all duration-300">
                                <Play className="size-8 text-white fill-white ml-1" />
                              </div>
                              <span className="text-white/70 text-sm font-medium group-hover:text-white transition-colors">
                                Official Trailer
                              </span>
                            </div>
                            {/* YouTube badge */}
                            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/60 rounded-lg px-3 py-1.5 backdrop-blur-sm">
                              <svg
                                className="size-4"
                                viewBox="0 0 24 24"
                                fill="#ff0000"
                              >
                                <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.6 5.8a3 3 0 0 0 2.1 2.1C4.5 20.5 12 20.5 12 20.5s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z" />
                              </svg>
                              <span className="text-white/80 text-xs">
                                YouTube
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-3">
                          <h4 className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">
                            About
                          </h4>
                          <p className="text-sm text-foreground/80 leading-relaxed">
                            {selectedGame.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

            {/* ── PROFILE PAGE ── */}
            {section === "profile" &&
              user &&
              (() => {
                const playedGames = games.filter(
                  (g) => userGameData[g.id]?.status === "Played",
                );
                const scoredGames = games.filter(
                  (g) => userGameData[g.id]?.score,
                );
                const avgScore = scoredGames.length
                  ? (
                      scoredGames.reduce(
                        (sum, g) => sum + Number(userGameData[g.id].score),
                        0,
                      ) / scoredGames.length
                    ).toFixed(1)
                  : null;
                const favGame = favouriteId
                  ? games.find((g) => g.id === favouriteId)
                  : null;
                return (
                  <div>
                    {/* Section header */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-primary/15 flex items-center justify-center">
                          <UserIcon className="size-5 text-primary" />
                        </div>
                        <h2
                          className="text-2xl font-bold text-foreground"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          My Profile
                        </h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowButton
                          direction="left"
                          enabled={canBack}
                          onClick={goBack}
                        />
                        <ArrowButton
                          direction="right"
                          enabled={canForward}
                          onClick={goForward}
                        />
                      </div>
                    </div>

                    {/* Profile layout: left sidebar + right content */}
                    <div className="grid grid-cols-[320px_1fr] gap-7">
                      {/* ── LEFT: Identity card ── */}
                      <div className="flex flex-col gap-5">
                        {/* Avatar + identity */}
                        <div className="relative rounded-2xl border border-border bg-card overflow-hidden">
                          {/* Log Out — absolute top-right, outside the flow */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-3 right-3 z-10 h-7 px-2.5 text-xs text-white bg-red-900/70 hover:bg-red-800/80 active:bg-red-950 border border-red-800/60 gap-1.5 transition-colors duration-150"
                            onClick={handleLogout}
                            disabled={actionBusy}
                          >
                            <LogOut className="size-3" />
                            Log Out
                          </Button>

                          {/* Banner */}
                          <div
                            className="h-20 w-full"
                            style={{
                              background: `linear-gradient(135deg, ${user.avatarColor}33 0%, ${user.avatarColor}08 100%)`,
                            }}
                          />
                          {/* Avatar + name */}
                          <div className="px-6 pb-6 -mt-8 flex flex-col gap-3">
                            <button
                              type="button"
                              onClick={openEditProfile}
                              aria-label="Edit profile"
                              className="relative size-16 rounded-2xl group focus:outline-none"
                            >
                              <div
                                className="size-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-xl ring-4 ring-card transition-all duration-200 group-hover:ring-primary/60 group-hover:brightness-75"
                                style={{
                                  backgroundColor: user.avatarColor,
                                  backgroundImage: user.avatar
                                    ? `url(${user.avatar})`
                                    : undefined,
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                  fontFamily: "var(--font-display)",
                                }}
                              >
                                {!user.avatar && user.initials}
                              </div>
                              <div className="absolute inset-0 rounded-2xl bg-black/60 flex flex-col items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <Edit3 className="size-3.5 text-white" />
                                <span
                                  className="text-[8px] font-bold text-white leading-tight text-center"
                                  style={{ fontFamily: "var(--font-display)" }}
                                >
                                  Edit Profile
                                </span>
                              </div>
                            </button>
                            <div>
                              <h3
                                className="text-xl font-bold text-foreground leading-tight"
                                style={{ fontFamily: "var(--font-display)" }}
                              >
                                {user.username}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {user.email}
                              </p>
                              {user.bio && (
                                <p className="text-xs text-foreground/70 mt-2 leading-relaxed">
                                  {user.bio}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full">
                                Member since {user.joinedYear}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4">
                          <h4 className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">
                            Stats
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              {
                                icon: Library,
                                label: "In List",
                                value: addedGames.length,
                              },
                              {
                                icon: Trophy,
                                label: "Played",
                                value: playedGames.length,
                              },
                              {
                                icon: BarChart2,
                                label: "Avg Score",
                                value: avgScore ?? "—",
                              },
                            ].map(({ icon: Icon, label, value }) => (
                              <div
                                key={label}
                                className="rounded-xl bg-secondary/40 border border-border px-4 py-3 flex flex-col gap-1"
                              >
                                <Icon className="size-4 text-primary" />
                                <span
                                  className="text-lg font-bold text-foreground leading-none"
                                  style={{ fontFamily: "var(--font-display)" }}
                                >
                                  {value}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* ── RIGHT: Game list ── */}
                      <div className="flex flex-col gap-5">
                        {/* Top genre + favourite */}
                        <div className="grid grid-cols-[1fr_2fr] gap-5">
                          {(() => {
                            const genreGames = games.filter(
                              (g) => g.genre === favouriteGenre,
                            );
                            const scoredInGenre = genreGames.filter(
                              (g) => userGameData[g.id]?.score,
                            );
                            const genreAvg = scoredInGenre.length
                              ? (
                                  scoredInGenre.reduce(
                                    (s, g) =>
                                      s + Number(userGameData[g.id].score),
                                    0,
                                  ) / scoredInGenre.length
                                ).toFixed(1)
                              : null;
                            const logoGames = genreGames.slice(0, 3);
                            return (
                              <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">
                                    Favourite Genre
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-[11px] text-muted-foreground hover:text-primary hover:bg-primary/10 border border-border/60 flex-none"
                                    onClick={openGenreModal}
                                  >
                                    Change
                                  </Button>
                                </div>
                                <span
                                  className="text-2xl font-bold text-foreground leading-tight"
                                  style={{ fontFamily: "var(--font-display)" }}
                                >
                                  {favouriteGenre}
                                </span>
                                {/* Mini stats */}
                                <div className="flex items-center gap-4">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-xs font-bold text-foreground leading-none">
                                      {genreGames.length}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                      Games
                                    </span>
                                  </div>
                                  <div className="w-px h-6 bg-border" />
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-xs font-bold text-foreground leading-none">
                                      {genreAvg ?? "—"}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                      Avg Rating
                                    </span>
                                  </div>
                                </div>
                                {/* Game logos */}
                                {logoGames.length > 0 && (
                                  <div className="flex items-center gap-2">
                                    {logoGames.map((g) => (
                                      <button
                                        key={g.id}
                                        onClick={() => handleGameClick(g)}
                                        className="size-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-md hover:scale-110 transition-transform duration-200 focus:outline-none"
                                        style={{
                                          backgroundColor: g.color,
                                          fontFamily: "var(--font-display)",
                                        }}
                                        title={g.name}
                                      >
                                        {g.initials}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                          <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">
                                Favourite Game
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-[11px] text-muted-foreground hover:text-primary hover:bg-primary/10 border border-border/60 flex-none"
                                onClick={openFavGameModal}
                              >
                                Change
                              </Button>
                            </div>
                            {favGame ? (
                              <div className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 relative">
                                {/* Cover / logo area — clicking navigates */}
                                <div
                                  className="relative flex items-center justify-center w-full cursor-pointer"
                                  style={{
                                    height: "100px",
                                    backgroundColor: favGame.color + "18",
                                  }}
                                  onClick={() => handleGameClick(favGame)}
                                >
                                  <div
                                    className="size-12 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-lg group-hover:scale-105 transition-transform duration-300"
                                    style={{
                                      backgroundColor: favGame.color,
                                      fontFamily: "var(--font-display)",
                                    }}
                                  >
                                    {favGame.initials}
                                  </div>
                                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent" />
                                </div>
                                {/* Info — clicking navigates */}
                                <div
                                  className="px-3 pb-3 pt-2 flex flex-col gap-0.5 cursor-pointer"
                                  onClick={() => handleGameClick(favGame)}
                                >
                                  <h3
                                    className="text-foreground font-bold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors"
                                    style={{
                                      fontFamily: "var(--font-display)",
                                    }}
                                  >
                                    {favGame.name}
                                  </h3>
                                  <span className="text-xs text-muted-foreground">
                                    {favGame.genre}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground italic">
                                Not set
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Game list */}
                        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <h4
                                className="text-base font-bold text-foreground"
                                style={{ fontFamily: "var(--font-display)" }}
                              >
                                My Game List
                              </h4>
                              <span className="text-xs text-muted-foreground bg-secondary border border-border px-2.5 py-0.5 rounded-full">
                                {addedGames.length} games
                              </span>
                            </div>
                            <Button
                              className="bg-primary hover:bg-primary/90 text-white gap-2"
                              onClick={openAddGame}
                            >
                              <Plus className="size-4" />
                              Add Game
                            </Button>
                          </div>

                          {addedGames.length === 0 ? (
                            <div className="py-12 flex flex-col items-center gap-3 text-center">
                              <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <ListPlus className="size-6 text-primary" />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                No games in your list yet.
                                <br />
                                Open a game and click{" "}
                                <span className="text-foreground font-medium">
                                  Add to List
                                </span>
                                .
                              </p>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2">
                              {addedGames.map((game) => {
                                const gd = getGameData(game.id);
                                const isFav = favouriteId === game.id;
                                const STATUS_COLORS = {
                                  Playing:
                                    "text-violet-400 bg-violet-500/10 border-violet-500/20",
                                  Played:
                                    "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                                  "Want to Play":
                                    "text-sky-400    bg-sky-500/10    border-sky-500/20",
                                  "On Hold":
                                    "text-amber-400  bg-amber-500/10  border-amber-500/20",
                                  Dropped:
                                    "text-rose-400   bg-rose-500/10   border-rose-500/20",
                                };
                                return (
                                  <div
                                    key={game.id}
                                    className="group flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-secondary/50 border border-transparent hover:border-border transition-all"
                                  >
                                    {/* Logo — clicking navigates to game page */}
                                    <button
                                      onClick={() => handleGameClick(game)}
                                      className="focus:outline-none"
                                      tabIndex={-1}
                                    >
                                      <div
                                        className="size-10 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-none hover:brightness-110 transition-all"
                                        style={{
                                          backgroundColor: game.color,
                                          fontFamily: "var(--font-display)",
                                        }}
                                      >
                                        {game.initials}
                                      </div>
                                    </button>
                                    {/* Name + genre — clicking navigates */}
                                    <button
                                      onClick={() => handleGameClick(game)}
                                      className="flex-1 min-w-0 text-left focus:outline-none"
                                    >
                                      <p
                                        className="font-bold text-foreground group-hover:text-primary transition-colors truncate text-sm"
                                        style={{
                                          fontFamily: "var(--font-display)",
                                        }}
                                      >
                                        {game.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {game.genre}
                                      </p>
                                    </button>
                                    {/* Status custom dropdown */}
                                    <div
                                      className="relative flex-none"
                                      data-dropdown
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setOpenDropdown(
                                            openDropdown?.gameId === game.id &&
                                              openDropdown.type === "status"
                                              ? null
                                              : {
                                                  gameId: game.id,
                                                  type: "status",
                                                },
                                          )
                                        }
                                        className={cn(
                                          "flex items-center gap-1 text-xs font-medium pl-2.5 pr-1.5 py-0.5 rounded-full border cursor-pointer transition-all duration-150 hover:brightness-110",
                                          STATUS_COLORS[gd.status] ??
                                            "text-muted-foreground bg-secondary border-border",
                                        )}
                                      >
                                        {gd.status}
                                        <ChevronDown className="size-3 opacity-70 flex-none" />
                                      </button>
                                      {openDropdown?.gameId === game.id &&
                                        openDropdown.type === "status" &&
                                        (() => {
                                          const STATUS_DOTS = {
                                            Playing: "bg-violet-400",
                                            Played: "bg-emerald-400",
                                            "Want to Play": "bg-sky-400",
                                            "On Hold": "bg-amber-400",
                                            Dropped: "bg-rose-400",
                                          };
                                          return (
                                            <div className="absolute right-0 top-[calc(100%+6px)] z-50 bg-card border border-border rounded-xl shadow-2xl shadow-black/40 overflow-hidden min-w-[160px]">
                                              {[
                                                "Playing",
                                                "Played",
                                                "Want to Play",
                                                "On Hold",
                                                "Dropped",
                                              ].map((opt, idx, arr) => (
                                                <button
                                                  key={opt}
                                                  type="button"
                                                  onClick={() => {
                                                    patchGameData(game.id, {
                                                      status: opt,
                                                    });
                                                    setOpenDropdown(null);
                                                  }}
                                                  className={cn(
                                                    "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-foreground hover:bg-secondary/70 transition-colors text-left",
                                                    idx !== arr.length - 1 &&
                                                      "border-b border-border/40",
                                                    gd.status === opt &&
                                                      "bg-secondary/50 text-primary",
                                                  )}
                                                >
                                                  <span
                                                    className={cn(
                                                      "size-2 rounded-full flex-none",
                                                      STATUS_DOTS[opt],
                                                    )}
                                                  />
                                                  {opt}
                                                </button>
                                              ))}
                                            </div>
                                          );
                                        })()}
                                    </div>
                                    {/* Score custom dropdown */}
                                    <div
                                      className="relative flex-none"
                                      data-dropdown
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setOpenDropdown(
                                            openDropdown?.gameId === game.id &&
                                              openDropdown.type === "score"
                                              ? null
                                              : {
                                                  gameId: game.id,
                                                  type: "score",
                                                },
                                          )
                                        }
                                        className="flex items-center gap-1 text-xs font-bold text-primary border border-border/50 rounded-lg pl-2 pr-1.5 py-0.5 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-150 min-w-[48px]"
                                      >
                                        <span>
                                          {gd.score ? `${gd.score}/10` : "—"}
                                        </span>
                                        <ChevronDown className="size-3 opacity-70 flex-none" />
                                      </button>
                                      {openDropdown?.gameId === game.id &&
                                        openDropdown.type === "score" && (
                                          <div className="absolute right-0 top-[calc(100%+6px)] z-50 bg-card border border-border rounded-xl shadow-2xl shadow-black/40 overflow-hidden min-w-[80px]">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                patchGameData(game.id, {
                                                  score: "",
                                                });
                                                setOpenDropdown(null);
                                              }}
                                              className={cn(
                                                "w-full text-left px-4 py-2.5 text-sm font-bold text-foreground hover:bg-secondary/70 transition-colors border-b border-border/40",
                                                !gd.score &&
                                                  "bg-secondary/50 text-primary",
                                              )}
                                            >
                                              —
                                            </button>
                                            {[
                                              10, 9, 8, 7, 6, 5, 4, 3, 2, 1,
                                            ].map((n, idx) => (
                                              <button
                                                key={n}
                                                type="button"
                                                onClick={() => {
                                                  patchGameData(game.id, {
                                                    score: String(n),
                                                  });
                                                  setOpenDropdown(null);
                                                }}
                                                className={cn(
                                                  "w-full text-left px-4 py-2.5 text-sm font-bold text-foreground hover:bg-secondary/70 transition-colors",
                                                  idx !== 9 &&
                                                    "border-b border-border/40",
                                                  gd.score === String(n) &&
                                                    "bg-secondary/50 text-primary",
                                                )}
                                              >
                                                {n}
                                              </button>
                                            ))}
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
          </div>
        </div>
      )}

      <LoginDialog
        open={loginOpen}
        onOpenChange={(open) => {
          setLoginOpen(open);
          if (!open) setAuthError("");
        }}
        onLogin={handleLogin}
        error={authError}
        isSubmitting={authSubmitting}
      />

      <RegisterDialog
        open={registerOpen}
        onOpenChange={(open) => {
          setRegisterOpen(open);
          if (!open) setAuthError("");
        }}
        onRegister={handleRegister}
        error={authError}
        isSubmitting={authSubmitting}
      />

      {/* ── REGISTRATION SUCCESS MODAL ── */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <div className="flex flex-col items-center gap-5 py-6 text-center">
            <div
              className="size-18 rounded-full bg-primary/15 flex items-center justify-center"
              style={{ width: "72px", height: "72px" }}
            >
              <CheckCircle2 className="size-10 text-primary" />
            </div>
            <div>
              <DialogTitle
                className="text-xl font-bold text-foreground mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Registration successful.
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Your account is ready.
              </DialogDescription>
            </div>
            <Button
              className="bg-primary hover:bg-primary/90 text-white px-8"
              onClick={() => setSuccessOpen(false)}
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── ADD GAME MODAL ── */}
      <Dialog open={addGameOpen} onOpenChange={setAddGameOpen}>
        <DialogContent
          className="bg-card border-border max-w-md flex flex-col"
          style={{ maxHeight: "80vh" }}
        >
          <DialogHeader>
            <div className="flex items-center gap-2.5 mb-0.5">
              <div className="size-7 rounded-lg bg-primary/20 flex items-center justify-center">
                <ListPlus className="size-4 text-primary" />
              </div>
              <DialogTitle
                className="text-foreground text-xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Add Game
              </DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground text-sm">
              Search for a game and add it to your list.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-1 min-h-0">
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search for a game..."
                value={addGameQuery}
                onChange={(e) => {
                  setAddGameQuery(e.target.value);
                  setAddGameSelected(null);
                }}
                className={cn(FIELD_CLASS, "pl-10")}
                autoFocus
              />
            </div>

            {/* Results list */}
            <div
              className="flex flex-col gap-1 overflow-y-auto"
              style={{ maxHeight: "320px" }}
            >
              {addGameResults.length === 0 ? (
                <div className="py-10 flex flex-col items-center gap-3 text-center">
                  <div className="size-10 rounded-2xl bg-secondary/60 border border-border flex items-center justify-center">
                    <Search className="size-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No games found.
                  </p>
                </div>
              ) : (
                addGameResults.map((game, idx) => {
                  const isSelected = addGameSelected?.id === game.id;
                  return (
                    <button
                      key={game.id}
                      type="button"
                      onClick={() =>
                        setAddGameSelected(isSelected ? null : game)
                      }
                      className={cn(
                        "flex items-center gap-4 px-4 py-3 rounded-xl border transition-all duration-150 text-left group",
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-transparent hover:border-border hover:bg-secondary/50",
                      )}
                    >
                      {/* Game logo */}
                      <div
                        className="size-10 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-none shadow-md"
                        style={{
                          backgroundColor: game.color,
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        {game.initials}
                      </div>
                      {/* Name + genre */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "text-sm font-bold truncate transition-colors",
                            isSelected
                              ? "text-primary"
                              : "text-foreground group-hover:text-primary",
                          )}
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {game.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {game.genre}
                        </p>
                      </div>
                      {/* Selected checkmark */}
                      {isSelected && (
                        <Check className="size-4 text-primary flex-none" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1 border-t border-border">
              <Button
                type="button"
                className="flex-1 bg-primary hover:bg-primary/90 text-white gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={!addGameSelected || actionBusy}
                onClick={handleAddGame}
              >
                <Plus className="size-4" />
                Add Game
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="flex-1 text-foreground hover:text-primary hover:bg-primary/10 border border-border"
                onClick={() => setAddGameOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── SELECT FAVOURITE GAME MODAL ── */}
      <Dialog open={favGameModalOpen} onOpenChange={setFavGameModalOpen}>
        <DialogContent
          className="bg-card border-border max-w-md flex flex-col"
          style={{ maxHeight: "80vh" }}
        >
          <DialogHeader>
            <div className="flex items-center gap-2.5 mb-0.5">
              <div className="size-7 rounded-lg bg-primary/20 flex items-center justify-center">
                <Star className="size-4 text-primary" />
              </div>
              <DialogTitle
                className="text-foreground text-xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Select Favourite Game
              </DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground text-sm">
              Choose your favourite from your game list.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-1 min-h-0">
            {addedGames.length === 0 ? (
              /* Empty state */
              <div className="py-10 flex flex-col items-center gap-4 text-center">
                <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <ListPlus className="size-6 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[260px]">
                  You need to add a game to your Game List before selecting a
                  Favourite Game.
                </p>
                <Button
                  className="bg-primary hover:bg-primary/90 text-white gap-2"
                  onClick={() => {
                    setFavGameModalOpen(false);
                    openAddGame();
                  }}
                >
                  <Plus className="size-4" />
                  Add Game
                </Button>
              </div>
            ) : (
              <>
                {/* Game list */}
                <div
                  className="flex flex-col gap-1 overflow-y-auto min-h-0"
                  style={{ maxHeight: "340px" }}
                >
                  {addedGames.map((game) => {
                    const isSelected = favGameSelected === game.id;
                    return (
                      <button
                        key={game.id}
                        type="button"
                        onClick={() =>
                          setFavGameSelected(isSelected ? null : game.id)
                        }
                        className={cn(
                          "flex items-center gap-4 px-4 py-3 rounded-xl border transition-all duration-150 text-left group",
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-transparent hover:border-border hover:bg-secondary/50",
                        )}
                      >
                        <div
                          className="size-10 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-none shadow-md"
                          style={{
                            backgroundColor: game.color,
                            fontFamily: "var(--font-display)",
                          }}
                        >
                          {game.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-sm font-bold truncate transition-colors",
                              isSelected
                                ? "text-primary"
                                : "text-foreground group-hover:text-primary",
                            )}
                            style={{ fontFamily: "var(--font-display)" }}
                          >
                            {game.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {game.genre}
                          </p>
                        </div>
                        {isSelected && (
                          <Check className="size-4 text-primary flex-none" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-1 border-t border-border">
                  <Button
                    type="button"
                    className="flex-1 bg-primary hover:bg-primary/90 text-white"
                    onClick={saveFavoriteGame}
                    disabled={actionBusy}
                  >
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1 text-foreground hover:text-primary hover:bg-primary/10 border border-border"
                    onClick={() => setFavGameModalOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── SELECT FAVOURITE GENRE MODAL ── */}
      <Dialog open={genreModalOpen} onOpenChange={setGenreModalOpen}>
        <DialogContent
          className="bg-card border-border max-w-sm flex flex-col"
          style={{ maxHeight: "80vh" }}
        >
          <DialogHeader>
            <div className="flex items-center gap-2.5 mb-0.5">
              <div className="size-7 rounded-lg bg-primary/20 flex items-center justify-center">
                <Library className="size-4 text-primary" />
              </div>
              <DialogTitle
                className="text-foreground text-xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Select Favourite Genre
              </DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground text-sm">
              Choose the genre you enjoy most.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-1 min-h-0">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search genres..."
                value={genreQuery}
                onChange={(e) => setGenreQuery(e.target.value)}
                className={cn(FIELD_CLASS, "pl-10")}
                autoFocus
              />
            </div>

            {/* Genre list */}
            <div
              className="flex flex-col gap-1 overflow-y-auto min-h-0"
              style={{ maxHeight: "300px" }}
            >
              {filteredGenres.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No genres found.
                </p>
              ) : (
                filteredGenres.map((genre, idx, arr) => {
                  const isSelected = genreSelected === genre;
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => setGenreSelected(genre)}
                      className={cn(
                        "flex items-center justify-between px-4 py-2.5 rounded-xl border text-left text-sm font-bold transition-all duration-150",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-transparent hover:border-border hover:bg-secondary/50 text-foreground",
                      )}
                    >
                      {genre}
                      {isSelected && <Check className="size-4 flex-none" />}
                    </button>
                  );
                })
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1 border-t border-border">
              <Button
                type="button"
                className="flex-1 bg-primary hover:bg-primary/90 text-white disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={!genreSelected || actionBusy}
                onClick={saveFavoriteGenre}
              >
                Save
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="flex-1 text-foreground hover:text-primary hover:bg-primary/10 border border-border"
                onClick={() => setGenreModalOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── EDIT PROFILE MODAL ── */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="bg-card border-border max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2.5 mb-0.5">
              <div className="size-7 rounded-lg bg-primary/20 flex items-center justify-center">
                <Edit3 className="size-4 text-primary" />
              </div>
              <DialogTitle
                className="text-foreground text-xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Edit Profile
              </DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground text-sm">
              Update your avatar, username or password.
            </DialogDescription>
          </DialogHeader>

          <form
            className="flex flex-col gap-5 mt-1"
            onSubmit={handleEditProfileSave}
          >
            {/* ── Avatar ── */}
            <div className="flex flex-col items-center gap-3 py-2">
              {/* Current avatar preview */}
              <div
                className="size-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-xl ring-4 ring-primary/20"
                style={{
                  backgroundColor: epAvatarColor,
                  backgroundImage: epAvatarPreview
                    ? `url(${epAvatarPreview})`
                    : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  fontFamily: "var(--font-display)",
                }}
              >
                {!epAvatarPreview && epAvatarInitials}
              </div>

              {/* Colour palette picker */}
              <div className="flex items-center gap-2">
                {AVATAR_PALETTE.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setEpAvatarColor(color)}
                    className="size-6 rounded-lg transition-all duration-150 focus:outline-none"
                    style={{
                      backgroundColor: color,
                      boxShadow:
                        epAvatarColor === color
                          ? `0 0 0 2px #0b0c15, 0 0 0 4px ${color}`
                          : "none",
                    }}
                    aria-label={`Avatar colour ${color}`}
                  />
                ))}
              </div>

              {/* Hidden file input */}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground hover:text-primary hover:bg-primary/10 text-sm h-8 px-4"
                onClick={() => avatarInputRef.current?.click()}
              >
                Change Avatar
              </Button>
            </div>

            <div className="h-px bg-border" />

            {/* ── Username ── */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ep-username" className="text-foreground text-sm">
                New Username
              </Label>
              <input
                id="ep-username"
                type="text"
                value={epUsername}
                onChange={(e) => {
                  setEpUsername(e.target.value);
                  setEpAvatarInitials(getInitials(e.target.value));
                }}
                className={cn(
                  FIELD_CLASS,
                  epUsernameEmpty &&
                    "border-rose-500/60 focus:border-rose-500/80 focus:ring-rose-500/20",
                )}
              />
              {epUsernameEmpty && (
                <p className="text-xs text-rose-400">
                  Username cannot be empty.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ep-date-of-birth" className="text-foreground text-sm">
                  Date of Birth
                </Label>
                <input
                  id="ep-date-of-birth"
                  type="date"
                  value={epDateOfBirth}
                  onChange={(event) => setEpDateOfBirth(event.target.value)}
                  className={FIELD_CLASS}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ep-bio" className="text-foreground text-sm">
                  Bio
                </Label>
                <textarea
                  id="ep-bio"
                  rows={3}
                  maxLength={2000}
                  value={epBio}
                  onChange={(event) => setEpBio(event.target.value)}
                  placeholder="Tell other players a little about yourself"
                  className={cn(FIELD_CLASS, "h-auto resize-y")}
                />
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* ── Password ── */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="ep-new-password"
                  className="text-foreground text-sm"
                >
                  New Password
                </Label>
                <input
                  id="ep-new-password"
                  type="password"
                  placeholder="Leave blank to keep current"
                  value={epNewPassword}
                  onChange={(e) => setEpNewPassword(e.target.value)}
                  className={cn(
                    FIELD_CLASS,
                    epPasswordMismatch &&
                      "border-rose-500/60 focus:border-rose-500/80 focus:ring-rose-500/20",
                  )}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="ep-confirm-password"
                  className="text-foreground text-sm"
                >
                  Confirm New Password
                </Label>
                <input
                  id="ep-confirm-password"
                  type="password"
                  placeholder="Repeat new password"
                  value={epConfirmPassword}
                  onChange={(e) => setEpConfirmPassword(e.target.value)}
                  className={cn(
                    FIELD_CLASS,
                    epPasswordMismatch &&
                      "border-rose-500/60 focus:border-rose-500/80 focus:ring-rose-500/20",
                  )}
                />
                {epPasswordMismatch && (
                  <p className="text-xs text-rose-400">
                    Passwords do not match.
                  </p>
                )}
              </div>
            </div>

            {/* ── Actions ── */}
            <div className="flex items-center gap-3 pt-1">
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90 text-white disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={!epCanSave || actionBusy}
              >
                Save Changes
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="flex-1 text-foreground hover:text-primary hover:bg-primary/10 border border-border"
                onClick={() => setEditProfileOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
