import React from 'react';
import { cn } from '@/lib/utils';

interface BrochureSlideProps {
  children: React.ReactNode;
  className?: string;
  backgroundVariant?: 'dark' | 'gradient' | 'pattern';
}

export function BrochureSlide({ 
  children, 
  className,
  backgroundVariant = 'dark' 
}: BrochureSlideProps) {
  const bgClasses = {
    dark: 'bg-[#0f1419]',
    gradient: 'bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#0f1419]',
    pattern: 'bg-[#0f1419] bg-[radial-gradient(circle_at_20%_80%,rgba(255,107,74,0.08)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(255,107,74,0.05)_0%,transparent_50%)]'
  };

  return (
    <div 
      className={cn(
        'w-full aspect-[297/210] min-h-[500px] p-8 md:p-12 lg:p-16 relative overflow-hidden',
        bgClasses[backgroundVariant],
        className
      )}
    >
      {children}
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({ icon, title, description, className }: FeatureCardProps) {
  return (
    <div className={cn(
      'bg-[#1a1f2e]/80 rounded-2xl p-5 border border-[#2a3041] hover:border-[#ff6b4a]/30 transition-all duration-300',
      className
    )}>
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff6b4a] to-[#ff8a6a] flex items-center justify-center mb-3 text-white">
        {icon}
      </div>
      <h4 className="text-white font-semibold text-sm mb-1">{title}</h4>
      <p className="text-[#8b95a8] text-xs leading-relaxed">{description}</p>
    </div>
  );
}

interface StatCardProps {
  value: string;
  label: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ value, label, icon, className }: StatCardProps) {
  return (
    <div className={cn(
      'bg-[#1a1f2e]/60 rounded-xl p-4 border border-[#2a3041] text-center',
      className
    )}>
      {icon && (
        <div className="w-8 h-8 rounded-lg bg-[#ff6b4a]/10 flex items-center justify-center mx-auto mb-2 text-[#ff6b4a]">
          {icon}
        </div>
      )}
      <div className="text-2xl font-bold text-[#ff6b4a]">{value}</div>
      <div className="text-[#8b95a8] text-xs mt-1">{label}</div>
    </div>
  );
}

interface BulletPointProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function BulletPoint({ children, icon }: BulletPointProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-5 h-5 rounded-full bg-[#ff6b4a]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
        {icon || <div className="w-2 h-2 rounded-full bg-[#ff6b4a]" />}
      </div>
      <span className="text-[#c8d0e0] text-sm leading-relaxed">{children}</span>
    </div>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline';
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span className={cn(
      'px-3 py-1 rounded-full text-xs font-medium',
      variant === 'default' 
        ? 'bg-[#ff6b4a]/10 text-[#ff6b4a] border border-[#ff6b4a]/20' 
        : 'bg-transparent text-[#8b95a8] border border-[#2a3041]'
    )}>
      {children}
    </span>
  );
}

export function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn('text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight', className)}>
      {children}
    </h2>
  );
}

export function SectionSubtitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('text-[#8b95a8] text-base md:text-lg leading-relaxed', className)}>
      {children}
    </p>
  );
}

export function Highlight({ children }: { children: React.ReactNode }) {
  return <span className="text-[#ff6b4a]">{children}</span>;
}
