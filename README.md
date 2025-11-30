# 🎫 Sticket - Decentralized Ticket Marketplace on Stellar

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Soroban](https://img.shields.io/badge/Soroban-Stellar-blue)](https://soroban.stellar.org/)
[![Built with Rust](https://img.shields.io/badge/Built%20with-Rust-orange)](https://www.rust-lang.org/)

**Sticket** is an open-source, decentralized event ticketing marketplace built on [Stellar's Soroban](https://soroban.stellar.org/) smart contract platform. It enables event creators to mint, sell, and manage NFT-based tickets with built-in secondary market controls and creator royalties.

## ✨ Features

- **🎟️ NFT Tickets** - Each ticket is a unique, verifiable NFT on Stellar
- **🏭 Factory Pattern** - Deploy new event contracts through a centralized factory
- **💰 Primary Sales** - Event creators set ticket prices and receive payments directly
- **🔄 Secondary Market** - Built-in peer-to-peer ticket resale with price controls
- **👑 Creator Royalties** - Automatic royalty payments on secondary sales (configurable BPS)
- **🔐 Ticket Validation** - On-chain ticket usage tracking to prevent fraud
- **📱 TypeScript SDKs** - Auto-generated SDKs for easy frontend integration

## 📦 Project Structure

```
sticket-contracts/
├── contracts/
│   ├── factory/           # Factory contract for deploying events
│   │   ├── src/
│   │   │   ├── lib.rs     # Factory implementation
│   │   │   └── test.rs    # Unit tests
│   │   └── Cargo.toml
│   └── nft_collections/   # NFT ticket marketplace contract
│       ├── src/
│       │   ├── lib.rs     # Ticket marketplace implementation
│       │   └── test.rs    # Unit tests
│       └── Cargo.toml
├── packages/              # TypeScript SDKs (auto-generated)
│   ├── sticket-factory/   # Factory contract SDK
│   └── sticket-nft-collections/  # NFT contract SDK
├── deploy.sh              # Automated deployment script
├── Cargo.toml             # Workspace configuration
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- [Rust](https://rustup.rs/) (latest stable)
- [Stellar CLI](https://developers.stellar.org/docs/tools/developer-tools) v23+
- [Node.js](https://nodejs.org/) 18+ (for TypeScript SDKs)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/sticket-contracts.git
cd sticket-contracts

# Install Soroban target
rustup target add wasm32-unknown-unknown

# Build contracts
cargo build --release --target wasm32-unknown-unknown
```

### Deploy to Testnet

The easiest way to deploy is using the automated deployment script:

```bash
# Make the script executable
chmod +x deploy.sh

# Run deployment (creates account if needed, deploys contracts, generates SDKs)
./deploy.sh
```

The script will:

1. ✅ Check prerequisites (stellar CLI, cargo)
2. 🔑 Create/fund a testnet account if needed
3. 🔨 Build all contracts
4. 📤 Deploy factory and NFT contracts
5. 🔗 Initialize factory with NFT WASM hash
6. 📦 Generate TypeScript SDKs
7. 📋 Output deployment info to `deployment-info.json`

### Manual Deployment

```bash
# Build contracts
cargo build --release --target wasm32-unknown-unknown

# Deploy factory contract
stellar contract deploy \
  --wasm target/wasm32v1-none/release/factory.wasm \
  --network testnet \
  --source alice

# Deploy NFT contract (to get WASM hash)
stellar contract install \
  --wasm target/wasm32v1-none/release/nft_collections.wasm \
  --network testnet \
  --source alice

# Initialize factory with NFT WASM hash
stellar contract invoke \
  --id <FACTORY_CONTRACT_ID> \
  --network testnet \
  --source alice \
  -- initialize \
  --wasm_hash <NFT_WASM_HASH>
```

## 📖 Contract Documentation

### Factory Contract

The factory contract manages the deployment and tracking of event contracts.

#### Functions

| Function                      | Description                                    |
| ----------------------------- | ---------------------------------------------- |
| `initialize(wasm_hash)`       | Initialize factory with NFT contract WASM hash |
| `create_event(...)`           | Deploy a new event with tickets                |
| `get_event(event_id)`         | Get event details by ID                        |
| `get_all_events()`            | List all deployed events                       |
| `get_creator_events(creator)` | List events by a specific creator              |
| `get_event_count()`           | Get total number of events                     |

### NFT Collections Contract

Each event is deployed as a separate NFT contract with marketplace functionality.

#### Functions

| Function                          | Description                                |
| --------------------------------- | ------------------------------------------ |
| `init(...)`                       | Initialize event with metadata and pricing |
| `mint()`                          | Mint a new ticket (primary sale)           |
| `transfer(from, to, ticket_id)`   | Transfer ticket ownership                  |
| `list_for_sale(ticket_id, price)` | List ticket on secondary market            |
| `buy_secondary(ticket_id)`        | Purchase from secondary market             |
| `cancel_listing(ticket_id)`       | Remove listing from secondary market       |
| `use_ticket(ticket_id)`           | Mark ticket as used (event creator only)   |

## 🛠️ Development

### Running Tests

```bash
# Run all tests
cargo test

# Run tests with output
cargo test -- --nocapture

# Run specific contract tests
cargo test -p factory
cargo test -p nft_collections
```

### Building for Production

```bash
cargo build --release --target wasm32-unknown-unknown
```

### Generating TypeScript SDKs

```bash
# Generate factory SDK
stellar contract bindings typescript \
  --network testnet \
  --contract-id <FACTORY_CONTRACT_ID> \
  --output-dir packages/sticket-factory

# Generate NFT SDK
stellar contract bindings typescript \
  --network testnet \
  --contract-id <NFT_CONTRACT_ID> \
  --output-dir packages/sticket-nft-collections
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

| Variable                 | Description                                    |
| ------------------------ | ---------------------------------------------- |
| `STELLAR_SOURCE_ACCOUNT` | Account name for deployment (default: `alice`) |
| `NETWORK`                | Network to deploy to (`testnet` or `mainnet`)  |

### Deployment Info

After deployment, `deployment-info.json` contains:

```json
{
  "network": "testnet",
  "contracts": {
    "factory": {
      "contractId": "CABC...",
      "wasmHash": "..."
    },
    "nftCollections": {
      "wasmHash": "...",
      "sampleContractId": "CDEF..."
    }
  }
}
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a PR.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🔒 Security

If you discover a security vulnerability, please see our [Security Policy](SECURITY.md) for responsible disclosure.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Stellar Development Foundation](https://stellar.org/) for Soroban
- [Soroban Examples](https://github.com/stellar/soroban-examples) for reference implementations

## 📬 Contact

- **GitHub Issues** - For bug reports and feature requests
- **Discussions** - For questions and community support

---

<p align="center">
  Built with ❤️ on Stellar
</p>
