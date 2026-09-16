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
  it("renders an honest reconstruction state for historical product routes", () => {
    render(
      <MemoryRouter initialEntries={["/products"]}>
        <AuthProvider authApi={anonymousAuthApi}>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "Catálogo en reconstrucción" }),
    ).toBeTruthy();
    expect(screen.getByText("No configurada todavía")).toBeTruthy();
  });
});
