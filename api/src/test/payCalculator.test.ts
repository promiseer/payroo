import { 
  calculateHours, 
  calculateGrossPay, 
  parseTimeToMinutes, 
  calculateWorkedMinutes,
  minutesToHours 
} from '../domain/payCalculator.js';
import { TimesheetEntry } from '../domain/types.js';

describe('Pay Calculator', () => {
  describe('parseTimeToMinutes', () => {
    test('should parse time correctly', () => {
      expect(parseTimeToMinutes('09:00')).toBe(540);
      expect(parseTimeToMinutes('17:30')).toBe(1050);
      expect(parseTimeToMinutes('00:00')).toBe(0);
      expect(parseTimeToMinutes('23:59')).toBe(1439);
    });
  });

  describe('calculateWorkedMinutes', () => {
    test('should calculate worked minutes correctly', () => {
      const entry: TimesheetEntry = {
        date: '2025-08-11',
        start: '09:00',
        end: '17:30',
        unpaidBreakMins: 30
      };
      
      // 17:30 - 09:00 = 510 minutes, minus 30 break = 480 minutes
      expect(calculateWorkedMinutes(entry)).toBe(480);
    });

    test('should handle same start and end time', () => {
      const entry: TimesheetEntry = {
        date: '2025-08-11',
        start: '09:00',
        end: '09:00',
        unpaidBreakMins: 0
      };
      
      expect(calculateWorkedMinutes(entry)).toBe(0);
    });

    test('should not return negative minutes', () => {
      const entry: TimesheetEntry = {
        date: '2025-08-11',
        start: '09:00',
        end: '10:00',
        unpaidBreakMins: 120 // 2 hours break for 1 hour work
      };
      
      expect(calculateWorkedMinutes(entry)).toBe(0);
    });
  });

  describe('minutesToHours', () => {
    test('should convert minutes to hours correctly', () => {
      expect(minutesToHours(60)).toBe(1);
      expect(minutesToHours(90)).toBe(1.5);
      expect(minutesToHours(480)).toBe(8);
      expect(minutesToHours(37)).toBe(0.62);
    });
  });

  describe('calculateHours', () => {
    test('should calculate normal hours when under threshold', () => {
      const entries: TimesheetEntry[] = [
        { date: '2025-08-11', start: '09:00', end: '17:00', unpaidBreakMins: 60 }, // 7 hours
        { date: '2025-08-12', start: '09:00', end: '17:00', unpaidBreakMins: 60 }, // 7 hours
        { date: '2025-08-13', start: '09:00', end: '17:00', unpaidBreakMins: 60 }, // 7 hours
        { date: '2025-08-14', start: '09:00', end: '17:00', unpaidBreakMins: 60 }, // 7 hours
        { date: '2025-08-15', start: '09:00', end: '17:00', unpaidBreakMins: 60 }  // 7 hours
      ]; // Total: 35 hours

      const result = calculateHours(entries);
      expect(result.normalHours).toBe(35);
      expect(result.overtimeHours).toBe(0);
    });

    test('should calculate overtime hours when over threshold', () => {
      const entries: TimesheetEntry[] = [
        { date: '2025-08-11', start: '08:00', end: '18:00', unpaidBreakMins: 60 }, // 9 hours
        { date: '2025-08-12', start: '08:00', end: '18:00', unpaidBreakMins: 60 }, // 9 hours
        { date: '2025-08-13', start: '08:00', end: '18:00', unpaidBreakMins: 60 }, // 9 hours
        { date: '2025-08-14', start: '08:00', end: '18:00', unpaidBreakMins: 60 }, // 9 hours
        { date: '2025-08-15', start: '08:00', end: '18:00', unpaidBreakMins: 60 }  // 9 hours
      ]; // Total: 45 hours

      const result = calculateHours(entries);
      expect(result.normalHours).toBe(38);
      expect(result.overtimeHours).toBe(7);
    });

    test('should handle Alice reference case', () => {
      const aliceEntries: TimesheetEntry[] = [
        { date: '2025-08-11', start: '09:00', end: '17:30', unpaidBreakMins: 30 }, // 8 hours
        { date: '2025-08-12', start: '09:00', end: '17:30', unpaidBreakMins: 30 }, // 8 hours
        { date: '2025-08-13', start: '09:00', end: '17:30', unpaidBreakMins: 30 }, // 8 hours
        { date: '2025-08-14', start: '09:00', end: '15:00', unpaidBreakMins: 30 }, // 5.5 hours
        { date: '2025-08-15', start: '10:00', end: '18:00', unpaidBreakMins: 30 }  // 7.5 hours
      ]; // Total: 37 hours

      const result = calculateHours(aliceEntries);
      expect(result.normalHours).toBe(37);
      expect(result.overtimeHours).toBe(0);
    });

    test('should handle Bob reference case', () => {
      const bobEntries: TimesheetEntry[] = [
        { date: '2025-08-11', start: '08:00', end: '18:00', unpaidBreakMins: 60 }, // 9 hours
        { date: '2025-08-12', start: '08:00', end: '18:00', unpaidBreakMins: 60 }, // 9 hours
        { date: '2025-08-13', start: '08:00', end: '18:00', unpaidBreakMins: 60 }, // 9 hours
        { date: '2025-08-14', start: '08:00', end: '18:00', unpaidBreakMins: 60 }, // 9 hours
        { date: '2025-08-15', start: '08:00', end: '18:00', unpaidBreakMins: 60 }  // 9 hours
      ]; // Total: 45 hours

      const result = calculateHours(bobEntries);
      expect(result.normalHours).toBe(38);
      expect(result.overtimeHours).toBe(7);
    });
  });

  describe('calculateGrossPay', () => {
    test('should calculate gross pay without overtime', () => {
      const gross = calculateGrossPay(35, 0, 25, 50);
      expect(gross).toBe(925); // 35 * 25 + 0 + 50 = 925
    });

    test('should calculate gross pay with overtime', () => {
      const gross = calculateGrossPay(38, 7, 48, 0);
      expect(gross).toBe(2328); // 38 * 48 + 7 * 48 * 1.5 = 1824 + 504 = 2328
    });

    test('should handle Alice reference case', () => {
      const gross = calculateGrossPay(37, 0, 35, 30);
      expect(gross).toBe(1325); // 37 * 35 + 0 + 30 = 1295 + 30 = 1325
    });

    test('should handle Bob reference case', () => {
      const gross = calculateGrossPay(38, 7, 48, 0);
      expect(gross).toBe(2328); // 38 * 48 + 7 * 48 * 1.5 = 1824 + 504 = 2328
    });
  });
});
