import { ArrowLeft, Check, X, Zap, Shield, BarChart3, Users, Clock, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-slate-900 to-slate-800">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-slate-400 hover:text-white" asChild>
                <a href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour à l'accueil
                </a>
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-white">SocialAffluence</h1>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Button className="gradient-primary hover:opacity-90" asChild>
                <a href="/login">Se connecter</a>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Tarifs <span className="gradient-text">transparents</span>
          </h1>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
            Choisissez la formule qui correspond à vos besoins. 
            Aucun frais caché, résiliable à tout moment.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* One-shot Plan */}
            <Card className="glass border-slate-700 relative">
              <CardHeader className="text-center">
                <Badge variant="outline" className="w-fit mx-auto mb-4 border-primary/50 text-primary">
                  Ponctuel
                </Badge>
                <CardTitle className="text-2xl font-bold text-white">
                  Analyse One-Shot
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Parfait pour des événements ou analyses ponctuelles
                </CardDescription>
                <div className="mt-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-white">5€</span>
                    <span className="text-slate-400 ml-2">par analyse</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-4">
                  <li className="flex items-center space-x-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-white">1 session d'analyse (24h max)</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-white">Détection temps réel</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-white">Export des données CSV</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-white">Graphiques basiques</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-white">1 caméra simultanée</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-5 h-5 rounded-full bg-slate-600 flex items-center justify-center">
                      <X className="h-3 w-3 text-slate-400" />
                    </div>
                    <span className="text-slate-400">Historique des données</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-5 h-5 rounded-full bg-slate-600 flex items-center justify-center">
                      <X className="h-3 w-3 text-slate-400" />
                    </div>
                    <span className="text-slate-400">Support prioritaire</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-5 h-5 rounded-full bg-slate-600 flex items-center justify-center">
                      <X className="h-3 w-3 text-slate-400" />
                    </div>
                    <span className="text-slate-400">API access</span>
                  </li>
                </ul>

                <div className="pt-6">
                  <Button className="w-full gradient-primary hover:opacity-90" size="lg">
                    <Zap className="mr-2 h-5 w-5" />
                    Choisir cette option
                  </Button>
                </div>

                <div className="flex items-center justify-center space-x-4 text-sm text-slate-400">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Paiement sécurisé</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Données exportables</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Subscription Plan */}
            <Card className="glass border-primary/50 relative overflow-hidden">
              {/* Popular badge */}
              <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-blue-500 text-white px-3 py-1 text-sm font-medium rounded-bl-lg">
                Populaire
              </div>
              
              <CardHeader className="text-center">
                <Badge variant="outline" className="w-fit mx-auto mb-4 border-primary text-primary bg-primary/10">
                  Abonnement
                </Badge>
                <CardTitle className="text-2xl font-bold text-white">
                  Abonnement Mensuel
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Pour un monitoring continu et des analyses avancées
                </CardDescription>
                <div className="mt-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-white">29€</span>
                    <span className="text-slate-400 ml-2">/mois</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-2">
                    Résiliable à tout moment
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-4">
                  <li className="flex items-center space-x-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-white">Monitoring illimité 24/7</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-white">Jusqu'à 5 caméras simultanées</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-white">Historique complet des données</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-white">Graphiques avancés et insights</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-white">Alertes personnalisables</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-white">Export CSV/PDF illimité</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-white">Support prioritaire</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-white">API REST complète</span>
                  </li>
                </ul>

                <div className="pt-6">
                  <Button className="w-full gradient-primary hover:opacity-90" size="lg">
                    <Users className="mr-2 h-5 w-5" />
                    Choisir cette option
                  </Button>
                </div>

                <div className="flex items-center justify-center space-x-4 text-sm text-slate-400">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Essai gratuit 7 jours</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Analytics avancés</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparison Features */}
      <section className="py-20 px-4 bg-slate-900/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Comparaison détaillée
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Tous les détails pour vous aider à choisir la formule parfaite
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full max-w-4xl mx-auto">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-4 px-6 text-white font-semibold">Fonctionnalité</th>
                  <th className="text-center py-4 px-6 text-white font-semibold">One-Shot</th>
                  <th className="text-center py-4 px-6 text-white font-semibold">Mensuel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                <tr>
                  <td className="py-4 px-6 text-slate-300">Durée d'utilisation</td>
                  <td className="py-4 px-6 text-center text-slate-300">24h max</td>
                  <td className="py-4 px-6 text-center text-primary font-semibold">Illimité</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-slate-300">Nombre de caméras</td>
                  <td className="py-4 px-6 text-center text-slate-300">1</td>
                  <td className="py-4 px-6 text-center text-primary font-semibold">5</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-slate-300">Historique des données</td>
                  <td className="py-4 px-6 text-center text-slate-400">✗</td>
                  <td className="py-4 px-6 text-center text-primary">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-slate-300">Alertes personnalisées</td>
                  <td className="py-4 px-6 text-center text-slate-400">✗</td>
                  <td className="py-4 px-6 text-center text-primary">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-slate-300">Support technique</td>
                  <td className="py-4 px-6 text-center text-slate-300">Standard</td>
                  <td className="py-4 px-6 text-center text-primary font-semibold">Prioritaire</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-slate-300">Accès API</td>
                  <td className="py-4 px-6 text-center text-slate-400">✗</td>
                  <td className="py-4 px-6 text-center text-primary">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Questions fréquentes
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="glass border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Puis-je changer de formule ?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Oui, vous pouvez passer de l'abonnement mensuel au one-shot à tout moment. 
                  Le changement prend effet immédiatement.
                </p>
              </CardContent>
            </Card>

            <Card className="glass border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Y a-t-il une période d'essai ?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  L'abonnement mensuel inclut 7 jours d'essai gratuit. 
                  Aucune carte de crédit requise pour commencer.
                </p>
              </CardContent>
            </Card>

            <Card className="glass border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Les données sont-elles sécurisées ?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Toutes les données sont chiffrées en transit et au repos. 
                  Nous sommes conformes RGPD et ne conservons que les métadonnées nécessaires.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-white font-semibold">SocialAffluence</span>
            </div>
            <p className="text-slate-400 text-center md:text-right">
              © 2024 SocialAffluence. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}