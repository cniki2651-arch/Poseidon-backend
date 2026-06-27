jest.mock('../../config/db', () => ({
  query: jest.fn(),
}));

const pool = require('../../config/db');
const { crearZarpe } = require('../zarpesController'); 

function crearResMock() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('Pruebas Unitarias - Módulo de Operaciones (Zarpes)', () => {
  beforeEach(() => {
    pool.query.mockReset(); 
  });

  test('CP-CN-ZAR-01: Devuelve 403 (Prohibido) si el socio tiene deuda pendiente', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ deudas_vencidas: '2' }] 
    });

    const req = {
      body: { 
        id_socio: 7, 
        id_embarcacion: 3, 
        id_tripulante: 1,
        destino: 'Isla San Lorenzo'
      }
    };
    const res = crearResMock();

    await crearZarpe(req, res);

    expect(res.status).toHaveBeenCalledWith(403); 
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'Operación denegada. El socio mantiene deuda activa con el club.' 
    });
    
    expect(pool.query).toHaveBeenCalledTimes(1); 
  });
});