# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

**Please do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please report security issues via one of these methods:

1. **Email**: Send details to [security@your-email.com] (replace with your email)
2. **GitHub Security Advisories**: Use the "Report a vulnerability" button in the Security tab

### What to Include

Please include the following information:

- **Description**: A clear description of the vulnerability
- **Impact**: Potential impact of the vulnerability
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Affected Components**: Which contracts/functions are affected
- **Suggested Fix**: If you have one (optional)

### What to Expect

- **Acknowledgment**: We'll acknowledge receipt within 48 hours
- **Initial Assessment**: Within 1 week, we'll provide an initial assessment
- **Updates**: We'll keep you informed of our progress
- **Resolution**: We aim to resolve critical issues within 30 days
- **Credit**: We'll credit you in our release notes (unless you prefer anonymity)

## Security Best Practices for Users

### Smart Contract Interaction

1. **Verify Contract Addresses**: Always verify contract addresses before interaction
2. **Test on Testnet**: Test all interactions on testnet before mainnet
3. **Check Approvals**: Review token approvals before confirming transactions
4. **Use Official SDKs**: Only use official TypeScript SDKs from this repository

### Deployment Security

1. **Secure Your Keys**: Never commit private keys or seed phrases
2. **Use Hardware Wallets**: For mainnet deployments, use hardware wallets
3. **Environment Variables**: Store sensitive data in environment variables
4. **Review Before Deploy**: Audit contracts before mainnet deployment

### Known Limitations

The following are known limitations (not vulnerabilities):

- **No Upgradability**: Contracts cannot be upgraded after deployment
- **Event Creator Trust**: Event creators have control over their event contracts
- **Ticket Usage**: Only event creators can mark tickets as used

## Bug Bounty Program

We currently do not have a formal bug bounty program. However, we deeply appreciate security researchers who help improve our project. Significant findings may be rewarded at our discretion.

## Audits

This project has not yet undergone a formal security audit. Use at your own risk, especially on mainnet.

If you're interested in sponsoring a security audit, please reach out.

## Security Updates

Security updates will be:

1. Released as new versions
2. Announced via GitHub releases
3. Documented in the CHANGELOG

Subscribe to repository notifications to stay informed.

---

Thank you for helping keep Sticket secure! 🔒
