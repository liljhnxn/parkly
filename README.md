# Parkly — On-Chain Parking Space Management & Reservations

Parkly is a Web3 decentralized parking space management and reservation platform deployed on **Botchain Mainnet**. 

Parking lot owners can register and monetize parking slots, set hourly rates in **BOT**, and toggle real-time availability. Drivers can explore available spaces across the network and reserve slots for custom time windows directly with their connected Web3 wallet (such as MetaMask).

---

## 🌟 Key Features

* **Browsing Without Wallet**: Anyone can browse listed spaces and view real-time on-chain statistics without connecting a wallet first.
* **On-Chain Listing**: Connected space owners can register new parking spots with a custom space number/identifier, physical location, and hourly rate.
* **Smart Reservation System**:
  * Prevents double bookings and overlapping reservations at the smart contract level.
  * Validates future start and end times in the user's local timezone.
  * Rejects reservations made by the space owner on their own spaces.
* **Owner Controls**:
  * Update space details (space number, location, hourly rate).
  * Toggle availability between `Available` and `Unavailable`.
  * Protects active slots: owners cannot set a space to `Available` while an active reservation is currently in progress.
  * Mark reservations as `Completed` upon parking conclusion.
* **Driver Controls**:
  * View active and past reservations.
  * Cancel active reservations directly on-chain before or during the scheduled slot.
* **Botchain Mainnet Native**:
  * Direct integration with Botchain Mainnet (Chain ID `677`).
  * One-click network switching in the UI.
  * Direct transaction and address links to [BotchainScan Explorer](https://scan.botchain.ai).
* **Modern Dashboard Aesthetic**:
  * Dark charcoal palette (`#0b0d11`, `#11141a`) with emerald green and purple accents.
  * Smooth animations, responsive layout, and toast notification feedback.

---

## ⛓️ Blockchain Configuration (Botchain Mainnet)

| Parameter | Value |
| :--- | :--- |
| **Network Name** | Botchain Mainnet |
| **Chain ID** | `677` |
| **Currency Symbol** | `BOT` (Decimals: 18) |
| **Total Supply** | 150 Million |
| **RPC URL** | [https://rpc.botchain.ai](https://rpc.botchain.ai) |
| **Block Explorer** | [https://scan.botchain.ai](https://scan.botchain.ai) |
| **Official Website** | [https://botchain.ai](https://botchain.ai) |
| **Deployed Contract** | [`0xe822F7F3FD58c89cdcb6dEdADAb273a503F7DF63`](https://scan.botchain.ai/address/0xe822F7F3FD58c89cdcb6dEdADAb273a503F7DF63#code) |

---

## 🏗️ Technology Stack

* **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons
* **Web3 Integration**: wagmi v2, viem v2, MetaMask / Injected Web3
* **Smart Contracts**: Solidity `^0.8.20` (Optimizer enabled, 200 runs)
* **Development & Testing Suite**: Hardhat, Hardhat Toolbox, Ethers.js v6, Chai Matchers

---

## 📁 Project Structure

```text
Parkly/
├── app/
│   ├── globals.css              # Dark theme styling, glassmorphism & subtle scrollbars
│   ├── layout.tsx               # Root Next.js layout & metadata
│   ├── page.tsx                 # Main one-page dashboard & exploration UI
│   └── providers.tsx            # Wagmi & React Query provider with toast system
├── components/
│   ├── AddSpaceSection.tsx      # Space creation form with tx receipts & copyable ID
│   ├── DashboardStats.tsx       # Real-time metric cards (Total, Available, Active, My Bookings)
│   ├── EditSpaceModal.tsx       # Owner space edit modal (number, location, rate)
│   ├── ExploreSpaces.tsx        # Parking slot cards, search & availability filters
│   ├── Header.tsx               # Brand logo, BOT Chain links & wallet connection manager
│   ├── MyReservations.tsx       # Driver reservation management & cancellation
│   ├── MySpaces.tsx             # Owner parking management, toggles & booking history
│   └── ReservationModal.tsx     # Time window selector, duration, cost & overlap checks
├── contracts/
│   └── Parkly.sol               # Solidity smart contract with custom errors & events
├── lib/
│   ├── chain.ts                 # Botchain Mainnet viem chain definition
│   ├── contracts/
│   │   ├── abi.ts               # Parkly contract ABI definitions
│   │   ├── config.ts            # Explorer URLs, contract address resolver & helpers
│   │   ├── deployment.json      # Deployed Mainnet address & deployment metadata
│   │   └── ParklyABI.json       # Exported raw ABI
│   ├── types.ts                 # TypeScript types & enum declarations
│   └── wagmi.ts                 # Wagmi client configuration
├── public/
│   └── botchain-logo.png        # Official BOT Chain logo
├── scripts/
│   ├── deploy.ts                # Hardhat deployment script for Botchain Mainnet
│   └── generate-wallet.ts       # Utility to generate an ephemeral deployment key
├── test/
│   └── Parkly.test.ts           # 28 comprehensive smart contract tests
├── hardhat.config.ts            # Hardhat network & compiler configuration
└── package.json
```

---

## 🚀 Getting Started

### 1. Prerequisites

* **Node.js**: v18+ (tested on Node v25)
* **npm** or **pnpm**
* **MetaMask** browser extension configured for Botchain Mainnet (Chain ID 677)

### 2. Installation

```bash
npm install
```

### 3. Environment Setup

Create or verify `.env` in the project root:

```env
# Botchain Mainnet RPC & Deployment Credentials
BOTCHAIN_RPC_URL="https://rpc.botchain.ai"
PRIVATE_KEY="YOUR_WALLET_PRIVATE_KEY_HERE"

# Frontend Configuration
NEXT_PUBLIC_BOTCHAIN_CHAIN_ID=677
NEXT_PUBLIC_BOTCHAIN_RPC_URL="https://rpc.botchain.ai"
NEXT_PUBLIC_BOTCHAIN_EXPLORER="https://scan.botchain.ai"
NEXT_PUBLIC_CONTRACT_ADDRESS="0xe822F7F3FD58c89cdcb6dEdADAb273a503F7DF63"
```

---

## 🧪 Smart Contract Testing

To run the complete smart contract test suite covering all 28 requirements:

```bash
npm run test
```

---

## 🚢 Deploying to Botchain Mainnet

To deploy a new instance to Botchain Mainnet:

```bash
npm run deploy:mainnet
```

The script will automatically:
1. Deploy `Parkly.sol` to Botchain Mainnet with optimal gas settings (20 Gwei, optimizer runs: 200).
2. Output the deployed contract address and BotchainScan explorer link.
3. Save the address into `lib/contracts/deployment.json` and sync `.env`.
4. Submit and verify source code on `https://scan.botchain.ai`.

---

## 💻 Running the Application

### Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

---

## 🔒 Security & Privacy

* **Zero Personal Identifiable Information (PII)**: The application does not store names, emails, phone numbers, or vehicle licenses.
* **Pure On-Chain Verification**: Space listings and reservations exist directly on the Botchain blockchain.
* **Deterministic Logic**: Permissions, reservation conflicts, and status updates are verified strictly within `Parkly.sol` custom errors and modifiers.
