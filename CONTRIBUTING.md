# Contributing to MCP IntelliBench

Thank you for your interest in contributing to MCP IntelliBench! 🎉

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Adding Challenges](#adding-challenges)
- [Code Standards](#code-standards)

## 📜 Code of Conduct

Please be respectful and constructive in all interactions. We want this to be a welcoming community.

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR-USERNAME/MCP_IntelliBench.git`
3. Add upstream remote: `git remote add upstream https://github.com/original/MCP_IntelliBench.git`

## 💻 Development Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Build
pnpm build
```

## ✏️ Making Changes

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Add tests for new functionality
4. Ensure all tests pass: `pnpm test`
5. Lint your code: `pnpm lint`
6. Commit with conventional commits: `git commit -m "feat: add new feature"`

### Commit Message Format

We use [Conventional Commits](https://conventionalcommits.org/):

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `test:` Test additions/modifications
- `refactor:` Code refactoring
- `chore:` Maintenance tasks

## 📤 Submitting a Pull Request

1. Push your branch: `git push origin feature/your-feature-name`
2. Open a Pull Request against `main`
3. Fill out the PR template
4. Wait for review

## 🧪 Adding Challenges

To add new benchmark challenges:

1. Create a new file in `src/data/challenges/`
2. Follow the `Challenge` interface in `src/shared/types/index.ts`
3. Include at least 3 test cases
4. Add appropriate difficulty rating (1-10)
5. Tag with relevant categories

Example:

```typescript
{
  id: 'codegen_xxx',
  title: 'Your Challenge Title',
  description: 'Detailed description...',
  category: ChallengeCategory.CODE_GENERATION,
  difficulty: 5,
  difficultyTier: Difficulty.MEDIUM,
  // ... rest of challenge
}
```

## 📏 Code Standards

- TypeScript strict mode
- ESLint + Prettier formatting
- JSDoc comments for public APIs
- Unit tests for new functionality
- No `any` types without justification

## 🙏 Thank You!

Your contributions help make MCP IntelliBench better for everyone!
