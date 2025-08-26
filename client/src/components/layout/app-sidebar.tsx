import { 
  LayoutDashboard, 
  Camera, 
  BarChart3, 
  Settings, 
  CreditCard, 
  History,
  User,
  Bell,
  Shield,
  Menu,
  X,
  LogOut
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


interface NavigationItem {
  title: string;
  url: string;
  icon: React.ComponentType<any>;
  isActive?: boolean;
}

// Helper function to generate user initials
function getUserInitials(user: any): string {
  if (user?.firstName && user?.lastName) {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }
  if (user?.username) {
    return user.username.substring(0, 2).toUpperCase();
  }
  return "U";
}

// Helper function to get user display name
function getUserDisplayName(user: any): string {
  if (user?.firstName && user?.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  if (user?.username) {
    return user.username;
  }
  return "Utilisateur";
}

const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Caméras",
    url: "/cameras",
    icon: Camera,
  },
  {
    title: "Historique",
    url: "/history",
    icon: History,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
];

const settingsItems: NavigationItem[] = [
  {
    title: "Paramètres",
    url: "/settings",
    icon: Settings,
  },
  {
    title: "Facturation",
    url: "/billing",
    icon: CreditCard,
  },
];

interface AppSidebarProps {
  children: React.ReactNode;
}

export function AppSidebar({ children }: AppSidebarProps) {

  const { user, isLoading, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };


  return (
    <SidebarProvider>
      <Sidebar className="border-r border-slate-700">
        <SidebarHeader className="border-b border-slate-700 p-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-white">SocialAffluence</h1>
              <span className="text-xs text-slate-400">v2.0</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2">
          <SidebarGroup>
            <SidebarGroupLabel className="text-slate-400 text-xs font-medium uppercase tracking-wider">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="w-full justify-start">
                      <a 
                        href={item.url}
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="text-slate-400 text-xs font-medium uppercase tracking-wider">
              Configuration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {settingsItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="w-full justify-start">
                      <a 
                        href={item.url}
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-slate-700 p-4">

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                {user?.avatar && (
                  <AvatarImage src={user.avatar} alt={getUserDisplayName(user)} />
                )}
                <AvatarFallback className="bg-primary text-white text-sm">
                  {isLoading ? "..." : getUserInitials(user)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">
                  {isLoading ? "Chargement..." : getUserDisplayName(user)}
                </span>
                <span className="text-xs text-slate-400">Abonnement Pro</span>

              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                <Settings className="h-4 w-4" />
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700">
                <DropdownMenuLabel className="text-white">Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem asChild>
                  <a href="/settings" className="text-slate-300 hover:text-white">
                    <Settings className="mr-2 h-4 w-4" />
                    Paramètres
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-slate-300 hover:text-white cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex-1">
        {/* Header bar */}
        <header className="glass sticky top-0 z-40 border-b border-slate-700">
          <div className="flex h-16 items-center gap-4 px-6">
            <SidebarTrigger className="text-slate-400 hover:text-white" />
            <div className="flex-1" />
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                <Bell className="h-5 w-5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-8 w-8 cursor-pointer">
                    {user?.avatar && (
                      <AvatarImage src={user.avatar} alt={getUserDisplayName(user)} />
                    )}
                    <AvatarFallback className="bg-primary text-white text-sm">
                      {isLoading ? "..." : getUserInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700">
                  <DropdownMenuLabel className="text-white">
                    {isLoading ? "Chargement..." : getUserDisplayName(user)}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem asChild>
                    <a href="/settings" className="text-slate-300 hover:text-white">
                      <Settings className="mr-2 h-4 w-4" />
                      Paramètres
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-slate-300 hover:text-white cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {

  const { user, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-700">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white">SocialAffluence</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5 text-slate-400" />
          </Button>
        </div>
        
        <nav className="p-4 space-y-6">
          <div>
            <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3">
              Navigation
            </h3>
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <a
                  key={item.title}
                  href={item.url}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  onClick={onClose}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3">
              Configuration
            </h3>
            <div className="space-y-1">
              {settingsItems.map((item) => (
                <a
                  key={item.title}
                  href={item.url}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  onClick={onClose}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </a>
              ))}
            </div>
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                {user?.avatar && (
                  <AvatarImage src={user.avatar} alt={getUserDisplayName(user)} />
                )}
                <AvatarFallback className="bg-primary text-white text-sm">
                  {isLoading ? "..." : getUserInitials(user)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">
                  {isLoading ? "Chargement..." : getUserDisplayName(user)}
                </span>
                <span className="text-xs text-slate-400">Abonnement Pro</span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-slate-400 hover:text-white"
              onClick={handleLogout}
              title="Se déconnecter"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}