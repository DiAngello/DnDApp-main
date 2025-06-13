describe('Criação de Personagem', () => {
  beforeEach(() => {
    window.localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwIiwidXNlcm5hbWUiOiJKb8OjbyIsImlhdCI6MTc0OTgzMzg0MSwiZXhwIjoxNzQ5OTIwMjQxfQ.gPp6yuOJ-zegO_JK_XkgK14xZ5U60Uj67e41Csk_cR8');
    cy.visit('/novo-personagem.html');
  });

  it('deve preencher e salvar todos os blocos corretamente', () => {

    // --- Bloco Personagem ---
    const personagem = {
      'nome-personagem': 'Aragorn',
      'classe-nivel': 'Guerreiro 5',
      'antecedente': 'Nobre',
      'nome-jogador': 'João',
      'raca': 'Humano',
      'alinhamento': 'Leal Bom',
      'pontos_experiencia': '1500',
      'classe-armadura': '16',
      'iniciativa': '+2',
      'deslocamento': '30',
      'pontos_vida_max': '45',
      'pontos_vida_atual': '45',
      'pontos_vida_temp': '0',
      'dado-vida': '1d10',
      'traços_personalidade': 'Líder nato',
      'ideais': 'Defender o reino',
      'vínculos': 'A espada de seu pai',
      'fraquezas': 'Teimoso',
      'idade': '38',
      'altura': '1.98m',
      'peso': '95kg',
      'cor_olhos': 'Cinza',
      'cor_pele': 'Pálida',
      'cor_cabelo': 'Castanho',
      'caracteristicas-adicionais': 'Cicatrizes pelo rosto',
    };

    Object.entries(personagem).forEach(([id, valor]) => {
      if (id === 'caracteristicas-adicionais') {
        cy.get(`textarea[id="${id}"]`).clear().type(valor);
      } else {
        cy.get(`input[id="${id}"]`).clear().type(valor);
      }
    });

    cy.intercept('POST', '/characters').as('criarPersonagem');
    cy.get('#btn-salvar').click();
    cy.wait('@criarPersonagem').its('response.statusCode').should('eq', 201);

    // --- Bloco Atributos ---
    const atributos = {
      'forca': '16',
      'destreza': '14',
      'constituicao': '15',
      'inteligencia': '12',
      'sabedoria': '13',
      'carisma': '11',
      'inspiracao': '12',
      'salvaguarda-forca': '2',
      'salvaguarda-destreza': '0',
      'salvaguarda-constituicao': '2',
      'salvaguarda-inteligencia': '0',
      'salvaguarda-sabedoria': '2',
      'salvaguarda-carisma': '0',
      'acrobacia': '2',
      'arcanismo': '0',
      'atletismo': '2',
      'atuacao': '0',
      'enganacao': '0',
      'furtividade': '2',
      'historia': '0',
      'intimidacao': '2',
      'intuicao': '0',
      'investigacao': '2',
      'lidar-com-animais': '0',
      'medicina': '2',
      'natureza': '0',
      'percepcao': '2',
      'persuasao': '0',
      'prestidigitacao': '2',
      'religiao': '0',
      'sobrevivencia': '2',
    };

    Object.entries(atributos).forEach(([id, valor]) => {
      if (typeof valor === 'boolean') {
        if (valor) {
          cy.get(`input[id="${id}"]`).check({ force: true });
        } else {
          cy.get(`input[id="${id}"]`).uncheck({ force: true });
        }
      } else {
        cy.get(`input[id="${id}"]`).clear().type(valor);
      }
    });

    cy.intercept('POST', '/characters/*/attributes').as('salvarAtributos');
    cy.get('#btn-salvar-atributos').click();
    cy.wait('@salvarAtributos').its('response.statusCode').should('eq', 200);
    cy.get('button.btn-continuar').click();

    // --- Bloco Habilidades ---
    const ataques = [
      { nome: 'Espada Longa', bonus: '+5', dano: '1d8+3 cortante' },
    ];

    for(let i = 1; i < ataques.length; i++) {  
      cy.get('.btn-adicionar').click();
    }
    ataques.forEach((ataque, index) => {
      cy.get('.linha-ataque').eq(index).within(() => {
        cy.get('.input-nome').type(ataque.nome);
        cy.get('.input-bonus').type(ataque.bonus);
        cy.get('.input-dano').type(ataque.dano);
      });
    });

    const habilidades = {
      'caracteristicas-talentos': 'Sentidos aguçados',
    };

    Object.entries(habilidades).forEach(([id, valor]) => {
      cy.get(`textarea[id="${id}"]`).clear().type(valor);
    });

    cy.intercept('POST', '/characters/*/abilities').as('salvarHabilidades');
    cy.get('#btn-salvar-habilidades').click();
    cy.wait('@salvarHabilidades').its('response.statusCode').should('eq', 200);
    cy.get('button.btn-continuar').click();

    // --- Bloco Magias ---
    const magias = {
      'classe-conjuradora': 'Mago',
      'cd-resistencia': '14',
      'bonus-ataque-magia': '+6',
      'habilidade-chave': 'Inteligência',
    };
    
    Object.entries(magias).forEach(([id, valor]) => {
        cy.get(`input[id="${id}"]`).clear().type(valor);
      
    });

    const truques = [
      { nome: 'Luz', preparado: true },
      { nome: 'Raio de Gelo', preparado: false },
      { nome: 'Toque Arrepiante', preparado: true }
    ];

    truques.forEach((truque, index) => {
      cy.get('.linha-magia').eq(index).within(() => {
        cy.get('.input-nome-magia').type(truque.nome);
        if (truque.preparado) {
          cy.get('.checkbox-preparada').check({ force: true });
        }
      });
    });

    cy.intercept('POST', '/characters/*/spells').as('salvarMagias');
    cy.get('#btn-salvar-magias').click();
    cy.wait('@salvarMagias').its('response.statusCode').should('eq', 200);
    cy.get('button.btn-continuar').click();

    // --- Bloco Inventário ---
    const inventario = {
      'pc': '50',
      'pp': '10',
      'pe': '30',
      'po': '15',
      'pl': '5',
    };

    Object.entries(inventario).forEach(([id, valor]) => {
        cy.get(`input[id="${id}"]`).clear().type(valor);
      
    });

    const equipamentos = [
      { nome: 'Espada Longa', quantidade: 1, categoria: 'Arma' },
      { nome: 'Cota de Malha', quantidade: 1, categoria: 'Armadura' },
      { nome: 'Poção de Cura', quantidade: 3, categoria: 'Consumível' }
    ];

    equipamentos.forEach((item, index) => {
      cy.get('.equipamento-campos').eq(index).within(() => {
        cy.get('.input-quantidade').clear().type(item.quantidade.toString());
        cy.get('.input-nome').type(item.nome);
        cy.get('.select-categoria').select(item.categoria);
      });
    });

    cy.intercept('POST', '/characters/*/inventory').as('salvarInventario');
    cy.get('#btn-salvar-inventario').click();
    cy.wait('@salvarInventario').its('response.statusCode').should('eq', 200);

    cy.get('button.btn-finalizar').click();
  });
});
