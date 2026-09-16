import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { App } from "./App";
import { ApiResponseError } from "./api/client";
import { AuthProvider } from "./auth/AuthContext";

const anonymousAuthApi = {
  async currentUser() {
    throw new ApiResponseError(
      401,
      "SESSION_INVALID",
      "Authentication required",
    );
  },
  async login() {
    throw new Error("unused");
  },
  async register() {
    throw new Error("unused");
  },
  async logout() {},
  async requestPasswordReset() {},
  async confirmPasswordReset() {},
};

describe("App routing", () => {
  it("publishes the B4 commerce authority on the home route", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AuthProvider authApi={anonymousAuthApi}>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "Meow Matrix 2026" }),
    ).toBeTruthy();
    expect(screen.getByText(/checkout idempotente/i)).toBeTruthy();
  });

  it("does not expose a cart to an anonymous browser", async () => {
    render(
      <MemoryRouter initialEntries={["/cart"]}>
        <AuthProvider authApi={anonymousAuthApi}>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole("heading", { name: "Necesitás iniciar sesión" }),
    ).toBeTruthy();
    expect(screen.getByRole("link", { name: "Ingresar" })).toBeTruthy();
  });
});
