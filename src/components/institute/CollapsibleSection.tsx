import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface CollapsibleSectionProps {
  title: string;
  description?: string;
  whatThisShows?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export function CollapsibleSection({
  title,
  description,
  whatThisShows,
  defaultOpen = true,
  children,
  className,
  headerAction,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CollapsibleTrigger asChild>
                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity text-left">
                  <CardTitle className="text-lg">{title}</CardTitle>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </CollapsibleTrigger>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
            {headerAction}
          </div>
          
          {whatThisShows && isOpen && (
            <div className="flex items-start gap-2 mt-3 p-3 bg-muted/50 rounded-lg">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">{whatThisShows}</p>
            </div>
          )}
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="pt-0">{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
