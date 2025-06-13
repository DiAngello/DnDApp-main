const authMiddleware = require('../authMiddleware');
const jwt = require('jsonwebtoken');

// Mock do jwt
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let mockRequest, mockResponse, nextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      headers: {},
      user: null
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
    process.env.JWT_SECRET = 'segredo_teste';
  });

  it('deve retornar 401 se nenhum token for fornecido', async () => {
    await authMiddleware(mockRequest, mockResponse, nextFunction);
    
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Token não fornecido' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('deve retornar 403 para token inválido', async () => {
    mockRequest.headers.authorization = 'Bearer token_invalido';
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(new Error('Token inválido'), null);
    });
    
    await authMiddleware(mockRequest, mockResponse, nextFunction);
    
    expect(jwt.verify).toHaveBeenCalledWith(
      'token_invalido',
      'segredo_teste',
      expect.any(Function)
    );
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Token inválido' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('deve chamar next() e adicionar usuário ao request quando token for válido', async () => {
    const mockUser = { id: 1, username: 'usuario_teste' };
    mockRequest.headers.authorization = 'Bearer token_valido';
    
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(null, mockUser);
    });
    
    await authMiddleware(mockRequest, mockResponse, nextFunction);
    
    expect(jwt.verify).toHaveBeenCalledWith(
      'token_valido',
      'segredo_teste',
      expect.any(Function)
    );
    expect(mockRequest.user).toEqual(mockUser);
    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  it('deve extrair corretamente o token do header Authorization', async () => {
    const mockUser = { id: 1, username: 'usuario_teste' };
    mockRequest.headers.authorization = 'Bearer token_corretamente_formatado';
    
    jwt.verify.mockImplementation((token, secret, callback) => {
      expect(token).toBe('token_corretamente_formatado');
      callback(null, mockUser);
    });
    
    await authMiddleware(mockRequest, mockResponse, nextFunction);
    
    expect(nextFunction).toHaveBeenCalled();
  });

  it('deve lidar com erro inesperado na verificação do token', async () => {
    mockRequest.headers.authorization = 'Bearer token_problema';
    
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(new Error('Erro inesperado'), null);
    });
    
    await authMiddleware(mockRequest, mockResponse, nextFunction);
    
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Token inválido' });
    expect(nextFunction).not.toHaveBeenCalled();
  });
});