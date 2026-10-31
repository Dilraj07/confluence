'use client';

import React, { useState } from 'react';
import { Space } from '@/types';
import {
  Settings,
  RefreshCw,
  Shield,
  Layers,
  Database,
  CheckCircle2,
  Users
} from 'lucide-react';

interface SettingsViewProps {
  spaces: Space[];
  onResetSeed: () => void;
  isSeeding: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  spaces,
  onResetSeed,
  isSeeding
}) => {
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = async () => {
    await onResetSeed();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      {/* Title */}
      <div>
        <h2 className="font-serif text-3xl font-normal text-[#1c1b1a]">
          Workspace Settings & Administration
        </h2>
        <p className="text-xs text-[#7b776f] mt-0.5 font-light">
          Manage organization tenant settings, Space sensitivities, and database seed scenarios.
        </p>
      </div>

      {/* Organization Details */}
      <div className="card-oura p-6 bg-white border border-[#e1dcd3] space-y-4 shadow-xs">
        <h3 className="font-serif text-lg font-normal text-[#1c1b1a] border-b border-[#e1dcd3] pb-2">
          Organization Profile
        </h3>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[#838280] block text-[11px]">Organization Name</span>
            <span className="font-semibold text-[#1c1b1a]">MeridianPay Inc.</span>
          </div>
          <div>
            <span className="text-[#838280] block text-[11px]">Tenant Slug</span>
            <span className="font-mono text-[#1c1b1a]">meridianpay-prod</span>
          </div>
          <div>
            <span className="text-[#838280] block text-[11px]">Canonical Storage</span>
            <span className="text-[#1c1b1a]">PostgreSQL / SQLite WAL Mode</span>
          </div>
          <div>
            <span className="text-[#838280] block text-[11px]">Active Memory Spaces</span>
            <span className="font-semibold text-[#2a72de]">{spaces.length} Spaces</span>
          </div>
        </div>
      </div>

      {/* Spaces Directory */}
      <div className="card-oura p-6 bg-white border border-[#e1dcd3] space-y-4 shadow-xs">
        <h3 className="font-serif text-lg font-normal text-[#1c1b1a] border-b border-[#e1dcd3] pb-2">
          Space Access & Sensitivity Levels
        </h3>
        <div className="space-y-2 text-xs">
          {spaces.map((s) => (
            <div key={s.id} className="p-3 bg-[#fbfaf7] rounded-lg border border-[#e1dcd3] flex items-center justify-between">
              <div>
                <span className="font-semibold text-[#1c1b1a]">{s.name} Space</span>
                <span className="text-[#838280] text-[11px] block">{s.slug} &bull; Type: {s.space_type}</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#2a72de]">
                {s.sensitivity_level}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hackathon Demo Reset Tool */}
      <div className="card-oura p-6 bg-white border border-[#e1dcd3] space-y-3 shadow-xs">
        <h3 className="font-serif text-lg font-normal text-[#1c1b1a] border-b border-[#e1dcd3] pb-2">
          MeridianPay Dataset Reset
        </h3>
        <p className="text-xs text-[#7b776f] font-light">
          Resets the database to the official MeridianPay Smart Routing v2 evaluation scenario (Payments Platform timeout ambiguity, duplicate authorization hazard, SRE circuit breaker, Risk shadow mode gate, and Merchant Ops hold).
        </p>

        {resetSuccess && (
          <div className="p-3 text-xs bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Database successfully reset and re-seeded to MeridianPay baseline!</span>
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={handleReset}
            disabled={isSeeding}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-[#1c1b1a] text-white hover:bg-[#39221e] disabled:opacity-50 transition-all shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin text-[#2a72de]' : ''}`} />
            <span>{isSeeding ? 'Resetting Demo Database...' : 'Re-Seed MeridianPay Dataset'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

