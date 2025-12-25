import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CLRSummaryCards } from '@/components/institute/clr/CLRSummaryCards';
import { CLRReportCard } from '@/components/institute/clr/CLRReportCard';
import { CLRDetailModal } from '@/components/institute/clr/CLRDetailModal';
import { CLRDisclaimerBanner } from '@/components/institute/clr/CLRDisclaimerBanner';
import { CLRReport } from '@/types/clrReport';
import {
  mockCLRReports,
  calculateCLRSummary,
  getReportsBySignal,
  getNotEligibleReports,
  filterCLRReports,
  getUniqueClasses,
  getUniqueSubjects
} from '@/data/mockCLRData';
import { 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  ChevronDown,
  ChevronUp,
  Activity,
  Filter
} from 'lucide-react';

const LearningResponsePage: React.FC = () => {
  const [classFilter, setClassFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<CLRReport | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Section collapse states
  const [isImmediateReviewOpen, setIsImmediateReviewOpen] = useState(true);
  const [isNeedsAttentionOpen, setIsNeedsAttentionOpen] = useState(true);
  const [isHealthyOpen, setIsHealthyOpen] = useState(false);
  const [isNotEligibleOpen, setIsNotEligibleOpen] = useState(false);

  // Get unique filter options
  const uniqueClasses = useMemo(() => getUniqueClasses(mockCLRReports), []);
  const uniqueSubjects = useMemo(() => getUniqueSubjects(mockCLRReports), []);

  // Filter reports
  const filteredReports = useMemo(() => 
    filterCLRReports(mockCLRReports, classFilter, subjectFilter),
    [classFilter, subjectFilter]
  );

  // Calculate summary and categorize reports
  const summary = useMemo(() => calculateCLRSummary(filteredReports), [filteredReports]);
  const immediateReviewReports = useMemo(() => 
    getReportsBySignal(filteredReports, 'immediate-review'), [filteredReports]);
  const needsAttentionReports = useMemo(() => 
    getReportsBySignal(filteredReports, 'needs-attention'), [filteredReports]);
  const healthyReports = useMemo(() => 
    getReportsBySignal(filteredReports, 'healthy'), [filteredReports]);
  const notEligibleReports = useMemo(() => 
    getNotEligibleReports(filteredReports), [filteredReports]);

  const handleViewDetails = (report: CLRReport) => {
    setSelectedReport(report);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedReport(null);
  };

  const clearFilters = () => {
    setClassFilter('all');
    setSubjectFilter('all');
  };

  const hasActiveFilters = classFilter !== 'all' || subjectFilter !== 'all';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Learning Response</h1>
          </div>
          <p className="text-muted-foreground">
            Early academic signal based on live classroom assessments
          </p>
        </div>

        {/* Disclaimer Banner */}
        <CLRDisclaimerBanner />

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span>Filters:</span>
              </div>
              <div className="flex flex-wrap gap-3">
                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {uniqueClasses.map(cls => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {uniqueSubjects.map(subj => (
                      <SelectItem key={subj} value={subj}>{subj}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <CLRSummaryCards summary={summary} />

        {/* Immediate Review Section */}
        {immediateReviewReports.length > 0 && (
          <Collapsible open={isImmediateReviewOpen} onOpenChange={setIsImmediateReviewOpen}>
            <Card className="border-red-200 bg-red-50/30">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-red-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <CardTitle className="text-red-700">
                        Immediate Review Suggested
                      </CardTitle>
                      <Badge className="bg-red-100 text-red-700 border-red-200">
                        {immediateReviewReports.length}
                      </Badge>
                    </div>
                    {isImmediateReviewOpen ? (
                      <ChevronUp className="h-5 w-5 text-red-600" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {immediateReviewReports.map(report => (
                      <CLRReportCard 
                        key={report.id} 
                        report={report} 
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Needs Attention Section */}
        {needsAttentionReports.length > 0 && (
          <Collapsible open={isNeedsAttentionOpen} onOpenChange={setIsNeedsAttentionOpen}>
            <Card className="border-amber-200 bg-amber-50/30">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-amber-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                      <CardTitle className="text-amber-700">
                        Needs Attention
                      </CardTitle>
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                        {needsAttentionReports.length}
                      </Badge>
                    </div>
                    {isNeedsAttentionOpen ? (
                      <ChevronUp className="h-5 w-5 text-amber-600" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-amber-600" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {needsAttentionReports.map(report => (
                      <CLRReportCard 
                        key={report.id} 
                        report={report} 
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Healthy Section */}
        {healthyReports.length > 0 && (
          <Collapsible open={isHealthyOpen} onOpenChange={setIsHealthyOpen}>
            <Card className="border-green-200 bg-green-50/30">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-green-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <CardTitle className="text-green-700">
                        Healthy Classrooms
                      </CardTitle>
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        {healthyReports.length}
                      </Badge>
                    </div>
                    {isHealthyOpen ? (
                      <ChevronUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {healthyReports.map(report => (
                      <CLRReportCard 
                        key={report.id} 
                        report={report} 
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Not Eligible Section */}
        {notEligibleReports.length > 0 && (
          <Collapsible open={isNotEligibleOpen} onOpenChange={setIsNotEligibleOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-muted-foreground">
                        Not Yet Eligible
                      </CardTitle>
                      <Badge variant="outline">
                        {notEligibleReports.length}
                      </Badge>
                    </div>
                    {isNotEligibleOpen ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4">
                    These classrooms have fewer than 4 live assessments and are not yet eligible 
                    for CLR analysis. Minimum 4 assessments required.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {notEligibleReports.map(report => (
                      <Card key={report.id} className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{report.className}</Badge>
                            <Badge variant="outline">{report.batchName}</Badge>
                          </div>
                          <p className="font-medium text-sm">{report.subject}: {report.chapter}</p>
                          <p className="text-xs text-muted-foreground mt-1">{report.teacher}</p>
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{report.sessionsCount} of 4 required sessions</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Empty State */}
        {filteredReports.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground">No Reports Found</h3>
              <p className="text-muted-foreground mt-1">
                No classroom learning response data matches your current filters.
              </p>
              {hasActiveFilters && (
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Detail Modal */}
        <CLRDetailModal 
          report={selectedReport}
          open={isDetailModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  );
};

export default LearningResponsePage;
