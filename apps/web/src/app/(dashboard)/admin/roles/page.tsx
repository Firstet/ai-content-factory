'use client';

import { useEffect, useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { ShieldCheck, Lock } from 'lucide-react';
import { api } from '@/lib/api';

export default function RolesAdminPage() {
  const [roles, setRoles] = useState<any[]>([]);

  useEffect(() => {
    async function loadRoles() {
      try {
        const res = await api.get('/roles');
        setRoles(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadRoles();
  }, []);

  const defaultRoles = [
    { name: 'SUPER_ADMIN', desc: 'Full unrestricted system access, API keys, and configurations.', badge: 'from-purple-600 to-indigo-600' },
    { name: 'ADMIN', desc: 'Manage brands, channels, users, and video pipelines.', badge: 'from-indigo-600 to-blue-600' },
    { name: 'EDITOR', desc: 'Create content, write scripts, trigger renders and publish.', badge: 'from-cyan-600 to-teal-600' },
    { name: 'VIEWER', desc: 'Read-only access to analytics and video status.', badge: 'from-slate-600 to-slate-700' },
  ];

  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            Roles & Permissions Matrix
          </h1>
          <p className="text-xs text-slate-400 mt-1">Configure role hierarchy and resource permissions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {defaultRoles.map((role) => (
            <div key={role.name} className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-lg bg-gradient-to-r ${role.badge} text-white font-bold text-xs shadow-md`}>
                  {role.name}
                </span>
                <Lock className="w-4 h-4 text-slate-500" />
              </div>
              <p className="text-xs text-slate-300">{role.desc}</p>
              <div className="pt-2 border-t border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Access Scope</span>
                <span className="font-semibold text-indigo-400">Enforced via RBAC Guard</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
