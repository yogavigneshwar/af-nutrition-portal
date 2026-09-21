import React from 'react';

export type BadgeVariant = 
  | 'green' 
  | 'gold' 
  | 'emerald' 
  | 'mint' 
  | 'amber' 
  | 'blue' 
  | 'purple' 
  | 'red' 
  | 'gray'
  | 'warning' 
  | 'success' 
  | 'danger' 
  | 'info' 
  | 'brand' 
  | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'green', size = 'sm' }) => {
  const styles: Record<BadgeVariant, string> = {
    green: 'bg-brand-50 text-brand-800 border-brand-200',
    brand: 'bg-brand-50 text-brand-800 border-brand-200',
    emerald: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold',
    success: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold',
    gold: 'bg-gold-50 text-gold-900 border-gold-300 font-bold shadow-sm',
    mint: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    blue: 'bg-sky-50 text-sky-800 border-sky-200',
    info: 'bg-sky-50 text-sky-800 border-sky-200',
    purple: 'bg-purple-50 text-purple-800 border-purple-200',
    red: 'bg-rose-50 text-rose-800 border-rose-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-200',
    gray: 'bg-slate-100 text-slate-700 border-slate-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 font-bold',
    md: 'text-xs px-3 py-1 font-bold',
  };

  const chosenStyle = styles[variant] || styles.green;

  return (
    <span className={`inline-flex items-center rounded-full border shadow-2xs ${chosenStyle} ${sizeStyles[size]}`}>
      {children}
    </span>
  );
};
