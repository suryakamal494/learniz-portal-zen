import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Sparkles,
  Trash2,
  RotateCcw,
  Eye,
  EyeOff,
  CheckCircle2,
  Plus,
  Loader2,
  AlertCircle,
  Settings2,
  Undo2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
  SUBJECT_OPTIONS,
  QUESTION_CATEGORIES,
  generateMockQuestions,
} from '@/data/mockAIGenerator'
import { mockInstructions } from '@/data/mockInstructions'
import { mockExamsData } from '@/data/mockExamsData'
import { MathText } from '@/components/teacher/exams/ai/MathText'
import type {
  AIExamConfig,
  AIQuestionBatch,
  DifficultyLevel,
  GeneratedQuestion,
  TestDetails,
} from '@/types/aiExamGenerator'

const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string; active: string }[] = [
  { value: 'easy', label: 'Easy', active: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'medium', label: 'Medium', active: 'bg-amber-100 text-amber-700 border-amber-300' },
  { value: 'hard', label: 'Hard', active: 'bg-rose-100 text-rose-700 border-rose-300' },
]

const QUESTION_TYPE_OPTIONS = [
  { value: 'single', label: 'Single Choice (Radio)' },
  { value: 'multiple', label: 'Multiple Choice' },
  { value: 'fillInBlanks', label: 'Fill in the Blanks' },
]

const EXAM_TYPE_OPTIONS = [
  'No Section, No Timer',
  'Section with No Timer',
  'Section with Timer',
] as const

const initialConfig: AIExamConfig = {
  subject: '',
  chapter: '',
  topics: [],
  numberOfQuestions: 5,
  difficulties: ['medium'],
  questionType: 'single',
  categories: ['Conceptual'],
  customInstructions: '',
}

const initialDetails: TestDetails = {
  testName: '',
  durationMinutes: 60,
  marksPerQuestion: 1,
  negativeMarkingPct: 0,
  examType: 'No Section, No Timer',
  instructionId: '',
}

type FeedFilter = 'active' | 'selected' | 'deleted'

export default function AIExamGeneratorPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [details, setDetails] = useState<TestDetails>(initialDetails)
  const [config, setConfig] = useState<AIExamConfig>(initialConfig)
  const [batches, setBatches] = useState<AIQuestionBatch[]>([])
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([])
  const [showAnswers, setShowAnswers] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter] = useState<FeedFilter>('active')

  const subjectMeta = SUBJECT_OPTIONS.find((s) => s.id === config.subject)
  const chapterMeta = subjectMeta?.chapters.find((c) => c.id === config.chapter)

  const available = questions.filter((q) => q.status === 'available')
  const deleted = questions.filter((q) => q.status === 'deleted')
  const selected = available.filter((q) => q.selected)
  const totalMarks = selected.length * (details.marksPerQuestion || 0)

  const configValid =
    !!config.subject &&
    !!config.chapter &&
    config.numberOfQuestions > 0 &&
    config.numberOfQuestions <= 15 &&
    config.difficulties.length > 0 &&
    config.categories.length > 0

  const detailsValid =
    details.testName.trim().length > 0 &&
    details.durationMinutes > 0 &&
    details.marksPerQuestion > 0

  const canSubmit = detailsValid && selected.length > 0

  const handleGenerate = async (overrideConfig?: AIExamConfig, overrideCount?: number) => {
    const useConfig = overrideConfig ?? config
    if (
      !useConfig.subject ||
      !useConfig.chapter ||
      useConfig.difficulties.length === 0 ||
      useConfig.categories.length === 0
    ) {
      toast({
        title: 'Missing AI configuration',
        description: 'Pick subject, chapter, difficulty and at least one category.',
        variant: 'destructive',
      })
      return
    }
    setGenerating(true)
    await new Promise((r) => setTimeout(r, 700))
    const batchId = `b${Date.now()}`
    const batch: AIQuestionBatch = {
      id: batchId,
      index: batches.length + 1,
      createdAt: new Date().toISOString(),
      config: { ...useConfig },
    }
    const newQs = generateMockQuestions(
      useConfig,
      batchId,
      details.marksPerQuestion || 1,
      overrideCount,
    )
    setBatches((prev) => [...prev, batch])
    setQuestions((prev) => [...prev, ...newQs])
    setGenerating(false)
    toast({
      title: `Added ${newQs.length} new questions`,
      description: `Batch ${batch.index} appended.`,
    })
  }

  const handleToggleSelect = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, selected: !q.selected } : q)),
    )
  }

  const handleDelete = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: 'deleted', selected: false } : q)),
    )
  }

  const handleRestore = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: 'available', selected: true } : q)),
    )
  }

  const handleRegenerateOne = async (id: string) => {
    const target = questions.find((q) => q.id === id)
    if (!target) return
    const batch = batches.find((b) => b.id === target.batchId)
    if (!batch) return
    const [fresh] = generateMockQuestions(batch.config, batch.id, details.marksPerQuestion || 1, 1)
    if (!fresh) return
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id
          ? {
              ...fresh,
              id: q.id,
              serial: q.serial,
              selected: q.selected,
              status: q.status,
            }
          : q,
      ),
    )
    toast({ title: 'Question regenerated', description: `Q${target.serial} replaced.` })
  }

  const handleSelectAll = (checked: boolean) => {
    setQuestions((prev) =>
      prev.map((q) => (q.status === 'available' ? { ...q, selected: checked } : q)),
    )
  }

  const handleCreateExam = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 600))
    const newId = `${Date.now()}`
    mockExamsData.unshift({
      id: newId,
      title: details.testName.trim(),
      category: 'Subject Exam',
      duration: details.durationMinutes,
      marksPerQuestion: details.marksPerQuestion,
      totalMarks: selected.length * details.marksPerQuestion,
      passPercentage: 40,
      negativeMark: details.negativeMarkingPct,
      examType: details.examType,
      instructionId: details.instructionId || undefined,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date().toISOString().slice(0, 10),
      startTime: '09:00',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questionCount: selected.length,
      batchCount: 0,
    })
    setSubmitting(false)
    toast({
      title: 'Exam created',
      description: `"${details.testName}" added with ${selected.length} questions.`,
    })
    navigate('/teacher/exams')
  }

  const filteredBatches = useMemo(() => {
    return batches.map((batch) => {
      const all = questions.filter((q) => q.batchId === batch.id)
      const visible = all.filter((q) => {
        if (filter === 'active') return q.status === 'available'
        if (filter === 'selected') return q.status === 'available' && q.selected
        return q.status === 'deleted'
      })
      return { batch, visible, total: all.length }
    })
  }, [batches, questions, filter])

  const feedHasAny = questions.length > 0

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 pb-28">
        {/* Top header */}
        <div className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur-md">
          <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/teacher/exams')}
                className="shrink-0"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-lg font-semibold text-slate-900 truncate">
                    AI Exam Generator
                  </h1>
                  <p className="text-xs text-slate-500 truncate">
                    Configure once, generate, refine and create — all in one place.
                  </p>
                </div>
              </div>
            </div>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as FeedFilter)} className="hidden md:block">
              <TabsList className="bg-slate-100">
                <TabsTrigger value="active" className="text-xs px-3">
                  Active <span className="ml-1 font-bold">{available.length}</span>
                </TabsTrigger>
                <TabsTrigger value="selected" className="text-xs px-3">
                  Selected <span className="ml-1 font-bold">{selected.length}</span>
                </TabsTrigger>
                <TabsTrigger value="deleted" className="text-xs px-3">
                  Deleted <span className="ml-1 font-bold">{deleted.length}</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Horizontal config strip */}
        <div className="sticky top-[57px] z-30 border-b bg-white shadow-[0_1px_0_rgba(0,0,0,0.02)]">
          <div className="px-4 sm:px-6 py-3 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            {/* Exam name + duration */}
            <div className="md:col-span-4 space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Exam Name & Duration
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Chemistry – Electrolysis Quiz"
                  value={details.testName}
                  onChange={(e) => setDetails({ ...details, testName: e.target.value })}
                  className="h-9 text-sm flex-1"
                />
                <div className="relative">
                  <Input
                    type="number"
                    min={1}
                    value={details.durationMinutes}
                    onChange={(e) =>
                      setDetails({ ...details, durationMinutes: Number(e.target.value) || 0 })
                    }
                    className="h-9 text-sm w-20 pr-7 text-center"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                    min
                  </span>
                </div>
              </div>
            </div>

            {/* Subject + Chapter */}
            <div className="md:col-span-3 space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Subject & Chapter
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={config.subject}
                  onValueChange={(v) =>
                    setConfig({ ...config, subject: v, chapter: '', topics: [] })
                  }
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECT_OPTIONS.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={config.chapter}
                  onValueChange={(v) => setConfig({ ...config, chapter: v, topics: [] })}
                  disabled={!subjectMeta}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder={subjectMeta ? 'Chapter' : 'Pick subject'} />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectMeta?.chapters.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Difficulty pills */}
            <div className="md:col-span-2 space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Difficulty
              </Label>
              <div className="flex gap-1">
                {DIFFICULTY_OPTIONS.map((d) => {
                  const active = config.difficulties.includes(d.value)
                  return (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() =>
                        setConfig({
                          ...config,
                          difficulties: active
                            ? config.difficulties.filter((x) => x !== d.value)
                            : [...config.difficulties, d.value],
                        })
                      }
                      className={cn(
                        'flex-1 h-9 text-xs font-medium rounded-md border transition',
                        active
                          ? d.active
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50',
                      )}
                    >
                      {d.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Qty */}
            <div className="md:col-span-1 space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Qty
              </Label>
              <Input
                type="number"
                min={1}
                max={15}
                value={config.numberOfQuestions}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    numberOfQuestions: Math.max(1, Math.min(15, Number(e.target.value) || 1)),
                  })
                }
                className="h-9 text-sm text-center"
              />
            </div>

            {/* Generate + Advanced */}
            <div className="md:col-span-2 flex gap-2">
              <Button
                onClick={() => handleGenerate()}
                disabled={generating || !configValid}
                className="flex-1 h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    Generating
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-1.5" />
                    Generate
                  </>
                )}
              </Button>
              <AdvancedPopover
                details={details}
                onDetailsChange={setDetails}
                config={config}
                onConfigChange={setConfig}
                chapterTopics={chapterMeta?.topics ?? []}
              />
            </div>
          </div>

          {!configValid && (
            <div className="px-4 sm:px-6 pb-2 -mt-1 text-[11px] text-amber-700 flex items-center gap-1.5">
              <AlertCircle className="h-3 w-3" />
              Pick subject, chapter, difficulty and a category to enable Generate.
            </div>
          )}
        </div>

        {/* Question feed */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          {/* Mobile filter */}
          <div className="md:hidden mb-4">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as FeedFilter)}>
              <TabsList className="w-full bg-slate-100">
                <TabsTrigger value="active" className="flex-1 text-xs">
                  Active ({available.length})
                </TabsTrigger>
                <TabsTrigger value="selected" className="flex-1 text-xs">
                  Selected ({selected.length})
                </TabsTrigger>
                <TabsTrigger value="deleted" className="flex-1 text-xs">
                  Deleted ({deleted.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {!feedHasAny ? (
            <EmptyState
              hasConfig={configValid}
              onGenerate={() => handleGenerate()}
              generating={generating}
            />
          ) : (
            <div className="space-y-8">
              {/* Bulk actions row */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <Checkbox
                    checked={available.length > 0 && selected.length === available.length}
                    onCheckedChange={(v) => handleSelectAll(!!v)}
                  />
                  Select all ({selected.length}/{available.length})
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAnswers((s) => !s)}
                  className="h-8"
                >
                  {showAnswers ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5 mr-1.5" />
                      Hide answers
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5 mr-1.5" />
                      Show answers
                    </>
                  )}
                </Button>
              </div>

              {filteredBatches.map(({ batch, visible }) => {
                if (visible.length === 0) return null
                return (
                  <section key={batch.id} className="space-y-3">
                    <BatchDivider batch={batch} count={visible.length} />
                    <div className="space-y-3">
                      {visible.map((q) =>
                        q.status === 'deleted' ? (
                          <DeletedQuestionRow key={q.id} q={q} onRestore={handleRestore} />
                        ) : (
                          <QuestionCard
                            key={q.id}
                            q={q}
                            showAnswer={showAnswers}
                            onToggleSelect={handleToggleSelect}
                            onDelete={handleDelete}
                            onRegenerate={handleRegenerateOne}
                          />
                        ),
                      )}
                    </div>
                    {filter !== 'deleted' && (
                      <div className="flex justify-center pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs text-slate-600 border-dashed"
                          disabled={generating}
                          onClick={() =>
                            handleGenerate(
                              batch.config,
                              Math.min(5, batch.config.numberOfQuestions),
                            )
                          }
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Generate {Math.min(5, batch.config.numberOfQuestions)} more in this batch
                        </Button>
                      </div>
                    )}
                  </section>
                )
              })}

              {filteredBatches.every(({ visible }) => visible.length === 0) && (
                <div className="text-center py-12 text-sm text-slate-500">
                  {filter === 'selected'
                    ? 'No questions selected yet.'
                    : filter === 'deleted'
                      ? 'Nothing deleted.'
                      : 'No active questions.'}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Sticky footer */}
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white/95 backdrop-blur">
          <div className="px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <FooterStat label="Total" value={questions.length} tone="text-slate-700" />
              <FooterStat label="Selected" value={selected.length} tone="text-blue-600" />
              <FooterStat label="Marks" value={totalMarks} tone="text-emerald-600" />
              {!detailsValid && (
                <span className="text-xs text-amber-600 inline-flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Add test name, duration and marks
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate('/teacher/exams')}
                className="flex-1 sm:flex-initial"
              >
                Cancel
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex-1 sm:flex-initial">
                    <Button
                      onClick={handleCreateExam}
                      disabled={!canSubmit || submitting}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating…
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Create Exam
                        </>
                      )}
                    </Button>
                  </span>
                </TooltipTrigger>
                {!canSubmit && (
                  <TooltipContent>
                    {selected.length === 0
                      ? 'Select at least one question.'
                      : 'Fill in test name, duration and marks per question.'}
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

/* ----------------------- Advanced Popover ----------------------- */

function AdvancedPopover({
  details,
  onDetailsChange,
  config,
  onConfigChange,
  chapterTopics,
}: {
  details: TestDetails
  onDetailsChange: (d: TestDetails) => void
  config: AIExamConfig
  onConfigChange: (c: AIExamConfig) => void
  chapterTopics: string[]
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" title="Advanced">
          <Settings2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[420px] max-h-[70vh] overflow-y-auto">
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Test Details
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Marks / Q">
                <Input
                  type="number"
                  min={1}
                  value={details.marksPerQuestion}
                  onChange={(e) =>
                    onDetailsChange({
                      ...details,
                      marksPerQuestion: Number(e.target.value) || 0,
                    })
                  }
                />
              </Field>
              <Field label="Negative %">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={details.negativeMarkingPct}
                  onChange={(e) =>
                    onDetailsChange({
                      ...details,
                      negativeMarkingPct: Number(e.target.value) || 0,
                    })
                  }
                />
              </Field>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-2">
              <Field label="Exam Type">
                <Select
                  value={details.examType}
                  onValueChange={(v) =>
                    onDetailsChange({ ...details, examType: v as TestDetails['examType'] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAM_TYPE_OPTIONS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Test Instructions">
                <Select
                  value={details.instructionId || 'none'}
                  onValueChange={(v) =>
                    onDetailsChange({ ...details, instructionId: v === 'none' ? '' : v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No instructions</SelectItem>
                    {mockInstructions.map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              AI Configuration
            </h4>
            <Field label="Question Type">
              <Select
                value={config.questionType}
                onValueChange={(v) =>
                  onConfigChange({ ...config, questionType: v as AIExamConfig['questionType'] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="mt-2">
              <Field label="Topics (optional)">
                <div className="flex flex-wrap gap-1.5 min-h-[44px] p-2 rounded-md border bg-white">
                  {chapterTopics.length === 0 ? (
                    <span className="text-xs text-slate-400 self-center">
                      Pick a chapter first
                    </span>
                  ) : (
                    chapterTopics.map((t) => {
                      const active = config.topics.includes(t)
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() =>
                            onConfigChange({
                              ...config,
                              topics: active
                                ? config.topics.filter((x) => x !== t)
                                : [...config.topics, t],
                            })
                          }
                          className={cn(
                            'text-xs px-2.5 py-1 rounded-full border transition',
                            active
                              ? 'bg-violet-100 border-violet-300 text-violet-700'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100',
                          )}
                        >
                          {t}
                        </button>
                      )
                    })
                  )}
                </div>
              </Field>
            </div>

            <div className="mt-2">
              <Field label="Categories">
                <div className="grid grid-cols-2 gap-2">
                  {QUESTION_CATEGORIES.map((c) => {
                    const active = config.categories.includes(c)
                    return (
                      <label
                        key={c}
                        className={cn(
                          'flex items-center gap-2 px-2.5 py-1.5 rounded-md border text-xs cursor-pointer transition',
                          active
                            ? 'bg-violet-50 border-violet-300 text-violet-700'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50',
                        )}
                      >
                        <Checkbox
                          checked={active}
                          onCheckedChange={() =>
                            onConfigChange({
                              ...config,
                              categories: active
                                ? config.categories.filter((x) => x !== c)
                                : [...config.categories, c],
                            })
                          }
                        />
                        {c}
                      </label>
                    )
                  })}
                </div>
              </Field>
            </div>

            <div className="mt-2">
              <Field label="Custom Prompt">
                <Textarea
                  rows={3}
                  placeholder="e.g. Class 12 CBSE – exam-style, no trick wording"
                  value={config.customInstructions}
                  onChange={(e) =>
                    onConfigChange({ ...config, customInstructions: e.target.value })
                  }
                />
              </Field>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

/* ----------------------- Sub-components ----------------------- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] font-medium text-slate-600">{label}</Label>
      {children}
    </div>
  )
}

function FooterStat({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: string
}) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <span className={cn('text-lg font-bold leading-none mt-0.5', tone)}>{value}</span>
    </div>
  )
}

function BatchDivider({ batch, count }: { batch: AIQuestionBatch; count: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-slate-200" />
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm">
        <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700">
          Batch {batch.index}
        </span>
        <span className="text-[10px] text-slate-400">·</span>
        <span className="text-[10px] text-slate-600">{count} Qs</span>
        <span className="text-[10px] text-slate-400">·</span>
        <span className="text-[10px] text-slate-600 capitalize">
          {batch.config.difficulties.join(', ') || 'mixed'}
        </span>
        <span className="text-[10px] text-slate-400">·</span>
        <span className="text-[10px] text-slate-600">
          {batch.config.categories.slice(0, 2).join(', ') || 'mixed'}
        </span>
      </div>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  )
}

function QuestionCard({
  q,
  showAnswer,
  onToggleSelect,
  onDelete,
  onRegenerate,
}: {
  q: GeneratedQuestion
  showAnswer: boolean
  onToggleSelect: (id: string) => void
  onDelete: (id: string) => void
  onRegenerate: (id: string) => void
}) {
  const diffColor =
    q.difficulty === 'easy'
      ? 'bg-green-50 text-green-700 border-green-200'
      : q.difficulty === 'medium'
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : 'bg-rose-50 text-rose-700 border-rose-200'

  return (
    <Card
      className={cn(
        'group p-4 sm:p-5 transition border',
        q.selected
          ? 'border-blue-200 ring-1 ring-blue-100 bg-white'
          : 'border-slate-200 bg-white hover:border-slate-300',
      )}
    >
      <div className="flex items-start gap-3">
        {/* Left: checkbox + serial */}
        <div className="flex flex-col items-center gap-2 pt-0.5">
          <Checkbox
            checked={q.selected}
            onCheckedChange={() => onToggleSelect(q.id)}
            aria-label={`Select question ${q.serial}`}
          />
          <span className="text-[10px] font-bold text-slate-400">Q{q.serial}</span>
        </div>

        {/* Right: content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <Badge variant="outline" className={cn('text-[10px] uppercase font-semibold', diffColor)}>
              {q.difficulty}
            </Badge>
            <Badge
              variant="outline"
              className="text-[10px] bg-violet-50 text-violet-700 border-violet-200"
            >
              {q.category}
            </Badge>
            <Badge
              variant="outline"
              className="text-[10px] bg-slate-50 text-slate-600 border-slate-200"
            >
              {q.topic}
            </Badge>
            <span className="text-[11px] text-slate-400 ml-auto">
              {q.marks} marks · {q.estimatedMinutes} min
            </span>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 min-w-0">
              <MathText
                text={q.questionText}
                className="block text-sm text-slate-800 leading-relaxed mb-3"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((o, idx) => {
                  const isCorrect = showAnswer && idx === q.correctAnswerIndex
                  return (
                    <div
                      key={o.label}
                      className={cn(
                        'flex items-start gap-2 px-3 py-2 rounded-md border text-xs',
                        isCorrect
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-slate-50 border-slate-200 text-slate-700',
                      )}
                    >
                      <span
                        className={cn(
                          'shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold',
                          isCorrect
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border border-slate-300 text-slate-500',
                        )}
                      >
                        {o.label}
                      </span>
                      <MathText text={o.text} className="leading-tight pt-0.5" />
                    </div>
                  )
                })}
              </div>

              {showAnswer && q.explanation && (
                <div className="mt-3 p-2.5 bg-amber-50/60 border border-amber-100 rounded-md">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block mb-1">
                    Explanation
                  </span>
                  <MathText text={q.explanation} className="text-xs text-amber-900 leading-relaxed" />
                </div>
              )}
            </div>

            {q.diagramSvg && (
              <div className="shrink-0 hidden sm:block">
                <div
                  className="w-32 h-24 rounded-md overflow-hidden border bg-slate-50"
                  dangerouslySetInnerHTML={{ __html: q.diagramSvg }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-violet-600"
            onClick={() => onRegenerate(q.id)}
            title="Regenerate"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-rose-600"
            onClick={() => onDelete(q.id)}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

function DeletedQuestionRow({
  q,
  onRestore,
}: {
  q: GeneratedQuestion
  onRestore: (id: string) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-dashed border-rose-200 bg-rose-50/40 px-3 py-2">
      <div className="min-w-0 flex items-center gap-2">
        <Trash2 className="h-3.5 w-3.5 text-rose-400 shrink-0" />
        <span className="text-xs text-slate-500 shrink-0">Q{q.serial} · Deleted</span>
        <MathText text={q.questionText} className="text-xs text-slate-600 truncate" />
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs text-rose-600 hover:text-rose-700"
        onClick={() => onRestore(q.id)}
      >
        <Undo2 className="h-3.5 w-3.5 mr-1" />
        Restore
      </Button>
    </div>
  )
}

function EmptyState({
  hasConfig,
  onGenerate,
  generating,
}: {
  hasConfig: boolean
  onGenerate: () => void
  generating: boolean
}) {
  return (
    <div className="px-6 py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mb-4">
        <Sparkles className="h-7 w-7 text-violet-600" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">No questions yet</h3>
      <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
        Pick subject, chapter, difficulty in the strip above and hit Generate. Each click
        appends a new batch — nothing you keep gets removed.
      </p>
      <Button
        onClick={onGenerate}
        disabled={!hasConfig || generating}
        className="mt-5 bg-blue-600 hover:bg-blue-700 text-white"
      >
        {generating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating…
          </>
        ) : (
          <>
            <Plus className="h-4 w-4 mr-2" />
            Generate first batch
          </>
        )}
      </Button>
      {!hasConfig && (
        <p className="mt-3 text-xs text-slate-400">
          Finish the config strip above to enable this.
        </p>
      )}
    </div>
  )
}
