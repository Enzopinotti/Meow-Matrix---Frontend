import type {
  PrivateFileMediaType,
  PrivateFilePurpose,
} from "../api/contracts";

const MiB = 1024 * 1024;

export type PrivateFilePurposePolicy = {
  label: string;
  description: string;
  maxBytes: number;
  mediaTypes: readonly PrivateFileMediaType[];
  extensions: readonly string[];
};

export const privateFilePolicies: Readonly<
  Record<PrivateFilePurpose, PrivateFilePurposePolicy>
> = {
  avatar: {
    label: "Avatar privado",
    description:
      "Imagen asociada a tu cuenta. B5 la guarda como archivo privado; no crea una URL pública permanente.",
    maxBytes: 2 * MiB,
    mediaTypes: ["image/jpeg", "image/png", "image/webp"],
    extensions: [".jpg", ".jpeg", ".png", ".webp"],
  },
  "premium-identification": {
    label: "Identificación",
    description:
      "Documento privado de identificación. Guardarlo no envía por sí solo una solicitud Premium.",
    maxBytes: 5 * MiB,
    mediaTypes: ["image/jpeg", "image/png", "application/pdf"],
    extensions: [".jpg", ".jpeg", ".png", ".pdf"],
  },
  "premium-address": {
    label: "Comprobante de domicilio",
    description:
      "Documento privado de domicilio. Guardarlo no cambia tu rol ni dispara una aprobación.",
    maxBytes: 5 * MiB,
    mediaTypes: ["image/jpeg", "image/png", "application/pdf"],
    extensions: [".jpg", ".jpeg", ".png", ".pdf"],
  },
  "premium-bank-statement": {
    label: "Comprobante bancario",
    description:
      "Documento privado bancario. Sólo se accede mediante la API autenticada.",
    maxBytes: 5 * MiB,
    mediaTypes: ["image/jpeg", "image/png", "application/pdf"],
    extensions: [".jpg", ".jpeg", ".png", ".pdf"],
  },
};

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kib = bytes / 1024;
  if (kib < 1024) return `${kib.toFixed(kib >= 10 ? 0 : 1)} KiB`;
  const mib = kib / 1024;
  return `${mib.toFixed(mib >= 10 ? 0 : 1)} MiB`;
}

export function acceptedFileTypes(purpose: PrivateFilePurpose): string {
  return privateFilePolicies[purpose].mediaTypes.join(",");
}

export function validateSelectedFile(
  purpose: PrivateFilePurpose,
  file: File,
): string | null {
  const policy = privateFilePolicies[purpose];
  if (file.size < 1) return "El archivo está vacío.";
  if (file.size > policy.maxBytes) {
    return `El archivo supera el límite de ${formatBytes(policy.maxBytes)}.`;
  }
  if (!policy.mediaTypes.includes(file.type as PrivateFileMediaType)) {
    return "El tipo declarado por el navegador no está permitido para este documento.";
  }
  const dot = file.name.lastIndexOf(".");
  const extension = dot >= 0 ? file.name.slice(dot).toLowerCase() : "";
  if (!policy.extensions.includes(extension)) {
    return "La extensión del archivo no coincide con los formatos permitidos.";
  }
  return null;
}
