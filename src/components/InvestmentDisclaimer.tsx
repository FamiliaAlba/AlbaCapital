import { AlertTriangle } from "lucide-react";

/**
 * Aviso de riesgo de inversión. Las cifras de TIR, plazos, capital
 * objetivo/captado y demás datos comerciales que se muestran en el sitio
 * provienen del contenido original del proyecto y no fueron validadas
 * como reales por Alba Capital al momento de esta entrega (ver
 * README_PRODUCTION.md, sección "Datos comerciales pendientes de
 * validar"). Este componente cumple una doble función: transparencia
 * legal mínima y señal explícita de que esas cifras no deben tratarse
 * como una promesa de rentabilidad.
 */
const InvestmentDisclaimer = () => {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/40 p-4 text-xs text-muted-foreground">
      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
      <p>
        Las inversiones inmobiliarias implican riesgos, incluida la posible pérdida del capital invertido. Las
        rentabilidades, plazos y montos exhibidos son estimaciones ilustrativas sujetas a cambio y no constituyen
        una garantía de resultado. Antes de invertir, solicitá el material de due diligence completo y asesoramiento
        profesional independiente.
      </p>
    </div>
  );
};

export default InvestmentDisclaimer;
