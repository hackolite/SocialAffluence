import { ArrowRight, Eye, Clock, BarChart3, Shield, Users, Zap, CheckCircle, Star, Menu, X, MessageSquare, Play, TrendingUp, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { useTranslation } from "react-i18next";
import { useState } from "react";
export default function Landing() {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-slate-900 to-slate-800">
      {/* Skip Link for Accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded-md z-50 focus:z-50"
      >
        {t('navigation.skipToMainContent')}
      </a>
      
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-slate-700/60" role="banner">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center" aria-hidden="true">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">SocialAffluence</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6" role="navigation" aria-label={t('navigation.mainNavigation')}>
              <a href="#features" className="text-slate-400 hover:text-white transition-colors">
                {t('navigation.features')}
              </a>
              <a href="#about" className="text-slate-400 hover:text-white transition-colors">
                {t('navigation.about')}
              </a>
              <a href="/contact" className="text-slate-400 hover:text-white transition-colors">
                Contact
              </a>
              <Button className="gradient-primary hover:opacity-90" asChild>
                <a href="/login">{t('navigation.login')}</a>
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle mobile menu"
                className="text-white hover:bg-slate-800"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-700 bg-slate-900/95 backdrop-blur-sm">
            <nav className="container mx-auto px-4 py-4 space-y-4" role="navigation" aria-label="Mobile navigation">
              <a 
                href="#features" 
                className="block text-slate-300 hover:text-white transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('navigation.features')}
              </a>
              <a 
                href="#about" 
                className="block text-slate-300 hover:text-white transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('navigation.about')}
              </a>
              <a 
                href="/contact" 
                className="block text-slate-300 hover:text-white transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </a>
              <div className="pt-2">
                <Button className="gradient-primary hover:opacity-90 w-full" asChild>
                  <a href="/login">{t('navigation.login')}</a>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main id="main-content" role="main">

        {/* Hero Section */}
        <section className="relative py-24 px-4 overflow-hidden" aria-labelledby="hero-heading">
          {/* Decorative background glow */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto relative z-10">
            {/* Badge */}
            <div className="flex justify-center mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" aria-hidden="true" />
                Analyse d'affluence propulsée par IA
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left">
                <h1 id="hero-heading" className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                  Comptez, analysez,{" "}
                  <span className="gradient-text">optimisez</span>{" "}
                  vos espaces en temps réel
                </h1>
                <p className="text-xl text-slate-300 mb-4 leading-relaxed">
                  SocialAffluence détecte automatiquement personnes, véhicules et objets via votre caméra — et vous donne des tableaux de bord live pour piloter vos flux.
                </p>
                <p className="text-base text-slate-400 mb-10">
                  Idéal pour les commerces, ports, espaces publics et événements. Aucune installation complexe, opérationnel en quelques secondes.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start" role="group" aria-label="Actions principales">
                  <Button size="lg" className="gradient-primary hover:opacity-90 text-base px-8 py-3 shadow-lg shadow-blue-500/20" asChild>
                    <a href="/signup" aria-describedby="signup-description">
                      Essayer gratuitement
                      <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                    </a>
                  </Button>
                  <span id="signup-description" className="sr-only">{t('hero.startFreeDescription')}</span>
                  <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800 text-base px-8 py-3" asChild>
                    <a href="/dashboard" aria-describedby="demo-description">
                      <Play className="mr-2 h-5 w-5" aria-hidden="true" />
                      Voir la démo
                    </a>
                  </Button>
                  <span id="demo-description" className="sr-only">{t('hero.viewDemoDescription')}</span>
                </div>
              </div>
              <aside className="flex justify-center lg:justify-end" aria-label={t('hero.dashboardPreview')}>
                <div className="glass rounded-2xl p-5 border border-slate-700/60 shadow-2xl shadow-black/40 w-full max-w-lg">
                  <img 
                    src="/img/demo-affluence.svg" 
                    alt="Capture d'écran du tableau de bord SocialAffluence montrant des graphiques en temps réel d'analyse d'affluence, des métriques de détection IA et des statistiques de flux de personnes"
                    className="w-full h-auto rounded-xl"
                  />
                </div>
              </aside>
            </div>

            {/* Stats row */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: "95%+", label: "Précision de détection", icon: <Eye className="h-5 w-5 text-blue-400" /> },
                { value: "<1s", label: "Latence temps réel", icon: <Clock className="h-5 w-5 text-green-400" /> },
                { value: "10+", label: "Classes d'objets", icon: <TrendingUp className="h-5 w-5 text-violet-400" /> },
                { value: "∞", label: "Caméras simultanées", icon: <Camera className="h-5 w-5 text-amber-400" /> },
              ].map(({ value, label, icon }) => (
                <div key={label} className="glass border border-slate-700/60 rounded-xl p-4 text-center hover:border-slate-600 transition-colors">
                  <div className="flex justify-center mb-2">{icon}</div>
                  <div className="text-2xl font-bold text-white">{value}</div>
                  <div className="text-sm text-slate-400 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Real-World Examples Carousel */}
        <section className="py-20 px-4 bg-slate-900/60" aria-labelledby="examples-heading">
          <div className="container mx-auto">
            <header className="text-center mb-12">
              <h2 id="examples-heading" className="text-3xl md:text-4xl font-bold text-white mb-4">
                {t('examples.title')}
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                De la rue au port, SocialAffluence s'adapte à tous vos contextes d'analyse.
              </p>
            </header>

            <div className="w-full">
              <Carousel className="w-full" aria-label={t('examples.carouselLabel')}>
                <CarouselContent>
                  <CarouselItem>
                    <article className="glass rounded-lg overflow-hidden border border-slate-700">
                      <img 
                        src="https://res.cloudinary.com/dinsxzuha/image/upload/v1783225938/Gemini_Generated_Image_174xyw174xyw174x_jlwuol.png"
                        alt="Illustration générée montrant une analyse de foule dans un espace public"
                        className="w-full h-64 md:h-80 object-cover"
                      />
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-white mb-2">
                          Analyse de foule en espace public
                        </h3>
                        <p className="text-slate-300">
                          Notre technologie permet une analyse précise des flux de personnes dans les espaces publics,
                          offrant des insights en temps réel pour améliorer la gestion des zones à forte affluence et garantir la sécurité des visiteurs.
                        </p>
                      </div>
                    </article>
                  </CarouselItem>

                  <CarouselItem>
                    <article className="glass rounded-lg overflow-hidden border border-slate-700">
                      <img 
                        src="https://res.cloudinary.com/dinsxzuha/image/upload/v1783225938/Gemini_Generated_Image_uz0binuz0binuz0b_pvhjaw.png"
                        alt="Illustration générée montrant un système de surveillance et de comptage de personnes dans un espace commercial"
                        className="w-full h-64 md:h-80 object-cover"
                      />
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-white mb-2">
                          Surveillance intelligente en espace commercial
                        </h3>
                        <p className="text-slate-300">
                          Notre système de surveillance intelligente permet de monitorer en continu les flux de personnes dans les espaces commerciaux,
                          offrant une visibilité complète pour optimiser l'organisation et améliorer l'expérience des visiteurs.
                        </p>
                      </div>
                    </article>
                  </CarouselItem>

                  <CarouselItem>
                    <article className="glass rounded-lg overflow-hidden border border-slate-700">
                      <img 
                        src="https://res.cloudinary.com/dinsxzuha/image/upload/v1783225928/ChatGPT_Image_5_juil._2026_04_19_04_k0a2jj.png"
                        alt="Visualisation de données d'affluence et de comptage de personnes dans un environnement commercial"
                        className="w-full h-64 md:h-80 object-cover"
                      />
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-white mb-2">
                          Visualisation avancée des données d'affluence
                        </h3>
                        <p className="text-slate-300">
                          Grâce à des tableaux de bord intuitifs, visualisez en temps réel les données de comptage et d'affluence,
                          et prenez des décisions éclairées pour optimiser l'expérience client et la gestion opérationnelle.
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
                {t('features.title')}
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                {t('features.description')}
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
              {[
                {
                  img: "/img/ia-precision.svg",
                  imgAlt: "Diagramme illustrant la précision de l'intelligence artificielle TensorFlow",
                  icon: <Eye className="h-6 w-6 text-white" />,
                  title: t('features.aiPrecision.title'),
                  desc: t('features.aiPrecision.description'),
                },
                {
                  img: "/img/temps-reel.svg",
                  imgAlt: "Interface de monitoring en temps réel avec flux de données live",
                  icon: <Clock className="h-6 w-6 text-white" />,
                  title: t('features.realTime.title'),
                  desc: t('features.realTime.description'),
                },
                {
                  img: "/img/historique.svg",
                  imgAlt: "Tableau de bord analytique avec graphiques historiques",
                  icon: <BarChart3 className="h-6 w-6 text-white" />,
                  title: t('features.fullHistory.title'),
                  desc: t('features.fullHistory.description'),
                },
                {
                  img: "/img/multi-cameras.svg",
                  imgAlt: "Interface de gestion multi-caméras avec vue en grille",
                  icon: <Users className="h-6 w-6 text-white" />,
                  title: t('features.multiCamera.title'),
                  desc: t('features.multiCamera.description'),
                },
                {
                  img: "/img/securite.svg",
                  imgAlt: "Icônes de sécurité représentant le chiffrement des données",
                  icon: <Shield className="h-6 w-6 text-white" />,
                  title: t('features.secure.title'),
                  desc: t('features.secure.description'),
                },
                {
                  img: "/img/mobile-install.svg",
                  imgAlt: "Smartphone montrant l'application mobile prête à l'emploi",
                  icon: <Zap className="h-6 w-6 text-white" />,
                  title: t('features.zeroInstall.title'),
                  desc: t('features.zeroInstall.description'),
                },
              ].map(({ img, imgAlt, icon, title, desc }) => (
                <article key={title} className="group glass border-slate-700/60 hover:border-blue-500/40 transition-all duration-300 hover:-translate-y-1 rounded-xl" role="listitem">
                  <CardContent className="p-6">
                    <div className="mb-5">
                      <img 
                        src={img} 
                        alt={imgAlt}
                        className="w-full h-32 object-cover rounded-lg mb-4 opacity-90 group-hover:opacity-100 transition-opacity"
                      />
                      <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20" aria-hidden="true">
                        {icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
                    <p className="text-slate-400 leading-relaxed text-sm">{desc}</p>
                  </CardContent>
                </article>
              ))}
            </div>
            
            {/* Contact CTA */}
            <div className="text-center mt-16">
              <div className="max-w-2xl mx-auto glass border border-slate-700/60 rounded-2xl p-10">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{t('features.contact.title')}</h3>
                <p className="text-slate-400 mb-6">{t('features.contact.description')}</p>
                <Button size="lg" className="gradient-primary hover:opacity-90 shadow-lg shadow-blue-500/20" asChild>
                  <a href="/contact">
                    {t('features.contact.button')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 px-4 bg-slate-900/60" aria-labelledby="about-heading">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <article>
                <h2 id="about-heading" className="text-3xl md:text-4xl font-bold text-white mb-6">
                  {t('about.title')}
                </h2>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                  {t('about.description')}
                </p>
                <ul className="space-y-4" role="list">
                  {[
                    "Algorithmes d'IA TensorFlow optimisés",
                    "Architecture on-device, données restent chez vous",
                    "Stockage NoSQL pour intégrations faciles",
                    "Tableaux de bord en temps réel",
                  ].map((item) => (
                    <li key={item} className="flex items-start space-x-3" role="listitem">
                      <CheckCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <span className="text-slate-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
              <aside className="relative" aria-label="Statistiques de performance">
                <div className="glass rounded-2xl border border-slate-700/60 overflow-hidden shadow-xl shadow-black/30">
                  <img 
                    src="/img/fake-stats.svg" 
                    alt="Graphiques analytiques montrant les métriques de performance, courbes de précision IA et statistiques d'utilisation en temps réel"
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-8">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-white">95%+</div>
                        <div className="text-xs text-slate-400 mt-1">Précision IA</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">&lt;1s</div>
                        <div className="text-xs text-slate-400 mt-1">Latence</div>
                      </div>
                      <div>
                        <div className="flex justify-center mb-1" aria-label="Note 5 étoiles">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" aria-hidden="true" />
                          ))}
                        </div>
                        <div className="text-xs text-slate-400">Satisfaction</div>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 relative overflow-hidden" aria-labelledby="cta-heading">
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-violet-600/10 to-blue-600/10" />
          </div>
          <div className="container mx-auto text-center relative z-10">
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm font-medium mb-8">
                <Zap className="h-4 w-4" aria-hidden="true" />
                Prêt en quelques secondes
              </div>
              <h2 id="cta-heading" className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
                {t('cta.title')}
              </h2>
              <p className="text-xl text-slate-400 mb-10 leading-relaxed">
                {t('cta.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="gradient-primary hover:opacity-90 text-base px-10 shadow-xl shadow-blue-500/25" asChild>
                  <a href="/signup" aria-describedby="cta-description">
                    {t('cta.startNow')}
                    <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800 text-base px-10" asChild>
                  <a href="/contact">Nous contacter</a>
                </Button>
              </div>
              <span id="cta-description" className="sr-only">Créer votre compte pour commencer l'analyse d'affluence dès aujourd'hui</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/60 py-10 px-4" role="contentinfo">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center" aria-hidden="true">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-white font-semibold">SocialAffluence</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#features" className="text-slate-400 hover:text-white text-sm transition-colors">{t('navigation.features')}</a>
              <a href="/contact" className="text-slate-400 hover:text-white text-sm transition-colors">Contact</a>
              <a href="#about" className="text-slate-400 hover:text-white text-sm transition-colors">{t('navigation.about')}</a>
            </div>
            <p className="text-slate-500 text-sm">
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
