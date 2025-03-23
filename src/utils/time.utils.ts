/**
 * Utilities for time operations
 */
export class TimeUtils {
	/**
	 * Format date to HH:MM (24-hour format)
	 * @param date The date to format
	 * @returns Formatted time string
	 */
	static formatTime24h(date: Date): string {
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		return `${hours}:${minutes}`;
	}

	/**
	 * Get current time formatted as HH:MM (24-hour format)
	 * @returns Current time string
	 */
	static getCurrentTime24h(): string {
		return this.formatTime24h(new Date());
	}
}
