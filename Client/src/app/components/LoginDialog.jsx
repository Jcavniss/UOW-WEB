import { useState } from "react";
import { Gamepad2 } from "lucide-react";
import { FIELD_CLASS } from "../ui-constants";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
export function LoginDialog({
  open,
  onOpenChange,
  onLogin,
  error,
  isSubmitting,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  async function handleSubmit(event) {
    event.preventDefault();
    const succeeded = await onLogin({ email: email.trim(), password });
    if (succeeded) {
      setEmail("");
      setPassword("");
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5 mb-0.5">
            <div className="size-7 rounded-lg bg-primary/20 flex items-center justify-center">
              <Gamepad2 className="size-4 text-primary" />
            </div>
            <DialogTitle
              className="text-foreground text-xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Login to GamerDiary
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-sm">
            Enter your credentials to access your account.
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4 mt-1" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="login-email" className="text-foreground text-sm">
              Email
            </Label>
            <input
              id="login-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={FIELD_CLASS}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="login-password" className="text-foreground text-sm">
              Password
            </Label>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={FIELD_CLASS}
              required
            />
          </div>

          {error && (
            <p
              role="alert"
              className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2"
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="mt-1 w-full bg-primary hover:bg-primary/90 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
