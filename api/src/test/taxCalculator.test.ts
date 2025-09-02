import { calculateTax, calculateSuper, calculateNet } from '../domain/taxCalculator.js';

describe('Tax Calculator', () => {
  describe('calculateTax', () => {
    test('should return 0 for gross <= 0', () => {
      expect(calculateTax(0)).toBe(0);
      expect(calculateTax(-100)).toBe(0);
    });

    test('should return 0 for gross <= $370', () => {
      expect(calculateTax(200)).toBe(0);
      expect(calculateTax(370)).toBe(0);
    });

    test('should calculate 10% tax for $370.01-$900 bracket', () => {
      expect(calculateTax(400)).toBe(3); // 10% of (400 - 370.01) = 10% of 29.99 = 3.00
      expect(calculateTax(500)).toBe(13); // 10% of (500 - 370.01) = 10% of 129.99 = 13.00
      expect(calculateTax(900)).toBe(53); // 10% of (900 - 370.01) = 10% of 529.99 = 53.00
    });

    test('should calculate tax for $900.01-$1500 bracket', () => {
      expect(calculateTax(1000)).toBe(72); // 53 + 19% of (1000 - 900.01) = 53 + 19% of 99.99 = 53 + 19 = 72
      expect(calculateTax(1200)).toBe(110); // 53 + 19% of (1200 - 900.01) = 53 + 19% of 299.99 = 53 + 57 = 110
      expect(calculateTax(1500)).toBe(167); // 53 + 19% of (1500 - 900.01) = 53 + 19% of 599.99 = 53 + 114 = 167
    });

    test('should calculate tax for higher brackets', () => {
      // Test $1500.01-$3000 bracket (32.5% rate)
      expect(calculateTax(2000)).toBe(329.5); // 167 + 32.5% of (2000 - 1500.01) = 167 + 162.5 = 329.5
      
      // Test $3000.01-$5000 bracket (37% rate)
      expect(calculateTax(4000)).toBe(1024.5); // 654.5 + 37% of (4000 - 3000.01) = 654.5 + 370 = 1024.5
      
      // Test >$5000 bracket (45% rate)
      expect(calculateTax(6000)).toBe(1844.5); // 1394.5 + 45% of (6000 - 5000.01) = 1394.5 + 450 = 1844.5
    });

    test('should handle reference test cases', () => {
      // Alice: gross $1,325.00, tax $133.75
      expect(calculateTax(1325)).toBeCloseTo(133.75, 2);
      
      // Bob: gross $2,328.00, tax $436.10
      expect(calculateTax(2328)).toBeCloseTo(436.10, 2);
    });
  });

  describe('calculateSuper', () => {
    test('should return 0 for gross <= 0', () => {
      expect(calculateSuper(0)).toBe(0);
      expect(calculateSuper(-100)).toBe(0);
    });

    test('should calculate 11.5% super by default', () => {
      expect(calculateSuper(1000)).toBe(115);
      expect(calculateSuper(2000)).toBe(230);
    });

    test('should use custom super rate', () => {
      expect(calculateSuper(1000, 0.10)).toBe(100);
      expect(calculateSuper(1000, 0.12)).toBe(120);
    });

    test('should handle reference test cases', () => {
      // Alice: gross $1,325.00, super $152.38
      expect(calculateSuper(1325)).toBeCloseTo(152.38, 2);
      
      // Bob: gross $2,328.00, super $267.72
      expect(calculateSuper(2328)).toBeCloseTo(267.72, 2);
    });
  });

  describe('calculateNet', () => {
    test('should calculate net pay correctly', () => {
      expect(calculateNet(1000, 100)).toBe(900);
      expect(calculateNet(2000, 300)).toBe(1700);
    });

    test('should handle reference test cases', () => {
      // Alice: gross $1,325.00, tax $133.75, net $1,191.25
      expect(calculateNet(1325, 133.75)).toBeCloseTo(1191.25, 2);
      
      // Bob: gross $2,328.00, tax $436.10, net $1,891.90
      expect(calculateNet(2328, 436.10)).toBeCloseTo(1891.90, 2);
    });
  });
});
