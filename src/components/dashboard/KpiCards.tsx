'use client';

import React from 'react';
import { Calendar, TrendingUp, Users, Award } from 'lucide-react';

interface KpiCardsProps {
  kpis: {
    today: number;
    week: number;
    month: number;
    total: number;
  };
}

export function KpiCards({ kpis }: KpiCardsProps) {
  const cards = [
    {
      title: 'Registros Hoy',
      value: kpis.today,
      subtext: 'Leads captados hoy',
      icon: Calendar,
      color: 'from-blue-500 to-cyan-500',
      badge: '+Hoy',
    },
    {
      title: 'Esta Semana',
      value: kpis.week,
      subtext: 'Últimos 7 días',
      icon: TrendingUp,
      color: 'from-indigo-500 to-purple-500',
      badge: 'Semana',
    },
    {
      title: 'Este Mes',
      value: kpis.month,
      subtext: 'Mes en curso',
      icon: Users,
      color: 'from-amber-500 to-orange-500',
      badge: 'Mes',
    },
    {
      title: 'Total Acumulado',
      value: kpis.total,
      subtext: 'Histórico de inscripciones',
      icon: Award,
      color: 'from-emerald-500 to-teal-500',
      badge: 'Total',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {card.title}
              </span>
              <div
                className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${card.color} text-white flex items-center justify-center shadow-md`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {card.value}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {card.badge}
              </span>
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
              {card.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
}
