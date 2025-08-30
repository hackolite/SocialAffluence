import { ArrowRight, Eye, Clock, BarChart3, Shield, Users, Zap, CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-slate-900 to-slate-800">
      {/* Skip Link for Accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded-md z-50 focus:z-50"
      >
        Aller au contenu principal
      </a>
      
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-border" role="banner">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center" aria-hidden="true">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">SocialAffluence</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6" role="navigation" aria-label="Navigation principale">
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

      {/* Main Content */}
      <main id="main-content" role="main">

        {/* Hero Section */}
        <section className="py-20 px-4" aria-labelledby="hero-heading">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left">
                <h1 id="hero-heading" className="text-4xl md:text-6xl font-bold text-white mb-6">
                  Surveillez l'affluence en{" "}
                  <span className="gradient-text">temps réel</span>
                </h1>
                <p className="text-xl text-slate-300 mb-8">
                  Analysez le flux de personnes avec notre IA avancée. Obtenez des insights précis 
                  pour optimiser vos espaces et améliorer l'expérience client.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start" role="group" aria-label="Actions principales">
                  <Button size="lg" className="gradient-primary hover:opacity-90" asChild>
                    <a href="/signup" aria-describedby="signup-description">
                      Commencer gratuitement
                      <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                    </a>
                  </Button>
                  <span id="signup-description" className="sr-only">Créer un compte gratuit pour commencer à analyser l'affluence</span>
                  <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800" asChild>
                    <a href="/dashboard" aria-describedby="demo-description">
                      Voir la démo
                    </a>
                  </Button>
                  <span id="demo-description" className="sr-only">Découvrir les fonctionnalités avec une démonstration interactive</span>
                </div>
              </div>
              <aside className="flex justify-center lg:justify-end" aria-label="Aperçu du tableau de bord">
                <div className="glass rounded-lg p-4 border border-slate-700">
                  <img 
                    src="/img/demo-affluence.svg" 
                    alt="Capture d'écran du tableau de bord SocialAffluence montrant des graphiques en temps réel d'analyse d'affluence, des métriques de détection IA et des statistiques de flux de personnes"
                    className="w-full max-w-md h-auto rounded-lg"
                  />
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Real-World Examples Carousel */}
        <section className="py-20 px-4 bg-slate-900/50" aria-labelledby="examples-heading">
          <div className="container mx-auto">
            <header className="text-center mb-12">
              <h2 id="examples-heading" className="text-3xl md:text-4xl font-bold text-white mb-4">
                Détection d'objets en conditions réelles
              </h2>
              <p className="text-slate-300 text-lg max-w-3xl mx-auto">
              </p>
            </header>

            <div className="w-full">
              <Carousel className="w-full" aria-label="Exemples d'applications en conditions réelles">
                <CarouselContent>
                  <CarouselItem>
                    <article className="glass rounded-lg overflow-hidden border border-slate-700">
                      <img 
                        src="/img/obj.png" 
                        alt="Interface d'analyse montrant la détection automatique de personnes dans un magasin avec zones de densité en temps réel et compteurs de flux clients"
                        className="w-full h-64 md:h-80 object-cover"
                      />
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-white mb-2">
                          Analyse de l'affluence en milieu urbain
                        </h3>
                        <p className="text-slate-300">
                        Notre solution de comptage et d’analyse en temps réel permet de transformer la gestion des flux urbains en un véritable levier d’efficacité et de qualité de vie. 
                        Grâce à des algorithmes avancés de détection et d’IA, nous fournissons des données précises sur la densité (sous forme de heatmap- à venir) 
                        et les déplacements des personnes dans les espaces publics, 
                        commerces, gares, transports, et zones événementielles.
                        </p>
                      </div>
                    </article>
                  </CarouselItem>
                  
                  <CarouselItem>
                    <article className="glass rounded-lg overflow-hidden border border-slate-700">
                      <img 
                        src="/img/bottle.png" 
                        alt="Système de monitoring des files d'attente avec alertes automatiques pour temps d'attente et suggestions d'ouverture de caisses supplémentaires"
                        className="w-full h-64 md:h-80 object-cover"
                      />
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-white mb-2">
                          Gestion intelligente des zones portuaire, plaisance ou commerce
                        </h3>
                        <p className="text-slate-300">
                        En fournissant des données précises sur le nombre de navires, leur position, leur rotation et leur temps de séjour, 
                        les opérateurs peuvent optimiser le planning de déchargement et de chargement, réduire les temps d’attente et améliorer la fluidité des opérations.
                        </p>
                      </div>
                    </article>
                  </CarouselItem>
                  
                  <CarouselItem>
                    <article className="glass rounded-lg overflow-hidden border border-slate-700">
                      <img 
                        src="/img/boat.jpeg" 
                        alt="Carte de chaleur comportementale des clients avec trajectoires de mouvement et zones d'intérêt pour optimisation du placement produits"
                        className="w-full h-64 md:h-80 object-cover"
                      />
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-white mb-2">
                          Analyse comportementale avancée
                        </h3>
                        <p className="text-slate-300">
                          Compréhension des parcours clients et points d'intérêt pour optimiser 
                          le placement des produits et améliorer les ventes.
                        </p>
                      </div>
                    </article>
                  </CarouselItem>
                </CarouselContent>
                
                <CarouselPrevious className="bg-slate-800 border-slate-600 hover:bg-slate-700 text-white" aria-label="Exemple précédent" />
                <CarouselNext className="bg-slate-800 border-slate-600 hover:bg-slate-700 text-white" aria-label="Exemple suivant" />
              </Carousel>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4" aria-labelledby="features-heading">
          <div className="container mx-auto">
            <header className="text-center mb-16">
              <h2 id="features-heading" className="text-3xl md:text-4xl font-bold text-white mb-4">
                Pourquoi choisir SocialAffluence ?
              </h2>
              <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                Notre plateforme combine l'intelligence artificielle et l'analyse temps réel 
                pour vous offrir des insights sans précédent.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" role="list">
              <article className="glass border-slate-700 hover:border-primary/50 transition-colors" role="listitem">
                <Card>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <img 
                        src="/img/ia-precision.svg" 
                        alt="Diagramme illustrant la précision de l'intelligence artificielle TensorFlow avec indicateurs de performance et taux de détection"
                        className="w-full h-32 object-cover rounded-lg mb-4"
                      />
                      <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center" aria-hidden="true">
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
              </article>

              <article className="glass border-slate-700 hover:border-primary/50 transition-colors" role="listitem">
                <Card>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <img 
                        src="/img/temps-reel.svg" 
                        alt="Interface de monitoring en temps réel avec flux de données live et notifications instantanées d'alertes"
                        className="w-full h-32 object-cover rounded-lg mb-4"
                      />
                      <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center" aria-hidden="true">
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
              </article>

              <article className="glass border-slate-700 hover:border-primary/50 transition-colors" role="listitem">
                <Card>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <img 
                        src="/img/historique.svg" 
                        alt="Tableau de bord analytique avec graphiques historiques, tendances temporelles et options d'export de données"
                        className="w-full h-32 object-cover rounded-lg mb-4"
                      />
                      <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center" aria-hidden="true">
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
              </article>

              <article className="glass border-slate-700 hover:border-primary/50 transition-colors" role="listitem">
                <Card>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <img 
                        src="/img/multi-cameras.svg" 
                        alt="Interface de gestion multi-caméras avec vue en grille, filtres par zone et contrôles centralisés"
                        className="w-full h-32 object-cover rounded-lg mb-4"
                      />
                      <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center" aria-hidden="true">
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
              </article>

              <article className="glass border-slate-700 hover:border-primary/50 transition-colors" role="listitem">
                <Card>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <img 
                        src="/img/securite.svg" 
                        alt="Icônes de sécurité représentant le chiffrement des données, conformité RGPD et authentification multi-facteurs"
                        className="w-full h-32 object-cover rounded-lg mb-4"
                      />
                      <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center" aria-hidden="true">
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
              </article>

              <article className="glass border-slate-700 hover:border-primary/50 transition-colors" role="listitem">
                <Card>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <img 
                        src="/img/mobile-install.svg" 
                        alt="Smartphone montrant l'application mobile prête à l'emploi avec interface simple et démarrage rapide"
                        className="w-full h-32 object-cover rounded-lg mb-4"
                      />
                      <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center" aria-hidden="true">
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
              </article>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 px-4 bg-slate-900/50" aria-labelledby="about-heading">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <article>
                <h2 id="about-heading" className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Technologie de pointe pour l'analyse d'affluence
                </h2>
                <p className="text-slate-300 text-lg mb-6">
                  SocialAffluence utilise les dernières avancées en intelligence artificielle 
                  et computer vision pour analyser les flux de personnes en temps réel.
                </p>
                <ul className="space-y-4" role="list">
                  <li className="flex items-center space-x-3" role="listitem">
                    <CheckCircle className="h-6 w-6 text-primary" aria-hidden="true" />
                    <span className="text-white">Algorithmes d'IA TensorFlow optimisés</span>
                  </li>
                  <li className="flex items-center space-x-3" role="listitem">
                    <CheckCircle className="h-6 w-6 text-primary" aria-hidden="true" />
                    <span className="text-white">Architecture on-device</span>
                  </li>
                  <li className="flex items-center space-x-3" role="listitem">
                    <CheckCircle className="h-6 w-6 text-primary" aria-hidden="true" />
                    <span className="text-white">Sotckage no-sql pour intégrations</span>
                  </li>
                  <li className="flex items-center space-x-3" role="listitem">
                    <CheckCircle className="h-6 w-6 text-primary" aria-hidden="true" />
                    <span className="text-white">Tableaux de bord en temps réel</span>
                  </li>
                </ul>
              </article>
              <aside className="relative" aria-label="Statistiques de performance">
                <div className="glass rounded-lg border border-slate-700 overflow-hidden">
                  <img 
                    src="/img/fake-stats.svg" 
                    alt="Graphiques analytiques montrant les métriques de performance, courbes de précision IA et statistiques d'utilisation en temps réel"
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-8">
                    <div className="text-center">
                      <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                        <BarChart3 className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">95%+</h3>
                      <p className="text-slate-300 mb-4">Précision de détection</p>
                      <div className="flex justify-center space-x-1" aria-label="Note de satisfaction 5 étoiles">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" aria-hidden="true" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4" aria-labelledby="cta-heading">
          <div className="container mx-auto text-center">
            <div className="max-w-3xl mx-auto">
              <h2 id="cta-heading" className="text-3xl md:text-4xl font-bold text-white mb-6">
                Prêt à optimiser votre espace ?
              </h2>
              <p className="text-xl text-slate-300 mb-8">
                Rejoignez des centaines d'entreprises qui font confiance à SocialAffluence 
                pour analyser leur affluence.
              </p>
              <Button size="lg" className="gradient-primary hover:opacity-90" asChild>
                <a href="/signup" aria-describedby="cta-description">
                  Commencer maintenant
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </a>
              </Button>
              <span id="cta-description" className="sr-only">Créer votre compte pour commencer l'analyse d'affluence dès aujourd'hui</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-8 px-4" role="contentinfo">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center" aria-hidden="true">
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
