import React from 'react';
import { AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface CLRDisclaimerBannerProps {
  variant?: 'default' | 'compact';
}

export const CLRDisclaimerBanner: React.FC<CLRDisclaimerBannerProps> = ({ 
  variant = 'default' 
}) => {
  if (variant === 'compact') {
    return (
      <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <p>
          This signal reflects early classroom learning response and should be used for 
          academic discussion only. All decisions remain human, offline, and academic.
        </p>
      </div>
    );
  }

  return (
    <Alert variant="default" className="bg-muted/30 border-muted">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="text-sm font-medium">Important Note</AlertTitle>
      <AlertDescription className="text-xs text-muted-foreground space-y-1">
        <p>
          This Classroom Learning Response report is an early academic signal system. 
          It is designed to help detect learning patterns and highlight classrooms that 
          may need academic attention.
        </p>
        <p className="font-medium">
          This is NOT a teacher evaluation system. All decisions remain human, offline, 
          and academic.
        </p>
      </AlertDescription>
    </Alert>
  );
};
