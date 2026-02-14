import { calculateTotalAmount, transformClaim } from './claim.schema';

describe('ClaimSchema Logic', () => {
  
  describe('transformClaim (toJSON)', () => {
    it('should map _id to id and remove __v', () => {
      const doc = {}; // Mongoose doc dummy
      const ret = { 
        _id: '507f1f77bcf86cd799439011', 
        __v: 0, 
        title: 'Test' 
      };

      transformClaim(doc, ret);

      expect(ret).toHaveProperty('id', '507f1f77bcf86cd799439011');
      expect(ret).not.toHaveProperty('_id');
      expect(ret).not.toHaveProperty('__v');
      expect(ret.title).toBe('Test');
    });
  });

  describe('calculateTotalAmount (pre-save hook)', () => {
    it('should calculate totalAmount based on damages prices', () => {
      // 1. Simulamos el contexto "this" del documento Mongoose
      const mockContext = {
        isModified: jest.fn().mockReturnValue(true), // Simulamos que 'damages' cambió
        damages: [
          { price: 100 },
          { price: 50.5 },
          { price: 0 }
        ],
        totalAmount: 0 // Valor inicial
      };
      
      const nextFn = jest.fn();

      // 2. Ejecutamos la función bindéandola al contexto mockeado
      calculateTotalAmount.call(mockContext, nextFn);

      // 3. Verificamos que la lógica matemática funcionó
      expect(mockContext.totalAmount).toBe(150.5);
      expect(mockContext.isModified).toHaveBeenCalledWith('damages');
      expect(nextFn).toHaveBeenCalled();
    });

    it('should NOT recalculate if damages are not modified', () => {
      const mockContext = {
        isModified: jest.fn().mockReturnValue(false), // No cambió damages
        damages: [{ price: 100 }],
        totalAmount: 999 // Valor antiguo
      };
      const nextFn = jest.fn();

      calculateTotalAmount.call(mockContext, nextFn);

      expect(mockContext.totalAmount).toBe(999); // No debe cambiar
    });
    
    it('should handle empty damages array safely', () => {
       const mockContext = {
        isModified: jest.fn().mockReturnValue(true),
        damages: [], // Array vacío
        totalAmount: 0
      };
      const nextFn = jest.fn();

      calculateTotalAmount.call(mockContext, nextFn);

      expect(mockContext.totalAmount).toBe(0);
    });
  });
});