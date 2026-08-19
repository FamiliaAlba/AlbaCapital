export type OpportunityStatus = "abierto" | "due-diligence" | "cerrado";

export interface Opportunity {
  id: string;
  nombre: string;
  ubicacion: string;
  tipo: string;
  status: OpportunityStatus;
  tirEstimada: string;
  plazo: string;
  ticketMinimo: string;
  capitalObjetivo: string;
  capitalCaptado: number; // 0-100 %
  descripcion: string;
  highlights: string[];
}

export const opportunities: Opportunity[] = [
  {
    id: "torre-palermo",
    nombre: "Torre Residencial Palermo",
    ubicacion: "Palermo, CABA",
    tipo: "Desarrollo residencial premium",
    status: "abierto",
    tirEstimada: "28% anual",
    plazo: "30 meses",
    ticketMinimo: "USD 25.000",
    capitalObjetivo: "USD 4.2M",
    capitalCaptado: 62,
    descripcion:
      "Edificio boutique de 18 unidades con amenities premium en zona de máxima demanda. Estructura mixta equity + preventa.",
    highlights: ["Permisos aprobados", "Preventa 40% colocada", "Salida 2027"],
  },
  {
    id: "logistico-pilar",
    nombre: "Centro Logístico Pilar",
    ubicacion: "Pilar, Buenos Aires",
    tipo: "Renta logística",
    status: "abierto",
    tirEstimada: "22% anual",
    plazo: "60 meses",
    ticketMinimo: "USD 50.000",
    capitalObjetivo: "USD 8.5M",
    capitalCaptado: 35,
    descripcion:
      "Nave logística de 12.000 m² con contrato triple net firmado a 10 años con operador investment grade.",
    highlights: ["Renta dolarizada", "Inquilino AAA", "Cap rate 9,2%"],
  },
  {
    id: "hotel-mendoza",
    nombre: "Hotel Boutique Mendoza",
    ubicacion: "Valle de Uco, Mendoza",
    tipo: "Hospitality",
    status: "due-diligence",
    tirEstimada: "32% anual",
    plazo: "48 meses",
    ticketMinimo: "USD 30.000",
    capitalObjetivo: "USD 6.0M",
    capitalCaptado: 18,
    descripcion:
      "Hotel boutique 24 llaves en zona vitivinícola con operador internacional bajo contrato de gestión.",
    highlights: ["Operador internacional", "RevPAR proyectado USD 320", "Exit a fondo hotelero"],
  },
  {
    id: "oficinas-nordelta",
    nombre: "Oficinas AAA Nordelta",
    ubicacion: "Nordelta, Buenos Aires",
    tipo: "Renta corporativa",
    status: "abierto",
    tirEstimada: "19% anual",
    plazo: "36 meses",
    ticketMinimo: "USD 20.000",
    capitalObjetivo: "USD 3.5M",
    capitalCaptado: 78,
    descripcion:
      "Edificio corporativo categoría AAA con certificación LEED y mix de inquilinos multinacionales.",
    highlights: ["LEED Gold", "Ocupación 92%", "Renta indexada USD"],
  },
  {
    id: "mixed-use-rosario",
    nombre: "Mixed-Use Rosario Centro",
    ubicacion: "Rosario, Santa Fe",
    tipo: "Desarrollo mixto",
    status: "abierto",
    tirEstimada: "26% anual",
    plazo: "42 meses",
    ticketMinimo: "USD 15.000",
    capitalObjetivo: "USD 5.2M",
    capitalCaptado: 12,
    descripcion:
      "Proyecto de uso mixto residencial + retail con anclas comerciales pre-comprometidas en zona consolidada.",
    highlights: ["Retail pre-anclado", "Permisos en trámite avanzado", "Ticket accesible"],
  },
  {
    id: "industrial-cordoba",
    nombre: "Parque Industrial Córdoba",
    ubicacion: "Córdoba Capital",
    tipo: "Industrial",
    status: "cerrado",
    tirEstimada: "24% anual",
    plazo: "54 meses",
    ticketMinimo: "USD 40.000",
    capitalObjetivo: "USD 7.0M",
    capitalCaptado: 100,
    descripcion:
      "Parque industrial de 4 naves con operadores del sector automotriz. Ronda cerrada — disponible próxima ronda.",
    highlights: ["Sold out", "Próxima ronda Q3", "Operadores firmados"],
  },
];
