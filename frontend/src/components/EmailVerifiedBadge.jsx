import React from 'react';
import { Shield } from 'lucide-react';

export default function EmailVerifiedBadge({ className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full cursor-help select-none ${className}`}
      title="This person has confirmed they own this email address."
    >
      <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
      <span>Email verified</span>
    </span>
  );
}
