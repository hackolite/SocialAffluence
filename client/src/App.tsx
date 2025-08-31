import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/layout/app-sidebar";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Pricing from "@/pages/pricing";
import Contact from "@/pages/contact";
import Dashboard from "@/pages/dashboard";
import Account from "@/pages/account";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/contact" component={Contact} />
      <Route path="/dashboard">
        {() => (
          <AppSidebar>
            <Dashboard />
          </AppSidebar>
        )}
      </Route>
      <Route path="/account">
        {() => (
          <AppSidebar>
            <Account />
          </AppSidebar>
        )}
      </Route>
      <Route path="/cameras">
        {() => (
          <AppSidebar>
            <div className="p-6">
              <h1 className="text-2xl font-bold text-white mb-4">Gestion des Caméras</h1>
              <p className="text-slate-300">Page en cours de développement...</p>
            </div>
          </AppSidebar>
        )}
      </Route>
      <Route path="/history">
        {() => (
          <AppSidebar>
            <div className="p-6">
              <h1 className="text-2xl font-bold text-white mb-4">Historique</h1>
              <p className="text-slate-300">Page en cours de développement...</p>
            </div>
          </AppSidebar>
        )}
      </Route>
      <Route path="/analytics">
        {() => (
          <AppSidebar>
            <div className="p-6">
              <h1 className="text-2xl font-bold text-white mb-4">Analytics</h1>
              <p className="text-slate-300">Page en cours de développement...</p>
            </div>
          </AppSidebar>
        )}
      </Route>
      <Route path="/settings">
        {() => (
          <AppSidebar>
            <div className="p-6">
              <h1 className="text-2xl font-bold text-white mb-4">Paramètres</h1>
              <p className="text-slate-300">Page en cours de développement...</p>
            </div>
          </AppSidebar>
        )}
      </Route>
      <Route path="/billing">
        {() => (
          <AppSidebar>
            <div className="p-6">
              <h1 className="text-2xl font-bold text-white mb-4">Facturation</h1>
              <p className="text-slate-300">Page en cours de développement...</p>
            </div>
          </AppSidebar>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
