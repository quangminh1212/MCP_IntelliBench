/**
 * @fileoverview Code Refactoring Challenges
 * @module @mcp/intellibench/data/challenges/refactoring
 * @version 1.0.0
 */

import type { Challenge } from '../../shared/types/index.js';
import { ChallengeCategory, Difficulty } from '../../shared/types/index.js';

export const refactoringChallenges: Challenge[] = [
    {
        id: 'refactor_001',
        title: 'Refactor Nested Callbacks',
        description: `Refactor the following callback hell into clean, readable async/await code:

\`\`\`javascript
function fetchUserData(userId, callback) {
  getUser(userId, (err, user) => {
    if (err) return callback(err);
    getPosts(user.id, (err, posts) => {
      if (err) return callback(err);
      getComments(posts[0].id, (err, comments) => {
        if (err) return callback(err);
        callback(null, { user, posts, comments });
      });
    });
  });
}
\`\`\``,
        category: ChallengeCategory.REFACTORING,
        difficulty: 4,
        difficultyTier: Difficulty.EASY,
        requirements: [
            'Convert to async/await syntax',
            'Maintain the same functionality',
            'Add proper error handling',
        ],
        templates: [{
            language: 'typescript',
            template: `async function fetchUserData(userId: string) {\n  // Refactor here\n}`,
            signature: 'async function fetchUserData(userId): Promise<{user, posts, comments}>',
        }],
        testCases: [
            { id: 'tc1', name: 'Success case', input: null, expectedOutput: true, isHidden: false, points: 30 },
            { id: 'tc2', name: 'Error handling', input: null, expectedOutput: true, isHidden: false, points: 35 },
            { id: 'tc3', name: 'Type safety', input: null, expectedOutput: true, isHidden: true, points: 35 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['refactor', 'async', 'clean-code'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'refactor_002',
        title: 'Extract Method Refactoring',
        description: `Refactor this long function by extracting methods:

\`\`\`typescript
function processOrder(order: Order): ProcessedOrder {
  // Validate order
  if (!order.items || order.items.length === 0) throw new Error('Empty order');
  if (!order.customer) throw new Error('No customer');
  if (!order.customer.email) throw new Error('No email');

  // Calculate subtotal
  let subtotal = 0;
  for (const item of order.items) {
    subtotal += item.price * item.quantity;
  }

  // Apply discounts
  let discount = 0;
  if (order.couponCode === 'SAVE10') discount = subtotal * 0.1;
  if (order.customer.membershipLevel === 'gold') discount += subtotal * 0.05;
  if (subtotal > 100) discount += 10;

  // Calculate tax
  const taxableAmount = subtotal - discount;
  const tax = taxableAmount * 0.08;

  // Calculate shipping
  let shipping = 5;
  if (subtotal > 50) shipping = 0;
  if (order.expedited) shipping += 15;

  // Create result
  return {
    orderId: order.id,
    subtotal,
    discount,
    tax,
    shipping,
    total: subtotal - discount + tax + shipping,
    customer: order.customer
  };
}
\`\`\``,
        category: ChallengeCategory.REFACTORING,
        difficulty: 5,
        difficultyTier: Difficulty.MEDIUM,
        requirements: [
            'Extract at least 4 helper methods',
            'Each method should have a single responsibility',
            'Maintain the same output',
        ],
        templates: [{
            language: 'typescript',
            template: `function processOrder(order: Order): ProcessedOrder {\n  // Refactor with extracted methods\n}`,
            signature: 'function processOrder(order): ProcessedOrder',
        }],
        testCases: [
            { id: 'tc1', name: 'Same output', input: null, expectedOutput: true, isHidden: false, points: 40 },
            { id: 'tc2', name: 'Method extraction', input: null, expectedOutput: true, isHidden: false, points: 30 },
            { id: 'tc3', name: 'Clean code', input: null, expectedOutput: true, isHidden: true, points: 30 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['refactor', 'extract-method', 'clean-code'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'refactor_003',
        title: 'Replace Conditionals with Polymorphism',
        description: `Refactor this switch statement using polymorphism:

\`\`\`typescript
class PaymentProcessor {
  processPayment(payment: Payment): Result {
    switch (payment.type) {
      case 'credit_card':
        // 20 lines of credit card processing
        return this.validateCard(payment);
      case 'paypal':
        // 15 lines of PayPal processing
        return this.connectToPayPal(payment);
      case 'crypto':
        // 25 lines of crypto processing
        return this.processBlockchain(payment);
      default:
        throw new Error('Unknown payment type');
    }
  }
}
\`\`\``,
        category: ChallengeCategory.REFACTORING,
        difficulty: 6,
        difficultyTier: Difficulty.MEDIUM,
        requirements: [
            'Create an interface/abstract class for payment handlers',
            'Implement concrete classes for each payment type',
            'Use factory or strategy pattern',
        ],
        templates: [{
            language: 'typescript',
            template: `interface PaymentHandler {\n  // Define interface\n}\n\nclass PaymentProcessor {\n  // Refactor to use polymorphism\n}`,
            signature: 'interface PaymentHandler, class PaymentProcessor',
        }],
        testCases: [
            { id: 'tc1', name: 'Credit card works', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc2', name: 'PayPal works', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc3', name: 'Extensible design', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc4', name: 'No switch', input: null, expectedOutput: true, isHidden: true, points: 25 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['refactor', 'polymorphism', 'design-pattern'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'refactor_004',
        title: 'Remove Code Duplication',
        description: `Remove the duplication in these functions:

\`\`\`typescript
function createAdminUser(data: AdminData) {
  validateEmail(data.email);
  const user = { id: generateId(), email: data.email, createdAt: new Date() };
  await db.users.insert(user);
  await sendWelcomeEmail(user.email);
  await logAudit('user_created', user.id);
  return { ...user, role: 'admin', permissions: data.permissions };
}

function createRegularUser(data: UserData) {
  validateEmail(data.email);
  const user = { id: generateId(), email: data.email, createdAt: new Date() };
  await db.users.insert(user);
  await sendWelcomeEmail(user.email);
  await logAudit('user_created', user.id);
  return { ...user, role: 'user', permissions: ['read'] };
}

function createGuestUser(data: GuestData) {
  validateEmail(data.email);
  const user = { id: generateId(), email: data.email, createdAt: new Date() };
  await db.users.insert(user);
  await sendWelcomeEmail(user.email);
  await logAudit('user_created', user.id);
  return { ...user, role: 'guest', permissions: [], expiresAt: data.expiresAt };
}
\`\`\``,
        category: ChallengeCategory.REFACTORING,
        difficulty: 5,
        difficultyTier: Difficulty.MEDIUM,
        requirements: [
            'Extract common logic to a base function',
            'Keep type safety',
            'Maintain individual function signatures',
        ],
        templates: [{
            language: 'typescript',
            template: `// Refactor to remove duplication\n\nasync function createAdminUser(data: AdminData) {\n  // Implement\n}\n\nasync function createRegularUser(data: UserData) {\n  // Implement\n}\n\nasync function createGuestUser(data: GuestData) {\n  // Implement\n}`,
            signature: 'createAdminUser, createRegularUser, createGuestUser',
        }],
        testCases: [
            { id: 'tc1', name: 'Admin user', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc2', name: 'Regular user', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc3', name: 'Guest user', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc4', name: 'DRY principle', input: null, expectedOutput: true, isHidden: true, points: 25 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['refactor', 'dry', 'clean-code'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'refactor_005',
        title: 'Introduce Dependency Injection',
        description: `Refactor this tightly-coupled class to use dependency injection:

\`\`\`typescript
class UserService {
  async getUser(id: string) {
    const db = new PostgresDatabase();
    const user = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    const cache = new RedisCache();
    await cache.set(\`user:\${id}\`, user);
    const logger = new FileLogger();
    logger.log(\`User \${id} retrieved\`);
    return user;
  }
}
\`\`\``,
        category: ChallengeCategory.REFACTORING,
        difficulty: 6,
        difficultyTier: Difficulty.MEDIUM,
        requirements: [
            'Inject dependencies through constructor',
            'Define interfaces for dependencies',
            'Make the class testable',
        ],
        templates: [{
            language: 'typescript',
            template: `interface Database {\n  // Define\n}\n\ninterface Cache {\n  // Define\n}\n\ninterface Logger {\n  // Define\n}\n\nclass UserService {\n  // Refactor with DI\n}`,
            signature: 'class UserService with dependency injection',
        }],
        testCases: [
            { id: 'tc1', name: 'Works correctly', input: null, expectedOutput: true, isHidden: false, points: 30 },
            { id: 'tc2', name: 'Interfaces defined', input: null, expectedOutput: true, isHidden: false, points: 35 },
            { id: 'tc3', name: 'Testable', input: null, expectedOutput: true, isHidden: true, points: 35 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['refactor', 'dependency-injection', 'testability'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'refactor_006',
        title: 'Convert Class to Functional',
        description: `Refactor this class-based code to functional style:

\`\`\`typescript
class Cart {
  private items: Item[] = [];

  addItem(item: Item) {
    this.items.push(item);
  }

  removeItem(id: string) {
    this.items = this.items.filter(i => i.id !== id);
  }

  getTotal() {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }

  applyDiscount(percent: number) {
    this.items = this.items.map(item => ({
      ...item,
      price: item.price * (1 - percent / 100)
    }));
  }
}
\`\`\``,
        category: ChallengeCategory.REFACTORING,
        difficulty: 5,
        difficultyTier: Difficulty.MEDIUM,
        requirements: [
            'Convert to pure functions',
            'Make cart immutable',
            'No side effects',
        ],
        templates: [{
            language: 'typescript',
            template: `type Cart = readonly Item[];\n\n// Implement pure functions\nfunction addItem(cart: Cart, item: Item): Cart {\n  // Implement\n}\n\nfunction removeItem(cart: Cart, id: string): Cart {\n  // Implement\n}\n\nfunction getTotal(cart: Cart): number {\n  // Implement\n}\n\nfunction applyDiscount(cart: Cart, percent: number): Cart {\n  // Implement\n}`,
            signature: 'addItem, removeItem, getTotal, applyDiscount',
        }],
        testCases: [
            { id: 'tc1', name: 'Add item', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc2', name: 'Remove item', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc3', name: 'Get total', input: null, expectedOutput: true, isHidden: false, points: 25 },
            { id: 'tc4', name: 'Immutability', input: null, expectedOutput: true, isHidden: true, points: 25 },
        ],
        maxScore: 100,
        timeLimit: 300,
        memoryLimit: 256,
        tags: ['refactor', 'functional', 'immutability'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
];

export default refactoringChallenges;
