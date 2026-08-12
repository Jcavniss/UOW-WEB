import { LogOut, User as UserIcon } from "lucide-react";
import { Button } from "./ui/button";
export function UserHeader({ user, onProfile, onLogout }) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onProfile}
        aria-label="View profile"
        className="size-9 rounded-full flex items-center justify-center text-sm font-bold text-white ring-2 ring-primary/40 hover:ring-primary/80 transition-all duration-200 flex-none"
        style={{
          backgroundColor: user.avatarColor,
          backgroundImage: user.avatar ? `url(${user.avatar})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          fontFamily: "var(--font-display)",
        }}
      >
        {!user.avatar && user.initials}
      </button>
      <Button
        className="bg-primary hover:bg-primary/90 text-white gap-2"
        onClick={onProfile}
      >
        <UserIcon className="size-4" />
        Profile
      </Button>
      <Button
        variant="ghost"
        className="text-foreground hover:text-primary hover:bg-primary/10 gap-2"
        onClick={onLogout}
      >
        <LogOut className="size-4" />
        Logout
      </Button>
    </div>
  );
}
