import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserCircle, Mail, User, Shield, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getUserInitials, getUserDisplayName } from "@/lib/user-utils";

export default function Account() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              <div className="h-32 bg-slate-700 rounded"></div>
              <div className="h-32 bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="glass">
            <CardContent className="pt-6 text-center">
              <UserCircle className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <h2 className="text-xl font-semibold text-white mb-2">Non connecté</h2>
              <p className="text-slate-400 mb-4">Vous devez être connecté pour accéder à votre compte.</p>
              <Button className="gradient-primary" asChild>
                <a href="/login">Se connecter</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <UserCircle className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-white">Mon Compte</h1>
            <p className="text-slate-400">Gérez vos informations personnelles et préférences</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Information */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Informations du profil</span>
              </CardTitle>
              <CardDescription>
                Vos informations personnelles et de contact
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 mb-6">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary text-white text-lg">
                    {getUserInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold text-white">{getUserDisplayName(user)}</h3>
                  <p className="text-slate-400">{user.email || user.username}</p>
                  <Badge variant="outline" className="mt-1">
                    <Shield className="h-3 w-3 mr-1" />
                    Abonnement Pro
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="displayName" className="text-white">Nom d'affichage</Label>
                  <Input
                    id="displayName"
                    value={getUserDisplayName(user)}
                    className="mt-1"
                    readOnly
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email || user.username || ''}
                    className="mt-1"
                    readOnly
                  />
                </div>

                <div>
                  <Label htmlFor="username" className="text-white">Nom d'utilisateur</Label>
                  <Input
                    id="username"
                    value={user.username || ''}
                    className="mt-1"
                    readOnly
                  />
                </div>
              </div>

              <Button className="w-full gradient-primary" disabled>
                <User className="h-4 w-4 mr-2" />
                Modifier le profil (Bientôt disponible)
              </Button>
            </CardContent>
          </Card>

          {/* Account Security */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Sécurité du compte</span>
              </CardTitle>
              <CardDescription>
                Paramètres de sécurité et authentification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-white font-medium">Email vérifié</p>
                      <p className="text-sm text-slate-400">Votre email est confirmé</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Vérifié</Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-white font-medium">Compte créé</p>
                      <p className="text-sm text-slate-400">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'Date inconnue'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Button className="w-full" variant="outline" disabled>
                  Changer le mot de passe (Bientôt disponible)
                </Button>
                
                <Button className="w-full" variant="outline" disabled>
                  Authentification à deux facteurs (Bientôt disponible)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Information */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Abonnement et facturation</span>
            </CardTitle>
            <CardDescription>
              Informations sur votre plan et historique de facturation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Plan Pro</h3>
                <p className="text-slate-400">Accès complet à toutes les fonctionnalités</p>
                <Badge className="mt-2 gradient-primary">
                  Actif
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">€29,99</p>
                <p className="text-slate-400">par mois</p>
              </div>
            </div>
            
            <div className="mt-6 flex space-x-3">
              <Button className="gradient-primary" asChild>
                <a href="/billing">Gérer l'abonnement</a>
              </Button>
              <Button variant="outline">
                Télécharger les factures
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}