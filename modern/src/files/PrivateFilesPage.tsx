import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient, ApiResponseError } from "../api/client";
import {
  privateFilePurposes,
  type PrivateFileDto,
  type PrivateFilePurpose,
} from "../api/contracts";
import { useAuth } from "../auth/AuthContext";
import {
  acceptedFileTypes,
  formatBytes,
  privateFilePolicies,
  validateSelectedFile,
} from "./file-policy";

type PrivateFilesApi = typeof apiClient.files;

type StatusMessage = {
  kind: "success" | "error";
  text: string;
} | null;

function errorMessage(error: unknown): string {
  if (error instanceof ApiResponseError) {
    if (error.status === 401) return "Tu sesión ya no es válida. Volvé a ingresar.";
    if (error.code === "FILE_PURPOSE_ALREADY_EXISTS") {
      return "Ya existe un archivo activo para este espacio. Eliminá el actual antes de subir otro.";
    }
    if (error.status === 413) return "El archivo supera el límite permitido por el servidor.";
    if (error.status === 415) {
      return "El servidor rechazó el formato o detectó que el contenido no coincide con el tipo declarado.";
    }
    if (error.status === 503) {
      return "El almacenamiento privado no está disponible en este momento.";
    }
    return error.message;
  }
  return error instanceof Error ? error.message : "No se pudo completar la operación.";
}

function fileByPurpose(
  items: readonly PrivateFileDto[],
): Partial<Record<PrivateFilePurpose, PrivateFileDto>> {
  return Object.fromEntries(items.map((item) => [item.purpose, item])) as Partial<
    Record<PrivateFilePurpose, PrivateFileDto>
  >;
}

function triggerPrivateDownload(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

export function PrivateFilesPage({
  filesApi = apiClient.files,
}: {
  filesApi?: PrivateFilesApi;
}) {
  const { status } = useAuth();
  const [items, setItems] = useState<readonly PrivateFileDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyPurpose, setBusyPurpose] = useState<PrivateFilePurpose | null>(null);
  const [busyFileId, setBusyFileId] = useState<string | null>(null);
  const [selected, setSelected] = useState<
    Partial<Record<PrivateFilePurpose, File>>
  >({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [message, setMessage] = useState<StatusMessage>(null);

  const byPurpose = useMemo(() => fileByPurpose(items), [items]);

  async function refresh() {
    setLoading(true);
    setMessage(null);
    try {
      const result = await filesApi.list();
      setItems(result.items);
    } catch (error) {
      setMessage({ kind: "error", text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated") void refresh();
    if (status === "anonymous") {
      setItems([]);
      setSelected({});
    }
  }, [status]);

  if (status === "loading") {
    return (
      <section className="page-section" aria-busy="true">
        <h1>Archivos privados</h1>
        <p>Verificando tu sesión…</p>
      </section>
    );
  }

  if (status !== "authenticated") {
    return (
      <section className="page-section private-files-intro">
        <p className="eyebrow">Privacidad B5</p>
        <h1>Archivos privados</h1>
        <p>
          Este espacio requiere una sesión activa. Los archivos se descargan por
          la API autenticada y no usan URLs públicas permanentes.
        </p>
        <Link className="button-link" to="/login">
          Ingresar para continuar
        </Link>
      </section>
    );
  }

  async function uploadPurpose(purpose: PrivateFilePurpose) {
    const file = selected[purpose];
    if (!file) {
      setMessage({ kind: "error", text: "Elegí un archivo antes de subirlo." });
      return;
    }
    const localError = validateSelectedFile(purpose, file);
    if (localError) {
      setMessage({ kind: "error", text: localError });
      return;
    }

    setBusyPurpose(purpose);
    setMessage(null);
    try {
      const created = await filesApi.upload(purpose, file);
      setItems((current) => [
        ...current.filter((item) => item.purpose !== purpose),
        created,
      ]);
      setSelected((current) => ({ ...current, [purpose]: undefined }));
      setMessage({
        kind: "success",
        text: `${privateFilePolicies[purpose].label} guardado en almacenamiento privado.`,
      });
    } catch (error) {
      setMessage({ kind: "error", text: errorMessage(error) });
    } finally {
      setBusyPurpose(null);
    }
  }

  async function downloadFile(file: PrivateFileDto) {
    setBusyFileId(file.id);
    setMessage(null);
    try {
      const blob = await filesApi.download(file.id);
      triggerPrivateDownload(blob, file.originalName);
      setMessage({
        kind: "success",
        text: "Descarga privada preparada desde tu sesión actual.",
      });
    } catch (error) {
      setMessage({ kind: "error", text: errorMessage(error) });
    } finally {
      setBusyFileId(null);
    }
  }

  async function deleteFile(file: PrivateFileDto) {
    setBusyFileId(file.id);
    setMessage(null);
    try {
      await filesApi.delete(file.id);
      setItems((current) => current.filter((item) => item.id !== file.id));
      setConfirmDeleteId(null);
      setMessage({
        kind: "success",
        text: `${privateFilePolicies[file.purpose].label} eliminado.`,
      });
    } catch (error) {
      setMessage({ kind: "error", text: errorMessage(error) });
    } finally {
      setBusyFileId(null);
    }
  }

  return (
    <section className="page-section private-files-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Privacidad B5</p>
          <h1>Archivos privados</h1>
          <p className="page-lede">
            Cada espacio admite un solo archivo activo. El navegador hace una
            validación preliminar de tamaño/formato; el backend vuelve a verificar
            los bytes reales antes de activar el archivo.
          </p>
        </div>
        <button type="button" className="secondary-button" onClick={() => void refresh()} disabled={loading}>
          {loading ? "Actualizando…" : "Actualizar"}
        </button>
      </div>

      {message ? (
        <p
          className={message.kind === "error" ? "form-error" : "form-success"}
          role={message.kind === "error" ? "alert" : "status"}
          aria-live="polite"
        >
          {message.text}
        </p>
      ) : null}

      <div className="private-file-grid" aria-busy={loading || undefined}>
        {privateFilePurposes.map((purpose) => {
          const policy = privateFilePolicies[purpose];
          const active = byPurpose[purpose];
          const chosen = selected[purpose];
          const inputId = `private-file-${purpose}`;
          const busy = busyPurpose === purpose || busyFileId === active?.id;

          return (
            <article className="private-file-card" key={purpose}>
              <div className="private-file-card__heading">
                <div>
                  <h2>{policy.label}</h2>
                  <p>{policy.description}</p>
                </div>
                <span className={active ? "status-chip status-chip--ready" : "status-chip"}>
                  {active ? "Guardado" : "Vacío"}
                </span>
              </div>

              <p className="private-file-rules">
                {policy.extensions.join(", ").toUpperCase()} · máximo {formatBytes(policy.maxBytes)}
              </p>

              {active ? (
                <div className="private-file-current">
                  <strong>{active.originalName}</strong>
                  <span>{formatBytes(active.bytes)}</span>
                  <span>SHA-256 verificado por servidor</span>
                  <div className="inline-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => void downloadFile(active)}
                      disabled={busy}
                    >
                      {busyFileId === active.id ? "Preparando…" : "Descargar"}
                    </button>
                    {confirmDeleteId === active.id ? (
                      <>
                        <button
                          type="button"
                          className="danger-button"
                          onClick={() => void deleteFile(active)}
                          disabled={busy}
                        >
                          Confirmar eliminación
                        </button>
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => setConfirmDeleteId(null)}
                          disabled={busy}
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => setConfirmDeleteId(active.id)}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                  <p className="private-file-replace-note">
                    Para reemplazar este archivo primero eliminá el actual. B5 no
                    finge un reemplazo atómico que el backend no ofrece.
                  </p>
                </div>
              ) : (
                <div className="private-file-upload">
                  <label htmlFor={inputId}>Seleccionar archivo</label>
                  <input
                    id={inputId}
                    type="file"
                    accept={acceptedFileTypes(purpose)}
                    disabled={busy}
                    onChange={(event) => {
                      const file = event.target.files?.item(0) ?? undefined;
                      setSelected((current) => ({ ...current, [purpose]: file }));
                      setMessage(null);
                    }}
                  />
                  {chosen ? (
                    <p className="selected-file" role="status">
                      {chosen.name} · {formatBytes(chosen.size)}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void uploadPurpose(purpose)}
                    disabled={!chosen || busy}
                  >
                    {busyPurpose === purpose ? "Subiendo…" : "Guardar de forma privada"}
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <aside className="privacy-note" aria-label="Límites del flujo B5">
        <h2>Qué significa guardar acá</h2>
        <p>
          Estos archivos quedan privados y asociados a tu cuenta. Guardar los tres
          documentos Premium no envía automáticamente una solicitud ni cambia tu
          rol: ese workflow requiere un contrato propio del backend. Del mismo modo,
          la confirmación de una orden no se presenta como prueba de que un email fue
          entregado.
        </p>
      </aside>
    </section>
  );
}
