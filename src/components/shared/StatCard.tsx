
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'primary' | 'success' | 'warning' | 'info' | 'gold';
  className?: string;
}

const variantStyles = {
  primary: {
    icon: 'gradient-primary',
    border: 'border-t-primary'
  },
  success: {
    icon: 'bg-success',
    border: 'border-t-success'
  },
  warning: {
    icon: 'bg-warning',
    border: 'border-t-warning'
  },
  info: {
    icon: 'bg-info',
    border: 'border-t-info'
  },
  gold: {
    icon: 'gradient-gold',
    border: 'border-t-secondary'
  }
};

export const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  variant = 'primary',
  className 
}: StatCardProps) => {
  const styles = variantStyles[variant];
  
  return (
    <div className={cn(
      "sea-card p-6 border-t-4",
      styles.border,
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <span className="dashboard-stat-label">{title}</span>
          <span className="dashboard-stat-value">{value}</span>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium",
              trend.isPositive ? "text-success" : "text-destructive"
            )}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md",
          styles.icon
        )}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
