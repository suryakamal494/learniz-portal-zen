import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CLRReport, CLRSignal } from '@/types/clrReport';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Target,
  Users
} from 'lucide-react';
import { CLRDisclaimerBanner } from './CLRDisclaimerBanner';

interface CLRDetailModalProps {
  report: CLRReport | null;
  open: boolean;
  onClose: () => void;
}

const getSignalConfig = (signal: CLRSignal) => {
  switch (signal) {
    case 'healthy':
      return {
        label: 'Healthy',
        icon: CheckCircle2,
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-200'
      };
    case 'needs-attention':
      return {
        label: 'Needs Attention',
        icon: AlertTriangle,
        bg: 'bg-amber-100',
        text: 'text-amber-700',
        border: 'border-amber-200'
      };
    case 'immediate-review':
      return {
        label: 'Immediate Review',
        icon: AlertCircle,
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-200'
      };
  }
};

export const CLRDetailModal: React.FC<CLRDetailModalProps> = ({ report, open, onClose }) => {
  if (!report) return null;

  const signalConfig = getSignalConfig(report.signal);
  const SignalIcon = signalConfig.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Classroom Learning Response Details
          </DialogTitle>
        </DialogHeader>

        {/* Classroom Info */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/5">
                {report.className}
              </Badge>
              <Badge variant="outline">
                {report.batchName}
              </Badge>
            </div>
            <Badge className={`${signalConfig.bg} ${signalConfig.text} ${signalConfig.border} border`}>
              <SignalIcon className="h-3.5 w-3.5 mr-1" />
              {signalConfig.label}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Subject</span>
              <p className="font-medium">{report.subject}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Chapter</span>
              <p className="font-medium">{report.chapter}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Teacher</span>
              <p className="font-medium">{report.teacher}</p>
            </div>
          </div>

          <Separator />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Accuracy Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">
                    {report.accuracyTrend[0]}% → {report.accuracyTrend[report.accuracyTrend.length - 1]}%
                  </span>
                  {report.isAccuracyImproving ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : report.accuracyTrend[report.accuracyTrend.length - 1] < report.accuracyTrend[0] ? (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  ) : (
                    <Minus className="h-5 w-5 text-amber-600" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {report.isAccuracyImproving ? 'Improving over sessions' : 'Not showing improvement'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Avg Engagement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{report.avgEngagement}%</span>
                  {report.avgEngagement >= 80 ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200">Healthy</Badge>
                  ) : report.avgEngagement >= 60 ? (
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200">Partial</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-700 border-red-200">Low</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on {report.sessionsCount} live assessments
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Session-by-session breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Session-by-Session Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">Session</th>
                      <th className="text-left py-2 font-medium">Date</th>
                      <th className="text-center py-2 font-medium">Correct</th>
                      <th className="text-center py-2 font-medium">Wrong</th>
                      <th className="text-center py-2 font-medium">Skipped</th>
                      <th className="text-center py-2 font-medium">Accuracy</th>
                      <th className="text-center py-2 font-medium">Engagement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.sessions.map((session) => (
                      <tr key={session.sessionId} className="border-b last:border-b-0">
                        <td className="py-2 font-medium">Session {session.sessionNumber}</td>
                        <td className="py-2 text-muted-foreground">{session.date}</td>
                        <td className="py-2 text-center text-green-600">{session.correct}</td>
                        <td className="py-2 text-center text-red-600">{session.wrong}</td>
                        <td className="py-2 text-center text-muted-foreground">{session.skipped}</td>
                        <td className="py-2 text-center">
                          <Badge 
                            variant="outline"
                            className={
                              session.accuracy >= 60 
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : session.accuracy >= 40
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-red-50 text-red-700 border-red-200'
                            }
                          >
                            {session.accuracy}%
                          </Badge>
                        </td>
                        <td className="py-2 text-center">
                          <Badge 
                            variant="outline"
                            className={
                              session.engagement >= 80 
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : session.engagement >= 60
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-red-50 text-red-700 border-red-200'
                            }
                          >
                            {session.engagement}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <CLRDisclaimerBanner variant="compact" />
        </div>
      </DialogContent>
    </Dialog>
  );
};
