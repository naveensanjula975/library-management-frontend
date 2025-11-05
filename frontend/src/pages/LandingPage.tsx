import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { User } from "@/types";

export default function LandingPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  // Render main landing page sections
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-5xl font-bold text-foreground">
            Your Personal Library
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Organize, manage, and discover your favorite books all in one place. 
            Start building your digital library today.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            {/* Primary call-to-action navigates to books list */}
            <Button size="lg" asChild>
              <Link to="/books">Browse Books</Link>
            </Button>
            {/* Secondary CTA goes to login/signup flow or logout if authenticated */}
            {!user ? (
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">Get Started</Link>
              </Button>
            ) : (
              <Button size="lg" variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📖</span>
                  Easy Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Add, edit, and organize your books with a simple and intuitive interface
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🔍</span>
                  Quick Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Find any book instantly with powerful search and filtering options
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  Track Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Keep track of your reading journey and build your personal collection
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* Final call to action prompting users to start */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to get started?</h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of readers organizing their libraries with ease
          </p>
          {/* Reuse primary navigation into the app */}
          <Button size="lg" asChild>
            <Link to="/books">Start Now</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      {/* Simple footer with brand and copyright */}
      <footer className="border-t py-8 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>© 2025 BookFlow</p>
        </div>
      </footer>
    </div>
  );
}
