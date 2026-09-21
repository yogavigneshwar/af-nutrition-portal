import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon | React.ReactNode;
  iconColor?: string;
  bgColor?: string;
  color?: 'emerald' | 'gold' | 'amber' | 'purple' | 'rose';
  trend?: {
    value: string;
    isPositive: boolean;
  };
  badge?: {
    text: string;
    variant?: 'success' | 'warning' | 'danger' | 'info' | 'gold';
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconColor,
  bgColor,
  color = 'emerald',
  trend,
  badge,
  onClick,
}) => {
  // Determine color scheme
  const getColorClasses = () => {
    if (color === 'gold') {
      return {
        bg: 'bg-gold-50 border border-gold-200/80',
        iconTxt: 'text-gold-700',
        badgeBg: 'bg-gold-100 text-gold-900 border-gold-300',
      };
    }
    if (color === 'amber') {
      return {
        bg: 'bg-amber-50 border border-amber-200/80',
        iconTxt: 'text-amber-700',
        badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      };
    }
    if (color === 'purple') {
      return {
        bg: 'bg-purple-50 border border-purple-200/80',
        iconTxt: 'text-purple-700',
        badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
      };
    }
    if (color === 'rose') {
      return {
        bg: 'bg-rose-50 border border-rose-200/80',
        iconTxt: 'text-rose-700',
        badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
      };
    }
    return {
      bg: 'bg-emerald-50 border border-emerald-200/80',
      iconTxt: 'text-emerald-700',
      badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    };
  };

  const scheme = getColorClasses();
  const finalBg = bgColor || scheme.bg;
  const finalIconColor = iconColor || scheme.iconTxt;

  // Render icon whether it's a Component or JSX Element
  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    const IconComponent = icon as LucideIcon;
    return <IconComponent className="w-5 h-5" />;
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-3xl p-5 border border-emerald-100/90 shadow-sm hover:shadow-md hover:border-gold-300 transition-all duration-200 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800/80 truncate">{title}</p>
            {badge && (
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border shadow-2xs ${scheme.badgeBg}`}>
                {badge.text}
              </span>
            )}
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1 font-medium truncate">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-2xl ${finalBg} ${finalIconColor} flex items-center justify-center shrink-0 shadow-sm`}>
          {renderIcon()}
        </div>
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold">
          <span className={trend.isPositive ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
          <span className="text-slate-400 ml-1.5 font-normal">vs previous period</span>
        </div>
      )}
    </div>
  );
};
