import { FileStack, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContentModeSelectorProps {
  mode: 'existing' | 'custom' | null;
  onModeChange: (mode: 'existing' | 'custom') => void;
}

export function ContentModeSelector({ mode, onModeChange }: ContentModeSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        How would you like to add content to this program?
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Choose Existing Courses Option */}
        <button
          type="button"
          onClick={() => onModeChange('existing')}
          className={cn(
            'relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200',
            'hover:border-primary/50 hover:bg-muted/30',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            'min-h-[180px]',
            mode === 'existing'
              ? 'border-primary bg-primary/5 shadow-sm'
              : 'border-border bg-background'
          )}
        >
          <div
            className={cn(
              'w-14 h-14 rounded-full flex items-center justify-center transition-colors',
              mode === 'existing'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            )}
          >
            <FileStack className="w-7 h-7" />
          </div>
          <div className="text-center space-y-1.5">
            <h3 className="font-semibold text-foreground">Choose Existing Courses</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Select pre-configured courses shared by Super Admin
            </p>
          </div>
          {mode === 'existing' && (
            <div className="absolute top-3 right-3">
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-primary-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          )}
        </button>

        {/* Create Custom Course Option */}
        <button
          type="button"
          onClick={() => onModeChange('custom')}
          className={cn(
            'relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200',
            'hover:border-primary/50 hover:bg-muted/30',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            'min-h-[180px]',
            mode === 'custom'
              ? 'border-primary bg-primary/5 shadow-sm'
              : 'border-border bg-background'
          )}
        >
          <div
            className={cn(
              'w-14 h-14 rounded-full flex items-center justify-center transition-colors',
              mode === 'custom'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            )}
          >
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="text-center space-y-1.5">
            <h3 className="font-semibold text-foreground">Create Custom Course</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Build your own course by selecting subjects, chapters and topics
            </p>
          </div>
          {mode === 'custom' && (
            <div className="absolute top-3 right-3">
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-primary-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
