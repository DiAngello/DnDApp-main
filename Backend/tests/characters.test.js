const request = require("supertest");
const express = require("express");
const characterRoutes = require("../characters");

// Mocks
jest.mock("../db", () => ({
  pool: {
    query: jest.fn()
  }
}));

jest.mock("../authMiddleware", () => (req, res, next) => {
  req.user = { id: 123 }; 
  next();
});

const { pool } = require("../db");
const app = express();
app.use(express.json());
app.use(characterRoutes);

describe("GET /characters", () => {
  it("deve retornar a lista de personagens do usuário autenticado", async () => {
    const mockRows = [
      { id: 1, nome: "Gimli", classe_nivel: "Guerreiro 5", raca: "Anão", pontos_vida_atual: 40, pontos_vida_max: 40 }
    ];

    pool.query.mockResolvedValueOnce({ rows: mockRows });

    const res = await request(app).get("/characters");

    expect(res.statusCode).toBe(200);
    expect(res.body.characters).toEqual(mockRows);
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("FROM characters"), [123]);
  });

  it("não deve retornar personagens que não pertencem ao usuário autenticado", async () => {
    const mockRows = [
      { id: 1, nome: "Gimli", classe_nivel: "Guerreiro 5", raca: "Anão", pontos_vida_atual: 40, pontos_vida_max: 40}
    ];

    pool.query.mockResolvedValueOnce({ rows: mockRows });

    const res = await request(app).get("/characters");

    expect(res.statusCode).toBe(200);
    expect(res.body.characters).toEqual(mockRows);
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("FROM characters"), [456]);
  });

});
