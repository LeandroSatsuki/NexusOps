import { describe, expect, it } from "vitest";

function isTicketAtRisk(dueAt: Date, now = new Date()) {
  const remaining = dueAt.getTime() - now.getTime();
  return remaining > 0 && remaining <= 60 * 60_000;
}

describe("regras de SLA do ticket", () => {
  it("marca risco quando vence em até uma hora", () => {
    expect(isTicketAtRisk(new Date(Date.now() + 45 * 60_000))).toBe(true);
  });

  it("não marca risco quando já venceu", () => {
    expect(isTicketAtRisk(new Date(Date.now() - 5 * 60_000))).toBe(false);
  });
});

