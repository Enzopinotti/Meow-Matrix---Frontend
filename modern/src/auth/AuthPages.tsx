import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ApiResponseError } from "../api/client";
import { useAuth } from "./AuthContext";

function authMessage(error: unknown): string {
  if (error instanceof ApiResponseError) {
    if (error.status === 401)
      return "El email o la contraseña no son correctos.";
    if (error.code === "EMAIL_ALREADY_REGISTERED") {
      return "Ya existe una cuenta para ese email.";
    }
    if (error.status === 429) {
      return "Hubo demasiados intentos. Esperá un momento antes de volver a probar.";
    }
    if (error.status === 503) {
      return "La autenticación está temporalmente fuera de servicio. Probá nuevamente más tarde.";
    }
    if (error.code === "RESET_TOKEN_INVALID") {
      return "El enlace de recuperación ya no es válido o expiró.";
    }
    if (error.code === "PASSWORD_REUSE") {
      return "La nueva contraseña debe ser distinta de la actual.";
    }
    if (error.details?.length) {
      return error.details.map((detail) => detail.message).join(" ");
    }
  }
  return error instanceof Error
    ? error.message
    : "No pudimos completar la operación.";
}

function AuthCard({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <section className="auth-card" aria-labelledby="auth-title">
      <p className="eyebrow">Cuenta Meow Matrix</p>
      <h1 id="auth-title">{title}</h1>
      <p>{intro}</p>
      {children}
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  minLength,
  maxLength,
}: {
  label: string;
  name: string;
  type?: "text" | "email" | "password";
  autoComplete: string;
  minLength?: number;
  maxLength?: number;
}) {
  return (
    <label className="auth-field">
      <span>{label}</span>
      <input
        required
        name={name}
        type={type}
        autoComplete={autoComplete}
        {...(minLength === undefined ? {} : { minLength })}
        {...(maxLength === undefined ? {} : { maxLength })}
      />
    </label>
  );
}

function SubmitState({
  pending,
  error,
}: {
  pending: boolean;
  error: string | null;
}) {
  return (
    <>
      {error ? (
        <p className="auth-feedback auth-feedback--error" role="alert">
          {error}
        </p>
      ) : null}
      <button className="primary-action" type="submit" disabled={pending}>
        {pending ? "Procesando…" : "Continuar"}
      </button>
    </>
  );
}

export function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (auth.status === "loading") {
    return (
      <AuthCard title="Ingresar" intro="Comprobando tu sesión…">
        <p role="status">Cargando…</p>
      </AuthCard>
    );
  }

  if (auth.status === "authenticated" && auth.user) {
    return (
      <AuthCard
        title={`Hola, ${auth.user.name}`}
        intro="Tu sesión está controlada por el backend mediante una cookie HttpOnly."
      >
        <dl className="account-summary">
          <div>
            <dt>Email</dt>
            <dd>{auth.user.email}</dd>
          </div>
          <div>
            <dt>Rol</dt>
            <dd>{auth.user.role}</dd>
          </div>
        </dl>
        <button
          className="secondary-action"
          type="button"
          onClick={() => void auth.logout()}
        >
          Cerrar sesión
        </button>
      </AuthCard>
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const data = new FormData(event.currentTarget);
    try {
      await auth.login({
        email: String(data.get("email") ?? ""),
        password: String(data.get("password") ?? ""),
      });
      navigate("/products", { replace: true });
    } catch (cause) {
      setError(authMessage(cause));
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthCard
      title="Ingresar"
      intro="Tu contraseña viaja a la API únicamente para autenticarte; el frontend nunca recibe ni guarda el identificador de sesión."
    >
      {auth.status === "error" && auth.error ? (
        <p className="auth-feedback auth-feedback--error" role="alert">
          {auth.error}{" "}
          <button
            type="button"
            className="link-button"
            onClick={() => void auth.refresh()}
          >
            Reintentar
          </button>
        </p>
      ) : null}
      <form className="auth-form" onSubmit={submit}>
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={254}
        />
        <Field
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="current-password"
          maxLength={4096}
        />
        <SubmitState pending={pending} error={error} />
      </form>
      <p className="auth-links">
        <Link to="/recovery">Olvidé mi contraseña</Link>
        <Link to="/register">Crear cuenta</Link>
      </p>
    </AuthCard>
  );
}

export function RegisterPage() {
  const auth = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") ?? "");
    const confirmation = String(data.get("passwordConfirmation") ?? "");
    if (password !== confirmation) {
      setPending(false);
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      const user = await auth.register({
        name: String(data.get("name") ?? ""),
        lastName: String(data.get("lastName") ?? ""),
        email: String(data.get("email") ?? ""),
        password,
      });
      setCreated(user.email);
      event.currentTarget.reset();
    } catch (cause) {
      setError(authMessage(cause));
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthCard
      title="Crear cuenta"
      intro="El alta aplica la política nueva de contraseña y conserva una única identidad por email."
    >
      {created ? (
        <p className="auth-feedback auth-feedback--success" role="status">
          Cuenta creada para {created}.{" "}
          <Link to="/login">Ya podés ingresar.</Link>
        </p>
      ) : null}
      <form className="auth-form" onSubmit={submit}>
        <div className="auth-grid">
          <Field
            label="Nombre"
            name="name"
            autoComplete="given-name"
            maxLength={80}
          />
          <Field
            label="Apellido"
            name="lastName"
            autoComplete="family-name"
            maxLength={80}
          />
        </div>
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={254}
        />
        <Field
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
        />
        <Field
          label="Repetir contraseña"
          name="passwordConfirmation"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
        />
        <p className="field-hint">
          Usá entre 12 y 128 caracteres. No reutilices una contraseña de otro
          servicio.
        </p>
        <SubmitState pending={pending} error={error} />
      </form>
      <p className="auth-links">
        <Link to="/login">Ya tengo cuenta</Link>
      </p>
    </AuthCard>
  );
}

export function RecoveryPage() {
  const auth = useAuth();
  const [pending, setPending] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const data = new FormData(event.currentTarget);
    try {
      await auth.requestPasswordReset(String(data.get("email") ?? ""));
      setAccepted(true);
    } catch (cause) {
      setError(authMessage(cause));
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthCard
      title="Recuperar contraseña"
      intro="Por seguridad, la respuesta es la misma exista o no una cuenta para el email ingresado."
    >
      {accepted ? (
        <p className="auth-feedback auth-feedback--success" role="status">
          Si existe una cuenta para ese email, vas a recibir un enlace de
          recuperación.
        </p>
      ) : null}
      <form className="auth-form" onSubmit={submit}>
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={254}
        />
        <SubmitState pending={pending} error={error} />
      </form>
      <p className="auth-links">
        <Link to="/login">Volver a ingresar</Link>
      </p>
    </AuthCard>
  );
}

export function ResetPasswordPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const token = search.get("token") ?? "";
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") ?? "");
    const confirmation = String(data.get("passwordConfirmation") ?? "");
    if (password !== confirmation) {
      setPending(false);
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      await auth.confirmPasswordReset({ token, password });
      navigate("/login", { replace: true });
    } catch (cause) {
      setError(authMessage(cause));
    } finally {
      setPending(false);
    }
  }

  if (!token) {
    return (
      <AuthCard
        title="Enlace incompleto"
        intro="Este enlace no contiene un token de recuperación. Solicitá uno nuevo."
      >
        <Link to="/recovery">Solicitar otro enlace</Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Elegir nueva contraseña"
      intro="Al confirmar el cambio, todas las sesiones anteriores de la cuenta se revocan."
    >
      <form className="auth-form" onSubmit={submit}>
        <Field
          label="Nueva contraseña"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
        />
        <Field
          label="Repetir contraseña"
          name="passwordConfirmation"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
        />
        <SubmitState pending={pending} error={error} />
      </form>
    </AuthCard>
  );
}
