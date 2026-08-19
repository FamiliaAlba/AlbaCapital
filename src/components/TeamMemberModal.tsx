import { useEffect, useRef } from "react";
import { X, Mail, Phone, Linkedin, ExternalLink, MapPin } from "lucide-react";
import type { PublicTeamMember } from "@/hooks/useTeamMembers";

interface TeamMemberModalProps {
  member: PublicTeamMember;
  onClose: () => void;
}

const TeamMemberModal = ({ member, onClose }: TeamMemberModalProps) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      // Trampa de foco simple dentro del modal
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, a[href], input, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [onClose]);

  const locationText = member.locationLabel || [member.city, member.country].filter(Boolean).join(", ");

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-member-modal-title"
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-background shadow-2xl"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid gap-0 md:grid-cols-[280px_1fr]">
          {member.photoUrl && (
            <div className="aspect-[3/4] w-full overflow-hidden md:aspect-auto md:h-full">
              <img
                src={member.photoUrl}
                alt={member.photoAlt}
                className="h-full w-full object-cover grayscale contrast-110"
              />
            </div>
          )}

          <div className="p-6 md:p-8 space-y-4">
            <div>
              <h2 id="team-member-modal-title" className="text-2xl md:text-3xl font-light text-architectural">
                {member.fullName}
              </h2>
              <p className="mt-1 text-minimal text-muted-foreground">{member.roleTitle}</p>
            </div>

            {(member.specialty || member.department) && (
              <div className="flex flex-wrap gap-2">
                {member.specialty && (
                  <span className="rounded-full bg-muted px-3 py-1 text-xs text-foreground">{member.specialty}</span>
                )}
                {member.department && (
                  <span className="rounded-full bg-muted px-3 py-1 text-xs text-foreground">{member.department}</span>
                )}
              </div>
            )}

            {locationText && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                {locationText}
              </p>
            )}

            {(member.fullBio || member.shortBio) && (
              <p className="text-sm leading-relaxed text-muted-foreground">{member.fullBio || member.shortBio}</p>
            )}

            {(member.publicEmail || member.publicPhone || member.linkedinUrl || member.professionalUrl) && (
              <div className="flex flex-col gap-2 border-t border-border pt-4 text-sm">
                {member.publicEmail && (
                  <a href={`mailto:${member.publicEmail}`} className="flex items-center gap-2 hover:text-muted-foreground">
                    <Mail className="h-4 w-4" /> {member.publicEmail}
                  </a>
                )}
                {member.publicPhone && (
                  <a href={`tel:${member.publicPhone}`} className="flex items-center gap-2 hover:text-muted-foreground">
                    <Phone className="h-4 w-4" /> {member.publicPhone}
                  </a>
                )}
                {member.linkedinUrl && (
                  <a
                    href={member.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-muted-foreground"
                  >
                    <Linkedin className="h-4 w-4" /> LinkedIn
                  </a>
                )}
                {member.professionalUrl && (
                  <a
                    href={member.professionalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-muted-foreground"
                  >
                    <ExternalLink className="h-4 w-4" /> Más información
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberModal;
