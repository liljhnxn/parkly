"use client";

import React, { useState, useEffect, useRef } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatEther, parseEther } from "viem";
import { ParkingSpace } from "@/lib/types";
import { PARKLY_CONTRACT_ADDRESS } from "@/lib/contracts/config";
import { PARKLY_ABI } from "@/lib/contracts/abi";
import { useToast } from "@/app/providers";
import { X, Edit3, Car, MapPin, Coins, Loader2 } from "lucide-react";

interface EditSpaceModalProps {
  space: ParkingSpace | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditSpaceModal({
  space,
  isOpen,
  onClose,
  onSuccess,
}: EditSpaceModalProps) {
  const { toast } = useToast();

  const [spaceNumber, setSpaceNumber] = useState("");
  const [location, setLocation] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const hasHandledSuccess = useRef(false);

  const {
    data: txHash,
    isPending: isWritePending,
    error: writeError,
    writeContract,
    reset: resetWrite,
  } = useWriteContract();

  const { isLoading: isTxConfirming, isSuccess: isTxSuccess } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  useEffect(() => {
    if (space && isOpen) {
      setSpaceNumber(space.spaceNumber);
      setLocation(space.location);
      setHourlyRate(formatEther(space.hourlyRate));
      hasHandledSuccess.current = false;
      resetWrite();
    }
  }, [space, isOpen, resetWrite]);

  useEffect(() => {
    if (isTxSuccess && !hasHandledSuccess.current) {
      hasHandledSuccess.current = true;
      toast("Parking space details updated on-chain!", "success");
      onSuccess?.();
      onClose();
    }
  }, [isTxSuccess, toast, onSuccess, onClose]);

  useEffect(() => {
    if (writeError) {
      toast(writeError.message || "Failed to update space", "error");
    }
  }, [writeError, toast]);

  if (!isOpen || !space) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spaceNumber.trim() || !location.trim()) {
      toast("Please provide both space number and location.", "error");
      return;
    }
    const rateNum = parseFloat(hourlyRate);
    if (isNaN(rateNum) || rateNum <= 0) {
      toast("Hourly rate must be greater than 0.", "error");
      return;
    }

    try {
      hasHandledSuccess.current = false;
      const rateWei = parseEther(hourlyRate);
      writeContract({
        address: PARKLY_CONTRACT_ADDRESS,
        abi: PARKLY_ABI,
        functionName: "updateParkingSpace",
        args: [space.id, spaceNumber.trim(), location.trim(), rateWei],
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error executing update";
      toast(errorMsg, "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-3xl bg-charcoal-900 border border-charcoal-700 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-charcoal-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Edit Space #{space.spaceNumber}
              </h3>
              <p className="text-xs text-gray-400">Space ID: {space.id.toString()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-charcoal-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Space Number / Name
            </label>
            <div className="relative">
              <Car className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={spaceNumber}
                onChange={(e) => setSpaceNumber(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-charcoal-850 border border-charcoal-750 text-sm text-gray-100 focus:outline-none focus:border-emerald-500/50 transition font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Parking Location
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-charcoal-850 border border-charcoal-750 text-sm text-gray-100 focus:outline-none focus:border-emerald-500/50 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Hourly Rate (BOHR)
            </label>
            <div className="relative">
              <Coins className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                step="0.001"
                min="0.0001"
                required
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-charcoal-850 border border-charcoal-750 text-sm text-gray-100 focus:outline-none focus:border-emerald-500/50 transition font-mono"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-charcoal-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isWritePending || isTxConfirming}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-charcoal-950 font-bold text-xs tracking-wide flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              {isWritePending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Approving...</span>
                </>
              ) : isTxConfirming ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
