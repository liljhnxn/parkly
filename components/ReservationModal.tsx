"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatEther, decodeEventLog } from "viem";
import { ParkingSpace, Reservation } from "@/lib/types";
import { PARKLY_CONTRACT_ADDRESS, getExplorerTxUrl, formatDateTime } from "@/lib/contracts/config";
import { PARKLY_ABI } from "@/lib/contracts/abi";
import { useToast } from "@/app/providers";
import {
  X,
  Calendar,
  Clock,
  Coins,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  Car,
  MapPin,
} from "lucide-react";

interface ReservationModalProps {
  space: ParkingSpace | null;
  isOpen: boolean;
  onClose: () => void;
  onReservationSuccess?: () => void;
  existingSpaceReservations?: Reservation[];
}

export function ReservationModal({
  space,
  isOpen,
  onClose,
  onReservationSuccess,
  existingSpaceReservations = [],
}: ReservationModalProps) {
  const { isConnected, address } = useAccount();
  const { toast } = useToast();

  const defaultStartTime = useMemo(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 15);
    d.setSeconds(0, 0);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  }, []);

  const defaultEndTime = useMemo(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 135);
    d.setSeconds(0, 0);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  }, []);

  const [startInput, setStartInput] = useState(defaultStartTime);
  const [endInput, setEndInput] = useState(defaultEndTime);
  const [copiedId, setCopiedId] = useState(false);
  const [confirmedResId, setConfirmedResId] = useState<string | null>(null);
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

  useEffect(() => {
    if (isOpen) {
      setStartInput(defaultStartTime);
      setEndInput(defaultEndTime);
      setConfirmedResId(null);
      hasHandledSuccess.current = false;
      resetWrite();
    }
  }, [isOpen, defaultStartTime, defaultEndTime, resetWrite]);

  useEffect(() => {
    if (isTxSuccess && receipt && !hasHandledSuccess.current) {
      hasHandledSuccess.current = true;
      let foundResId: string | null = null;
      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: PARKLY_ABI,
            data: log.data,
            topics: log.topics,
          });
          if (decoded.eventName === "SpaceReserved") {
            const args = decoded.args as { reservationId: bigint };
            foundResId = args.reservationId.toString();
            break;
          }
        } catch {
          // not this event
        }
      }
      if (foundResId) {
        setConfirmedResId(foundResId);
      }
      toast("Reservation confirmed on Botchain!", "success");
      onReservationSuccess?.();
    }
  }, [isTxSuccess, receipt, toast, onReservationSuccess]);

  useEffect(() => {
    if (writeError) {
      toast(writeError.message || "Failed to submit reservation", "error");
    }
  }, [writeError, toast]);

  const { startUnix, endUnix, durationHours, estimatedCost, hasConflict, conflictReason } =
    useMemo(() => {
      const s = Math.floor(new Date(startInput).getTime() / 1000);
      const e = Math.floor(new Date(endInput).getTime() / 1000);
      const now = Math.floor(Date.now() / 1000);

      let conflict = false;
      let reason = "";

      if (isNaN(s) || isNaN(e)) {
        return {
          startUnix: 0,
          endUnix: 0,
          durationHours: 0,
          estimatedCost: "0",
          hasConflict: true,
          conflictReason: "Please enter valid dates.",
        };
      }

      if (s < now - 60) {
        conflict = true;
        reason = "Start time must be in the future.";
      } else if (e <= s) {
        conflict = true;
        reason = "End time must be after start time.";
      }

      if (!conflict && existingSpaceReservations && existingSpaceReservations.length > 0) {
        for (const r of existingSpaceReservations) {
          if (r.status === 0) {
            const rStart = Number(r.startTime);
            const rEnd = Number(r.endTime);
            if (s < rEnd && e > rStart) {
              conflict = true;
              reason = `Overlaps with existing reservation (${formatDateTime(
                rStart
              )} - ${formatDateTime(rEnd)})`;
              break;
            }
          }
        }
      }

      const diffSec = Math.max(0, e - s);
      const hours = diffSec / 3600;
      let costStr = "0";
      if (space && hours > 0) {
        const ratePerSec = Number(space.hourlyRate) / 3600;
        const totalWei = BigInt(Math.floor(ratePerSec * diffSec));
        costStr = formatEther(totalWei);
      }

      return {
        startUnix: s,
        endUnix: e,
        durationHours: hours,
        estimatedCost: costStr,
        hasConflict: conflict,
        conflictReason: reason,
      };
    }, [startInput, endInput, space, existingSpaceReservations]);

  if (!isOpen || !space) return null;

  const isOwner =
    address && space.owner.toLowerCase() === address.toLowerCase();

  const handleConfirmReservation = () => {
    if (!isConnected) {
      toast("Please connect your wallet first.", "error");
      return;
    }
    if (isOwner) {
      toast("Space owners cannot reserve their own space.", "error");
      return;
    }
    if (hasConflict) {
      toast(conflictReason || "Invalid reservation parameters.", "error");
      return;
    }

    try {
      hasHandledSuccess.current = false;
      writeContract({
        address: PARKLY_CONTRACT_ADDRESS,
        abi: PARKLY_ABI,
        functionName: "reserveSpace",
        args: [space.id, BigInt(startUnix), BigInt(endUnix)],
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error executing reservation";
      toast(errorMsg, "error");
    }
  };

  const handleCopyResId = () => {
    if (!confirmedResId) return;
    navigator.clipboard.writeText(confirmedResId);
    setCopiedId(true);
    toast("Reservation ID copied!", "info");
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-3xl bg-charcoal-900 border border-charcoal-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-charcoal-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {isTxSuccess ? "Reservation Confirmed!" : "Reserve Parking Space"}
              </h3>
              <p className="text-xs text-gray-400">
                Space #{space.spaceNumber} &bull; ID: {space.id.toString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-charcoal-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          {isTxSuccess ? (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <h4 className="text-sm font-bold text-white">
                    You have successfully booked this parking space!
                  </h4>
                </div>
                <p className="text-xs text-gray-300">
                  Your reservation is immutably recorded on Botchain Mainnet.
                </p>

                {confirmedResId && (
                  <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-charcoal-900 border border-charcoal-750">
                    <div>
                      <span className="text-[11px] text-gray-400 uppercase tracking-wider block">
                        Reservation ID
                      </span>
                      <span className="font-mono text-base font-bold text-emerald-400">
                        #{confirmedResId}
                      </span>
                    </div>
                    <button
                      onClick={handleCopyResId}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-xs text-gray-200 transition cursor-pointer"
                    >
                      {copiedId ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-gray-400" />
                          <span>Copy ID</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-800 space-y-2 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Parking Space:</span>
                  <span className="text-white font-medium">#{space.spaceNumber}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Location:</span>
                  <span className="text-white font-medium">{space.location}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Start Time:</span>
                  <span className="text-white font-medium">{formatDateTime(startUnix)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>End Time:</span>
                  <span className="text-white font-medium">{formatDateTime(endUnix)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Duration:</span>
                  <span className="text-white font-medium">
                    {durationHours.toFixed(1)} hrs
                  </span>
                </div>
              </div>

              {txHash && (
                <div className="pt-2 text-center">
                  <a
                    href={getExplorerTxUrl(txHash)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Transaction on BotchainScan
                  </a>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="p-4 rounded-2xl bg-charcoal-850 border border-charcoal-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-bold text-white">
                      Space #{space.spaceNumber}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-emerald-300">
                    {formatEther(space.hourlyRate)} BOT / hr
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <span className="truncate">{space.location}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Start Date & Time (Your Local Timezone)
                  </label>
                  <input
                    type="datetime-local"
                    value={startInput}
                    onChange={(e) => setStartInput(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-charcoal-850 border border-charcoal-750 text-sm text-gray-100 focus:outline-none focus:border-purple-500/60 font-mono transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    End Date & Time (Your Local Timezone)
                  </label>
                  <input
                    type="datetime-local"
                    value={endInput}
                    onChange={(e) => setEndInput(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-charcoal-850 border border-charcoal-750 text-sm text-gray-100 focus:outline-none focus:border-purple-500/60 font-mono transition"
                  />
                </div>
              </div>

              {hasConflict && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{conflictReason}</span>
                </div>
              )}

              {!hasConflict && (
                <div className="p-4 rounded-2xl bg-charcoal-850/80 border border-charcoal-800 space-y-2.5">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Reservation Summary
                  </h4>

                  <div className="flex items-center justify-between text-xs text-gray-300">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      Total Duration
                    </span>
                    <span className="font-mono font-medium text-white">
                      {durationHours.toFixed(2)} hours
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-300">
                    <span className="flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-emerald-400" />
                      Estimated Fee
                    </span>
                    <span className="font-mono font-bold text-emerald-300">
                      ~{parseFloat(estimatedCost).toFixed(4)} BOT
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-6 border-t border-charcoal-800 bg-charcoal-900/50 flex items-center justify-end gap-3">
          {isTxSuccess ? (
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-charcoal-950 font-bold text-xs tracking-wide transition cursor-pointer"
            >
              Close
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-charcoal-800 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmReservation}
                disabled={hasConflict || isWritePending || isTxConfirming || isOwner}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-xs tracking-wide flex items-center gap-2 transition shadow-glowPurple active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isWritePending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Confirm in Wallet...</span>
                  </>
                ) : isTxConfirming ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Confirming on Botchain...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    <span>Confirm Reservation</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
