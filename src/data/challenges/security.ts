/**
 * @fileoverview Security Challenges
 * @module @mcp/intellibench/data/challenges/security
 * @version 1.0.0
 */

import type { Challenge } from '../../shared/types/index.js';
import { ChallengeCategory, Difficulty } from '../../shared/types/index.js';

export const securityChallenges: Challenge[] = [
    {
        id: 'security_001',
        title: 'Fix SQL Injection Vulnerability',
        description: `The following code is vulnerable to SQL injection. Identify and fix the vulnerability:

\`\`\`typescript
async function getUserByEmail(email: string) {
  const query = \`SELECT * FROM users WHERE email = '\${email}'\`;
  return await db.query(query);
}
\`\`\``,
        category: ChallengeCategory.SECURITY,
        difficulty: 5,
        difficultyTier: Difficulty.MEDIUM,
        requirements: [
            'Identify the SQL injection vulnerability',
            'Fix using parameterized queries',
            'Explain the security implications',
        ],
        templates: [{
            language: 'typescript',
            template: `async function getUserByEmail(email: string) {\n  // Fix the vulnerability\n}`,
            signature: 'async function getUserByEmail(email): Promise<User>',
        }],
        testCases: [
            { id: 'tc1', name: 'Normal input', input: 'test@example.com', expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc2', name: 'Injection attempt', input: "'; DROP TABLE users;--", expectedOutput: true, isHidden: false, points: 50 },
            { id: 'tc3', name: 'Special chars', input: null, expectedOutput: true, isHidden: true, points: 25 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['security', 'sql-injection', 'database'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'security_002',
        title: 'Fix XSS Vulnerability',
        description: `The following React component is vulnerable to XSS. Fix it:

\`\`\`tsx
function UserComment({ comment }: { comment: string }) {
  return <div dangerouslySetInnerHTML={{ __html: comment }} />;
}
\`\`\``,
        category: ChallengeCategory.SECURITY,
        difficulty: 5,
        difficultyTier: Difficulty.MEDIUM,
        requirements: [
            'Remove XSS vulnerability',
            'Sanitize HTML if needed',
            'Allow safe formatting if required',
        ],
        templates: [{
            language: 'typescript',
            template: `function UserComment({ comment }: { comment: string }) {\n  // Fix the XSS vulnerability\n}`,
            signature: 'function UserComment({ comment }): JSX.Element',
        }],
        testCases: [
            { id: 'tc1', name: 'Plain text', input: 'Hello World', expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc2', name: 'Script injection', input: '<script>alert("xss")</script>', expectedOutput: true, isHidden: false, points: 50 },
            { id: 'tc3', name: 'Event handler', input: '<img onerror="alert(1)" src="x">', expectedOutput: true, isHidden: true, points: 25 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['security', 'xss', 'react'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'security_003',
        title: 'Implement Secure Password Hashing',
        description: `Implement a secure password hashing system using bcrypt or argon2. Include functions for hashing and verification.`,
        category: ChallengeCategory.SECURITY,
        difficulty: 6,
        difficultyTier: Difficulty.MEDIUM,
        requirements: [
            'Use a secure hashing algorithm (bcrypt/argon2)',
            'Implement proper salt handling',
            'Add timing-safe comparison',
            'Handle errors gracefully',
        ],
        templates: [{
            language: 'typescript',
            template: `async function hashPassword(password: string): Promise<string> {\n  // Implement secure hashing\n}\n\nasync function verifyPassword(password: string, hash: string): Promise<boolean> {\n  // Implement secure verification\n}`,
            signature: 'hashPassword(password): Promise<string>, verifyPassword(password, hash): Promise<boolean>',
        }],
        testCases: [
            { id: 'tc1', name: 'Hash and verify', input: 'myPassword123', expectedOutput: true, isHidden: false, points: 30 },
            { id: 'tc2', name: 'Wrong password', input: null, expectedOutput: false, isHidden: false, points: 30 },
            { id: 'tc3', name: 'Different hashes', input: null, expectedOutput: true, isHidden: true, points: 40 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['security', 'authentication', 'hashing'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'security_004',
        title: 'Fix Path Traversal Vulnerability',
        description: `The following file server has a path traversal vulnerability. Fix it:

\`\`\`typescript
app.get('/files/:filename', (req, res) => {
  const filePath = path.join(uploadsDir, req.params.filename);
  res.sendFile(filePath);
});
\`\`\``,
        category: ChallengeCategory.SECURITY,
        difficulty: 6,
        difficultyTier: Difficulty.MEDIUM,
        requirements: [
            'Prevent directory traversal attacks',
            'Validate file paths',
            'Return appropriate errors for invalid requests',
        ],
        templates: [{
            language: 'typescript',
            template: `app.get('/files/:filename', (req, res) => {\n  // Fix the path traversal vulnerability\n});`,
            signature: 'GET /files/:filename handler',
        }],
        testCases: [
            { id: 'tc1', name: 'Valid file', input: 'document.pdf', expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc2', name: 'Path traversal', input: '../../../etc/passwd', expectedOutput: 403, isHidden: false, points: 50 },
            { id: 'tc3', name: 'URL encoded', input: '..%2F..%2Fetc%2Fpasswd', expectedOutput: 403, isHidden: true, points: 25 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['security', 'path-traversal', 'file-system'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'security_005',
        title: 'Implement JWT Authentication',
        description: `Implement secure JWT token generation and validation with proper expiration handling.`,
        category: ChallengeCategory.SECURITY,
        difficulty: 7,
        difficultyTier: Difficulty.HARD,
        requirements: [
            'Use secure signing algorithm (RS256 or HS256)',
            'Implement token expiration',
            'Handle token refresh',
            'Validate all claims',
        ],
        templates: [{
            language: 'typescript',
            template: `interface TokenPayload {\n  userId: string;\n  role: string;\n}\n\nfunction generateToken(payload: TokenPayload): string {\n  // Implement\n}\n\nfunction verifyToken(token: string): TokenPayload | null {\n  // Implement\n}`,
            signature: 'generateToken(payload): string, verifyToken(token): TokenPayload | null',
        }],
        testCases: [
            { id: 'tc1', name: 'Generate and verify', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc2', name: 'Expired token', input: null, expectedOutput: null, isHidden: false, points: 25 },
            { id: 'tc3', name: 'Invalid signature', input: null, expectedOutput: null, isHidden: false, points: 25 },
            { id: 'tc4', name: 'Tampered payload', input: null, expectedOutput: null, isHidden: true, points: 25 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['security', 'jwt', 'authentication'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'security_006',
        title: 'Implement Rate Limiting',
        description: `Implement a rate limiter middleware that limits requests per IP address with the following features:
- Configurable window and max requests
- Sliding window algorithm
- Proper headers (X-RateLimit-*)`,
        category: ChallengeCategory.SECURITY,
        difficulty: 6,
        difficultyTier: Difficulty.MEDIUM,
        requirements: [
            'Limit requests per IP',
            'Implement sliding window',
            'Return 429 when exceeded',
            'Add rate limit headers',
        ],
        templates: [{
            language: 'typescript',
            template: `interface RateLimitConfig {\n  windowMs: number;\n  maxRequests: number;\n}\n\nfunction rateLimiter(config: RateLimitConfig) {\n  // Return Express middleware\n}`,
            signature: 'rateLimiter(config): Middleware',
        }],
        testCases: [
            { id: 'tc1', name: 'Under limit', input: null, expectedOutput: 200, isHidden: false, points: 25 },
            { id: 'tc2', name: 'At limit', input: null, expectedOutput: 429, isHidden: false, points: 25 },
            { id: 'tc3', name: 'Window reset', input: null, expectedOutput: 200, isHidden: false, points: 25 },
            { id: 'tc4', name: 'Different IPs', input: null, expectedOutput: true, isHidden: true, points: 25 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['security', 'rate-limiting', 'middleware'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'security_007',
        title: 'Implement CSRF Protection',
        description: `Implement CSRF token generation and validation for a web application.`,
        category: ChallengeCategory.SECURITY,
        difficulty: 6,
        difficultyTier: Difficulty.MEDIUM,
        requirements: [
            'Generate cryptographically secure tokens',
            'Validate tokens on state-changing requests',
            'Handle token expiration',
            'Bind tokens to user sessions',
        ],
        templates: [{
            language: 'typescript',
            template: `class CSRFProtection {\n  generateToken(sessionId: string): string {\n    // Implement\n  }\n  validateToken(sessionId: string, token: string): boolean {\n    // Implement\n  }\n}`,
            signature: 'class CSRFProtection { generateToken, validateToken }',
        }],
        testCases: [
            { id: 'tc1', name: 'Valid token', input: null, expectedOutput: true, isHidden: false, points: 30 },
            { id: 'tc2', name: 'Invalid token', input: null, expectedOutput: false, isHidden: false, points: 30 },
            { id: 'tc3', name: 'Wrong session', input: null, expectedOutput: false, isHidden: true, points: 40 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['security', 'csrf', 'web'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
];

export default securityChallenges;
