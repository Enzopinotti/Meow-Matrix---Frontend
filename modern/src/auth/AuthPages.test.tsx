import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ApiResponseError } from "../api/client";
import type { UserDto } from "../api/contracts";
import { AuthProvider } from "./AuthContext";
import { LoginPage, RecoveryPage, RegisterPage } from "./AuthPages";

const user: UserDto = {
  id: "user-1",
  name: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  role: "user",
  avatarUrl: null,
};

function authApi(overrides: Record<string, unknown> = {}) {
  return {
    currentUser: vi
      .fn()
      .mockRejectedValue(
        new ApiResponseError(401, "SESSION_INVALID", "Authentication required"),
      ),
    login: vi.fn().mockResolvedValue({
      user,
      expiresAt: "2026-09-16T20:00:00.000Z",
    }),
    register: vi.fn().mockResolvedValue(user),
    logout: vi.fn().mockResolvedValue(undefined),
    requestPasswordReset: vi.fn().mockResolvedValue(undefined),
    confirmPasswordReset: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function renderAuthRoute(
  initialEntry: string,
  element: React.ReactNode,
  api = authApi(),
) {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthProvider authApi={api}>
        <Routes>
          <Route path={initialEntry.split("?")[0]} element={element} />
          <Route path="/products" element={<p>Products destination</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
  return api;
}

describe("B3 auth pages", () => {
  it("submits login without exposing a token to the component contract", async () => {
    const api = authApi();
    renderAuthRoute("/login", <LoginPage />, api);

    await waitFor(() => expect(api.currentUser).toHaveBeenCalledOnce());
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "ada@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "legacy-compatible-password" },
    });
    fireEvent.submit(screen.getByLabelText("Email").closest("form")!);

    await waitFor(() =>
      expect(api.login).toHaveBeenCalledWith({
        email: "ada@example.com",
        password: "legacy-compatible-password",
      }),
    );
    expect(await screen.findByText("Products destination")).toBeTruthy();
  });

  it("keeps recovery confirmation generic", async () => {
    const api = authApi();
    renderAuthRoute("/recovery", <RecoveryPage />, api);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "unknown@example.com" },
    });
    fireEvent.submit(screen.getByLabelText("Email").closest("form")!);

    expect(
      await screen.findByText(
        "Si existe una cuenta para ese email, vas a recibir un enlace de recuperación.",
      ),
    ).toBeTruthy();
    expect(api.requestPasswordReset).toHaveBeenCalledWith("unknown@example.com");
  });

  it("blocks mismatched registration passwords before contacting the API", async () => {
    const api = authApi();
    renderAuthRoute("/register", <RegisterPage />, api);

    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Ada" },
    });
    fireEvent.change(screen.getByLabelText("Apellido"), {
      target: { value: "Lovelace" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "ada@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "correct horse battery staple" },
    });
    fireEvent.change(screen.getByLabelText("Repetir contraseña"), {
      target: { value: "different horse battery staple" },
    });
    fireEvent.submit(screen.getByLabelText("Nombre").closest("form")!);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Las contraseñas no coinciden.",
    );
    expect(api.register).not.toHaveBeenCalled();
  });

  it("surfaces a truthful service-unavailable state", async () => {
    const api = authApi({
      login: vi
        .fn()
        .mockRejectedValue(
          new ApiResponseError(503, "AUTH_UNAVAILABLE", "Auth unavailable"),
        ),
    });
    renderAuthRoute("/login", <LoginPage />, api);

    await waitFor(() => expect(api.currentUser).toHaveBeenCalledOnce());
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "ada@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "correct horse battery staple" },
    });
    fireEvent.submit(screen.getByLabelText("Email").closest("form")!);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "La autenticación está temporalmente fuera de servicio.",
    );
  });
});
