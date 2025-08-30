import { ArrowRight, Eye, Clock, BarChart3, Shield, Users, Zap, CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-slate-900 to-slate-800">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">SocialAffluence</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-slate-400 hover:text-white transition-colors">
                Fonctionnalités
              </a>
              <a href="/pricing" className="text-slate-400 hover:text-white transition-colors">
                Tarifs
              </a>
              <a href="#about" className="text-slate-400 hover:text-white transition-colors">
                À propos
              </a>
              <Button className="gradient-primary hover:opacity-90" asChild>
                <a href="/login">Se connecter</a>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Surveillez l'affluence en{" "}
                <span className="gradient-text">temps réel</span>
              </h1>
              <p className="text-xl text-slate-300 mb-8">
                Analysez le flux de personnes avec notre IA avancée. Obtenez des insights précis 
                pour optimiser vos espaces et améliorer l'expérience client.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="gradient-primary hover:opacity-90" asChild>
                  <a href="/signup">
                    Commencer gratuitement
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800" asChild>
                  <a href="/dashboard">
                    Voir la démo
                  </a>
                </Button>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="glass rounded-lg p-4 border border-slate-700">
                <img 
                  src="/img/demo-affluence.svg" 
                  alt="Demo SocialAffluence Dashboard" 
                  className="w-full max-w-md h-auto rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Pourquoi choisir SocialAffluence ?
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Notre plateforme combine l'intelligence artificielle et l'analyse temps réel 
              pour vous offrir des insights sans précédent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="glass border-slate-700 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="mb-4">
                  <AspectRatio ratio={2/1} className="mb-4">
                    <img 
                      src="/img/ia-precision.svg" 
                      alt="IA de Précision" 
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </AspectRatio>
                  <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">IA de Précision</h3>
                <p className="text-slate-300">
                  Détection avancée alimentée par TensorFlow avec une précision de 95%+ 
                  pour identifier personnes et véhicules.
                </p>
              </CardContent>
            </Card>

            <Card className="glass border-slate-700 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="mb-4">
                  <AspectRatio ratio={2/1} className="mb-4">
                    <img 
                      src="/img/temps-reel.svg" 
                      alt="Temps Réel" 
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </AspectRatio>
                  <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Temps Réel</h3>
                <p className="text-slate-300">
                  Monitoring en direct avec mise à jour instantanée des métriques 
                  et alertes automatiques.
                </p>
              </CardContent>
            </Card>

            <Card className="glass border-slate-700 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="mb-4">
                  <AspectRatio ratio={2/1} className="mb-4">
                    <img 
                      src="/img/historique.svg" 
                      alt="Historique Complet" 
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </AspectRatio>
                  <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Historique Complet</h3>
                <p className="text-slate-300">
                  Analysez les tendances par jour, semaine ou mois avec des 
                  graphiques interactifs et exports CSV/PDF.
                </p>
              </CardContent>
            </Card>

            <Card className="glass border-slate-700 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="mb-4">
                  <AspectRatio ratio={2/1} className="mb-4">
                    <img 
                      src="/img/multi-cameras.svg" 
                      alt="Multi-Caméras" 
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </AspectRatio>
                  <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Multi-Caméras</h3>
                <p className="text-slate-300">
                  Gérez plusieurs caméras simultanément avec filtrage par zone 
                  et vue d'ensemble centralisée.
                </p>
              </CardContent>
            </Card>

            <Card className="glass border-slate-700 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="mb-4">
                  <AspectRatio ratio={2/1} className="mb-4">
                    <img 
                      src="/img/securite.svg" 
                      alt="Sécurisé" 
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </AspectRatio>
                  <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Sécurisé</h3>
                <p className="text-slate-300">
                  Données chiffrées, conformité RGPD et stockage sécurisé 
                  avec authentification multi-facteurs.
                </p>
              </CardContent>
            </Card>

            <Card className="glass border-slate-700 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="mb-4">
                  <AspectRatio ratio={2/1} className="mb-4">
                    <img 
                      src="/img/mobile-install.svg" 
                      alt="Zéro Installation" 
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </AspectRatio>
                  <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Zéro Installation</h3>
                <p className="text-slate-300">
                  Tout fonctionne directement sur votre téléphone, aucune configuration complexe requise. 
                  Démarrez en quelques secondes !
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-slate-900/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Technologie de pointe pour l'analyse d'affluence
              </h2>
              <p className="text-slate-300 text-lg mb-6">
                SocialAffluence utilise les dernières avancées en intelligence artificielle 
                et computer vision pour analyser les flux de personnes en temps réel.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-primary" />
                  <span className="text-white">Algorithmes d'IA TensorFlow optimisés</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-primary" />
                  <span className="text-white">Architecture cloud native scalable</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-primary" />
                  <span className="text-white">API RESTful pour intégrations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-primary" />
                  <span className="text-white">Tableaux de bord en temps réel</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="glass rounded-lg border border-slate-700 overflow-hidden">
                <img 
                  src="/img/fake-stats.svg" 
                  alt="Statistiques Analytics" 
                  className="w-full h-64 object-cover"
                />
                <div className="p-8">
                  <div className="text-center">
                    <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">95%+</h3>
                    <p className="text-slate-300 mb-4">Précision de détection</p>
                    <div className="flex justify-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Prêt à optimiser votre espace ?
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Rejoignez des centaines d'entreprises qui font confiance à SocialAffluence 
              pour analyser leur affluence.
            </p>
            <Button size="lg" className="gradient-primary hover:opacity-90" asChild>
              <a href="/signup">
                Commencer maintenant
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
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