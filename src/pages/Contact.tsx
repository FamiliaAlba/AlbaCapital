import LeadForm from "@/components/LeadForm";
import { MessageCircle, Mail, MapPin } from "lucide-react";
import { CONTACT, OFFICE_LOCATIONS, buildWhatsAppUrl } from "@/config/site";

const WHATSAPP_MSG = "Hola, quiero conocer las oportunidades de inversión de Alba Capital.";

const Contact = () => {
  return (
    <div className="min-h-screen pt-12 md:pt-16">
      <section className="bg-background py-12 md:py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-7xl">
            <p className="text-minimal text-muted-foreground">CONTACTO</p>
            <h1 className="mt-3 text-4xl md:text-6xl font-light text-architectural">
              Hablemos de
              <br />
              tu próxima inversión
            </h1>
          </div>
        </div>
      </section>

      <section className="bg-background pb-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2">
            <div className="space-y-8">
              <a
                href={buildWhatsAppUrl(WHATSAPP_MSG)}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-5 rounded-2xl border border-border/60 bg-gradient-to-br from-foreground/[0.03] to-transparent p-6 transition-all hover:border-border"
              >
                <MessageCircle className="h-6 w-6 text-[#25D366]" strokeWidth={1.8} />
                <div>
                  <p className="text-minimal text-muted-foreground">WHATSAPP</p>
                  <p className="mt-2 text-xl font-light">Respuesta en minutos</p>
                  <p className="mt-1 text-sm text-muted-foreground">Hablá directo con un asesor</p>
                </div>
              </a>

              <div className="flex items-start gap-5 rounded-2xl border border-border/60 bg-gradient-to-br from-foreground/[0.03] to-transparent p-6">
                <Mail className="h-6 w-6" strokeWidth={1.8} />
                <div>
                  <p className="text-minimal text-muted-foreground">EMAIL</p>
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="mt-2 block text-xl font-light hover:text-muted-foreground"
                  >
                    {CONTACT.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-5 rounded-2xl border border-border/60 bg-gradient-to-br from-foreground/[0.03] to-transparent p-6">
                <MapPin className="h-6 w-6" strokeWidth={1.8} />
                <div>
                  <p className="text-minimal text-muted-foreground">OFICINAS</p>
                  <p className="mt-2 text-xl font-light">{OFFICE_LOCATIONS.join(", ")}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Atención con cita previa</p>
                </div>
              </div>
            </div>

            <LeadForm source="contacto" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
