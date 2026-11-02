"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { createPublicClient, http } from "viem";
import { botchainTestnet } from "@/lib/chain";
import { PARKLY_CONTRACT_ADDRESS, BOTCHAIN_RPC_URL, getExplorerAddressUrl } from "@/lib/contracts/config";
import { PARKLY_ABI } from "@/lib/contracts/abi";
import { ParkingSpace, Reservation } from "@/lib/types";
import { Header } from "@/components/Header";
import { DashboardStats } from "@/components/DashboardStats";
import { ExploreSpaces } from "@/components/ExploreSpaces";
import { AddSpaceSection } from "@/components/AddSpaceSection";
import { ReservationModal } from "@/components/ReservationModal";
import { MySpaces } from "@/components/MySpaces";
import { MyReservations } from "@/components/MyReservations";
import { Sparkles, RefreshCw, ShieldCheck, ExternalLink, Car } from "lucide-react";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();

  const [allSpaces, setAllSpaces] = useState<ParkingSpace[]>([]);
  const [allReservations, setAllReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSpaceForReservation, setSelectedSpaceForReservation] = useState<ParkingSpace | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadContractData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      if (!PARKLY_CONTRACT_ADDRESS || PARKLY_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      const client = createPublicClient({
        chain: botchainTestnet,
        transport: http(BOTCHAIN_RPC_URL),
      });

      const rawSpaces = (await client.readContract({
        address: PARKLY_CONTRACT_ADDRESS,
        abi: PARKLY_ABI,
        functionName: "getAllParkingSpaces",
      })) as ParkingSpace[];

      setAllSpaces(rawSpaces || []);

      const reservationList: Reservation[] = [];
      if (rawSpaces && rawSpaces.length > 0) {
        for (const sp of rawSpaces) {
          try {
            const spaceRes = (await client.readContract({
              address: PARKLY_CONTRACT_ADDRESS,
              abi: PARKLY_ABI,
              functionName: "getSpaceReservations",
              args: [sp.id],
            })) as Reservation[];
            if (spaceRes) {
              reservationList.push(...spaceRes);
            }
          } catch {
            // ignore
          }
        }
      }
      setAllReservations(reservationList);
    } catch (err) {
      console.error("Error reading contract data:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadContractData();
  }, [loadContractData]);

  const totalSpaces = allSpaces.length;
  const availableSpaces = allSpaces.filter((s) => s.status === 0).length;
  const activeReservations = allReservations.filter((r) => r.status === 0).length;
  const myReservationsCount = mounted && address
    ? allReservations.filter((r) => r.driver.toLowerCase() === address.toLowerCase()).length
    : 0;

  const selectedSpaceReservations = selectedSpaceForReservation
    ? allReservations.filter((r) => r.spaceId === selectedSpaceForReservation.id)
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-charcoal-950 text-gray-100 selection:bg-emerald-500/20">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="relative mb-8 p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-charcoal-900 via-charcoal-850 to-charcoal-900 border border-charcoal-750 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Decentralized Parking Infrastructure &bull; Botchain Testnet</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white font-sans leading-tight">
                Decentralized Parking Management & Instant Reservations
              </h1>
              <p className="text-sm sm:text-base text-gray-400 mt-2">
                List and monetize your private parking spaces or reserve available spots with transparent, on-chain smart contract automation.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={loadContractData}
                disabled={isRefreshing}
                className="px-4 py-2.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 border border-charcoal-700 text-xs font-semibold text-gray-300 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-emerald-400" : ""}`} />
                <span>{isRefreshing ? "Refreshing..." : "Refresh Data"}</span>
              </button>

              {PARKLY_CONTRACT_ADDRESS && PARKLY_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" && (
                <a
                  href={getExplorerAddressUrl(PARKLY_CONTRACT_ADDRESS)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-charcoal-800/80 hover:bg-charcoal-750 border border-charcoal-700 text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1.5 transition"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Contract Verified</span>
                  <ExternalLink className="w-3 h-3 text-gray-500 ml-0.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        <DashboardStats
          totalSpaces={totalSpaces}
          availableSpaces={availableSpaces}
          activeReservations={activeReservations}
          myReservationsCount={myReservationsCount}
          isLoading={isLoading}
        />

        <ExploreSpaces
          spaces={allSpaces}
          isLoading={isLoading}
          onReserveSpace={(space) => setSelectedSpaceForReservation(space)}
          connectedAddress={mounted ? address : undefined}
        />

        <AddSpaceSection onSpaceAdded={loadContractData} />

        {mounted && isConnected && (
          <MySpaces
            spaces={allSpaces}
            reservations={allReservations}
            onRefresh={loadContractData}
          />
        )}

        {mounted && isConnected && (
          <MyReservations
            reservations={allReservations}
            spaces={allSpaces}
            onRefresh={loadContractData}
          />
        )}
      </main>

      <ReservationModal
        space={selectedSpaceForReservation}
        isOpen={!!selectedSpaceForReservation}
        onClose={() => setSelectedSpaceForReservation(null)}
        onReservationSuccess={loadContractData}
        existingSpaceReservations={selectedSpaceReservations}
      />

      <footer className="border-t border-charcoal-800 bg-charcoal-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-gray-300">Parkly</span>
            <span>&bull; Powered by Botchain (Chain ID: 968)</span>
          </div>
          <div>
            <span>Smart contract automated &bull; No middleman fees</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
