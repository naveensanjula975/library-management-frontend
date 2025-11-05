import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import type { User } from "@/types";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  // Local state holds the current user (if logged in). We read from localStorage
  // because login/signup currently store a `user` JSON object there.
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        setUser(null);
      }
    }

    // Listen for storage events so the navbar updates when auth changes in other tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === "user") {
        setUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="text-xl font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-2"
          >
            <span>BookFlow</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant={isActive("/") ? "default" : "ghost"}
              asChild
              size="sm"
            >
              <Link to="/">Home</Link>
            </Button>
            <Button
              variant={isActive("/books") ? "default" : "ghost"}
              asChild
              size="sm"
            >
              <Link to="/books">Books</Link>
            </Button>
            {!user ? (
              <>
                <Button
                  variant={isActive("/login") ? "default" : "ghost"}
                  asChild
                  size="sm"
                >
                  <Link to="/login">Login</Link>
                </Button>
                <Button
                  variant={isActive("/signup") ? "default" : "ghost"}
                  asChild
                  size="sm"
                >
                  <Link to="/signup">Sign up</Link>
                </Button>
              </>
            ) : (
              <>
                <span className="text-sm text-foreground/90 px-2">{user.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Clear stored user and navigate to landing page
                    localStorage.removeItem("user");
                    setUser(null);
                    navigate("/");
                  }}
                >
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

