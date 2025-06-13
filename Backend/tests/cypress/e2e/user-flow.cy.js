describe("Fluxo de usuário: cadastro, login e perfil", () => {
  const user = {
    username: "usuario_teste",
    email: "usuario_teste@email.com",
    password: "Senha123!"
  };

  it("Deve cadastrar usuário com sucesso", () => {
    cy.request("POST", "http://localhost:3000/register", {
      username: user.username,
      email: user.email,
      senha: user.password
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body.message).to.eq("Usuário criado com sucesso");
    });
  });

  it("Deve realizar login com usuário cadastrado", () => {
    cy.request("POST", "http://localhost:3000/login", {
      username: user.username,
      senha: user.password
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property("token");
      cy.wrap(response.body.token).as("token");
    });
  });

  it("Deve acessar perfil autenticado com token", function () {
    cy.request({
      method: "GET",
      url: "http://localhost:3000/profile",
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.user.username).to.eq(user.username);
    });
  });
});