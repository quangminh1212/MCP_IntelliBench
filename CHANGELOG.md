# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-22

### Added

- Initial release of MCP IntelliBench
- MCP Server with complete tool, resource, and prompt support
- 8 MCP tools for benchmark management:
  - `intellibench_start_session` - Start benchmark sessions
  - `intellibench_get_challenge` - Get current challenge
  - `intellibench_submit_solution` - Submit solutions for scoring
  - `intellibench_get_results` - Get comprehensive results
  - `intellibench_leaderboard` - View leaderboard
  - `intellibench_list_challenges` - List available challenges
  - `intellibench_session_status` - Check session status
  - `intellibench_skip_challenge` - Skip current challenge
- 6 sample challenges across categories:
  - Code Generation
  - Bug Detection
  - Algorithm Design
  - Refactoring
  - Security Analysis
- Scoring engine with 5 evaluation dimensions:
  - Correctness (40%)
  - Efficiency (20%)
  - Code Quality (20%)
  - Completeness (10%)
  - Creativity (10%)
- Session management with result tracking
- Leaderboard system with timeframe filtering
- MCP Resources for data access
- MCP Prompts for user guidance
- Comprehensive TypeScript types
- Unit test framework with Vitest
- ESLint + Prettier code formatting

### Technical Stack

- TypeScript 5.7
- Node.js 20+
- @modelcontextprotocol/sdk
- Zod for schema validation
- Pino for logging
- Vitest for testing

## [Unreleased]

### Planned

- Web dashboard with React
- SQLite database persistence
- More benchmark challenges (30+)
- Code execution sandbox
- PDF report generation
- Multi-language support
