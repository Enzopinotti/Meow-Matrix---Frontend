import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App routing", () => {
  it("renders an honest reconstruction state for historical product routes", () => {
    render(
      <MemoryRouter initialEntries={["/products"]}>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "Catálogo en reconstrucción" }),
    ).toBeTruthy();
    expect(screen.getByText("No configurada todavía")).toBeTruthy();
  });
});
