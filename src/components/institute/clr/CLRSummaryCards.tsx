import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CLRSummary } from '@/types/clrReport';
import { CheckCircle2, AlertTriangle, AlertCircle, Clock } from 'lucide-react';

interface CLRSummaryCardsProps {
  summary: CLRSummary;
}

export const CLRSummaryCards: React.FC<CLRSummaryCardsProps> = ({ summary }) => {
  const cards = [
    {
      label: 'Healthy',
      value: summary.healthy,
      icon: CheckCircle2,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      iconColor: 'text-green-600'
    },
    {
      label: 'Needs Attention',
      value: summary.needsAttention,
      icon: AlertTriangle,
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-700',
      iconColor: 'text-amber-600'
    },
    {
      label: 'Immediate Review',
      value: summary.immediateReview,
      icon: AlertCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      iconColor: 'text-red-600'
    },
    {
      label: 'Not Eligible',
      value: summary.notEligible,
      icon: Clock,
      bgColor: 'bg-muted',
      borderColor: 'border-border',
      textColor: 'text-muted-foreground',
      iconColor: 'text-muted-foreground'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card 
          key={card.label} 
          className={`${card.bgColor} ${card.borderColor} border`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${card.textColor}`}>
                  {card.label}
                </p>
                <p className={`text-3xl font-bold ${card.textColor} mt-1`}>
                  {card.value}
                </p>
              </div>
              <card.icon className={`h-8 w-8 ${card.iconColor}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
