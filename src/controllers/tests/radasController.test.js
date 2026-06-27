jest.mock('../../config/db', () => ({
  query: jest.fn(),
}));

const pool = require('../../config/db');
const { asignarRada } = require('../radasController'); 

function crearResMock() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('Pruebas Unitarias - Módulo de Operaciones (Radas)', () => {
  beforeEach(() => {
    pool.query.mockReset(); 
  });

  test('CP-CN-RAD-02: Devuelve 409 si se intenta asignar una rada ya ocupada', async () => {
    pool.query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ estado: 'Ocupado' }]
    });

    const req = {
      params: { id: 15 },
      body: { id_embarcacion: 1 }
    };
    const res = crearResMock();

    await asignarRada(req, res);

    expect(res.status).toHaveBeenCalledWith(409); 
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'La rada seleccionada ya se encuentra ocupada. Seleccione otra disponible.' 
    });
    
    expect(pool.query).toHaveBeenCalledTimes(1); 
  });
});