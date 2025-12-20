import { TrendDirection, PerformanceStatus, AttentionArea } from '@/types/instituteAnalytics';

// Performance Status Helpers
export function getPerformanceStatus(accuracy: number): PerformanceStatus {
  if (accuracy >= 70) return 'strong';
  if (accuracy >= 40) return 'moderate';
  return 'weak';
}

export function getPerformanceColor(status: PerformanceStatus): string {
  switch (status) {
    case 'strong': return 'text-green-600';
    case 'moderate': return 'text-amber-600';
    case 'weak': return 'text-red-600';
  }
}

export function getPerformanceBgColor(status: PerformanceStatus): string {
  switch (status) {
    case 'strong': return 'bg-green-100 text-green-700';
    case 'moderate': return 'bg-amber-100 text-amber-700';
    case 'weak': return 'bg-red-100 text-red-700';
  }
}

export function getPerformanceBarColor(status: PerformanceStatus): string {
  switch (status) {
    case 'strong': return 'bg-green-500';
    case 'moderate': return 'bg-amber-500';
    case 'weak': return 'bg-red-500';
  }
}

// Trend Helpers
export function getTrendIcon(trend: TrendDirection): string {
  switch (trend) {
    case 'improving': return '↑';
    case 'declining': return '↓';
    case 'stable': return '→';
    case 'not_enough_data': return '?';
  }
}

export function getTrendColor(trend: TrendDirection): string {
  switch (trend) {
    case 'improving': return 'text-green-600';
    case 'declining': return 'text-red-600';
    case 'stable': return 'text-blue-600';
    case 'not_enough_data': return 'text-muted-foreground';
  }
}

export function getTrendBgColor(trend: TrendDirection): string {
  switch (trend) {
    case 'improving': return 'bg-green-100 text-green-700';
    case 'declining': return 'bg-red-100 text-red-700';
    case 'stable': return 'bg-blue-100 text-blue-700';
    case 'not_enough_data': return 'bg-muted text-muted-foreground';
  }
}

export function getTrendLabel(trend: TrendDirection): string {
  switch (trend) {
    case 'improving': return 'Improving';
    case 'declining': return 'Declining';
    case 'stable': return 'Stable';
    case 'not_enough_data': return 'Not Enough Data';
  }
}

// Insight Generation
export function generateInstituteInsight(accuracy: number, engagement: number, trend: TrendDirection): string {
  const status = getPerformanceStatus(accuracy);
  
  if (status === 'strong' && trend === 'improving') {
    return `Excellent academic health! The institute is showing strong performance at ${accuracy.toFixed(1)}% accuracy with consistent improvement. Students are actively engaged (${engagement.toFixed(1)}% engagement rate).`;
  }
  
  if (status === 'strong' && trend === 'stable') {
    return `Good academic standing with ${accuracy.toFixed(1)}% accuracy maintained consistently. Focus on identifying areas where incremental improvements can push performance even higher.`;
  }
  
  if (status === 'moderate' && trend === 'improving') {
    return `Positive trajectory! While current accuracy is ${accuracy.toFixed(1)}%, the improving trend indicates teaching strategies are working. Continue current approaches and monitor progress.`;
  }
  
  if (status === 'moderate' && trend === 'declining') {
    return `Attention needed: Accuracy at ${accuracy.toFixed(1)}% with declining trend. Review teaching methods and identify chapters causing difficulty. Consider remedial sessions for struggling areas.`;
  }
  
  if (status === 'weak') {
    return `Critical attention required: ${accuracy.toFixed(1)}% accuracy indicates significant learning gaps. Prioritize identifying root causes and implementing targeted interventions immediately.`;
  }
  
  return `Current accuracy stands at ${accuracy.toFixed(1)}% with ${engagement.toFixed(1)}% engagement. Monitor trends over the coming weeks for better insights.`;
}

export function generateTeacherInsight(
  teacherName: string,
  accuracy: number,
  trend: TrendDirection,
  subjectCount: number
): string {
  const status = getPerformanceStatus(accuracy);
  const firstName = teacherName.split(' ').pop() || teacherName;
  
  if (status === 'strong' && trend === 'improving') {
    return `${firstName}'s teaching across ${subjectCount} subject(s) shows excellent outcomes with ${accuracy.toFixed(1)}% student accuracy and consistent improvement. Students are responding well to the teaching methodology.`;
  }
  
  if (status === 'strong' && trend === 'stable') {
    return `${firstName} maintains strong performance at ${accuracy.toFixed(1)}% accuracy. Teaching approach is effective and consistent across classes.`;
  }
  
  if (status === 'moderate' && trend === 'improving') {
    return `${firstName}'s students show improving outcomes (currently ${accuracy.toFixed(1)}%). The positive trend suggests recent teaching adjustments are working well.`;
  }
  
  if (status === 'moderate' && trend === 'declining') {
    return `${firstName}'s classes show ${accuracy.toFixed(1)}% accuracy with a declining trend. Consider scheduling a discussion to understand challenges and explore support options.`;
  }
  
  if (status === 'weak') {
    return `${firstName}'s students are struggling with ${accuracy.toFixed(1)}% accuracy. This requires immediate attention - consider classroom observation and additional support resources.`;
  }
  
  return `${firstName}'s teaching shows ${accuracy.toFixed(1)}% student accuracy across ${subjectCount} subject(s).`;
}

export function generateSubjectInsight(
  subjectName: string,
  accuracy: number,
  trend: TrendDirection,
  chapterCount: number
): string {
  const status = getPerformanceStatus(accuracy);
  
  if (status === 'strong') {
    return `${subjectName} is performing well institute-wide at ${accuracy.toFixed(1)}% accuracy across ${chapterCount} chapters. ${trend === 'improving' ? 'The improving trend is encouraging.' : 'Maintain current teaching standards.'}`;
  }
  
  if (status === 'moderate') {
    if (trend === 'improving') {
      return `${subjectName} shows moderate performance (${accuracy.toFixed(1)}%) but is improving. Continue monitoring and support the positive trajectory.`;
    }
    if (trend === 'declining') {
      return `${subjectName} needs attention: ${accuracy.toFixed(1)}% accuracy with declining trend. Identify weak chapters and coordinate with teachers for remediation.`;
    }
    return `${subjectName} shows moderate performance at ${accuracy.toFixed(1)}%. Focus on chapters below average to improve overall subject health.`;
  }
  
  return `${subjectName} requires immediate focus: only ${accuracy.toFixed(1)}% accuracy. Conduct subject-level review with all teachers.`;
}

export function generateChapterInsight(
  chapterName: string,
  accuracy: number,
  engagement: number,
  trend: TrendDirection
): string {
  const status = getPerformanceStatus(accuracy);
  
  if (status === 'strong' && engagement > 85) {
    return `${chapterName} shows strong learning outcomes with ${accuracy.toFixed(1)}% accuracy and high engagement (${engagement.toFixed(1)}%). Students are grasping concepts well.`;
  }
  
  if (status === 'moderate' && trend === 'declining') {
    return `${chapterName} is showing declining performance (${accuracy.toFixed(1)}%). Consider revisiting teaching approach or adding reinforcement activities.`;
  }
  
  if (status === 'weak') {
    return `${chapterName} needs immediate attention: ${accuracy.toFixed(1)}% accuracy indicates significant gaps. Plan revision sessions and additional practice.`;
  }
  
  if (engagement < 75) {
    return `${chapterName} has low engagement (${engagement.toFixed(1)}%). Students may be skipping questions - investigate if content is too difficult or unclear.`;
  }
  
  return `${chapterName}: ${accuracy.toFixed(1)}% accuracy, ${engagement.toFixed(1)}% engagement. ${getTrendLabel(trend)} trend.`;
}

export function generateClassInsight(
  className: string,
  accuracy: number,
  trend: TrendDirection,
  subjectCount: number
): string {
  const status = getPerformanceStatus(accuracy);
  
  if (status === 'strong') {
    return `${className} demonstrates strong academic performance at ${accuracy.toFixed(1)}% across ${subjectCount} subjects. ${trend === 'improving' ? 'The class is on an upward trajectory.' : 'Maintain current standards.'}`;
  }
  
  if (status === 'moderate') {
    return `${className} shows average performance (${accuracy.toFixed(1)}%). Focus on subjects with lower accuracy to bring up overall class performance.`;
  }
  
  return `${className} needs focused attention: ${accuracy.toFixed(1)}% accuracy indicates significant room for improvement across ${subjectCount} subjects.`;
}

// Attention Area Prioritization
export function getAttentionPriorityColor(priority: AttentionArea['priority']): string {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-700 border-red-200';
    case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
  }
}

// Formatting
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
}

// Subject Colors
export function getSubjectColor(subjectId: string): string {
  const colors: Record<string, string> = {
    mathematics: '#3B82F6',
    physics: '#8B5CF6',
    chemistry: '#10B981',
    biology: '#F59E0B',
    english: '#EC4899',
  };
  return colors[subjectId] || '#6B7280';
}

export function getSubjectBgClass(subjectId: string): string {
  const classes: Record<string, string> = {
    mathematics: 'bg-blue-100 text-blue-700',
    physics: 'bg-purple-100 text-purple-700',
    chemistry: 'bg-green-100 text-green-700',
    biology: 'bg-amber-100 text-amber-700',
    english: 'bg-pink-100 text-pink-700',
  };
  return classes[subjectId] || 'bg-muted text-muted-foreground';
}
