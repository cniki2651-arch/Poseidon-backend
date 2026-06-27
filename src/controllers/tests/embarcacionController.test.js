// src/controllers/embarcacionController.test.js

jest.mock('../config/db', () => ({
  query: jest.fn(),
}));

const pool = require('../../config/db');
// 1. Corregimos el nombre de la función importada
const { crearEmbarcacion } = require('../embarcacionesController'); 

function crearResMock() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('Pruebas Unitarias - Embarcaciones', () => {
  beforeEach(() => {
    pool.query.mockReset(); 
  });

  test('CP-CN-EMB-02: Devuelve 400 si la eslora es negativa o cero', async () => {
    const req = {
      body: { 
        id_socio: 5, 
        nombre_nave: 'Poseidón II', // 2. Corregimos el nombre de la variable
        matricula: 'PT-1234', 
        tipo: 'Yate', 
        eslora: -5 
      }
    };
    const res = crearResMock();

    // 3. Llamamos a la función con el nombre correcto
    await crearEmbarcacion(req, res);

    expect(res.status).toHaveBeenCalledWith(400); 
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'La eslora es obligatoria y debe ser un valor positivo mayor a cero.' 
    });
    
    expect(pool.query).not.toHaveBeenCalled(); 
  });
});