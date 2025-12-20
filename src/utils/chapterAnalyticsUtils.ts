import { 
  PerformanceMetrics, 
  TrendDirection, 
  PerformanceCategory, 
  InsightMessage,
  ChapterAnalytics,
  StudentChapterPerformance
} from '@/types/chapterReport';

// Get trend icon
export const getTrendIcon = (trend: TrendDirection): string => {
  switch (trend) {
    case 'improving': return '⬆️';
    case 'declining': return '⬇️';
    case 'stable': return '➡️';
    default: return '❓';
  }
};

// Get trend label
export const getTrendLabel = (trend: TrendDirection): string => {
  switch (trend) {
    case 'improving': return 'Improving';
    case 'declining': return 'Declining';
    case 'stable': return 'Stable';
    default: return 'Not Enough Data';
  }
};

// Get category color classes
export const getCategoryColor = (category: PerformanceCategory): string => {
  switch (category) {
    case 'strong': return 'text-green-600 bg-green-50 border-green-200';
    case 'moderate': return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'weak': return 'text-red-600 bg-red-50 border-red-200';
  }
};

// Get category badge color
export const getCategoryBadgeColor = (category: PerformanceCategory): string => {
  switch (category) {
    case 'strong': return 'bg-green-100 text-green-700';
    case 'moderate': return 'bg-amber-100 text-amber-700';
    case 'weak': return 'bg-red-100 text-red-700';
  }
};

// Get trend color
export const getTrendColor = (trend: TrendDirection): string => {
  switch (trend) {
    case 'improving': return 'text-green-600';
    case 'declining': return 'text-red-600';
    case 'stable': return 'text-blue-600';
    default: return 'text-muted-foreground';
  }
};

// Get mastery level label
export const getMasteryLabel = (level: string): string => {
  switch (level) {
    case 'mastered': return 'Mastered';
    case 'near_mastery': return 'Near Mastery';
    case 'needs_improvement': return 'Needs Improvement';
    default: return level;
  }
};

// Get mastery level color
export const getMasteryColor = (level: string): string => {
  switch (level) {
    case 'mastered': return 'bg-green-100 text-green-700';
    case 'near_mastery': return 'bg-amber-100 text-amber-700';
    case 'needs_improvement': return 'bg-red-100 text-red-700';
    default: return 'bg-muted text-muted-foreground';
  }
};

// Generate chapter overview insight
export const generateChapterOverviewInsight = (metrics: PerformanceMetrics, totalStudents: number): InsightMessage => {
  const { accuracy, skipPercentage, trend, category } = metrics;
  
  if (category === 'strong' && trend === 'improving') {
    return {
      type: 'success',
      title: 'Excellent Progress!',
      message: `Your class is doing very well in this chapter with ${accuracy.toFixed(0)}% accuracy and showing improvement. Keep up the great teaching strategies!`
    };
  }
  
  if (category === 'weak') {
    return {
      type: 'warning',
      title: 'Needs Attention',
      message: `The class is struggling with this chapter (${accuracy.toFixed(0)}% accuracy). Consider revisiting the core concepts and providing additional practice.`
    };
  }
  
  if (skipPercentage > 20) {
    return {
      type: 'warning',
      title: 'High Skip Rate',
      message: `${skipPercentage.toFixed(0)}% of questions are being skipped. Students may lack confidence. Try building their understanding with simpler problems first.`
    };
  }
  
  if (trend === 'declining') {
    return {
      type: 'warning',
      title: 'Performance Declining',
      message: `Class performance is dropping over recent tests. Review what changed and consider reinforcing previous concepts.`
    };
  }
  
  return {
    type: 'info',
    title: 'Steady Progress',
    message: `The class is at ${accuracy.toFixed(0)}% accuracy with ${category} performance. Continue monitoring and address any weak areas.`
  };
};

// Generate topic insight
export const generateTopicInsight = (topics: { topicName: string; metrics: PerformanceMetrics }[]): InsightMessage => {
  const weakTopics = topics.filter(t => t.metrics.category === 'weak');
  const strongTopics = topics.filter(t => t.metrics.category === 'strong');
  
  if (weakTopics.length === 0 && strongTopics.length === topics.length) {
    return {
      type: 'success',
      title: 'All Topics Strong!',
      message: 'Great news! Students are performing well across all topics in this chapter.'
    };
  }
  
  if (weakTopics.length > 0) {
    const weakNames = weakTopics.map(t => t.topicName).join(', ');
    return {
      type: 'action',
      title: 'Focus Areas Identified',
      message: `Students are struggling with: ${weakNames}. Consider dedicating extra time to these topics in upcoming classes.`
    };
  }
  
  return {
    type: 'info',
    title: 'Mixed Performance',
    message: `Students show varied understanding across topics. Focus on the moderate-performing areas to push them to strong.`
  };
};

// Generate difficulty insight
export const generateDifficultyInsight = (difficulty: { easy: PerformanceMetrics; medium: PerformanceMetrics; hard: PerformanceMetrics }): InsightMessage => {
  const { easy, medium, hard } = difficulty;
  
  if (easy.category === 'weak') {
    return {
      type: 'warning',
      title: 'Foundation Issues',
      message: `Students are struggling even with easy questions (${easy.accuracy.toFixed(0)}%). This indicates gaps in basic understanding. Start with fundamentals before moving to complex problems.`
    };
  }
  
  if (hard.category === 'strong') {
    return {
      type: 'success',
      title: 'Advanced Understanding',
      message: `Students are handling difficult questions well (${hard.accuracy.toFixed(0)}%). They have a deep understanding of this chapter.`
    };
  }
  
  if (medium.category === 'weak' && easy.category === 'strong') {
    return {
      type: 'action',
      title: 'Bridge the Gap',
      message: `Students understand basics (${easy.accuracy.toFixed(0)}%) but struggle with medium complexity (${medium.accuracy.toFixed(0)}%). Focus on connecting concepts and practice application.`
    };
  }
  
  return {
    type: 'info',
    title: 'Typical Pattern',
    message: `Performance decreases with difficulty level as expected. Easy: ${easy.accuracy.toFixed(0)}%, Medium: ${medium.accuracy.toFixed(0)}%, Hard: ${hard.accuracy.toFixed(0)}%.`
  };
};

// Generate question type insight
export const generateQuestionTypeInsight = (types: { 
  memory: PerformanceMetrics; 
  conceptual: PerformanceMetrics; 
  logical: PerformanceMetrics; 
  analytical: PerformanceMetrics;
}): InsightMessage => {
  const weakTypes = [];
  const strongTypes = [];
  
  if (types.memory.category === 'weak') weakTypes.push('Memory');
  if (types.conceptual.category === 'weak') weakTypes.push('Conceptual');
  if (types.logical.category === 'weak') weakTypes.push('Logical');
  if (types.analytical.category === 'weak') weakTypes.push('Analytical');
  
  if (types.memory.category === 'strong') strongTypes.push('Memory');
  if (types.conceptual.category === 'strong') strongTypes.push('Conceptual');
  if (types.logical.category === 'strong') strongTypes.push('Logical');
  if (types.analytical.category === 'strong') strongTypes.push('Analytical');
  
  if (weakTypes.includes('Conceptual') && strongTypes.includes('Memory')) {
    return {
      type: 'action',
      title: 'Rote vs Understanding',
      message: `Students can memorize but struggle to understand concepts. Use more "why" questions and real-world examples to build conceptual clarity.`
    };
  }
  
  if (weakTypes.includes('Analytical')) {
    return {
      type: 'action',
      title: 'Problem-Solving Skills Need Work',
      message: `Analytical thinking is weak (${types.analytical.accuracy.toFixed(0)}%). Introduce more multi-step problems and guide students through the solving process.`
    };
  }
  
  if (weakTypes.length === 0) {
    return {
      type: 'success',
      title: 'Well-Rounded Skills',
      message: `Students show balanced performance across all question types. They have developed diverse thinking skills.`
    };
  }
  
  return {
    type: 'info',
    title: 'Thinking Skills Overview',
    message: `Strong areas: ${strongTypes.join(', ') || 'None'}. Areas to develop: ${weakTypes.join(', ') || 'None'}.`
  };
};

// Generate student grouping insight
export const generateStudentGroupInsight = (
  improving: number, 
  declining: number, 
  consistentlyLow: number,
  notEnoughData: number,
  total: number
): InsightMessage => {
  const improvingPct = (improving / total) * 100;
  const decliningPct = (declining / total) * 100;
  
  if (decliningPct > 30) {
    return {
      type: 'warning',
      title: 'Many Students Declining',
      message: `${declining} students (${decliningPct.toFixed(0)}%) are showing declining performance. This needs immediate attention - consider a class review session.`
    };
  }
  
  if (consistentlyLow >= 3) {
    return {
      type: 'action',
      title: 'Support Group Needed',
      message: `${consistentlyLow} students consistently score below 40%. Consider forming a remedial group for extra support.`
    };
  }
  
  if (improvingPct > 50) {
    return {
      type: 'success',
      title: 'Class is Growing!',
      message: `More than half your class (${improving} students) is showing improvement. Your teaching methods are working well!`
    };
  }
  
  return {
    type: 'info',
    title: 'Mixed Progress',
    message: `${improving} improving, ${declining} declining, ${consistentlyLow} need support. Focus on the declining group to prevent further drops.`
  };
};

// Format percentage for display
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

// Format comparison with class
export const formatComparison = (value: number): string => {
  if (value > 0) return `+${value.toFixed(0)}% above class`;
  if (value < 0) return `${value.toFixed(0)}% below class`;
  return 'At class average';
};

// Get comparison color
export const getComparisonColor = (value: number): string => {
  if (value > 5) return 'text-green-600';
  if (value < -5) return 'text-red-600';
  return 'text-muted-foreground';
};
