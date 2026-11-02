# Parkly — On-Chain Parking Space Management & Reservations

Parkly is a Web3 decentralized parking space management and reservation platform powered by **Botchain Testnet**. 

Parking lot owners can register and monetize parking slots, set hourly rates in BOHR, and toggle real-time availability. Drivers can explore available spaces across the network and reserve slots for custom time windows directly with their connected Web3 wallet (such as MetaMask).

---

## 🌟 Key Features

* **Browsing Without Wallet**: Anyone can browse listed spaces and view real-time on-chain statistics without connecting a wallet first.
* **On-Chain Listing**: Connected space owners can register new parking spots with a custom space number/identifier, physical location, and hourly rate.
* **Smart Reservation System**:
  * Prevents double bookings and overlapping reservations.
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
* **Botchain Testnet Native**:
  * Direct integration with Botchain Testnet (Chain ID `968`).
  * One-click network switching in the UI.
  * Direct transaction and address links to the [BohrScan Explorer](https://scan.bohr.life).
* **Modern Dashboard Aesthetic**:
  * Dark charcoal palette (`#0b0d11`, `#11141a`) with muted emerald green and purple accents.
  * Smooth animations, responsive layout, and toast notification feedback.

---

## 🏗️ Technology Stack

* **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons
* **Web3 Integration**: wagmi v2, viem v2, MetaMask / Injected Web3
* **Smart Contracts**: Solidity `^0.8.20`
* **Development & Testing Suite**: Hardhat, Hardhat Toolbox, Ethers.js v6, Chai Matchers

---

## ⛓️ Blockchain Configuration (Botchain Testnet)

| Parameter | Value |
| :--- | :--- |
| **Network Name** | Botchain Testnet |
| **Chain ID** | `968` |
| **Currency Symbol** | `BOHR` |
| **RPC URL** | `https://rpc.bohr.life` |
| **Block Explorer** | [https://scan.bohr.life](https://scan.bohr.life) |

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
│   ├── Header.tsx               # Brand logo, tagline & wallet connection manager
│   ├── MyReservations.tsx       # Driver reservation management & cancellation
│   ├── MySpaces.tsx             # Owner parking management, toggles & booking history
│   └── ReservationModal.tsx     # Time window selector, duration, cost & overlap checks
├── contracts/
│   └── Parkly.sol               # Solidity smart contract with custom errors & events
├── lib/
│   ├── chain.ts                 # Botchain Testnet viem chain definition
│   ├── contracts/
│   │   ├── abi.ts               # Parkly contract ABI definitions
│   │   ├── config.ts            # Explorer URLs, contract address resolver & helpers
│   │   └── deployment.json      # Deployed address & deployment metadata
│   ├── types.ts                 # TypeScript types & enum declarations
│   └── wagmi.ts                 # Wagmi client configuration
├── scripts/
│   ├── deploy.ts                # Hardhat deployment script for Botchain
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
* **MetaMask** browser extension

### 2. Installation

Clone or open the workspace directory, then install dependencies:

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Populate the `.env` file:

```env
# Botchain RPC & Deployment Credentials
BOTCHAIN_RPC_URL="https://rpc.bohr.life"
PRIVATE_KEY="YOUR_WALLET_PRIVATE_KEY_HERE"

# Frontend Configuration
NEXT_PUBLIC_BOTCHAIN_CHAIN_ID=968
NEXT_PUBLIC_BOTCHAIN_RPC_URL="https://rpc.bohr.life"
NEXT_PUBLIC_BOTCHAIN_EXPLORER="https://scan.bohr.life"
NEXT_PUBLIC_CONTRACT_ADDRESS="0x..." # Deployed contract address
```

> **Security Note**: Never commit your real private key to version control. The `.gitignore` is preconfigured to ignore `.env`.

---

## 🧪 Smart Contract Testing

To run the complete smart contract test suite covering all 28 requirements (creation, updates, overlaps, validations, cancellation, completion, and permissions):

```bash
npm run test
```

### Test Coverage Highlights:
1. **Adding Parking Spaces**: Validates required fields and assigns initial `Available` status.
2. **Input Validation**: Rejects empty space numbers, empty locations, and zero hourly rates.
3. **Updating Parking Spaces**: Restricts updates to the original owner only.
4. **Reservations & Overlaps**:
   * Permits bookings for future timestamps.
   * Rejects bookings where `endTime <= startTime` or starts in the past.
   * Rejects space owners attempting to book their own spaces.
   * Prevents overlapping bookings (full overlap, partial overlap, exact duplicate).
5. **Cancellations & Completions**:
   * Permits driver or owner to cancel an active booking.
   * Prevents cancellation of already cancelled or completed reservations.
   * Allows owner to mark reservations as completed.
6. **Availability Toggling**:
   * Allows owners to set `Available` or `Unavailable`.
   * Rejects setting `Available` when an active reservation is currently in progress.
7. **View Queries**: Tests `getAllParkingSpaces`, `getUserSpaces`, `getUserReservations`, and `getSpaceReservations`.

---

## 🚢 Deploying to Botchain Testnet

To deploy the smart contract to Botchain Testnet:

1. Ensure your `.env` contains `PRIVATE_KEY` funded with Botchain testnet BOHR tokens.
   *(You can run `npx ts-node scripts/generate-wallet.ts` if you need to create a new address to fund).*
2. Execute the deployment script:

```bash
npm run deploy:botchain
```

The script will automatically:
1. Deploy `Parkly.sol` to Botchain Testnet.
2. Output the deployed contract address and BohrScan explorer link.
3. Save the address into `lib/contracts/deployment.json` and sync `.env`.

---

## 💻 Running the Application

### Development Mode

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

Create an optimized production build:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

---

## 🔒 Security & Privacy

* **Zero Personal Identifiable Information (PII)**: The application does not store names, emails, phone numbers, or vehicle licenses.
* **Pure On-Chain Verification**: Space listings and reservations exist directly on the Botchain blockchain.
* **Deterministic Logic**: Permissions, reservation conflicts, and status updates are verified strictly within `Parkly.sol` custom errors and modifiers.

