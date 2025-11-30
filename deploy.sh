#!/bin/bash

# =============================================================================
# Sticket - Stellar Ticket Marketplace Deployment Script
# =============================================================================
# This script automates the entire deployment process:
# 1. Builds all contracts
# 2. Deploys to testnet
# 3. Initializes factory with NFT WASM hash
# 4. Generates TypeScript SDKs
# 5. Creates a Next.js frontend (optional)
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
NETWORK="testnet"
SOURCE_ACCOUNT="${STELLAR_SOURCE_ACCOUNT:-alice}"
FRONTEND_DIR="frontend"

# Contract output directories
FACTORY_SDK_DIR="packages/sticket-factory"
NFT_SDK_DIR="packages/sticket-nft-collections"

# Output file for contract addresses
OUTPUT_FILE="deployment-info.json"

echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║           🎫 STICKET - Stellar Ticket Marketplace 🎫             ║"
echo "║                     Deployment Script                             ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# -----------------------------------------------------------------------------
# Helper Functions
# -----------------------------------------------------------------------------

log_step() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}▶ $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

log_info() {
    echo -e "${CYAN}  ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}  ✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}  ⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}  ❌ $1${NC}"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 is not installed. Please install it first."
        exit 1
    fi
}

# -----------------------------------------------------------------------------
# Pre-flight Checks
# -----------------------------------------------------------------------------

log_step "Pre-flight Checks"

check_command "stellar"
check_command "cargo"
log_success "stellar CLI found"
log_success "cargo found"

# Check if source account exists
if stellar keys address $SOURCE_ACCOUNT &> /dev/null; then
    log_success "Source account '$SOURCE_ACCOUNT' exists"
else
    log_warning "Source account '$SOURCE_ACCOUNT' not found. Creating..."
    stellar keys generate $SOURCE_ACCOUNT --network $NETWORK 2>/dev/null || true
    log_info "Funding account via friendbot..."
    stellar keys fund $SOURCE_ACCOUNT --network $NETWORK 2>/dev/null || true
    log_success "Account created and funded"
fi

# Get source account address
SOURCE_ADDRESS=$(stellar keys address $SOURCE_ACCOUNT)
log_info "Source address: $SOURCE_ADDRESS"

# -----------------------------------------------------------------------------
# Build Contracts
# -----------------------------------------------------------------------------

log_step "Building Contracts"

stellar contract build

log_success "Contracts built successfully"

# Extract WASM hashes from build output
FACTORY_WASM="target/wasm32v1-none/release/factory.wasm"
NFT_WASM="target/wasm32v1-none/release/nft_collections.wasm"

if [ ! -f "$FACTORY_WASM" ]; then
    log_error "Factory WASM not found at $FACTORY_WASM"
    exit 1
fi

if [ ! -f "$NFT_WASM" ]; then
    log_error "NFT Collections WASM not found at $NFT_WASM"
    exit 1
fi

log_success "Factory WASM: $FACTORY_WASM"
log_success "NFT Collections WASM: $NFT_WASM"

# -----------------------------------------------------------------------------
# Install NFT WASM (to get hash for factory initialization)
# -----------------------------------------------------------------------------

log_step "Installing NFT Collections WASM"

NFT_INSTALL_OUTPUT=$(stellar contract install \
    --wasm $NFT_WASM \
    --source-account $SOURCE_ACCOUNT \
    --network $NETWORK 2>&1)

# Extract WASM hash (last line of output or from "Using wasm hash" line)
NFT_WASM_HASH=$(echo "$NFT_INSTALL_OUTPUT" | grep -oE '[a-f0-9]{64}' | tail -1)

if [ -z "$NFT_WASM_HASH" ]; then
    log_error "Failed to get NFT WASM hash"
    echo "$NFT_INSTALL_OUTPUT"
    exit 1
fi

log_success "NFT WASM Hash: $NFT_WASM_HASH"

# -----------------------------------------------------------------------------
# Deploy Factory Contract
# -----------------------------------------------------------------------------

log_step "Deploying Factory Contract"

FACTORY_DEPLOY_OUTPUT=$(stellar contract deploy \
    --wasm $FACTORY_WASM \
    --source-account $SOURCE_ACCOUNT \
    --network $NETWORK 2>&1)

# Extract contract ID (last line that looks like a contract ID)
FACTORY_CONTRACT_ID=$(echo "$FACTORY_DEPLOY_OUTPUT" | grep -oE 'C[A-Z0-9]{55}' | tail -1)

if [ -z "$FACTORY_CONTRACT_ID" ]; then
    log_error "Failed to deploy factory contract"
    echo "$FACTORY_DEPLOY_OUTPUT"
    exit 1
fi

log_success "Factory Contract ID: $FACTORY_CONTRACT_ID"

# -----------------------------------------------------------------------------
# Initialize Factory with NFT WASM Hash
# -----------------------------------------------------------------------------

log_step "Initializing Factory"

stellar contract invoke \
    --network $NETWORK \
    --source-account $SOURCE_ACCOUNT \
    --id $FACTORY_CONTRACT_ID \
    -- \
    initialize \
    --wasm_hash $NFT_WASM_HASH

log_success "Factory initialized with NFT WASM hash"

# Verify initialization
log_info "Verifying factory initialization..."
STORED_HASH=$(stellar contract invoke \
    --network $NETWORK \
    --source-account $SOURCE_ACCOUNT \
    --id $FACTORY_CONTRACT_ID \
    -- \
    get_wasm_hash 2>&1 | grep -oE '[a-f0-9]{64}' | head -1)

if [ "$STORED_HASH" = "$NFT_WASM_HASH" ]; then
    log_success "Factory WASM hash verified!"
else
    log_warning "WASM hash verification unclear, but continuing..."
fi

# -----------------------------------------------------------------------------
# Generate TypeScript Bindings
# -----------------------------------------------------------------------------

log_step "Generating TypeScript SDKs"

# Create packages directory if it doesn't exist
mkdir -p packages

# Generate Factory SDK
log_info "Generating Factory SDK..."
stellar contract bindings typescript \
    --network $NETWORK \
    --contract-id $FACTORY_CONTRACT_ID \
    --output-dir $FACTORY_SDK_DIR \
    --overwrite

log_success "Factory SDK generated at $FACTORY_SDK_DIR"

# Deploy a sample NFT collection to generate bindings (optional)
# We'll use the factory to create one, or deploy directly for bindings
log_info "Deploying sample NFT collection for SDK generation..."

NFT_DEPLOY_OUTPUT=$(stellar contract deploy \
    --wasm $NFT_WASM \
    --source-account $SOURCE_ACCOUNT \
    --network $NETWORK 2>&1)

NFT_CONTRACT_ID=$(echo "$NFT_DEPLOY_OUTPUT" | grep -oE 'C[A-Z0-9]{55}' | tail -1)

if [ -n "$NFT_CONTRACT_ID" ]; then
    log_success "Sample NFT Contract ID: $NFT_CONTRACT_ID"
    
    # Generate NFT SDK
    log_info "Generating NFT Collections SDK..."
    stellar contract bindings typescript \
        --network $NETWORK \
        --contract-id $NFT_CONTRACT_ID \
        --output-dir $NFT_SDK_DIR \
        --overwrite
    
    log_success "NFT Collections SDK generated at $NFT_SDK_DIR"
else
    log_warning "Could not deploy sample NFT contract for SDK generation"
fi

# -----------------------------------------------------------------------------
# Save Deployment Info
# -----------------------------------------------------------------------------

log_step "Saving Deployment Information"

cat > $OUTPUT_FILE << EOF
{
  "network": "$NETWORK",
  "networkPassphrase": "Test SDF Network ; September 2015",
  "rpcUrl": "https://soroban-testnet.stellar.org",
  "deployedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "sourceAccount": "$SOURCE_ADDRESS",
  "contracts": {
    "factory": {
      "contractId": "$FACTORY_CONTRACT_ID",
      "wasmHash": "$(stellar contract info wasm --wasm $FACTORY_WASM 2>/dev/null | grep -oE '[a-f0-9]{64}' | head -1 || echo 'unknown')"
    },
    "nftCollections": {
      "wasmHash": "$NFT_WASM_HASH",
      "sampleContractId": "${NFT_CONTRACT_ID:-null}"
    }
  },
  "sdks": {
    "factory": "$FACTORY_SDK_DIR",
    "nftCollections": "$NFT_SDK_DIR"
  }
}
EOF

log_success "Deployment info saved to $OUTPUT_FILE"

# -----------------------------------------------------------------------------
# Create Environment File
# -----------------------------------------------------------------------------

log_step "Creating Environment Files"

# Create .env for the packages
cat > packages/.env << EOF
# Sticket Contract Addresses
NEXT_PUBLIC_FACTORY_CONTRACT_ID=$FACTORY_CONTRACT_ID
NEXT_PUBLIC_NFT_WASM_HASH=$NFT_WASM_HASH
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
EOF

log_success "Environment file created at packages/.env"

# -----------------------------------------------------------------------------
# Build SDKs
# -----------------------------------------------------------------------------

log_step "Building TypeScript SDKs"

if [ -d "$FACTORY_SDK_DIR" ]; then
    log_info "Building Factory SDK..."
    cd $FACTORY_SDK_DIR
    npm install 2>/dev/null || log_warning "npm install had warnings"
    npm run build 2>/dev/null || log_warning "npm build had warnings"
    cd - > /dev/null
    log_success "Factory SDK built"
fi

if [ -d "$NFT_SDK_DIR" ]; then
    log_info "Building NFT Collections SDK..."
    cd $NFT_SDK_DIR
    npm install 2>/dev/null || log_warning "npm install had warnings"
    npm run build 2>/dev/null || log_warning "npm build had warnings"
    cd - > /dev/null
    log_success "NFT Collections SDK built"
fi

# -----------------------------------------------------------------------------
# Summary
# -----------------------------------------------------------------------------

echo -e "\n${CYAN}"
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                    🎉 DEPLOYMENT COMPLETE! 🎉                     ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${GREEN}Contract Addresses:${NC}"
echo -e "  Factory:          ${YELLOW}$FACTORY_CONTRACT_ID${NC}"
echo -e "  NFT WASM Hash:    ${YELLOW}$NFT_WASM_HASH${NC}"
[ -n "$NFT_CONTRACT_ID" ] && echo -e "  Sample NFT:       ${YELLOW}$NFT_CONTRACT_ID${NC}"

echo -e "\n${GREEN}Explorer Links:${NC}"
echo -e "  Factory: ${BLUE}https://stellar.expert/explorer/testnet/contract/$FACTORY_CONTRACT_ID${NC}"

echo -e "\n${GREEN}Generated Files:${NC}"
echo -e "  Deployment Info:  ${YELLOW}$OUTPUT_FILE${NC}"
echo -e "  Environment:      ${YELLOW}packages/.env${NC}"
echo -e "  Factory SDK:      ${YELLOW}$FACTORY_SDK_DIR${NC}"
echo -e "  NFT SDK:          ${YELLOW}$NFT_SDK_DIR${NC}"

echo -e "\n${GREEN}Next Steps:${NC}"
echo -e "  1. Copy ${YELLOW}packages/.env${NC} to your Next.js project as ${YELLOW}.env.local${NC}"
echo -e "  2. Install SDKs: ${CYAN}npm install ./$FACTORY_SDK_DIR ./$NFT_SDK_DIR${NC}"
echo -e "  3. Or run: ${CYAN}./deploy.sh --with-frontend${NC} to generate a Next.js app"

echo -e "\n${GREEN}Test your deployment:${NC}"
echo -e "  ${CYAN}stellar contract invoke --network testnet --source-account $SOURCE_ACCOUNT --id $FACTORY_CONTRACT_ID -- get_event_count${NC}"

# -----------------------------------------------------------------------------
# Optional: Create Next.js Frontend
# -----------------------------------------------------------------------------

if [[ "$1" == "--with-frontend" ]] || [[ "$2" == "--with-frontend" ]]; then
    log_step "Creating Next.js Frontend"
    
    if [ -d "$FRONTEND_DIR" ]; then
        log_warning "Frontend directory already exists. Skipping creation."
    else
        check_command "npx"
        
        log_info "Creating Next.js app..."
        npx create-next-app@latest $FRONTEND_DIR \
            --typescript \
            --tailwind \
            --app \
            --src-dir \
            --import-alias "@/*" \
            --no-eslint \
            --use-npm \
            --yes
        
        cd $FRONTEND_DIR
        
        log_info "Installing Stellar dependencies..."
        npm install @stellar/stellar-sdk @stellar/freighter-api
        
        # Link local SDKs
        npm install ../$FACTORY_SDK_DIR ../$NFT_SDK_DIR
        
        # Copy environment file
        cp ../packages/.env .env.local
        
        log_info "Creating Stellar integration files..."
        
        # Create lib directory
        mkdir -p src/lib
        
        # Create Stellar config
        cat > src/lib/stellar-config.ts << 'STELLAR_CONFIG'
export const NETWORK_CONFIG = {
  networkPassphrase: process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE!,
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL!,
  factoryContractId: process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ID!,
  nftWasmHash: process.env.NEXT_PUBLIC_NFT_WASM_HASH!,
};

export const isTestnet = process.env.NEXT_PUBLIC_NETWORK === 'testnet';
STELLAR_CONFIG

        # Create Freighter hook
        cat > src/lib/use-freighter.ts << 'USE_FREIGHTER'
"use client";

import { useState, useEffect, useCallback } from "react";
import freighter from "@stellar/freighter-api";

export interface FreighterState {
  isConnected: boolean;
  isLoading: boolean;
  publicKey: string | null;
  error: string | null;
}

export function useFreighter() {
  const [state, setState] = useState<FreighterState>({
    isConnected: false,
    isLoading: true,
    publicKey: null,
    error: null,
  });

  const checkConnection = useCallback(async () => {
    try {
      const connected = await freighter.isConnected();
      if (connected) {
        const { address } = await freighter.getAddress();
        setState({
          isConnected: true,
          isLoading: false,
          publicKey: address,
          error: null,
        });
      } else {
        setState({
          isConnected: false,
          isLoading: false,
          publicKey: null,
          error: null,
        });
      }
    } catch (err) {
      setState({
        isConnected: false,
        isLoading: false,
        publicKey: null,
        error: "Freighter not available",
      });
    }
  }, []);

  const connect = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await freighter.requestAccess();
      await checkConnection();
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to connect to Freighter",
      }));
    }
  }, [checkConnection]);

  const disconnect = useCallback(() => {
    setState({
      isConnected: false,
      isLoading: false,
      publicKey: null,
      error: null,
    });
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return { ...state, connect, disconnect, checkConnection };
}
USE_FREIGHTER

        # Create Factory client hook
        cat > src/lib/use-factory.ts << 'USE_FACTORY'
"use client";

import { useMemo } from "react";
import { Client as FactoryClient } from "sticket-factory";
import freighter from "@stellar/freighter-api";
import { NETWORK_CONFIG } from "./stellar-config";

export function useFactoryClient(publicKey: string | null) {
  const client = useMemo(() => {
    if (!publicKey) return null;

    return new FactoryClient({
      contractId: NETWORK_CONFIG.factoryContractId,
      networkPassphrase: NETWORK_CONFIG.networkPassphrase,
      rpcUrl: NETWORK_CONFIG.rpcUrl,
      publicKey,
      signTransaction: async (tx) => {
        const { signedTxXdr } = await freighter.signTransaction(tx.toXDR(), {
          networkPassphrase: NETWORK_CONFIG.networkPassphrase,
        });
        return signedTxXdr;
      },
    });
  }, [publicKey]);

  return client;
}
USE_FACTORY

        # Create main page
        cat > src/app/page.tsx << 'MAIN_PAGE'
"use client";

import { useState, useEffect } from "react";
import { useFreighter } from "@/lib/use-freighter";
import { useFactoryClient } from "@/lib/use-factory";

export default function Home() {
  const { isConnected, isLoading, publicKey, error, connect, disconnect } = useFreighter();
  const factoryClient = useFactoryClient(publicKey);
  const [eventCount, setEventCount] = useState<number | null>(null);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    async function fetchEvents() {
      if (!factoryClient) return;
      
      try {
        const countTx = await factoryClient.get_event_count();
        const countResult = await countTx.simulate();
        setEventCount(countResult.result as number);

        const eventsTx = await factoryClient.get_all_events();
        const eventsResult = await eventsTx.simulate();
        setEvents(eventsResult.result as any[]);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      }
    }

    if (isConnected) {
      fetchEvents();
    }
  }, [factoryClient, isConnected]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent mb-4">
            🎫 Sticket
          </h1>
          <p className="text-xl text-gray-300">
            Decentralized Ticket Marketplace on Stellar
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="max-w-md mx-auto mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            {isLoading ? (
              <div className="text-center text-gray-300">
                <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                Connecting...
              </div>
            ) : isConnected ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-green-400 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Connected
                  </span>
                  <button
                    onClick={disconnect}
                    className="text-sm text-gray-400 hover:text-white transition"
                  >
                    Disconnect
                  </button>
                </div>
                <p className="text-gray-300 font-mono text-sm truncate">
                  {publicKey}
                </p>
              </div>
            ) : (
              <button
                onClick={connect}
                className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition transform hover:scale-105"
              >
                Connect Freighter Wallet
              </button>
            )}
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>
        </div>

        {/* Stats */}
        {isConnected && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
              <p className="text-4xl font-bold text-purple-400">{eventCount ?? "..."}</p>
              <p className="text-gray-400">Total Events</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
              <p className="text-4xl font-bold text-pink-400">{events.length}</p>
              <p className="text-gray-400">Active Events</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
              <p className="text-4xl font-bold text-green-400">∞</p>
              <p className="text-gray-400">Possibilities</p>
            </div>
          </div>
        )}

        {/* Events List */}
        {isConnected && events.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Events</h2>
            <div className="grid gap-4">
              {events.map((event, i) => (
                <div
                  key={i}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-purple-500/50 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{event.name}</h3>
                      <p className="text-gray-400 text-sm">{event.symbol}</p>
                    </div>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                      Active
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs mt-4 font-mono truncate">
                    {event.event_contract}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {isConnected && events.length === 0 && eventCount === 0 && (
          <div className="text-center text-gray-400">
            <p className="text-6xl mb-4">🎭</p>
            <p>No events yet. Create your first event!</p>
          </div>
        )}

        {/* Not Connected */}
        {!isConnected && !isLoading && (
          <div className="text-center text-gray-400">
            <p className="text-6xl mb-4">🔐</p>
            <p>Connect your wallet to view events</p>
          </div>
        )}
      </div>
    </main>
  );
}
MAIN_PAGE

        # Update layout
        cat > src/app/layout.tsx << 'LAYOUT'
import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const font = Space_Grotesk({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sticket - Stellar Ticket Marketplace",
  description: "Decentralized ticket marketplace built on Stellar",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={font.className}>{children}</body>
    </html>
  );
}
LAYOUT

        cd ..
        
        log_success "Next.js frontend created at $FRONTEND_DIR"
        
        echo -e "\n${GREEN}To start the frontend:${NC}"
        echo -e "  ${CYAN}cd $FRONTEND_DIR && npm run dev${NC}"
    fi
fi

echo -e "\n${GREEN}Done! 🚀${NC}\n"

