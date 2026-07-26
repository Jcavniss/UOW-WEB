export function Header({
  user,
  onHome = () => {},
  onLogin = () => {},
  onRegister = () => {},
  onProfile = () => {},
  onLogout = () => {},
  historyControls,
}) {
  const initials = user?.username?.slice(0, 2).toUpperCase() || "U";

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="header-actions">
          {historyControls}
          <button className="brand" type="button" onClick={onHome}>
            <span className="brand-mark">G</span>
            <span>Gamer<span className="accent">Diary</span></span>
          </button>
        </div>
        <div className="header-actions">
          {user ? (
            <>
              <button className="user-chip" type="button" onClick={onProfile}>
                <span className="avatar">{initials}</span>
                <span>{user.username}</span>
              </button>
              <button className="button ghost" type="button" onClick={onLogout}>Log out</button>
            </>
          ) : (
            <>
              <button className="button ghost" type="button" onClick={onLogin}>Log in</button>
              <button className="button" type="button" onClick={onRegister}>Sign up</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}