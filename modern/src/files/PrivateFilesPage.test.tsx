import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiResponseError } from "../api/client";
import type { PrivateFileDto, UserDto } from "../api/contracts";
import { AuthProvider } from "../auth/AuthContext";
import { PrivateFilesPage } from "./PrivateFilesPage";

const user: UserDto = {
  id: "user-1",
  name: "Ada",
  lastName: "Lovelace",
  email: "ada@example.test",
  role: "user",
  avatarUrl: null,
};

const activeFile: PrivateFileDto = {
  id: "file-1",
  ownerId: user.id,
  purpose: "premium-identification",
  originalName: "identity.pdf",
  mediaType: "application/pdf",
  bytes: 1024,
  sha256: "a".repeat(64),
  createdAt: "2026-09-16T20:00:00.000Z",
};

function authApi(authenticated = true) {
  return {
    async currentUser() {
      if (!authenticated) {
        throw new ApiResponseError(
          401,
          "SESSION_INVALID",
          "Authentication required",
        );
      }
      return user;
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
}

function filesApi(items: readonly PrivateFileDto[] = []) {
  return {
    list: vi.fn(async () => ({ items })),
    upload: vi.fn(async () => activeFile),
    download: vi.fn(
      async () => new Blob(["private"], { type: "application/pdf" }),
    ),
    delete: vi.fn(async () => undefined),
  };
}

function renderPage(
  options: {
    authenticated?: boolean;
    items?: readonly PrivateFileDto[];
  } = {},
) {
  const api = filesApi(options.items);
  render(
    <MemoryRouter>
      <AuthProvider authApi={authApi(options.authenticated ?? true)}>
        <PrivateFilesPage filesApi={api} />
      </AuthProvider>
    </MemoryRouter>,
  );
  return api;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("B5 PrivateFilesPage", () => {
  it("gates private metadata behind the backend-owned session", async () => {
    const api = renderPage({ authenticated: false });

    expect(
      await screen.findByRole("heading", { name: "Archivos privados" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Ingresar para continuar" }),
    ).toBeTruthy();
    expect(api.list).not.toHaveBeenCalled();
  });

  it("renders server metadata and requires explicit confirmation before delete", async () => {
    const api = renderPage({ items: [activeFile] });

    expect(await screen.findByText("identity.pdf")).toBeTruthy();
    expect(screen.getByText(/SHA-256 verificado por servidor/i)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));
    expect(api.delete).not.toHaveBeenCalled();

    fireEvent.click(
      screen.getByRole("button", { name: "Confirmar eliminación" }),
    );
    await waitFor(() => expect(api.delete).toHaveBeenCalledWith("file-1"));
    await waitFor(() => expect(screen.queryByText("identity.pdf")).toBeNull());
  });

  it("blocks a locally invalid avatar selection before contacting the API", async () => {
    const api = renderPage();
    await screen.findByRole("heading", { name: "Archivos privados" });

    const inputs = screen.getAllByLabelText("Seleccionar archivo");
    const invalidAvatar = new File(["%PDF"], "avatar.pdf", {
      type: "application/pdf",
    });
    const fileList = {
      0: invalidAvatar,
      length: 1,
      item(index: number) {
        return index === 0 ? invalidAvatar : null;
      },
    } as unknown as FileList;
    fireEvent.change(inputs[0] as HTMLInputElement, {
      target: { files: fileList },
    });

    const uploadButtons = screen.getAllByRole("button", {
      name: "Guardar de forma privada",
    });
    fireEvent.click(uploadButtons[0] as HTMLButtonElement);

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toMatch(/tipo declarado por el navegador/i);
    expect(api.upload).not.toHaveBeenCalled();
  });

  it("uses and revokes an ephemeral object URL for authenticated download", async () => {
    const createObjectURL = vi.fn(() => "blob:private-file");
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURL,
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    const api = renderPage({ items: [activeFile] });
    await screen.findByText("identity.pdf");
    fireEvent.click(screen.getByRole("button", { name: "Descargar" }));

    await waitFor(() => expect(api.download).toHaveBeenCalledWith("file-1"));
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:private-file");
  });
});
