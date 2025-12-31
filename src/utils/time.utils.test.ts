import { TimeUtils } from './time.utils';

describe('TimeUtils', () => {
	describe('formatTime24h', () => {
		/*
		 * Given: A date object with morning time (09:05)
		 * When: Formatting to 24-hour format
		 * Then: Returns "09:05" with zero-padded hours and minutes
		 */
		it('should format morning time with zero-padded hours', () => {
			const date = new Date('2024-01-01T09:05:00');
			expect(TimeUtils.formatTime24h(date)).toBe('09:05');
		});

		/*
		 * Given: A date object with afternoon time (14:30)
		 * When: Formatting to 24-hour format
		 * Then: Returns "14:30" in 24-hour format
		 */
		it('should format afternoon time in 24-hour format', () => {
			const date = new Date('2024-01-01T14:30:00');
			expect(TimeUtils.formatTime24h(date)).toBe('14:30');
		});

		/*
		 * Given: A date object at midnight (00:00)
		 * When: Formatting to 24-hour format
		 * Then: Returns "00:00" with zero-padded hours
		 */
		it('should format midnight as 00:00', () => {
			const date = new Date('2024-01-01T00:00:00');
			expect(TimeUtils.formatTime24h(date)).toBe('00:00');
		});

		/*
		 * Given: A date object late at night (23:59)
		 * When: Formatting to 24-hour format
		 * Then: Returns "23:59" without AM/PM notation
		 */
		it('should format late night time without AM/PM', () => {
			const date = new Date('2024-01-01T23:59:00');
			expect(TimeUtils.formatTime24h(date)).toBe('23:59');
		});

		/*
		 * Given: A date object with single-digit minutes (14:05)
		 * When: Formatting to 24-hour format
		 * Then: Returns "14:05" with zero-padded minutes
		 */
		it('should zero-pad single-digit minutes', () => {
			const date = new Date('2024-01-01T14:05:00');
			expect(TimeUtils.formatTime24h(date)).toBe('14:05');
		});
	});

	describe('getCurrentTime24h', () => {
		/*
		 * Given: Current system time
		 * When: Getting current time in 24-hour format
		 * Then: Returns a string matching HH:MM pattern
		 */
		it('should return current time in HH:MM format', () => {
			const result = TimeUtils.getCurrentTime24h();
			expect(result).toMatch(/^\d{2}:\d{2}$/);
		});

		/*
		 * Given: Current system time
		 * When: Getting current time twice within the same minute
		 * Then: Both calls return the same time string
		 */
		it('should return consistent time when called within same minute', () => {
			const time1 = TimeUtils.getCurrentTime24h();
			const time2 = TimeUtils.getCurrentTime24h();
			expect(time1).toBe(time2);
		});
	});
});
