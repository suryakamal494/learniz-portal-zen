import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BrochureSlide, 
  FeatureCard, 
  StatCard, 
  BulletPoint, 
  Badge, 
  SectionTitle, 
  SectionSubtitle, 
  Highlight 
} from '@/components/brochure/BrochureSlide';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Sparkles, 
  FileText, 
  ClipboardCheck, 
  BarChart3, 
  Users, 
  TrendingUp, 
  MessageSquare, 
  Building2, 
  GraduationCap,
  Brain,
  Zap,
  Clock,
  Target,
  BookOpen,
  Video,
  PenTool,
  Award,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  LineChart,
  ArrowUpRight,
  Layers,
  Send,
  BellRing,
  Shield,
  Globe,
  Download,
  Printer
} from 'lucide-react';

export default function BrochurePage() {
  const navigate = useNavigate();
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 10;

  const handlePrevious = () => {
    setCurrentSlide(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide(prev => Math.min(totalSlides - 1, prev + 1));
  };

  const handlePrint = () => {
    setIsPrintMode(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setIsPrintMode(false), 500);
    }, 100);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPrintMode) return;
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') navigate('/login');
      if (e.key === 'p' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handlePrint();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const slides = [
    // Slide 1: Cover
    <BrochureSlide key="cover" backgroundVariant="pattern">
      <div className="absolute top-6 right-6">
        <button 
          onClick={() => navigate('/login')}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="h-full flex flex-col justify-center items-center text-center max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ff6b4a] to-[#ff8a6a] flex items-center justify-center">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <span className="text-3xl font-bold text-white">Learniz</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          Your Test, Lesson Plan & Reports —{' '}
          <span className="text-[#ff6b4a]">Ready in Minutes</span>
        </h1>
        
        <p className="text-xl text-[#8b95a8] mb-8 max-w-2xl">
          AI-powered teaching platform that saves teachers 45+ hours every month
        </p>
        
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {['JEE', 'NEET', 'EAMCET', 'CBSE', 'State Boards'].map(board => (
            <Badge key={board}>{board}</Badge>
          ))}
        </div>
        
        <div className="bg-[#1a1f2e]/80 rounded-2xl p-6 border border-[#2a3041] flex items-center gap-4 max-w-md">
          <div className="w-12 h-12 rounded-full bg-[#ff6b4a]/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-[#ff6b4a]" />
          </div>
          <p className="text-[#c8d0e0] text-sm italic">
            "I can create tests, lesson plans, and track every student — all in one place!"
          </p>
        </div>
      </div>
    </BrochureSlide>,

    // Slide 2: AI Test Generator
    <BrochureSlide key="test-generator" backgroundVariant="gradient">
      <div className="h-full flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#ff6b4a]/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#ff6b4a]" />
            </div>
            <span className="text-[#ff6b4a] text-sm font-medium uppercase tracking-wide">AI-Powered</span>
          </div>
          
          <SectionTitle className="mb-4">
            Create Tests Instantly — <Highlight>Without Compromising Quality</Highlight>
          </SectionTitle>
          
          <SectionSubtitle className="mb-8">
            With one click, teachers can create class tests, practice assessments, chapter tests, and mock exams — exactly the way they want.
          </SectionSubtitle>
          
          <div className="space-y-4">
            <BulletPoint icon={<Target className="w-3 h-3 text-[#ff6b4a]" />}>
              Choose difficulty: <strong className="text-white">Easy, Medium, Hard</strong>
            </BulletPoint>
            <BulletPoint icon={<Brain className="w-3 h-3 text-[#ff6b4a]" />}>
              Select cognitive levels: <strong className="text-white">Remember, Understand, Apply, Analyze</strong>
            </BulletPoint>
            <BulletPoint icon={<Layers className="w-3 h-3 text-[#ff6b4a]" />}>
              Multiple formats: <strong className="text-white">MCQs, True/False, Fill-in-Blanks, Subjective</strong>
            </BulletPoint>
            <BulletPoint icon={<BookOpen className="w-3 h-3 text-[#ff6b4a]" />}>
              100% curriculum-aligned to your syllabus
            </BulletPoint>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-[#1a1f2e]/80 rounded-2xl p-6 border border-[#2a3041] w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-medium">Test Generator</span>
              <Badge>AI Powered</Badge>
            </div>
            <div className="space-y-3">
              <div className="bg-[#0f1419] rounded-lg p-3">
                <div className="text-[#8b95a8] text-xs mb-1">Subject</div>
                <div className="text-white text-sm">Physics - Wave Motion</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0f1419] rounded-lg p-3">
                  <div className="text-[#8b95a8] text-xs mb-1">Questions</div>
                  <div className="text-[#ff6b4a] text-lg font-bold">25</div>
                </div>
                <div className="bg-[#0f1419] rounded-lg p-3">
                  <div className="text-[#8b95a8] text-xs mb-1">Duration</div>
                  <div className="text-[#ff6b4a] text-lg font-bold">45 min</div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-[#ff6b4a] to-[#ff8a6a] rounded-lg p-3 text-center text-white font-medium cursor-pointer hover:opacity-90 transition-opacity">
                Generate Test Instantly
              </div>
            </div>
          </div>
        </div>
      </div>
    </BrochureSlide>,

    // Slide 3: Question Bank
    <BrochureSlide key="question-bank" backgroundVariant="pattern">
      <div className="h-full flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#ff6b4a]/20 flex items-center justify-center">
              <ClipboardCheck className="w-4 h-4 text-[#ff6b4a]" />
            </div>
            <span className="text-[#ff6b4a] text-sm font-medium uppercase tracking-wide">Question Bank</span>
          </div>
          
          <SectionTitle className="mb-4">
            Thousands of Questions, <Highlight>Organized by Chapter</Highlight>
          </SectionTitle>
          
          <SectionSubtitle className="mb-8">
            Never start from scratch. Access a rich library of curriculum-aligned questions, filter by topic, difficulty, or question type — and reuse them anytime.
          </SectionSubtitle>
          
          <div className="grid grid-cols-2 gap-4">
            <StatCard value="10K+" label="Ready Questions" icon={<FileText className="w-4 h-4" />} />
            <StatCard value="100%" label="Curriculum Aligned" icon={<Target className="w-4 h-4" />} />
            <StatCard value="5" label="Difficulty Levels" icon={<Layers className="w-4 h-4" />} />
            <StatCard value="∞" label="Custom Questions" icon={<PenTool className="w-4 h-4" />} />
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-[#1a1f2e]/80 rounded-2xl p-4 border border-[#2a3041] w-full max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 bg-[#0f1419] rounded-lg px-3 py-2 text-[#8b95a8] text-sm">
                Search questions...
              </div>
              <Badge variant="outline">Filter</Badge>
            </div>
            <div className="space-y-2">
              {[
                { chapter: 'Wave Motion', count: 156, difficulty: 'Mixed' },
                { chapter: 'Optics', count: 203, difficulty: 'Hard' },
                { chapter: 'Thermodynamics', count: 178, difficulty: 'Medium' },
              ].map((item, i) => (
                <div key={i} className="bg-[#0f1419] rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <div className="text-white text-sm font-medium">{item.chapter}</div>
                    <div className="text-[#8b95a8] text-xs">{item.count} questions</div>
                  </div>
                  <Badge variant="outline">{item.difficulty}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </BrochureSlide>,

    // Slide 4: Lesson Plans & LMS
    <BrochureSlide key="lesson-plans" backgroundVariant="gradient">
      <div className="h-full flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#ff6b4a]/20 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-[#ff6b4a]" />
            </div>
            <span className="text-[#ff6b4a] text-sm font-medium uppercase tracking-wide">LMS Content</span>
          </div>
          
          <SectionTitle className="mb-4">
            Your Entire Teaching Material, <Highlight>Ready to Deliver</Highlight>
          </SectionTitle>
          
          <SectionSubtitle className="mb-8">
            Structured lesson plans with animations, videos, and notes. Assign to batches with one click — students access content anytime, anywhere.
          </SectionSubtitle>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <FeatureCard
              icon={<Video className="w-5 h-5" />}
              title="Videos"
              description="Engaging video lessons"
            />
            <FeatureCard
              icon={<Sparkles className="w-5 h-5" />}
              title="Animations"
              description="Interactive visuals"
            />
            <FeatureCard
              icon={<FileText className="w-5 h-5" />}
              title="Notes"
              description="Detailed study material"
            />
            <FeatureCard
              icon={<ClipboardCheck className="w-5 h-5" />}
              title="Quizzes"
              description="Practice assessments"
            />
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-[#1a1f2e]/80 rounded-2xl p-5 border border-[#2a3041] w-full max-w-sm">
            <div className="text-white font-medium mb-4">Lesson Series</div>
            <div className="space-y-3">
              {[
                { title: 'Wave Motion Fundamentals', items: 12, progress: 85 },
                { title: 'Optics & Light', items: 18, progress: 60 },
                { title: 'Modern Physics', items: 15, progress: 40 },
              ].map((series, i) => (
                <div key={i} className="bg-[#0f1419] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm font-medium">{series.title}</span>
                    <span className="text-[#8b95a8] text-xs">{series.items} items</span>
                  </div>
                  <div className="h-1.5 bg-[#2a3041] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#ff6b4a] to-[#ff8a6a] rounded-full transition-all"
                      style={{ width: `${series.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </BrochureSlide>,

    // Slide 5: Chapter Analytics
    <BrochureSlide key="chapter-analytics" backgroundVariant="pattern">
      <div className="h-full flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#ff6b4a]/20 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-[#ff6b4a]" />
            </div>
            <span className="text-[#ff6b4a] text-sm font-medium uppercase tracking-wide">Reports</span>
          </div>
          
          <SectionTitle className="mb-4">
            Know Exactly Where <Highlight>Students Struggle</Highlight>
          </SectionTitle>
          
          <SectionSubtitle className="mb-8">
            Chapter-wise accuracy breakdown, topic-wise performance drill-down, difficulty-level insights, and cognitive-type analysis — all in one dashboard.
          </SectionSubtitle>
          
          <div className="space-y-4">
            <BulletPoint icon={<PieChart className="w-3 h-3 text-[#ff6b4a]" />}>
              <strong className="text-white">Topic-wise accuracy</strong> — See which concepts need revision
            </BulletPoint>
            <BulletPoint icon={<LineChart className="w-3 h-3 text-[#ff6b4a]" />}>
              <strong className="text-white">Difficulty analysis</strong> — Compare Easy vs Medium vs Hard performance
            </BulletPoint>
            <BulletPoint icon={<Brain className="w-3 h-3 text-[#ff6b4a]" />}>
              <strong className="text-white">Cognitive insights</strong> — Identify thinking gaps: Remember, Apply, Analyze
            </BulletPoint>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-[#1a1f2e]/80 rounded-2xl p-5 border border-[#2a3041] w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-medium">Chapter: Wave Motion</span>
              <Badge>Physics</Badge>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-[#0f1419] rounded-lg p-3 text-center">
                <div className="text-[#4ade80] text-xl font-bold">78%</div>
                <div className="text-[#8b95a8] text-xs">Accuracy</div>
              </div>
              <div className="bg-[#0f1419] rounded-lg p-3 text-center">
                <div className="text-[#ff6b4a] text-xl font-bold">45</div>
                <div className="text-[#8b95a8] text-xs">Students</div>
              </div>
              <div className="bg-[#0f1419] rounded-lg p-3 text-center">
                <div className="text-[#60a5fa] text-xl font-bold">12</div>
                <div className="text-[#8b95a8] text-xs">Tests</div>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { topic: 'Wave Properties', accuracy: 85 },
                { topic: 'Wave Equations', accuracy: 72 },
                { topic: 'Standing Waves', accuracy: 58 },
              ].map((topic, i) => (
                <div key={i} className="bg-[#0f1419] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm">{topic.topic}</span>
                    <span className={`text-sm font-medium ${topic.accuracy >= 70 ? 'text-[#4ade80]' : 'text-[#f59e0b]'}`}>
                      {topic.accuracy}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#2a3041] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${topic.accuracy >= 70 ? 'bg-[#4ade80]' : 'bg-[#f59e0b]'}`}
                      style={{ width: `${topic.accuracy}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </BrochureSlide>,

    // Slide 6: Student Grouping
    <BrochureSlide key="student-grouping" backgroundVariant="gradient">
      <div className="h-full flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#ff6b4a]/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-[#ff6b4a]" />
            </div>
            <span className="text-[#ff6b4a] text-sm font-medium uppercase tracking-wide">Student Insights</span>
          </div>
          
          <SectionTitle className="mb-4">
            Instantly See <Highlight>Who Needs Attention</Highlight>
          </SectionTitle>
          
          <SectionSubtitle className="mb-8">
            Automatic grouping based on performance trends — Improving, Declining, Need Support. Individual student trends compared against class average.
          </SectionSubtitle>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#0f1419]/60 rounded-xl p-4 border border-[#4ade80]/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-[#4ade80]" />
                <span className="text-[#4ade80] text-sm font-medium">Improving</span>
              </div>
              <div className="text-white text-2xl font-bold">12</div>
              <div className="text-[#8b95a8] text-xs">students</div>
            </div>
            <div className="bg-[#0f1419]/60 rounded-xl p-4 border border-[#f59e0b]/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
                <span className="text-[#f59e0b] text-sm font-medium">Need Focus</span>
              </div>
              <div className="text-white text-2xl font-bold">8</div>
              <div className="text-[#8b95a8] text-xs">students</div>
            </div>
            <div className="bg-[#0f1419]/60 rounded-xl p-4 border border-[#ef4444]/20">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpRight className="w-4 h-4 text-[#ef4444] rotate-90" />
                <span className="text-[#ef4444] text-sm font-medium">Declining</span>
              </div>
              <div className="text-white text-2xl font-bold">3</div>
              <div className="text-[#8b95a8] text-xs">students</div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-[#1a1f2e]/80 rounded-2xl p-5 border border-[#2a3041] w-full max-w-md">
            <div className="text-white font-medium mb-4">Student Performance Bands</div>
            <div className="space-y-3">
              {[
                { name: 'Rahul Sharma', score: 92, trend: 'up', band: 'High' },
                { name: 'Priya Patel', score: 78, trend: 'up', band: 'Medium' },
                { name: 'Amit Kumar', score: 65, trend: 'down', band: 'At Risk' },
                { name: 'Sneha Reddy', score: 88, trend: 'stable', band: 'High' },
              ].map((student, i) => (
                <div key={i} className="bg-[#0f1419] rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#2a3041] flex items-center justify-center text-white text-xs font-medium">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">{student.name}</div>
                      <div className="text-[#8b95a8] text-xs">{student.score}% avg</div>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    student.band === 'High' ? 'bg-[#4ade80]/10 text-[#4ade80]' :
                    student.band === 'Medium' ? 'bg-[#60a5fa]/10 text-[#60a5fa]' :
                    'bg-[#ef4444]/10 text-[#ef4444]'
                  }`}>
                    {student.band}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </BrochureSlide>,

    // Slide 7: Grand Tests
    <BrochureSlide key="grand-tests" backgroundVariant="pattern">
      <div className="h-full flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#ff6b4a]/20 flex items-center justify-center">
              <Award className="w-4 h-4 text-[#ff6b4a]" />
            </div>
            <span className="text-[#ff6b4a] text-sm font-medium uppercase tracking-wide">Grand Tests</span>
          </div>
          
          <SectionTitle className="mb-4">
            Conduct Institution-Wide <Highlight>Assessments</Highlight>
          </SectionTitle>
          
          <SectionSubtitle className="mb-8">
            Multi-subject grand tests with complete subject-wise and chapter-wise breakdown. Publish ranks for JEE, NEET, and EAMCET competitions.
          </SectionSubtitle>
          
          <div className="flex flex-wrap gap-3 mb-6">
            <Badge>JEE Mains Ranking</Badge>
            <Badge>NEET Ranking</Badge>
            <Badge>EAMCET Ranking</Badge>
          </div>
          
          <div className="space-y-4">
            <BulletPoint icon={<CheckCircle2 className="w-3 h-3 text-[#ff6b4a]" />}>
              Complete subject & chapter breakdown for every student
            </BulletPoint>
            <BulletPoint icon={<CheckCircle2 className="w-3 h-3 text-[#ff6b4a]" />}>
              Performance bands: High, Medium, At Risk
            </BulletPoint>
            <BulletPoint icon={<CheckCircle2 className="w-3 h-3 text-[#ff6b4a]" />}>
              One-click rank publishing with competition type
            </BulletPoint>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-[#1a1f2e]/80 rounded-2xl p-5 border border-[#2a3041] w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-medium">Grand Test: Mock JEE #3</span>
              <Badge>Ranks Published</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[#0f1419] rounded-lg p-3 text-center">
                <div className="text-[#ff6b4a] text-2xl font-bold">245</div>
                <div className="text-[#8b95a8] text-xs">Students</div>
              </div>
              <div className="bg-[#0f1419] rounded-lg p-3 text-center">
                <div className="text-[#4ade80] text-2xl font-bold">72%</div>
                <div className="text-[#8b95a8] text-xs">Avg Score</div>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { subject: 'Physics', accuracy: 75, color: '#60a5fa' },
                { subject: 'Chemistry', accuracy: 68, color: '#4ade80' },
                { subject: 'Mathematics', accuracy: 71, color: '#f59e0b' },
              ].map((subj, i) => (
                <div key={i} className="bg-[#0f1419] rounded-lg p-3 flex items-center justify-between">
                  <span className="text-white text-sm">{subj.subject}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-[#2a3041] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full"
                        style={{ width: `${subj.accuracy}%`, backgroundColor: subj.color }}
                      />
                    </div>
                    <span className="text-[#8b95a8] text-xs w-10 text-right">{subj.accuracy}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </BrochureSlide>,

    // Slide 8: Institute Dashboard
    <BrochureSlide key="institute-dashboard" backgroundVariant="gradient">
      <div className="h-full flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#ff6b4a]/20 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-[#ff6b4a]" />
            </div>
            <span className="text-[#ff6b4a] text-sm font-medium uppercase tracking-wide">Institute View</span>
          </div>
          
          <SectionTitle className="mb-4">
            Complete Academic Visibility — <Highlight>In One Place</Highlight>
          </SectionTitle>
          
          <SectionSubtitle className="mb-8">
            Monitor teacher performance, subject health, class comparisons, and attention areas — all from a single dashboard. Leadership stays informed without micromanaging.
          </SectionSubtitle>
          
          <div className="grid grid-cols-2 gap-4">
            <FeatureCard
              icon={<Users className="w-5 h-5" />}
              title="Teacher Performance"
              description="Track teaching effectiveness across batches"
            />
            <FeatureCard
              icon={<BookOpen className="w-5 h-5" />}
              title="Subject Health"
              description="Monitor subject-wise academic progress"
            />
            <FeatureCard
              icon={<BarChart3 className="w-5 h-5" />}
              title="Class Analytics"
              description="Compare batch performance instantly"
            />
            <FeatureCard
              icon={<AlertTriangle className="w-5 h-5" />}
              title="Attention Areas"
              description="Auto-flagged areas needing focus"
            />
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="grid grid-cols-2 gap-3 w-full max-w-md">
            <div className="bg-[#1a1f2e]/80 rounded-xl p-4 border border-[#2a3041]">
              <div className="text-[#8b95a8] text-xs mb-1">Active Students</div>
              <div className="text-white text-2xl font-bold">1,247</div>
              <div className="text-[#4ade80] text-xs flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> +12%
              </div>
            </div>
            <div className="bg-[#1a1f2e]/80 rounded-xl p-4 border border-[#2a3041]">
              <div className="text-[#8b95a8] text-xs mb-1">Teachers</div>
              <div className="text-white text-2xl font-bold">32</div>
              <div className="text-[#60a5fa] text-xs mt-1">8 subjects</div>
            </div>
            <div className="bg-[#1a1f2e]/80 rounded-xl p-4 border border-[#2a3041]">
              <div className="text-[#8b95a8] text-xs mb-1">Tests This Month</div>
              <div className="text-white text-2xl font-bold">156</div>
              <div className="text-[#ff6b4a] text-xs mt-1">AI Generated</div>
            </div>
            <div className="bg-[#1a1f2e]/80 rounded-xl p-4 border border-[#2a3041]">
              <div className="text-[#8b95a8] text-xs mb-1">Avg Performance</div>
              <div className="text-white text-2xl font-bold">74%</div>
              <div className="text-[#4ade80] text-xs flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> +5%
              </div>
            </div>
          </div>
        </div>
      </div>
    </BrochureSlide>,

    // Slide 9: WhatsApp Automation
    <BrochureSlide key="whatsapp" backgroundVariant="pattern">
      <div className="h-full flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#25d366]/20 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-[#25d366]" />
            </div>
            <span className="text-[#25d366] text-sm font-medium uppercase tracking-wide">WhatsApp Integration</span>
          </div>
          
          <SectionTitle className="mb-4">
            Parents Stay Informed — <Highlight>Without Extra Work</Highlight>
          </SectionTitle>
          
          <SectionSubtitle className="mb-8">
            Automatic updates on test scores, attendance alerts, and academic milestones — sent instantly to parents via WhatsApp. No manual follow-ups needed.
          </SectionSubtitle>
          
          <div className="space-y-4">
            <BulletPoint icon={<Send className="w-3 h-3 text-[#25d366]" />}>
              <strong className="text-white">Auto test results</strong> — Scores sent immediately after submission
            </BulletPoint>
            <BulletPoint icon={<BellRing className="w-3 h-3 text-[#25d366]" />}>
              <strong className="text-white">Attendance alerts</strong> — Instant notification to parents
            </BulletPoint>
            <BulletPoint icon={<Award className="w-3 h-3 text-[#25d366]" />}>
              <strong className="text-white">Milestone updates</strong> — Achievements shared automatically
            </BulletPoint>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-[#1a1f2e]/80 rounded-2xl p-5 border border-[#2a3041] w-full max-w-sm">
            <div className="bg-[#0f1419] rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#25d366]/20 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-4 h-4 text-[#25d366]" />
                </div>
                <div className="bg-[#25d366]/10 rounded-lg rounded-tl-none p-3 text-sm text-[#c8d0e0]">
                  <p className="font-medium text-[#25d366] mb-1">Learniz Updates</p>
                  <p>📊 <strong>Physics Test Result</strong></p>
                  <p className="mt-1">Your ward Rahul scored <strong className="text-[#4ade80]">85/100</strong> in Wave Motion chapter test.</p>
                  <p className="text-xs text-[#8b95a8] mt-2">Rank: 5/45</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#25d366]/20 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-4 h-4 text-[#25d366]" />
                </div>
                <div className="bg-[#25d366]/10 rounded-lg rounded-tl-none p-3 text-sm text-[#c8d0e0]">
                  <p>✅ Rahul completed today's LMS assignment: <strong>Optics Fundamentals</strong></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BrochureSlide>,

    // Slide 10: Closing/CTA
    <BrochureSlide key="closing" backgroundVariant="pattern">
      <div className="h-full flex flex-col justify-center items-center text-center max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ff6b4a] to-[#ff8a6a] flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <span className="text-4xl font-bold text-white">Learniz</span>
        </div>
        
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
          Built for Teachers. <br/>
          <span className="text-[#ff6b4a]">Designed for Schools.</span>
        </h1>
        
        <p className="text-xl text-[#8b95a8] mb-10 max-w-2xl">
          Everything you need — lesson preparation, teaching support, assessments, reports, and communication — in one powerful platform.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-[#1a1f2e]/60 rounded-xl p-4 border border-[#2a3041]">
            <Zap className="w-6 h-6 text-[#ff6b4a] mx-auto mb-2" />
            <div className="text-white text-sm font-medium">AI-Powered</div>
          </div>
          <div className="bg-[#1a1f2e]/60 rounded-xl p-4 border border-[#2a3041]">
            <Clock className="w-6 h-6 text-[#ff6b4a] mx-auto mb-2" />
            <div className="text-white text-sm font-medium">Save 45+ hrs/month</div>
          </div>
          <div className="bg-[#1a1f2e]/60 rounded-xl p-4 border border-[#2a3041]">
            <Shield className="w-6 h-6 text-[#ff6b4a] mx-auto mb-2" />
            <div className="text-white text-sm font-medium">Secure & Private</div>
          </div>
          <div className="bg-[#1a1f2e]/60 rounded-xl p-4 border border-[#2a3041]">
            <Globe className="w-6 h-6 text-[#ff6b4a] mx-auto mb-2" />
            <div className="text-white text-sm font-medium">Access Anywhere</div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-gradient-to-r from-[#ff6b4a] to-[#ff8a6a] rounded-xl text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Get Started Today
          </button>
          <button className="px-8 py-4 bg-[#1a1f2e] border border-[#2a3041] rounded-xl text-white font-semibold hover:bg-[#1a1f2e]/80 transition-all">
            Request Demo
          </button>
        </div>
      </div>
    </BrochureSlide>
  ];

  // Print mode: show all slides stacked vertically
  if (isPrintMode) {
    return (
      <div className="brochure-print-container bg-[#0f1419]">
        <style>{`
          @media print {
            @page {
              size: A4 landscape;
              margin: 0;
            }
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .brochure-print-container {
              background: #0f1419 !important;
            }
            .brochure-slide-print {
              page-break-after: always;
              page-break-inside: avoid;
              height: 100vh;
              width: 100vw;
            }
            .brochure-slide-print:last-child {
              page-break-after: auto;
            }
          }
        `}</style>
        {slides.map((slide, i) => (
          <div key={i} className="brochure-slide-print">
            {slide}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1419] overflow-hidden">
      {/* Navigation */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#1a1f2e]/90 backdrop-blur-sm rounded-full px-4 py-2 border border-[#2a3041] print:hidden">
        <button
          onClick={handlePrevious}
          disabled={currentSlide === 0}
          className="p-2 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-1.5 px-2">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentSlide 
                  ? 'bg-[#ff6b4a] w-6' 
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
        <button
          onClick={handleNext}
          disabled={currentSlide === totalSlides - 1}
          className="p-2 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all"
        >
          <ChevronRight size={20} />
        </button>
        
        {/* Print/Download Button */}
        <div className="w-px h-6 bg-[#2a3041] mx-1" />
        <button
          onClick={handlePrint}
          className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-all flex items-center gap-1.5"
          title="Print / Save as PDF (Ctrl+P)"
        >
          <Download size={18} />
          <span className="text-xs hidden sm:inline">PDF</span>
        </button>
      </div>

      {/* Slide container */}
      <div className="relative">
        <div 
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, i) => (
            <div key={i} className="w-full flex-shrink-0">
              {slide}
            </div>
          ))}
        </div>
      </div>

      {/* Page number */}
      <div className="fixed bottom-4 right-6 text-[#8b95a8] text-sm print:hidden">
        {currentSlide + 1} / {totalSlides}
      </div>
    </div>
  );
}
