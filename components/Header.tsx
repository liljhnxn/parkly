"use client";

import React, { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain, useBalance } from "wagmi";
import { botchainTestnet } from "@/lib/chain";
import { shortenAddress, getExplorerAddressUrl } from "@/lib/contracts/config";
import { useToast } from "@/app/providers";
import {
  Car,
  Wallet,
  Check,
  Copy,
  ExternalLink,
  LogOut,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";

export function Header() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { data: balanceData } = useBalance({
    address,
  });
  const { toast } = useToast();

  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isWrongNetwork = mounted && isConnected && chainId !== botchainTestnet.id;

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast("Address copied to clipboard!", "info");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnect = () => {
    const connector = connectors[0];
    if (connector) {
      connect({ connector });
    } else {
      toast("No Web3 wallet detected. Please install MetaMask.", "error");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-charcoal-750/70 bg-charcoal-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-parklyGreen/20 via-charcoal-800 to-parklyPurple/20 border border-parklyGreen/30 flex items-center justify-center shadow-glowGreen/20">
            <Car className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-white font-sans">
                PARK<span className="text-emerald-400">LY</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                Botchain
              </span>
            </div>
            <p className="text-xs text-gray-400 hidden sm:block">
              Find a space. Park with ease.
            </p>
          </div>
        </div>

        {/* Right Action / Wallet */}
        <div className="flex items-center gap-3">
          {isWrongNetwork && (
            <button
              onClick={() => switchChain({ chainId: botchainTestnet.id })}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium hover:bg-amber-500/20 transition cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Switch to Botchain</span>
            </button>
          )}

          {!mounted || !isConnected ? (
            <button
              onClick={handleConnect}
              disabled={!mounted || isConnecting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-charcoal-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 transition-all shadow-glowGreen active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Wallet className="w-4 h-4" />
              <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-700/80 transition-all text-sm font-medium text-gray-200 cursor-pointer"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono">{shortenAddress(address)}</span>
                {balanceData && (
                  <span className="text-xs text-gray-400 hidden md:inline">
                    ({parseFloat(balanceData.formatted).toFixed(3)} {balanceData.symbol})
                  </span>
                )}
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-xl bg-charcoal-900 border border-charcoal-700 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onClick={() => setDropdownOpen(false)}
                >
                  <div className="p-2 border-b border-charcoal-800 mb-1">
                    <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
                      Connected Wallet
                    </p>
                    <p className="text-xs font-mono text-gray-200 truncate mt-0.5">
                      {address}
                    </p>
                    {balanceData && (
                      <p className="text-xs text-emerald-400 mt-1">
                        {parseFloat(balanceData.formatted).toFixed(4)} {balanceData.symbol}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleCopy}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-gray-300 hover:bg-charcoal-800 hover:text-white transition cursor-pointer"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    <span>{copied ? "Copied!" : "Copy Address"}</span>
                  </button>

                  <a
                    href={getExplorerAddressUrl(address || "")}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-gray-300 hover:bg-charcoal-800 hover:text-white transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View on BohrScan</span>
                  </a>

                  <div className="border-t border-charcoal-800 my-1" />

                  <button
                    onClick={() => disconnect()}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Disconnect</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
