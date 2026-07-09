import React from 'react';
import { Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

/**
 * DevNote — UI-only, non-production helper.
 *
 * Renders a small dashed-ring info icon that opens a popover with developer
 * context (why a feature behaves the way it does, how draft/publish gating
 * works, etc.). Guarded by `import.meta.env.DEV` OR the
 * `VITE_SHOW_DEV_NOTES` flag; returns `null` in production so it tree-shakes
 * out of the bundle.
 */
export const DevNote: React.FC<{
  title: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, children, className }) => {
  const enabled =
    import.meta.env.DEV ||
    import.meta.env.VITE_SHOW_DEV_NOTES === 'true' ||
    import.meta.env.VITE_SHOW_DEV_NOTES === '1';

  if (!enabled) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-amber-700 rounded-full px-2 py-0.5 border border-dashed border-amber-400 bg-amber-50/70 hover:bg-amber-100 transition-colors',
            className,
          )}
          aria-label={`Developer note: ${title}`}
        >
          <Info className="h-3 w-3" />
          Dev note
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96 max-w-[90vw] text-xs leading-relaxed">
        <div className="text-[10px] uppercase tracking-wider text-amber-700 font-bold mb-1">
          Dev note · not shipped to production
        </div>
        <div className="font-semibold text-slate-900 mb-1.5">{title}</div>
        <div className="text-slate-700 space-y-2">{children}</div>
      </PopoverContent>
    </Popover>
  );
};
