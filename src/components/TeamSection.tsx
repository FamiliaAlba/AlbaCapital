import { useState } from "react";
import { useTeamMembers, type PublicTeamMember } from "@/hooks/useTeamMembers";
import { useI18n } from "@/i18n/I18nProvider";
import TeamMemberModal from "@/components/TeamMemberModal";

const TeamSection = () => {
  const { locale, t } = useI18n();
  const { members, loading, error } = useTeamMembers(locale);
  const [selected, setSelected] = useState<PublicTeamMember | null>(null);

  // Sin integrantes publicados: no se muestran tarjetas de ejemplo.
  // Se oculta la sección completa en vez de mostrar contenido ficticio.
  if (!loading && !error && members.length === 0) {
    return null;
  }

  return (
    <section id="equipo" className="py-24 md:py-32 scroll-mt-24">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <p className="text-minimal text-muted-foreground mb-3">{t("team.eyebrow")}</p>
          <h2 className="text-4xl md:text-6xl font-light text-architectural">{t("team.title")}</h2>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] w-full animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        )}

        {error && <p className="text-center text-sm text-muted-foreground">{t("team.error")}</p>}

        {!loading && !error && members.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {members.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => setSelected(member)}
                className="group text-left rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-haspopup="dialog"
              >
                <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-muted">
                  {member.photoUrl && (
                    <img
                      src={member.photoUrl}
                      alt={member.photoAlt}
                      loading="lazy"
                      className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
                    />
                  )}
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-foreground">{member.fullName}</h3>
                  <p className="text-minimal text-muted-foreground mt-1">{member.roleTitle}</p>
                  {(member.city || member.country) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {[member.city, member.country].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && <TeamMemberModal member={selected} onClose={() => setSelected(null)} />}

      {!loading && !error && members.length > 0 && (
        <script
          type="application/ld+json"
          // JSON-LD generado a partir de datos ya filtrados como públicos.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              members.map((m) => ({
                "@context": "https://schema.org",
                "@type": "Person",
                name: m.fullName,
                jobTitle: m.roleTitle,
                ...(m.publicEmail ? { email: m.publicEmail } : {}),
                ...(m.linkedinUrl ? { sameAs: [m.linkedinUrl] } : {}),
                worksFor: { "@type": "Organization", name: "Alba Capital" },
              })),
            ),
          }}
        />
      )}
    </section>
  );
};

export default TeamSection;
