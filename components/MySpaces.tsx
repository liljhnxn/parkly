"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatEther } from "viem";
import { ParkingSpace, Reservation, SpaceStatus, ReservationStatus } from "@/lib/types";
import { PARKLY_CONTRACT_ADDRESS, shortenAddress, formatDateTime } from "@/lib/contracts/config";
import { PARKLY_ABI } from "@/lib/contracts/abi";
import { EditSpaceModal } from "./EditSpaceModal";
import { useToast } from "@/app/providers";
import {
  Car,
  MapPin,
  Coins,
  Edit,
  Power,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface MySpacesProps {
  spaces: ParkingSpace[];
  reservations: Reservation[];
  onRefresh: () => void;
}

export function MySpaces({ spaces, reservations, onRefresh }: MySpacesProps) {
  const { address } = useAccount();
  const { toast } = useToast();

  const [editingSpace, setEditingSpace] = useState<ParkingSpace | null>(null);
  const [expandedSpaceId, setExpandedSpaceId] = useState<string | null>(null);

  const hasHandledToggle = useRef(false);
  const hasHandledComplete = useRef(false);

  // Toggle Availability
  const {
    writeContract: writeToggleAvailability,
    data: toggleTxHash,
    isPending: isTogglePending,
    error: toggleError,
    reset: resetToggle,
  } = useWriteContract();

  const { isLoading: isToggleConfirming, isSuccess: isToggleSuccess } =
    useWaitForTransactionReceipt({
      hash: toggleTxHash,
    });

  // Complete Reservation
  const {
    writeContract: writeCompleteReservation,
    data: completeTxHash,
    isPending: isCompletePending,
    error: completeError,
    reset: resetComplete,
  } = useWriteContract();

  const { isLoading: isCompleteConfirming, isSuccess: isCompleteSuccess } =
    useWaitForTransactionReceipt({
      hash: completeTxHash,
    });

  useEffect(() => {
    if (isToggleSuccess && !hasHandledToggle.current) {
      hasHandledToggle.current = true;
      toast("Availability updated successfully!", "success");
      onRefresh();
      resetToggle();
    }
  }, [isToggleSuccess, toast, onRefresh, resetToggle]);

  useEffect(() => {
    if (isCompleteSuccess && !hasHandledComplete.current) {
      hasHandledComplete.current = true;
      toast("Reservation marked as completed!", "success");
      onRefresh();
      resetComplete();
    }
  }, [isCompleteSuccess, toast, onRefresh, resetComplete]);

  useEffect(() => {
    if (toggleError) {
      toast(toggleError.message || "Failed to update availability", "error");
    }
  }, [toggleError, toast]);

  useEffect(() => {
    if (completeError) {
      toast(completeError.message || "Failed to complete reservation", "error");
    }
  }, [completeError, toast]);

  if (!address) return null;

  const mySpaces = spaces.filter(
    (s) => s.owner.toLowerCase() === address.toLowerCase()
  );

  const handleToggleStatus = (space: ParkingSpace) => {
    hasHandledToggle.current = false;
    const newStatus =
      space.status === SpaceStatus.Available
        ? SpaceStatus.Unavailable
        : SpaceStatus.Available;

    try {
      writeToggleAvailability({
        address: PARKLY_CONTRACT_ADDRESS,
        abi: PARKLY_ABI,
        functionName: "updateSpaceAvailability",
        args: [space.id, newStatus],
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error executing status change";
      toast(msg, "error");
    }
  };

  const handleCompleteReservation = (resId: bigint) => {
    hasHandledComplete.current = false;
    try {
      writeCompleteReservation({
        address: PARKLY_CONTRACT_ADDRESS,
        abi: PARKLY_ABI,
        functionName: "completeReservation",
        args: [resId],
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error completing reservation";
      toast(msg, "error");
    }
  };

  return (
    <section className="mb-14">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>My Parking Spaces</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
              {mySpaces.length} {mySpaces.length === 1 ? "space" : "spaces"}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Manage your listed spots, toggle status, and inspect bookings.
          </p>
        </div>
      </div>

      {mySpaces.length === 0 ? (
        <div className="p-8 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-center">
          <Car className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-300">
            You haven't listed any parking spaces yet.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Use the "List a New Parking Space" section above to add your first parking slot!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {mySpaces.map((space) => {
            const spaceReservations = reservations.filter(
              (r) => r.spaceId === space.id
            );
            const activeReservations = spaceReservations.filter(
              (r) => r.status === ReservationStatus.Active
            );
            const isExpanded = expandedSpaceId === space.id.toString();

            return (
              <div
                key={space.id.toString()}
                className="rounded-2xl bg-charcoal-900 border border-charcoal-800 overflow-hidden transition-all duration-200"
              >
                <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Space Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base sm:text-lg font-bold text-white font-mono">
                        Space #{space.spaceNumber}
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-charcoal-800 text-gray-400">
                        ID: {space.id.toString()}
                      </span>
                      {space.status === SpaceStatus.Available ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                          Available
                        </span>
                      ) : space.status === SpaceStatus.Occupied ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-400">
                          Occupied
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/15 border border-red-500/30 text-red-400">
                          Unavailable
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 pt-1">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        {space.location}
                      </span>
                      <span className="flex items-center gap-1.5 font-mono text-emerald-300">
                        <Coins className="w-3.5 h-3.5 text-emerald-400" />
                        {formatEther(space.hourlyRate)} BOT / hr
                      </span>
                      <span className="flex items-center gap-1.5 text-purple-300">
                        <Calendar className="w-3.5 h-3.5 text-purple-400" />
                        {activeReservations.length} Active Booking
                        {activeReservations.length === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Toggle Availability */}
                    <button
                      onClick={() => handleToggleStatus(space)}
                      disabled={isTogglePending || isToggleConfirming}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                        space.status === SpaceStatus.Available
                          ? "bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20"
                          : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>
                        {space.status === SpaceStatus.Available
                          ? "Set Unavailable"
                          : "Set Available"}
                      </span>
                    </button>

                    {/* Edit Space */}
                    <button
                      onClick={() => setEditingSpace(space)}
                      className="px-3.5 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 hover:bg-charcoal-750 text-xs font-medium text-gray-200 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    {/* Expand/Collapse Bookings */}
                    <button
                      onClick={() =>
                        setExpandedSpaceId(isExpanded ? null : space.id.toString())
                      }
                      className="px-3.5 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 hover:bg-charcoal-750 text-xs font-medium text-gray-300 flex items-center gap-1 transition cursor-pointer"
                    >
                      <span>Bookings ({spaceReservations.length})</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Reservations List */}
                {isExpanded && (
                  <div className="p-5 border-t border-charcoal-800 bg-charcoal-950/60">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                      Space Bookings & History
                    </h4>

                    {spaceReservations.length === 0 ? (
                      <p className="text-xs text-gray-500 italic">
                        No reservations have been made for this space yet.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {spaceReservations.map((res) => {
                          const isActive = res.status === ReservationStatus.Active;
                          return (
                            <div
                              key={res.id.toString()}
                              className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-white">
                                    Res #{res.id.toString()}
                                  </span>
                                  <span className="text-gray-400">
                                    Driver: {shortenAddress(res.driver)}
                                  </span>
                                  {isActive ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold">
                                      Active
                                    </span>
                                  ) : res.status === ReservationStatus.Completed ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-500/10 text-purple-400 font-semibold">
                                      Completed
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-500/10 text-red-400 font-semibold">
                                      Cancelled
                                    </span>
                                  )}
                                </div>
                                <div className="text-gray-400 flex items-center gap-2">
                                  <Clock className="w-3 h-3 text-gray-500" />
                                  <span>
                                    {formatDateTime(res.startTime)} &rarr;{" "}
                                    {formatDateTime(res.endTime)}
                                  </span>
                                </div>
                              </div>

                              {isActive && (
                                <button
                                  onClick={() => handleCompleteReservation(res.id)}
                                  disabled={isCompletePending || isCompleteConfirming}
                                  className="px-3 py-1.5 rounded-lg bg-purple-500/15 border border-purple-500/30 hover:bg-purple-500/25 text-purple-300 font-medium text-xs flex items-center gap-1.5 transition self-start sm:self-center cursor-pointer"
                                >
                                  {isCompletePending || isCompleteConfirming ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-3.5 h-3.5" />
                                  )}
                                  <span>Mark Completed</span>
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Space Modal */}
      <EditSpaceModal
        space={editingSpace}
        isOpen={!!editingSpace}
        onClose={() => setEditingSpace(null)}
        onSuccess={onRefresh}
      />
    </section>
  );
}
