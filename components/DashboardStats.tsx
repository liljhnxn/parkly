"use client";

import React from "react";
import { Car, CheckCircle2, Clock, CalendarCheck } from "lucide-react";

interface DashboardStatsProps {
  totalSpaces: number;
  availableSpaces: number;
  activeReservations: number;
  myReservationsCount: number;
  isLoading?: boolean;
}

export function DashboardStats({
  totalSpaces,
  availableSpaces,
  activeReservations,
  myReservationsCount,
  isLoading,
}: DashboardStatsProps) {
  const stats = [
    {
      title: "Total Parking Spaces",
      value: totalSpaces,
      icon: Car,
      color: "text-emerald-400",
      bgGradient: "from-emerald-500/10 to-transparent",
      borderColor: "border-emerald-500/20",
      description: "Listed across network",
    },
    {
      title: "Available Spaces",
      value: availableSpaces,
      icon: CheckCircle2,
      color: "text-teal-400",
      bgGradient: "from-teal-500/10 to-transparent",
      borderColor: "border-teal-500/20",
      description: "Ready for reservation",
    },
    {
      title: "Active Reservations",
      value: activeReservations,
      icon: Clock,
      color: "text-purple-400",
      bgGradient: "from-purple-500/10 to-transparent",
      borderColor: "border-purple-500/20",
      description: "On-chain ongoing & upcoming",
    },
    {
      title: "My Reservations",
      value: myReservationsCount,
      icon: CalendarCheck,
      color: "text-violet-400",
      bgGradient: "from-violet-500/10 to-transparent",
      borderColor: "border-violet-500/20",
      description: "Reserved with your wallet",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((item, idx) => {
        const IconComponent = item.icon;
        return (
          <div
            key={idx}
            className={`p-5 rounded-2xl bg-charcoal-900 border ${item.borderColor} bg-gradient-to-br ${item.bgGradient} relative overflow-hidden transition-all duration-300 hover:scale-[1.01]`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">
                {item.title}
              </span>
              <div className={`p-2 rounded-xl bg-charcoal-800/80 border border-white/5 ${item.color}`}>
                <IconComponent className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
                {isLoading ? "..." : item.value}
              </span>
            </div>

            <p className="text-[11px] text-gray-500 mt-1">{item.description}</p>
          </div>
        );
      })}
    </div>
  );
}

