"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Reservation, ParkingSpace, ReservationStatus } from "@/lib/types";
import {
  PARKLY_CONTRACT_ADDRESS,
  formatDateTime,
  getExplorerTxUrl,
} from "@/lib/contracts/config";
import { PARKLY_ABI } from "@/lib/contracts/abi";
import { useToast } from "@/app/providers";
import {
  Calendar,
  Car,
  MapPin,
  Clock,
  XCircle,
  ExternalLink,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface MyReservationsProps {
  reservations: Reservation[];
  spaces: ParkingSpace[];
  onRefresh: () => void;
}

export function MyReservations({
  reservations,
  spaces,
  onRefresh,
}: MyReservationsProps) {
  const { address } = useAccount();
  const { toast } = useToast();

  const [cancellingId, setCancellingId] = useState<bigint | null>(null);
  const hasHandledCancel = useRef(false);

  const {
    writeContract: writeCancelReservation,
    data: cancelTxHash,
    isPending: isCancelPending,
    error: cancelError,
    reset: resetCancel,
  } = useWriteContract();

  const { isLoading: isCancelConfirming, isSuccess: isCancelSuccess } =
    useWaitForTransactionReceipt({
      hash: cancelTxHash,
    });

  useEffect(() => {
    if (isCancelSuccess && !hasHandledCancel.current) {
      hasHandledCancel.current = true;
      toast("Reservation cancelled successfully!", "success");
      setCancellingId(null);
      resetCancel();
      onRefresh();
    }
  }, [isCancelSuccess, toast, resetCancel, onRefresh]);

  useEffect(() => {
    if (cancelError) {
      toast(cancelError.message || "Failed to cancel reservation", "error");
      setCancellingId(null);
    }
  }, [cancelError, toast]);

  if (!address) return null;

  const myReservations = reservations.filter(
    (r) => r.driver.toLowerCase() === address.toLowerCase()
  );

  const getSpace = (spaceId: bigint): ParkingSpace | undefined => {
    return spaces.find((s) => s.id === spaceId);
  };

  const handleCancel = (resId: bigint) => {
    if (
      !confirm(
        "Are you sure you want to cancel this reservation? This action is irreversible on-chain."
      )
    ) {
      return;
    }
    hasHandledCancel.current = false;
    setCancellingId(resId);
    try {
      writeCancelReservation({
        address: PARKLY_CONTRACT_ADDRESS,
        abi: PARKLY_ABI,
        functionName: "cancelReservation",
        args: [resId],
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error cancelling reservation";
      toast(msg, "error");
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case ReservationStatus.Active:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
        );
      case ReservationStatus.Cancelled:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/15 border border-red-500/30 text-red-400">
            Cancelled
          </span>
        );
      case ReservationStatus.Completed:
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 border border-purple-500/30 text-purple-400">
            Completed
          </span>
        );
    }
  };

  return (
    <section className="mb-14">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>My Reservations</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-300">
              {myReservations.length}{" "}
              {myReservations.length === 1 ? "booking" : "bookings"}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Your reserved parking spots and scheduled time windows.
          </p>
        </div>
      </div>

      {myReservations.length === 0 ? (
        <div className="p-8 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-center">
          <Calendar className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-300">
            No reservations found.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Browse available spaces above and reserve a parking spot for your next trip.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myReservations.map((res) => {
            const space = getSpace(res.spaceId);
            const isActive = res.status === ReservationStatus.Active;
            const isThisCancelling =
              cancellingId === res.id && (isCancelPending || isCancelConfirming);

            return (
              <div
                key={res.id.toString()}
                className="p-5 sm:p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 hover:border-charcoal-700/80 transition-all flex flex-col justify-between shadow-card"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base sm:text-lg font-bold text-white font-mono">
                          Space #{space ? space.spaceNumber : res.spaceId.toString()}
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-charcoal-800 text-gray-400">
                          Res #{res.id.toString()}
                        </span>
                      </div>
                      {space && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">{space.location}</span>
                        </div>
                      )}
                    </div>
                    {getStatusBadge(res.status)}
                  </div>

                  {/* Timestamps */}
                  <div className="my-4 p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-purple-400" />
                        Start Time:
                      </span>
                      <span className="text-white font-mono font-medium">
                        {formatDateTime(res.startTime)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-purple-400" />
                        End Time:
                      </span>
                      <span className="text-white font-mono font-medium">
                        {formatDateTime(res.endTime)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-2 border-t border-charcoal-800 flex items-center justify-between">
                  <span className="text-[11px] text-gray-500">
                    Space ID: {res.spaceId.toString()}
                  </span>

                  {isActive ? (
                    <button
                      onClick={() => handleCancel(res.id)}
                      disabled={isThisCancelling}
                      className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {isThisCancelling ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Cancelling...</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel Reservation</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-xs text-gray-500 italic">
                      {res.status === ReservationStatus.Completed
                        ? "Completed"
                        : "Cancelled"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
