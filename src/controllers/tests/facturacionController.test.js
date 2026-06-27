// 1. Aislamos la base de datos (Mockeamos pool.connect para las transacciones)
jest.mock('../config/db', () => ({
    connect: jest.fn(),
}));

const pool = require('../../config/db');
const { fraccionarDeuda } = require('../facturacionController');

// 2. Simulador de la respuesta HTTP
function crearResMock() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe('Pruebas Unitarias - Módulo de Finanzas (Fraccionamiento)', () => {
    let mockClient;

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockClient = {
            query: jest.fn(),
            release: jest.fn(),
        };
        pool.connect.mockResolvedValue(mockClient);
    });

    // ── PRUEBA 1: Validación Matemática (Caja Blanca) ──
    test('Devuelve 400 si el número de cuotas es mayor a 6 (Regla de negocio)', async () => {
        const req = {
            body: { id_factura: 15, cuotas: 8 }, // 8 cuotas es INVÁLIDO (máximo 6)
            usuario: { id_usuario: 4 }
        };
        const res = crearResMock();

        await fraccionarDeuda(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            mensaje: 'Se requiere un ID de factura válido y un número de cuotas entre 2 y 6.'
        });
        
        expect(pool.connect).not.toHaveBeenCalled();
    });

    // ── PRUEBA 2: Integridad Relacional (Rollback) ──
    test('Devuelve 404 y hace ROLLBACK si la factura no existe o ya está pagada', async () => {
        mockClient.query.mockResolvedValueOnce();
        mockClient.query.mockResolvedValueOnce({ rows: [] });

        const req = {
            body: { id_factura: 999, cuotas: 3 }, 
            usuario: { id_usuario: 4 }
        };
        const res = crearResMock();

        await fraccionarDeuda(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            mensaje: 'Factura no encontrada o ya procesada.'
        });

        expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
        expect(mockClient.release).toHaveBeenCalled(); 
    });
});