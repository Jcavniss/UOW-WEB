import { Button } from "./ui/button";
export function GuestHeader({ onLogin, onRegister }) {
  return (
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        className="text-foreground hover:text-primary hover:bg-primary/10"
        onClick={onLogin}
      >
        Login
      </Button>
      <Button
        className="bg-primary hover:bg-primary/90 text-white"
        onClick={onRegister}
      >
        Register
      </Button>
    </div>
  );
}
