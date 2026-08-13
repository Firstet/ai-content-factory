'use client';

import { Shell } from '@/components/layout/Shell';
import { CreditCard, CheckCircle2, Zap } from 'lucide-react';

export default function BillingAdminPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            Billing & Usage Infrastructure
          </h1>
          <p className="text-xs text-slate-400 mt-1">Multi-tenant SaaS subscription ready with Stripe / Paddle hooks.</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase">
                Self-Hosted Unlimited License
              </span>
              <h2 className="text-lg font-bold text-white mt-2">Unlimited Enterprise Tier</h2>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-white">$0</span>
              <span className="text-xs text-slate-400"> / month (Self-Hosted)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Zap className="w-4 h-4 text-amber-400" /> AI Provider API Token Quota
              </div>
              <p className="text-xl font-bold text-white">Unlimited</p>
              <p className="text-[11px] text-slate-500">Pay-as-you-go per provider key</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Concurrent Video Renders
              </div>
              <p className="text-xl font-bold text-white">4 Worker Threads</p>
              <p className="text-[11px] text-slate-500">Scale via docker-compose</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <CreditCard className="w-4 h-4 text-indigo-400" /> Stripe Webhooks Status
              </div>
              <p className="text-xl font-bold text-indigo-400">Ready for Integration</p>
              <p className="text-[11px] text-slate-500">Tenant quota hooks enabled</p>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
