'use client';

import React, { useState } from 'react';
import { Logo } from '@/components/brand/Logo';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  Lock,
  Sparkles,
  CheckCircle2,
  GitBranch,
  Calendar,
  Layers,
  LogIn,
  ShieldAlert,
  Check,
  X,
  XCircle,
  Zap,
  ArrowUpRight,
  Users
} from 'lucide-react';

interface GeneralLandingPageProps {
  onExplore: () => void;
  onLoginAsPersona?: (personaName: string) => void;
  onNavigateToView?: (view: string) => void;
}

export const GeneralLandingPage: React.FC<GeneralLandingPageProps> = ({
  onExplore,
  onLoginAsPersona,
  onNavigateToView
}) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('team.lead@enterprise.com');
  const [passwordInput, setPasswordInput] = useState('••••••••••••');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLoginAsPersona) {
      onLoginAsPersona('Maya Chen');
    }
    onExplore();
  };

  return (
    <div className="min-h-screen relative font-sans text-[#1c1b1a] overflow-x-hidden selection:bg-[#2a72de]/20">
      {/* 1. User Uploaded Background Image */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/landing-bg.jpg')` }}
      />
      {/* Glassmorphic protective gradient */}
      <div className="fixed inset-0 z-0 bg-[#faf8f5]/80 backdrop-blur-[3px] pointer-events-none" />

      {/* 2. Page Content */}
      <div className="relative z-10 flex flex-col justify-between min-h-screen">
        {/* Navigation */}
        <header className="sticky top-0 z-50 bg-[#faf8f5]/75 backdrop-blur-md border-b border-[#e5e0d8] px-6 lg:px-12 py-3.5">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={onExplore}>
              <Logo variant="full" size="md" showTagline={false} />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-4 py-1.5 rounded-lg text-xs font-medium text-stone-700 hover:text-black bg-white/80 border border-[#e1dcd3] hover:bg-white shadow-2xs transition-all"
              >
                Sign In
              </button>

              <button
                onClick={onExplore}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#1c1b1a] hover:bg-black shadow-xs transition-all group"
              >
                <span>Explore Overview</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-[#2a72de]" />
              </button>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="pt-16 pb-14 px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-5">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-[#e1dcd3] text-xs font-medium text-stone-700 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Continuous Organizational Memory</span>
            </div>

            {/* Punchy Headline */}
            <h1 className="font-serif text-4xl sm:text-6xl font-normal text-[#1c1b1a] tracking-tight leading-tight">
              Your meetings, finally connected.
            </h1>

            {/* Short Subhead */}
            <p className="text-base sm:text-lg text-stone-600 font-light max-w-xl mx-auto leading-relaxed">
              Stop losing critical decisions between rooms. Confluence connects isolated discussions into an evolving, verifiable truth graph.
            </p>

            {/* Primary Action Button */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={onExplore}
                className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold bg-[#1c1b1a] text-white hover:bg-black transition-all shadow-md group"
              >
                <Compass className="w-4 h-4 text-[#2a72de]" />
                <span>Launch Overview</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-5 py-3 rounded-xl text-sm font-medium bg-white/90 border border-stone-300 text-stone-800 hover:bg-white shadow-2xs transition-all"
              >
                Corporate SSO
              </button>
            </div>
          </div>
        </section>

        {/* Visual Comparison: The Problem vs The Solution */}
        <section className="py-8 px-6 max-w-5xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* The Old Way: Isolated Silos */}
            <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-xs border border-red-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600">
                <XCircle className="w-4 h-4" />
                <span>Without Confluence &bull; Fragmented Silos</span>
              </div>

              <div className="space-y-3 text-xs text-stone-600">
                <div className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold mt-0.5">&times;</span>
                  <span><strong>Isolated Meetings</strong>: Decisions made in one room stay unknown to other teams.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold mt-0.5">&times;</span>
                  <span><strong>Vanishing Context</strong>: Notes get lost in Slack threads and docs nobody re-opens.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold mt-0.5">&times;</span>
                  <span><strong>Conflicting Assumptions</strong>: Teams deploy on outdated agreements, causing launch delays.</span>
                </div>
              </div>
            </div>

            {/* The Confluence Way: Unified Graph */}
            <div className="p-6 rounded-2xl bg-white/90 backdrop-blur-xs border border-emerald-300 shadow-xs space-y-4 ring-1 ring-emerald-500/10">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                <span>With Confluence &bull; Connected Truth</span>
              </div>

              <div className="space-y-3 text-xs text-stone-700">
                <div className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Cross-Meeting Synthesis</strong>: Automatically links discussions across weeks into one timeline.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Verifiable Lineage</strong>: Every technical decision cites the exact speaker turn.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Launch Gate Consensus</strong>: Enforces multi-team sign-offs before shipping to production.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Better Than Others: Visual Battlecard */}
        <section className="py-10 px-6 max-w-5xl mx-auto w-full space-y-5">
          <div className="text-center space-y-1">
            <h2 className="font-serif text-2xl font-normal text-[#1c1b1a]">
              Why Confluence Beats Traditional AI Recappers
            </h2>
            <p className="text-xs text-stone-500">
              Traditional tools summarize single meetings. Confluence builds an organizational memory.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="p-4 rounded-xl bg-white/85 border border-[#e1dcd3] shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Memory Span</span>
              <div className="text-xs font-bold text-[#1c1b1a]">Multi-Week Synthesis</div>
              <p className="text-[11px] text-stone-500">Not just 1 meeting</p>
            </div>

            <div className="p-4 rounded-xl bg-white/85 border border-[#e1dcd3] shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Hallucinations</span>
              <div className="text-xs font-bold text-emerald-700">0% Fabrications</div>
              <p className="text-[11px] text-stone-500">Grounded in verbatim turns</p>
            </div>

            <div className="p-4 rounded-xl bg-white/85 border border-[#e1dcd3] shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Decision Tracking</span>
              <div className="text-xs font-bold text-[#1c1b1a]">Evolution Graph</div>
              <p className="text-[11px] text-stone-500">Supersedes outdated rules</p>
            </div>

            <div className="p-4 rounded-xl bg-white/85 border border-[#e1dcd3] shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Governance</span>
              <div className="text-xs font-bold text-[#2a72de]">Multi-Team Gates</div>
              <p className="text-[11px] text-stone-500">Unanimous sign-off checks</p>
            </div>
          </div>
        </section>

        {/* 4 Core Features Grid (Concise & Clickable) */}
        <section className="py-8 px-6 max-w-5xl mx-auto w-full space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200/60 pb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
              Core Capabilities
            </span>
            <button
              onClick={onExplore}
              className="text-xs text-[#2a72de] hover:underline font-semibold flex items-center gap-1"
            >
              <span>Explore All Features</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Card 1 */}
            <div
              onClick={onExplore}
              className="p-4 rounded-xl bg-white/90 border border-[#e1dcd3] hover:border-[#2a72de] cursor-pointer transition-all space-y-2 group shadow-2xs"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2a72de] flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-sm font-semibold text-[#1c1b1a] group-hover:text-[#2a72de]">
                Executive Overview
              </h3>
              <p className="text-[11px] text-stone-500 leading-snug">
                Prioritized attention, active launch blockers, and live Copilot chatbot.
              </p>
            </div>

            {/* Card 2 */}
            <div
              onClick={onExplore}
              className="p-4 rounded-xl bg-white/90 border border-[#e1dcd3] hover:border-emerald-500 cursor-pointer transition-all space-y-2 group shadow-2xs"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <GitBranch className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-sm font-semibold text-[#1c1b1a] group-hover:text-emerald-700">
                Decision Lineage
              </h3>
              <p className="text-[11px] text-stone-500 leading-snug">
                Verifiable graphs tracking revisions, dependencies, and supersessions.
              </p>
            </div>

            {/* Card 3 */}
            <div
              onClick={onExplore}
              className="p-4 rounded-xl bg-white/90 border border-[#e1dcd3] hover:border-purple-500 cursor-pointer transition-all space-y-2 group shadow-2xs"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-sm font-semibold text-[#1c1b1a] group-hover:text-purple-700">
                Dual-Month Calendar
              </h3>
              <p className="text-[11px] text-stone-500 leading-snug">
                Browse discussions across months with turn-by-turn evidence citations.
              </p>
            </div>

            {/* Card 4 */}
            <div
              onClick={onExplore}
              className="p-4 rounded-xl bg-white/90 border border-[#e1dcd3] hover:border-amber-500 cursor-pointer transition-all space-y-2 group shadow-2xs"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-sm font-semibold text-[#1c1b1a] group-hover:text-amber-700">
                Agentic Copilot
              </h3>
              <p className="text-[11px] text-stone-500 leading-snug">
                Instant conversational answers with inline LaTeX math and voice input.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="py-12 px-6 text-center">
          <div className="max-w-xl mx-auto space-y-3">
            <h3 className="font-serif text-2xl font-normal text-[#1c1b1a]">
              Ready to eliminate alignment drift?
            </h3>
            <button
              onClick={onExplore}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold bg-[#1c1b1a] text-white hover:bg-black transition-all shadow-sm group"
            >
              <span>Click to Enter Workspace Overview</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-[#2a72de]" />
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#e5e0d8] bg-[#faf8f5]/80 py-4 px-6 text-center text-[11px] text-stone-500">
          CONFLUENCE &bull; The Autonomous Organizational Memory Network &bull;{' '}
          <button onClick={onExplore} className="text-[#2a72de] font-semibold hover:underline">
            Explore Workspace
          </button>
        </footer>
      </div>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-[#e1dcd3] max-w-sm w-full p-6 shadow-xl space-y-4 relative">
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute right-4 top-4 text-stone-400 hover:text-stone-700"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <Logo variant="icon" size="xs" />
              <h3 className="font-serif text-lg font-normal text-[#1c1b1a] mt-1">
                Corporate SSO Login
              </h3>
              <p className="text-xs text-stone-500">Sign in to open your workspace.</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3 pt-1">
              <div>
                <label className="text-[11px] font-medium text-stone-700 block mb-0.5">
                  Email
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-[#e1dcd3] bg-[#fcfbf9] focus:outline-none focus:ring-1 focus:ring-[#2a72de]"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-stone-700 block mb-0.5">
                  Password
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-[#e1dcd3] bg-[#fcfbf9] focus:outline-none focus:ring-1 focus:ring-[#2a72de]"
                  required
                />
              </div>

              <div className="pt-1 space-y-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg text-xs font-semibold bg-[#1c1b1a] text-white hover:bg-black transition-all shadow-xs"
                >
                  Sign In &amp; Open Overview
                </button>

                <button
                  type="button"
                  onClick={onExplore}
                  className="w-full py-2 rounded-lg text-xs font-medium text-stone-600 hover:text-[#1c1b1a] bg-stone-100 transition-colors"
                >
                  Skip &bull; Explore Demo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
