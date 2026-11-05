"use client";

import React, { useState, useMemo } from "react";
import { ParkingSpace, SpaceStatus } from "@/lib/types";
import { formatEther } from "viem";
import { shortenAddress, getExplorerAddressUrl } from "@/lib/contracts/config";
import { useToast } from "@/app/providers";
import {
  Search,
  MapPin,
  Coins,
  User,
  Copy,
  Check,
  Calendar,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Filter,
} from "lucide-react";

interface ExploreSpacesProps {
  spaces: ParkingSpace[];
  isLoading: boolean;
  onReserveSpace: (space: ParkingSpace) => void;
  connectedAddress?: string;
}

export function ExploreSpaces({
  spaces,
  isLoading,
  onReserveSpace,
  connectedAddress,
}: ExploreSpacesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "AVAILABLE" | "OCCUPIED" | "UNAVAILABLE">("ALL");
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCopyOwner = (owner: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(owner);
    setCopiedAddress(owner);
    toast("Owner address copied!", "info");
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const filteredSpaces = useMemo(() => {
    return spaces.filter((space) => {
      const matchesSearch =
        space.spaceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        space.location.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === "AVAILABLE") return space.status === SpaceStatus.Available;
      if (statusFilter === "OCCUPIED") return space.status === SpaceStatus.Occupied;
      if (statusFilter === "UNAVAILABLE") return space.status === SpaceStatus.Unavailable;
      return true;
    });
  }, [spaces, searchTerm, statusFilter]);

  const getStatusBadge = (status: number) => {
    switch (status) {
      case SpaceStatus.Available:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Available
          </span>
        );
      case SpaceStatus.Occupied:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Occupied
          </span>
        );
      case SpaceStatus.Unavailable:
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/15 border border-red-500/30 text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            Unavailable
          </span>
        );
    }
  };

  return (
    <section className="mb-14">
      {/* Section Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Explore Parking Spaces</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-charcoal-800 border border-charcoal-700 text-gray-400">
              {filteredSpaces.length} {filteredSpaces.length === 1 ? "space" : "spaces"}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Browse verified on-chain parking slots and book your reservation.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search space # or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-xl bg-charcoal-900 border border-charcoal-750 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50 transition"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-charcoal-900 border border-charcoal-750 rounded-xl overflow-x-auto">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                statusFilter === "ALL"
                  ? "bg-charcoal-750 text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("AVAILABLE")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                statusFilter === "AVAILABLE"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setStatusFilter("OCCUPIED")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                statusFilter === "OCCUPIED"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Occupied
            </button>
            <button
              onClick={() => setStatusFilter("UNAVAILABLE")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                statusFilter === "UNAVAILABLE"
                  ? "bg-red-500/20 text-red-300 border border-red-500/30"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Unavailable
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Parking Spaces */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-charcoal-900 border border-charcoal-800 animate-pulse p-6 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-1/3 h-5 bg-charcoal-800 rounded-md" />
                <div className="w-2/3 h-4 bg-charcoal-800 rounded-md" />
              </div>
              <div className="w-full h-10 bg-charcoal-800 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredSpaces.length === 0 ? (
        <div className="p-12 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-charcoal-800 flex items-center justify-center text-gray-500 mb-3">
            <Filter className="w-6 h-6" />
          </div>
          <p className="text-base font-semibold text-gray-200">No parking spaces found</p>
          <p className="text-xs text-gray-500 max-w-sm mt-1">
            {searchTerm || statusFilter !== "ALL"
              ? "Try adjusting your search criteria or resetting filters."
              : "No parking spaces listed on-chain yet. Be the first parking owner to add one!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSpaces.map((space) => {
            const isOwner =
              connectedAddress &&
              space.owner.toLowerCase() === connectedAddress.toLowerCase();
            const isAvailable = space.status === SpaceStatus.Available;

            return (
              <div
                key={space.id.toString()}
                className="group rounded-2xl bg-charcoal-900 border border-charcoal-800 hover:border-charcoal-700 p-6 flex flex-col justify-between transition-all duration-300 shadow-card hover:shadow-card-hover relative overflow-hidden"
              >
                {/* Subtle top glow line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent group-hover:via-emerald-400/50 transition-all" />

                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-white font-mono tracking-tight group-hover:text-emerald-400 transition">
                          Space #{space.spaceNumber}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-charcoal-800 text-gray-400">
                          ID: {space.id.toString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{space.location}</span>
                      </div>
                    </div>
                    {getStatusBadge(space.status)}
                  </div>

                  {/* Hourly Rate */}
                  <div className="my-4 p-3 rounded-xl bg-charcoal-850 border border-charcoal-800 flex items-center justify-between">
                    <span className="text-xs text-gray-400 flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-emerald-400" />
                      Hourly Rate
                    </span>
                    <span className="text-sm font-bold text-emerald-300 font-mono">
                      {formatEther(space.hourlyRate)} BOT
                    </span>
                  </div>

                  {/* Owner info */}
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-1 pb-4">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-gray-500" />
                      Owner
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-gray-300">
                        {shortenAddress(space.owner)}
                      </span>
                      <button
                        onClick={(e) => handleCopyOwner(space.owner, e)}
                        title="Copy Address"
                        className="p-1 hover:text-white transition rounded"
                      >
                        {copiedAddress === space.owner ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-gray-400" />
                        )}
                      </button>
                      <a
                        href={getExplorerAddressUrl(space.owner)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 hover:text-white transition rounded"
                        title="View on BotchainScan"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="mt-2 pt-3 border-t border-charcoal-800">
                  {isOwner ? (
                    <div className="w-full py-2.5 px-4 rounded-xl bg-charcoal-800 border border-charcoal-700 text-xs text-center text-gray-400 font-medium">
                      You own this parking space
                    </div>
                  ) : !isAvailable ? (
                    <button
                      disabled
                      className="w-full py-2.5 px-4 rounded-xl bg-charcoal-800 border border-charcoal-750 text-xs text-gray-500 font-medium cursor-not-allowed text-center"
                    >
                      Currently Unavailable
                    </button>
                  ) : (
                    <button
                      onClick={() => onReserveSpace(space)}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-charcoal-950 font-semibold text-xs tracking-wide flex items-center justify-center gap-2 transition shadow-glowGreen active:scale-[0.98] cursor-pointer"
                    >
                      <Calendar className="w-4 h-4" />
                      Reserve Space
                    </button>
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

