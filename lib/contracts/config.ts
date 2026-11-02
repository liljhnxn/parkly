import { Address } from "viem";
import deploymentData from "./deployment.json";

export const BOTCHAIN_CHAIN_ID = 968;
export const BOTCHAIN_RPC_URL =
  process.env.NEXT_PUBLIC_BOTCHAIN_RPC_URL || "https://rpc.bohr.life";
export const BOTCHAIN_EXPLORER_URL =
  process.env.NEXT_PUBLIC_BOTCHAIN_EXPLORER || "https://scan.bohr.life";

// Read from NEXT_PUBLIC_CONTRACT_ADDRESS, or fallback to deployment.json address
export const PARKLY_CONTRACT_ADDRESS: Address = (process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS ||
  (deploymentData as { address?: string }).address ||
  "0x0000000000000000000000000000000000000000") as Address;

export function getExplorerTxUrl(txHash: string): string {
  return `${BOTCHAIN_EXPLORER_URL}/tx/${txHash}`;
}

export function getExplorerAddressUrl(address: string): string {
  return `${BOTCHAIN_EXPLORER_URL}/address/${address}`;
}

export function shortenAddress(address?: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatDateTime(timestamp: number | bigint): string {
  const ts = Number(timestamp);
  if (!ts) return "—";
  const date = new Date(ts * 1000);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDuration(seconds: number | bigint): string {
  const sec = Number(seconds);
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours} hr${hours > 1 ? "s" : ""}`;
  } else {
    return `${minutes} min${minutes > 1 ? "s" : ""}`;
  }
}
