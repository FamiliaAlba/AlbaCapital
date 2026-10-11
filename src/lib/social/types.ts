export type Network = "instagram" | "facebook" | "linkedin" | "telegram";
export type FormatId = "square" | "portrait" | "story" | "landscape";

export interface PostContent {
  title: string;
  description: string;
  cta: string;
  /** URL pública (o ruta del sitio) de la imagen de portada elegida. */
  imageUrl: string;
  /** Punto focal del recorte, 0..1 en cada eje. */
  focus: { x: number; y: number };
  zoom: number;
  captions: Partial<Record<Network, string>>;
  /** Redes cuyo texto el administrador editó a mano: no se pisa al regenerar. */
  captionEdited: Partial<Record<Network, boolean>>;
}

export interface PieceInfo {
  url: string;
  width: number;
  height: number;
  bytes: number;
}

export type DeliveryStatus = "queued" | "processing" | "published" | "failed" | "needs_review";
export type AccountStatus = "connected" | "needs_reconnect" | "insufficient_permissions" | "pending_approval";
