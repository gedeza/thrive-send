import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { TIMEZONES, DEFAULT_TIMEZONE, formatDateInTimezone, convertToTimezone, getCurrentDateInTimezone } from '@/config/timezone';

describe('Timezone Configuration', () => {
  it('should have valid timezone list', () => {
    expect(TIMEZONES).toBeDefined();
    expect(TIMEZONES.length).toBeGreaterThan(0);
    TIMEZONES.forEach(tz => {
      expect(tz).toHaveProperty('value');
      expect(tz).toHaveProperty('label');
    });
  });

  it('should have UTC as default timezone', () => {
    expect(DEFAULT_TIMEZONE).toBe('UTC');
  });

  it('should format date in specified timezone', () => {
    const date = new Date('2025-05-27T12:00:00Z');
    const formattedDate = formatDateInTimezone(date, 'America/New_York', 'yyyy-MM-dd HH:mm:ss');
    expect(formattedDate).toBe('2025-05-27 08:00:00');
  });

  it('should convert date to specified timezone', () => {
    const date = new Date('2025-05-27T12:00:00Z');
    const convertedDate = convertToTimezone(date, 'America/New_York');
    expect(convertedDate.getHours()).toBe(8);
  });

  it('should get current date in specified timezone', () => {
    const currentDate = getCurrentDateInTimezone('America/New_York');
    expect(currentDate).toBeInstanceOf(Date);
  });

  it('should handle different timezone conversions correctly', () => {
    const date = new Date('2025-05-27T12:00:00Z');
    
    // Test multiple timezones
    const timezones = [
      { tz: 'America/New_York', expected: '08:00' },
      { tz: 'Europe/London', expected: '13:00' },
      { tz: 'Asia/Tokyo', expected: '21:00' },
    ];

    timezones.forEach(({ tz, expected }) => {
      const formattedTime = formatDateInTimezone(date, tz, 'HH:mm');
      expect(formattedTime).toBe(expected);
    });
  });

  it('should maintain date consistency across timezone conversions', () => {
    const date = new Date('2025-05-27T12:00:00Z');
    const timezones = ['America/New_York', 'Europe/London', 'Asia/Tokyo'];

    timezones.forEach(tz => {
      const convertedDate = convertToTimezone(date, tz);
      const formattedDate = formatDateInTimezone(convertedDate, tz, 'yyyy-MM-dd');
      expect(formattedDate).toBe('2025-05-27');
    });
  });
}); 