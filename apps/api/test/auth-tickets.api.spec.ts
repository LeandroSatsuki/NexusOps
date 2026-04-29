import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { AppModule } from "../src/app.module";

describe("auth e tickets API", () => {
  let app: INestApplication;
  let token = "";

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api");
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("autentica admin seedado", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({ email: "admin@nexusops.local", password: "NexusOps@123" })
      .expect(201);

    token = res.body.accessToken;
    expect(token).toBeTruthy();
  });

  it("lista tickets autenticado", async () => {
    const res = await request(app.getHttpServer()).get("/api/tickets").set("Authorization", `Bearer ${token}`).expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

