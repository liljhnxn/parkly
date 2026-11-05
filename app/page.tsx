"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useAccount } from "wagmi";
import { createPublicClient, http } from "viem";
import { botchainMainnet } from "@/lib/chain";
import {
  PARKLY_CONTRACT_ADDRESS,
  BOTCHAIN_RPC_URL,
  BOTCHAIN_EXPLORER_URL,
  getExplorerAddressUrl,
} from "@/lib/contracts/config";
import { PARKLY_ABI } from "@/lib/contracts/abi";
import { ParkingSpace, Reservation } from "@/lib/types";
import { Header } from "@/components/Header";
import { DashboardStats } from "@/components/DashboardStats";
import { ExploreSpaces } from "@/components/ExploreSpaces";
import { AddSpaceSection } from "@/components/AddSpaceSection";
import { ReservationModal } from "@/components/ReservationModal";
import { MySpaces } from "@/components/MySpaces";
import { MyReservations } from "@/components/MyReservations";
import { useToast } from "@/app/providers";
import {
  Sparkles,
  RefreshCw,
  ShieldCheck,
  ExternalLink,
  Car,
  Copy,
  Check,
  Globe,
  Layers,
  ArrowUpRight,
} from "lucide-react";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { toast } = useToast();

  const [allSpaces, setAllSpaces] = useState<ParkingSpace[]>([]);
  const [allReservations, setAllReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSpaceForReservation, setSelectedSpaceForReservation] = useState<ParkingSpace | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedContract, setCopiedContract] = useState(false);

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
        chain: botchainMainnet,
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
            // ignore individual space errors
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

  const handleCopyContract = () => {
    if (!PARKLY_CONTRACT_ADDRESS) return;
    navigator.clipboard.writeText(PARKLY_CONTRACT_ADDRESS);
    setCopiedContract(true);
    toast("Contract address copied!", "info");
    setTimeout(() => setCopiedContract(false), 2000);
  };

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
        {/* Hero Section */}
        <div className="relative mb-8 p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-charcoal-900 via-charcoal-850 to-charcoal-900 border border-charcoal-750 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="max-w-2xl">
                {/* Network & Ecosystem Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                    <div className="w-4 h-4 rounded overflow-hidden relative shrink-0">
                      <Image
                        src="/botchain-logo.png"
                        alt="BOT Chain"
                        width={16}
                        height={16}
                        className="object-cover"
                      />
                    </div>
                    <span>BOT Chain Mainnet (Chain ID: 677)</span>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-charcoal-800 border border-charcoal-700 text-gray-300 text-xs font-mono">
                    Native Token: BOT
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white font-sans leading-tight">
                  Decentralized Parking Management & Instant Reservations
                </h1>
                <p className="text-sm sm:text-base text-gray-400 mt-2">
                  List and monetize your private parking spaces or reserve available spots with transparent, on-chain smart contract automation.
                </p>
              </div>

              {/* Action Buttons */}
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

            {/* Front Ecosystem Quick Links & Verified Mainnet Contract Address Bar */}
            <div className="pt-4 border-t border-charcoal-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Mainnet Contract Pill */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-400 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Mainnet Contract:
                </span>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-charcoal-950/70 border border-charcoal-750">
                  <a
                    href={getExplorerAddressUrl(PARKLY_CONTRACT_ADDRESS)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono text-emerald-300 hover:text-white transition flex items-center gap-1"
                    title="View verified contract on BotchainScan"
                  >
                    <span>{PARKLY_CONTRACT_ADDRESS}</span>
                    <ExternalLink className="w-3 h-3 text-gray-500 ml-0.5" />
                  </a>
                  <button
                    onClick={handleCopyContract}
                    className="p-1 hover:text-white text-gray-400 transition cursor-pointer"
                    title="Copy Contract Address"
                  >
                    {copiedContract ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Links to Botchain Website & Explorer */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <a
                  href="https://botchain.ai"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 border border-charcoal-700 text-xs font-medium text-gray-200 hover:text-white transition"
                >
                  <div className="w-3.5 h-3.5 rounded overflow-hidden relative shrink-0">
                    <Image
                      src="/botchain-logo.png"
                      alt="BOT Chain"
                      width={14}
                      height={14}
                      className="object-cover"
                    />
                  </div>
                  <span>BOT Chain Website</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-gray-400" />
                </a>

                <a
                  href="https://scan.botchain.ai"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 border border-charcoal-700 text-xs font-medium text-emerald-300 hover:text-emerald-200 transition"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>BOT Chain Explorer</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-gray-400" />
                </a>
              </div>
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

        {/* Dedicated BOT Chain Ecosystem Section */}
        <section className="mt-14 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-charcoal-900 via-charcoal-850 to-charcoal-900 border border-charcoal-800 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-charcoal-950 border border-emerald-500/40 p-2 shrink-0 flex items-center justify-center shadow-glowGreen/20">
                <Image
                  src="/botchain-logo.png"
                  alt="BOT Chain Logo"
                  width={40}
                  height={40}
                  className="rounded object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">BOT Chain Ecosystem</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold uppercase tracking-wider">
                    Mainnet Live
                  </span>
                </div>
                <p className="text-xs text-gray-400 max-w-xl mt-1">
                  Parkly is deployed natively on BOT Chain (Chain ID: 677). Experience ultra-fast EVM transactions, sub-second finality, and micro-fees denominated in BOT.
                </p>
              </div>
            </div>

            {/* Official Links Buttons */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <a
                href="https://botchain.ai"
                target="_blank"
                rel="noreferrer"
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 border border-charcoal-700 text-xs font-semibold text-gray-200 hover:text-white transition"
              >
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>BOT Chain Website</span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
              </a>

              <a
                href="https://scan.botchain.ai"
                target="_blank"
                rel="noreferrer"
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-semibold text-emerald-300 hover:text-white transition"
              >
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>BOT Chain Explorer</span>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <ReservationModal
        space={selectedSpaceForReservation}
        isOpen={!!selectedSpaceForReservation}
        onClose={() => setSelectedSpaceForReservation(null)}
        onReservationSuccess={loadContractData}
        existingSpaceReservations={selectedSpaceReservations}
      />

      {/* Footer */}
      <footer className="border-t border-charcoal-800 bg-charcoal-950 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-gray-400">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-charcoal-900 border border-charcoal-750 p-1 flex items-center justify-center">
              <Image
                src="/botchain-logo.png"
                alt="BOT Chain Logo"
                width={22}
                height={22}
                className="rounded object-contain"
              />
            </div>
            <div>
              <p className="font-bold text-gray-200">
                Parkly &bull; Built on BOT Chain
              </p>
              <p className="text-[11px] text-gray-500">
                Decentralized Parking Infrastructure &bull; Chain ID: 677
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <a
              href="https://botchain.ai"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition flex items-center gap-1"
            >
              <span>BOT Chain Website</span>
              <ExternalLink className="w-3 h-3 text-gray-500" />
            </a>

            <a
              href="https://scan.botchain.ai"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition flex items-center gap-1 text-emerald-400"
            >
              <span>BOT Chain Explorer</span>
              <ExternalLink className="w-3 h-3 text-emerald-500" />
            </a>

            <a
              href={getExplorerAddressUrl(PARKLY_CONTRACT_ADDRESS)}
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition flex items-center gap-1 font-mono text-gray-400"
            >
              <span>Contract: {PARKLY_CONTRACT_ADDRESS.slice(0, 6)}...{PARKLY_CONTRACT_ADDRESS.slice(-4)}</span>
              <ExternalLink className="w-3 h-3 text-gray-500" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
