import { Instagram, Linkedin, Facebook } from "lucide-react";
import albaLogo from "@/assets/alba-logo-white.webp";
import { CONTACT, OFFICE_LOCATIONS, SOCIAL_LINKS } from "@/config/site";

const SOCIAL_ICONS: Record<string, typeof Instagram> = {
  Instagram,
  LinkedIn: Linkedin,
  Facebook,
};

const Contact = () => {
  return (
    <section id="contact" className="py-16 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-minimal text-muted-foreground mb-3">CONTACTO</h2>
              <h3 className="text-2xl md:text-3xl font-light text-architectural mb-8">
                Creemos algo
                <br />
                extraordinario
              </h3>

              <div className="space-y-5">
                <div>
                  <h4 className="text-minimal text-muted-foreground mb-1">TELÉFONO</h4>
                  <a href={CONTACT.phoneHref} className="text-base hover:text-muted-foreground transition-colors duration-300">
                    {CONTACT.phoneDisplay}
                  </a>
                </div>

                <div>
                  <h4 className="text-minimal text-muted-foreground mb-1">ESTUDIO</h4>
                  <address className="text-base not-italic">
                    {OFFICE_LOCATIONS.join(". ")}
                  </address>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {SOCIAL_LINKS.some((s) => s.url) && (
                <div>
                  <h4 className="text-minimal text-muted-foreground mb-4">SEGUINOS</h4>
                  <div className="flex items-center gap-4">
                    {SOCIAL_LINKS.filter((s) => s.url).map((s) => {
                      const Icon = SOCIAL_ICONS[s.name];
                      return (
                        <a
                          key={s.name}
                          href={s.url ?? undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={s.name}
                          className="p-2 rounded-full border border-border text-foreground hover:bg-foreground hover:text-background transition-colors duration-300"
                        >
                          <Icon className="w-4 h-4" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Abordamos cada proyecto con curiosidad, rigor y compromiso con la excelencia.
                </p>
              </div>

              <div className="pt-2">
                <img src={albaLogo} alt="Alba Capital" className="h-16 w-auto opacity-90" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
