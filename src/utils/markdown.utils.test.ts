import { MarkdownUtils } from './markdown.utils';

describe('MarkdownUtils', () => {
	describe('normalizeHeadingText', () => {
		it('should trim whitespace and convert to lowercase', () => {
			expect(MarkdownUtils.normalizeHeadingText('  Log Items  ')).toBe('log items');
		});

		it('should remove trailing punctuation', () => {
			expect(MarkdownUtils.normalizeHeadingText('Activity Log:')).toBe('activity log');
			expect(MarkdownUtils.normalizeHeadingText('Done Today!')).toBe('done today');
			expect(MarkdownUtils.normalizeHeadingText('Notes...')).toBe('notes');
		});

		it('should handle multiple trailing punctuation marks', () => {
			expect(MarkdownUtils.normalizeHeadingText('What?!?')).toBe('what');
			expect(MarkdownUtils.normalizeHeadingText('Hello...')).toBe('hello');
		});

		it('should handle text with no punctuation', () => {
			expect(MarkdownUtils.normalizeHeadingText('Simple Text')).toBe('simple text');
		});

		it('should handle empty strings', () => {
			expect(MarkdownUtils.normalizeHeadingText('')).toBe('');
			expect(MarkdownUtils.normalizeHeadingText('   ')).toBe('');
		});
	});
});
