module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/src'],
	testMatch: ['**/*.test.ts'],
	moduleFileExtensions: ['ts', 'js'],
	collectCoverageFrom: [
		'src/**/*.ts',
		'!src/**/*.test.ts',
		'!src/main.ts',
		'!src/ui/**',
		'!src/endpoints/**',
	],
	coverageDirectory: 'coverage',
	coverageReporters: ['text', 'lcov', 'html'],
};
