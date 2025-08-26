import { useEffect, useRef, useState } from "react";
import { Bell, Settings, User, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { getUserInitials, getUserDisplayName } from "@/lib/user-utils";

export default function Header() {
  const [visible, setVisible] = useState(true);
  const headerRef = useRef(null);
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const handleClickTopZone = (e: MouseEvent) => {
      if (!visible && e.clientY <= 80) {
        setVisible(true);
      }
    };

    window.addEventListener("click", handleClickTopZone);
    return () => window.removeEventListener("click", handleClickTopZone);
  }, [visible]);

  if (!visible) return null;

  return (
    <header
      ref={headerRef}
      className="glass sticky top-0 z-50 border-b border-border"
    >
      <div className="container mx-auto px-4 py-4 relative">
        {/* Bouton croix */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">SocialAffluence</h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a
                href="#"
                className="text-white hover:text-primary transition-colors"
              >
                Dashboard
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors"
              >
                Analytics
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors"
              >
                Settings
              </a>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-slate-700"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-slate-700"
            >
              <Settings className="h-5 w-5" />
            </Button>
            {isAuthenticated && user && !isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-white">
                    {getUserInitials(user)}
                  </span>
                </div>
                <span className="text-sm text-white hidden md:inline">
                  {getUserDisplayName(user)}
                </span>
              </div>
            ) : (
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
