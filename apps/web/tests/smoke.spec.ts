import { expect, test } from "@playwright/test";

test("renderiza a tela de login", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "NexusOps" })).toBeVisible();
  await expect(page.getByRole("textbox").first()).toBeVisible();
  await expect(page.getByRole("textbox").nth(1)).toBeVisible();
  await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
});
