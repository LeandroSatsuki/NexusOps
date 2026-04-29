import { expect, test } from "@playwright/test";

test("login, abre board, cria ticket e move card", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Senha").fill("NexusOps@123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByText("Dashboard")).toBeVisible();

  await page.getByRole("button", { name: "Chamados" }).click();
  await expect(page.getByRole("button", { name: "Board" })).toBeVisible();

  await page.getByRole("button", { name: "Novo" }).click();
  await page.getByPlaceholder("Título").fill("Teste crítico Playwright");
  await page.getByPlaceholder("Descrição").fill("Ticket criado pelo fluxo crítico do MVP.");
  await page.getByRole("button", { name: "Criar chamado" }).click();
  await expect(page.getByText("Teste crítico Playwright")).toBeVisible();

  const card = page.getByText("Teste crítico Playwright").locator("..");
  const target = page.getByText("Em andamento").locator("..");
  await card.dragTo(target);
});
