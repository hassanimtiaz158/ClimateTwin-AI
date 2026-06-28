# Contributing to ClimateTwin AI

Thank you for your interest in contributing to ClimateTwin AI! This guide will help you get started.

## Code of Conduct

Please be respectful and inclusive in all interactions. We follow the [Contributor Covenant](https://www.contributor-covenant.org/).

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch
4. Make your changes
5. Submit a pull request

## Development Setup

### Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL 15+
- Git

### Setup Instructions

```bash
# Clone your fork
git clone https://github.com/your-username/climatetwin-ai.git
cd climatetwin-ai

# Setup backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Setup frontend
cd ../frontend
npm install
```

See [SETUP.md](./SETUP.md) for detailed instructions.

## Branch Strategy

- `main` - Production-ready code
- `develop` - Development integration
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

## Commit Messages

Use clear, descriptive commit messages:

```
feat: Add scenario comparison feature
fix: Resolve projection calculation error
docs: Update API documentation
style: Format code with black
refactor: Simplify projection engine
test: Add unit tests for AI pipeline
chore: Update dependencies
```

## Pull Request Process

1. Update documentation if needed
2. Add tests for new functionality
3. Ensure all tests pass
4. Request review from maintainers
5. Address feedback promptly

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
```

## Code Style

### Python (Backend)

- Follow PEP 8
- Use Black for formatting
- Use isort for imports
- Type hints required
- Docstrings for public functions

```bash
# Format code
black app/
isort app/

# Check style
flake8 app/
mypy app/
```

### TypeScript (Frontend)

- Use ESLint
- Follow React best practices
- Use Prettier for formatting

```bash
# Format code
npm run lint
npm run typecheck
```

## Testing

### Backend Tests

```bash
cd backend
pytest tests/ -v
```

### Frontend Tests

```bash
cd frontend
npm run test
```

### Test Requirements

- Unit tests for new functions
- Integration tests for new endpoints
- Aim for 80%+ coverage

## Documentation

- Update README for major changes
- Add docstrings to new functions
- Update API documentation
- Include examples where helpful

## Issue Reporting

### Bug Reports

Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details

### Feature Requests

Include:
- Problem description
- Proposed solution
- Alternatives considered
- Use cases

## Development Workflow

### 1. Find or Create Issue

- Check existing issues
- Discuss major changes first
- Get assignment before starting

### 2. Create Branch

```bash
git checkout -b feature/your-feature-name
```

### 3. Make Changes

- Write clean, maintainable code
- Follow coding standards
- Add tests as needed

### 4. Test Locally

```bash
# Backend
cd backend && pytest

# Frontend
cd frontend && npm test
```

### 5. Commit Changes

```bash
git add .
git commit -m "feat: Add your feature description"
```

### 6. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## Review Process

- All PRs require at least one review
- Address feedback promptly
- Keep PRs focused and small
- Be open to suggestions

## Questions?

- Open a discussion on GitHub
- Join our community chat
- Email maintainers@climatetwin.ai

Thank you for contributing! 🌍
