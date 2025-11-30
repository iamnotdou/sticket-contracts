# Contributing to Sticket

Thank you for your interest in contributing to Sticket! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Please:

- Be respectful of differing viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

## Getting Started

### Finding Something to Work On

- Check the [Issues](../../issues) for bugs and feature requests
- Look for issues labeled `good first issue` for beginner-friendly tasks
- Issues labeled `help wanted` are great for contributors

### Before Starting Work

1. Check if the issue is already assigned
2. Comment on the issue to express interest
3. Wait for maintainer confirmation before starting

## Development Setup

### Prerequisites

- Rust (latest stable) - [Install](https://rustup.rs/)
- Stellar CLI v23+ - [Install](https://developers.stellar.org/docs/tools/developer-tools)
- Node.js 18+ (for SDK development)

### Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/sticket-contracts.git
cd sticket-contracts

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/sticket-contracts.git

# Install Soroban target
rustup target add wasm32-unknown-unknown

# Build to verify setup
cargo build --release --target wasm32-unknown-unknown

# Run tests
cargo test
```

## Making Changes

### Branch Naming

Use descriptive branch names:

- `feature/add-ticket-transfer-limits`
- `fix/secondary-sale-royalty-calculation`
- `docs/update-deployment-guide`
- `refactor/optimize-storage-access`

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```
feat(factory): add event cancellation functionality
fix(nft): correct royalty calculation for secondary sales
docs: update deployment instructions for mainnet
test(factory): add tests for event creation edge cases
```

## Pull Request Process

### Before Submitting

1. **Sync with upstream:**

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests:**

   ```bash
   cargo test
   ```

3. **Format code:**

   ```bash
   cargo fmt
   ```

4. **Check for warnings:**

   ```bash
   cargo clippy -- -D warnings
   ```

5. **Build successfully:**
   ```bash
   cargo build --release --target wasm32-unknown-unknown
   ```

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Tests added/updated for changes
- [ ] Documentation updated if needed
- [ ] All tests pass locally
- [ ] No new clippy warnings
- [ ] Commit messages follow conventions
- [ ] PR description explains changes clearly

### Review Process

1. Submit PR against `main` branch
2. Automated checks must pass
3. At least one maintainer review required
4. Address feedback promptly
5. Squash commits if requested
6. Maintainer merges after approval

## Coding Standards

### Rust Style

- Follow official [Rust Style Guide](https://doc.rust-lang.org/nightly/style-guide/)
- Use `cargo fmt` before committing
- Address all `cargo clippy` warnings

### Soroban Specifics

- Use `#![no_std]` for all contracts
- Minimize storage operations (they cost fees)
- Document all public functions
- Use descriptive error messages

### Example Function Documentation

```rust
/// Mints a new ticket for the caller.
///
/// # Arguments
/// * `env` - The Soroban environment
///
/// # Returns
/// * `u32` - The newly minted ticket ID
///
/// # Panics
/// * If all tickets have been minted
/// * If caller has insufficient payment token balance
///
/// # Events
/// * Emits a transfer event from zero address to buyer
pub fn mint(env: Env) -> u32 {
    // implementation
}
```

## Testing

### Writing Tests

- Place tests in `src/test.rs` within each contract
- Test both success and failure cases
- Use descriptive test names

```rust
#[test]
fn test_mint_increments_ticket_count() {
    // Arrange
    let env = Env::default();
    // ... setup

    // Act
    let ticket_id = client.mint();

    // Assert
    assert_eq!(client.get_tickets_minted(), 1);
}

#[test]
#[should_panic(expected = "All tickets minted")]
fn test_mint_fails_when_sold_out() {
    // Test that minting fails after all tickets are sold
}
```

### Running Tests

```bash
# All tests
cargo test

# Specific contract
cargo test -p factory
cargo test -p nft_collections

# With output
cargo test -- --nocapture
```

## Documentation

### When to Update Docs

- New features or API changes
- Bug fixes that change behavior
- Configuration changes
- Deployment process changes

### Documentation Files

- `README.md` - Project overview and quick start
- `CONTRIBUTING.md` - This file
- Contract comments - Inline documentation
- SDK READMEs - Package-specific docs

## Questions?

- Open a [Discussion](../../discussions) for questions
- Check existing issues before creating new ones
- Join our community channels (if applicable)

---

Thank you for contributing to Sticket! 🎫
