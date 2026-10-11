export interface PublishContext {
  /** Token ya descifrado de la cuenta (nunca se registra). */
  token: string;
  externalId: string;
  parentExternalId?: string | null;
  targetKind: string;
  caption: string;
  imageUrl: string;
  link: string;
  altText: string;
  /** Estado persistido del proveedor (p. ej. id de contenedor de Instagram) para reconciliar. */
  state: Record<string, unknown>;
  saveState: (state: Record<string, unknown>) => Promise<void>;
}

export interface PublishResult {
  externalId: string;
  externalUrl?: string;
}

export interface AccountCheck {
  status: "connected" | "needs_reconnect" | "insufficient_permissions" | "pending_approval";
  publishEnabled: boolean;
  detail?: string;
  permissions?: string[];
}
