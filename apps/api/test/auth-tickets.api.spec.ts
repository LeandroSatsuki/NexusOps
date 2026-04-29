import "reflect-metadata";
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { AppModule } from "../src/app.module";

describe("auth e tickets API", () => {
  let app: INestApplication;
  let token = "";
  let refreshToken = "";

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
    refreshToken = res.body.refreshToken;
    expect(token).toBeTruthy();
    expect(refreshToken).toBeTruthy();
  });

  it("lista tickets autenticado", async () => {
    const res = await request(app.getHttpServer()).get("/api/tickets").set("Authorization", `Bearer ${token}`).expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("rotaciona refresh token e rejeita reutilização", async () => {
    const rotated = await request(app.getHttpServer()).post("/api/auth/refresh").send({ refreshToken }).expect(201);

    expect(rotated.body.accessToken).toBeTruthy();
    expect(rotated.body.refreshToken).toBeTruthy();
    expect(rotated.body.refreshToken).not.toBe(refreshToken);

    await request(app.getHttpServer()).post("/api/auth/refresh").send({ refreshToken }).expect(401);
  });

  it("revoga sessão no logout", async () => {
    const login = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({ email: "admin@nexusops.local", password: "NexusOps@123" })
      .expect(201);

    await request(app.getHttpServer()).post("/api/auth/logout").set("Authorization", `Bearer ${login.body.accessToken}`).expect(201);
    await request(app.getHttpServer()).get("/api/auth/me").set("Authorization", `Bearer ${login.body.accessToken}`).expect(401);
  });
});
