import { useI18n } from "@/i18n/I18nProvider";
import heroImage from "@/assets/hero-architecture.webp";

const Hero = () => {
  const { t } = useI18n();

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${heroImage})`,
          filter: "grayscale(100%) sepia(35%) contrast(1.05) brightness(0.9)"
        }} 
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 hero-overlay" />
      
      {/* Content */}
      <div className="relative z-10 text-center max-w-7xl mx-auto px-6">
        <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-light text-white text-architectural mb-8">
          <span className="block animate-fade-in" style={{ animationDelay: '0.2s', animationDuration: '1s', animationFillMode: 'backwards' }}>
            {t("hero.line1")}
          </span>
          <span className="block animate-fade-in" style={{ animationDelay: '0.9s', animationDuration: '1s', animationFillMode: 'backwards' }}>
            {t("hero.line2")}
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-white/80 font-light tracking-wide max-w-2xl mx-auto reveal-delayed">
          {t("hero.subtitle")}
        </p>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 reveal-delayed">
        <div className="w-px h-16 bg-white/40" />
        <div className="text-minimal text-white/60 mt-4 rotate-90 origin-center">
          {t("hero.scroll")}
        </div>
      </div>
    </section>
  );
};

export default Hero;
