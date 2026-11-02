"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, decodeEventLog } from "viem";
import { PARKLY_CONTRACT_ADDRESS, getExplorerTxUrl } from "@/lib/contracts/config";
import { PARKLY_ABI } from "@/lib/contracts/abi";
import { useToast } from "@/app/providers";
import {
  PlusCircle,
  Car,
  MapPin,
  Coins,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  Lock,
} from "lucide-react";

interface AddSpaceSectionProps {
  onSpaceAdded?: () => void;
}

export function AddSpaceSection({ onSpaceAdded }: AddSpaceSectionProps) {
  const { isConnected } = useAccount();
  const { toast } = useToast();

  const [spaceNumber, setSpaceNumber] = useState("");
  const [location, setLocation] = useState("");
  const [hourlyRateInput, setHourlyRateInput] = useState("0.05");
  const [copiedId, setCopiedId] = useState(false);
  const [createdSpaceId, setCreatedSpaceId] = useState<string | null>(null);
  const hasHandledSuccess = useRef(false);

  const {
    data: txHash,
    isPending: isWritePending,
    error: writeError,
    writeContract,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isTxConfirming,
    isSuccess: isTxSuccess,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Extract created Space ID from event receipt
  useEffect(() => {
    if (isTxSuccess && receipt && !hasHandledSuccess.current) {
      hasHandledSuccess.current = true;
      let foundId: string | null = null;
      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: PARKLY_ABI,
            data: log.data,
            topics: log.topics,
          });
          if (decoded.eventName === "ParkingSpaceAdded") {
            const args = decoded.args as { spaceId: bigint };
            foundId = args.spaceId.toString();
            break;
          }
        } catch {
          // not this event
        }
      }
      if (foundId) {
        setCreatedSpaceId(foundId);
      }
      toast("Parking space created successfully on-chain!", "success");
      onSpaceAdded?.();
    }
  }, [isTxSuccess, receipt, toast, onSpaceAdded]);

  useEffect(() => {
    if (writeError) {
      toast(writeError.message || "Failed to submit transaction", "error");
    }
  }, [writeError, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      toast("Please connect your wallet first.", "error");
      return;
    }

    if (!spaceNumber.trim()) {
      toast("Space number is required.", "error");
      return;
    }
    if (!location.trim()) {
      toast("Location is required.", "error");
      return;
    }
    const rateNum = parseFloat(hourlyRateInput);
    if (isNaN(rateNum) || rateNum <= 0) {
      toast("Hourly rate must be greater than 0.", "error");
      return;
    }

    try {
      hasHandledSuccess.current = false;
      const rateWei = parseEther(hourlyRateInput);
      writeContract({
        address: PARKLY_CONTRACT_ADDRESS,
        abi: PARKLY_ABI,
        functionName: "addParkingSpace",
        args: [spaceNumber.trim(), location.trim(), rateWei],
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error preparing transaction";
      toast(errorMsg, "error");
    }
  };

  const handleCopyId = () => {
    if (!createdSpaceId) return;
    navigator.clipboard.writeText(createdSpaceId);
    setCopiedId(true);
    toast("Space ID copied!", "info");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleReset = () => {
    setSpaceNumber("");
    setLocation("");
    setHourlyRateInput("0.05");
    setCreatedSpaceId(null);
    hasHandledSuccess.current = false;
    resetWrite();
  };

  return (
    <section className="mb-14">
      <div className="p-6 sm:p-8 rounded-3xl bg-charcoal-900 border border-charcoal-750 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-parklyGreen/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <PlusCircle className="w-6 h-6 text-emerald-400" />
              <span>List a New Parking Space</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              Set your space details and earn BOHR whenever drivers reserve your slot.
            </p>
          </div>
        </div>

        {!isConnected ? (
          <div className="p-8 rounded-2xl bg-charcoal-850/80 border border-dashed border-charcoal-700 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-xl bg-charcoal-800 flex items-center justify-center text-gray-500 mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <p className="text-base font-semibold text-gray-200">
              Wallet Connection Required
            </p>
            <p className="text-xs text-gray-400 max-w-sm mt-1">
              Connect your MetaMask or Web3 wallet above to register and manage parking spaces on Botchain.
            </p>
          </div>
        ) : isTxSuccess ? (
          /* Success Card */
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-white">
                  Parking Space Listed Successfully!
                </h3>
                <p className="text-xs text-gray-300 mt-1">
                  Your parking space #{spaceNumber} is now live and discoverable on-chain.
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-4">
                  {createdSpaceId && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-charcoal-900 border border-charcoal-700">
                      <span className="text-xs text-gray-400">Space ID:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {createdSpaceId}
                      </span>
                      <button
                        onClick={handleCopyId}
                        className="p-1 hover:text-white transition text-gray-400 cursor-pointer"
                        title="Copy Space ID"
                      >
                        {copiedId ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}

                  {txHash && (
                    <a
                      href={getExplorerTxUrl(txHash)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-emerald-300 hover:text-white font-medium underline underline-offset-4 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View on BohrScan Explorer
                    </a>
                  )}
                </div>

                <div className="mt-5">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-charcoal-950 font-semibold text-xs transition cursor-pointer"
                  >
                    List Another Space
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Add Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Space Number */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Space Number / Code
                </label>
                <div className="relative">
                  <Car className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. A-101, Bay-4"
                    value={spaceNumber}
                    onChange={(e) => setSpaceNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-charcoal-850 border border-charcoal-750 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50 transition font-mono"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Parking Location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Downtown Mall, Level 2"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-charcoal-850 border border-charcoal-750 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50 transition"
                  />
                </div>
              </div>

              {/* Hourly Rate */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Hourly Rate (in BOHR)
                </label>
                <div className="relative">
                  <Coins className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    step="0.001"
                    min="0.0001"
                    required
                    placeholder="0.05"
                    value={hourlyRateInput}
                    onChange={(e) => setHourlyRateInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-charcoal-850 border border-charcoal-750 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50 transition font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-[11px] text-gray-500">
                Contract network: Botchain Testnet (Chain ID 968)
              </p>

              <button
                type="submit"
                disabled={isWritePending || isTxConfirming}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-charcoal-950 font-bold text-xs tracking-wide flex items-center gap-2 transition shadow-glowGreen active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isWritePending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Approve in Wallet...</span>
                  </>
                ) : isTxConfirming ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Confirming on Botchain...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Add Space</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
