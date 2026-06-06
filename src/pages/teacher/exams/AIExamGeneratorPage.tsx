import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Sparkles,
  BookOpen,
  Hash,
  Filter,
  GraduationCap,
  Trash2,
  RotateCcw,
  Eye,
  EyeOff,
  CheckCircle2,
  Plus,
  Loader2,
  AlertCircle,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
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
import type {
  AIExamConfig,
  AIQuestionBatch,
  DifficultyLevel,
  GeneratedQuestion,
  TestDetails,
} from '@/types/aiExamGenerator'

const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string; color: string }[] = [
  { value: 'easy', label: 'Easy', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'hard', label: 'Hard', color: 'bg-rose-100 text-rose-700 border-rose-200' },
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
  difficulties: [],
  questionType: 'single',
  categories: [],
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

export default function AIExamGeneratorPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [details, setDetails] = useState<TestDetails>(initialDetails)
  const [config, setConfig] = useState<AIExamConfig>(initialConfig)
  const [batches, setBatches] = useState<AIQuestionBatch[]>([])
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([])
  const [showAnswers, setShowAnswers] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(true)
  const [configOpen, setConfigOpen] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const subjectMeta = SUBJECT_OPTIONS.find((s) => s.id === config.subject)
  const chapterMeta = subjectMeta?.chapters.find((c) => c.id === config.chapter)
  const availableTopics = chapterMeta?.topics ?? []

  const available = questions.filter((q) => q.status === 'available')
  const deleted = questions.filter((q) => q.status === 'deleted')
  const selected = available.filter((q) => q.selected)
  const totalMarks = selected.reduce((sum, q) => sum + (details.marksPerQuestion || 0), 0)

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

  const handleGenerate = async () => {
    if (!configValid) {
      toast({
        title: 'Missing AI configuration',
        description:
          'Pick a subject, chapter, difficulty, category and a valid number of questions (1\u201315).',
        variant: 'destructive',
      })
      return
    }
    setGenerating(true)
    await new Promise((r) => setTimeout(r, 800))
    const batchId = `b${Date.now()}`
    const batch: AIQuestionBatch = {
      id: batchId,
      index: batches.length + 1,
      createdAt: new Date().toISOString(),
      config: { ...config },
    }
    const newQs = generateMockQuestions(config, batchId, details.marksPerQuestion || 1)
    setBatches((prev) => [...prev, batch])
    setQuestions((prev) => [...prev, ...newQs])
    setGenerating(false)
    toast({
      title: `Added ${newQs.length} new questions`,
      description: `Batch ${batch.index} appended. You can refine your config and generate more.`,
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

  const handleRegenerateDeleted = async () => {
    if (deleted.length === 0) return
    // For each deleted, generate a fresh replacement using the original batch config
    const replacements: GeneratedQuestion[] = []
    deleted.forEach((d) => {
      const batch = batches.find((b) => b.id === d.batchId)
      if (!batch) return
      const [fresh] = generateMockQuestions(batch.config, batch.id, details.marksPerQuestion || 1, 1)
      if (fresh) replacements.push({ ...fresh, id: d.id, serial: d.serial })
    })
    setQuestions((prev) =>
      prev.map((q) => {
        const repl = replacements.find((r) => r.id === q.id)
        return repl ? { ...repl, status: 'available', selected: true } : q
      }),
    )
    toast({
      title: 'Deleted questions regenerated',
      description: `${replacements.length} replacements added back to your list.`,
    })
  }

  const handleSelectAll = (checked: boolean) => {
    setQuestions((prev) =>
      prev.map((q) => (q.status === 'available' ? { ...q, selected: checked } : q)),
    )
  }

  const handleResetConfig = () => {
    setConfig(initialConfig)
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

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 pb-32">
        {/* Header */}
        <div className="sticky top-0 z-30 border-b bg-white/85 backdrop-blur-md">
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
                    Configure once, generate questions, refine, and create the exam in one place.
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <CounterChip label="Available" value={available.length} tone="slate" />
              <CounterChip label="Selected" value={selected.length} tone="blue" />
              <CounterChip label="Marks" value={totalMarks} tone="green" />
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* LEFT PANE */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-4">
              {/* Test Details */}
              <SectionCard
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                icon={<GraduationCap className="h-4 w-4 text-blue-600" />}
                title="Test Details"
                subtitle="Name, duration, marks and exam type"
                accent="from-blue-50 to-blue-50/30 border-blue-100"
                complete={detailsValid}
              >
                <div className="space-y-4">
                  <Field label="Test Name" required>
                    <Input
                      placeholder="e.g. Chemistry \u2013 Electrolysis Quiz"
                      value={details.testName}
                      onChange={(e) => setDetails({ ...details, testName: e.target.value })}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Duration (min)" required>
                      <Input
                        type="number"
                        min={1}
                        value={details.durationMinutes}
                        onChange={(e) =>
                          setDetails({
                            ...details,
                            durationMinutes: Number(e.target.value) || 0,
                          })
                        }
                      />
                    </Field>
                    <Field label="Marks / Question" required>
                      <Input
                        type="number"
                        min={1}
                        value={details.marksPerQuestion}
                        onChange={(e) =>
                          setDetails({
                            ...details,
                            marksPerQuestion: Number(e.target.value) || 0,
                          })
                        }
                      />
                    </Field>
                  </div>
                  <Field
                    label="Negative Marking (%)"
                    hint="Deducted for wrong answers (0\u2013100)"
                  >
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={details.negativeMarkingPct}
                      onChange={(e) =>
                        setDetails({
                          ...details,
                          negativeMarkingPct: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </Field>
                  <Field label="Exam Type" required>
                    <Select
                      value={details.examType}
                      onValueChange={(v) =>
                        setDetails({ ...details, examType: v as TestDetails['examType'] })
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
                        setDetails({ ...details, instructionId: v === 'none' ? '' : v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select instructions (optional)" />
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
              </SectionCard>

              {/* AI Configuration */}
              <SectionCard
                open={configOpen}
                onOpenChange={setConfigOpen}
                icon={<BookOpen className="h-4 w-4 text-violet-600" />}
                title="AI Configuration"
                subtitle="What kind of questions should AI generate?"
                accent="from-violet-50 to-purple-50/40 border-violet-100"
                complete={configValid}
                action={
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetConfig}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Reset
                  </Button>
                }
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Subject" required>
                      <Select
                        value={config.subject}
                        onValueChange={(v) =>
                          setConfig({ ...config, subject: v, chapter: '', topics: [] })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {SUBJECT_OPTIONS.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Chapter" required>
                      <Select
                        value={config.chapter}
                        onValueChange={(v) => setConfig({ ...config, chapter: v, topics: [] })}
                        disabled={!subjectMeta}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={subjectMeta ? 'Choose chapter' : 'Select subject first'}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {subjectMeta?.chapters.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>

                  <Field
                    label="Topics"
                    hint={
                      chapterMeta
                        ? 'Pick one or more (leave empty to cover all)'
                        : 'Select a chapter to see topics'
                    }
                  >
                    <div className="flex flex-wrap gap-2 min-h-[44px] p-2 rounded-md border bg-white">
                      {availableTopics.length === 0 ? (
                        <span className="text-xs text-slate-400 self-center px-1">
                          No topics yet
                        </span>
                      ) : (
                        availableTopics.map((t) => {
                          const active = config.topics.includes(t)
                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() =>
                                setConfig({
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field
                      label="Number of Questions"
                      required
                      hint="1\u201315 per generation"
                    >
                      <Input
                        type="number"
                        min={1}
                        max={15}
                        value={config.numberOfQuestions}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            numberOfQuestions: Math.max(
                              1,
                              Math.min(15, Number(e.target.value) || 1),
                            ),
                          })
                        }
                      />
                    </Field>
                    <Field label="Question Type" required>
                      <Select
                        value={config.questionType}
                        onValueChange={(v) =>
                          setConfig({ ...config, questionType: v as AIExamConfig['questionType'] })
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
                  </div>

                  <Field label="Difficulty" required>
                    <div className="flex flex-wrap gap-2">
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
                              'text-xs px-3 py-1.5 rounded-full border transition font-medium',
                              active
                                ? d.color
                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50',
                            )}
                          >
                            {d.label}
                          </button>
                        )
                      })}
                    </div>
                  </Field>

                  <Field label="Question Category" required>
                    <div className="grid grid-cols-2 gap-2">
                      {QUESTION_CATEGORIES.map((c) => {
                        const active = config.categories.includes(c)
                        return (
                          <label
                            key={c}
                            className={cn(
                              'flex items-center gap-2 px-3 py-2 rounded-md border text-sm cursor-pointer transition',
                              active
                                ? 'bg-violet-50 border-violet-300 text-violet-700'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50',
                            )}
                          >
                            <Checkbox
                              checked={active}
                              onCheckedChange={() =>
                                setConfig({
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

                  <Field
                    label="Custom Instructions"
                    hint="Add class, board or any specific guidance for the AI"
                  >
                    <Textarea
                      rows={3}
                      placeholder="e.g. Class 12 CBSE \u2013 keep questions exam-style and avoid trick wording"
                      value={config.customInstructions}
                      onChange={(e) =>
                        setConfig({ ...config, customInstructions: e.target.value })
                      }
                    />
                  </Field>
                </div>
              </SectionCard>

              {/* Generate action */}
              <div className="lg:sticky lg:bottom-24">
                <Button
                  onClick={handleGenerate}
                  disabled={generating || !configValid}
                  className="w-full h-12 text-base bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-md"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating\u2026
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      {questions.length === 0
                        ? `Generate ${config.numberOfQuestions} Questions`
                        : `Add ${config.numberOfQuestions} More Questions`}
                    </>
                  )}
                </Button>
                {!configValid && (
                  <p className="mt-2 text-xs text-slate-500 flex items-start gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 mt-0.5 text-amber-500" />
                    Pick subject, chapter, difficulty and at least one category to enable
                    generation.
                  </p>
                )}
              </div>
            </div>

            {/* RIGHT PANE */}
            <div className="lg:col-span-7 xl:col-span-8">
              <Card className="border-slate-200">
                <CardHeader className="pb-3 border-b">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Hash className="h-4 w-4 text-slate-500" />
                        Generated Questions
                      </CardTitle>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Each generation appends below. Select what you want, delete the rest.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAnswers((s) => !s)}
                        disabled={available.length === 0}
                      >
                        {showAnswers ? (
                          <>
                            <EyeOff className="h-3.5 w-3.5 mr-1.5" />
                            Hide Answers
                          </>
                        ) : (
                          <>
                            <Eye className="h-3.5 w-3.5 mr-1.5" />
                            Show Answers
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRegenerateDeleted}
                        disabled={deleted.length === 0}
                      >
                        <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                        Regenerate Deleted ({deleted.length})
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <StatPill label="Total" value={questions.length} color="text-slate-700" />
                    <StatPill label="Available" value={available.length} color="text-emerald-600" />
                    <StatPill label="Selected" value={selected.length} color="text-blue-600" />
                    <StatPill
                      label="Deleted"
                      value={deleted.length}
                      color="text-rose-600"
                    />
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {available.length === 0 && deleted.length === 0 ? (
                    <EmptyState
                      hasConfig={configValid}
                      onGenerate={handleGenerate}
                      generating={generating}
                    />
                  ) : (
                    <div>
                      {/* Bulk row */}
                      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-slate-50/50">
                        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                          <Checkbox
                            checked={
                              available.length > 0 &&
                              selected.length === available.length
                            }
                            onCheckedChange={(v) => handleSelectAll(!!v)}
                          />
                          Select all ({selected.length}/{available.length})
                        </label>
                        <span className="text-xs text-slate-500">
                          {batches.length} {batches.length === 1 ? 'batch' : 'batches'} generated
                        </span>
                      </div>

                      {/* Batches */}
                      <div className="divide-y">
                        {batches.map((batch) => {
                          const batchQs = questions.filter(
                            (q) => q.batchId === batch.id && q.status === 'available',
                          )
                          const batchDeleted = questions.filter(
                            (q) => q.batchId === batch.id && q.status === 'deleted',
                          )
                          if (batchQs.length === 0 && batchDeleted.length === 0) return null
                          return (
                            <div key={batch.id} className="py-3">
                              <BatchHeader batch={batch} count={batchQs.length} />
                              <div className="px-4 space-y-3 mt-2">
                                {batchQs.map((q) => (
                                  <QuestionCard
                                    key={q.id}
                                    question={q}
                                    showAnswer={showAnswers}
                                    onToggleSelect={handleToggleSelect}
                                    onDelete={handleDelete}
                                    onRegenerate={handleRegenerateOne}
                                  />
                                ))}
                                {batchDeleted.map((q) => (
                                  <DeletedQuestionRow
                                    key={q.id}
                                    question={q}
                                    onRestore={handleRestore}
                                  />
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Sticky submit bar */}
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-white/95 backdrop-blur">
          <div className="px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <Badge variant="outline" className="font-normal">
                {selected.length} selected
              </Badge>
              <Badge variant="outline" className="font-normal">
                {totalMarks} marks
              </Badge>
              <Badge variant="outline" className="font-normal">
                {details.durationMinutes} min
              </Badge>
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
                          Creating\u2026
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

/* ---------------- Sub-components ---------------- */

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-slate-500">{hint}</p>}
    </div>
  )
}

function SectionCard({
  open,
  onOpenChange,
  icon,
  title,
  subtitle,
  accent,
  complete,
  action,
  children,
}: {
  open: boolean
  onOpenChange: (b: boolean) => void
  icon: React.ReactNode
  title: string
  subtitle: string
  accent: string
  complete: boolean
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Card
      className={cn(
        'overflow-hidden border bg-gradient-to-br',
        accent,
      )}
    >
      <Collapsible open={open} onOpenChange={onOpenChange}>
        <div className="flex items-center justify-between px-4 py-3">
          <CollapsibleTrigger className="flex items-center gap-3 text-left flex-1 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-white border flex items-center justify-center shrink-0">
              {icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900 truncate">{title}</h3>
                {complete && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
              </div>
              <p className="text-xs text-slate-500 truncate">{subtitle}</p>
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-slate-400 ml-2 shrink-0 transition-transform',
                open && 'rotate-180',
              )}
            />
          </CollapsibleTrigger>
          {action}
        </div>
        <CollapsibleContent>
          <div className="px-4 pb-4 pt-1 bg-white/60 border-t">{children}</div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

function CounterChip({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'slate' | 'blue' | 'green'
}) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-emerald-100 text-emerald-700',
  }
  return (
    <div
      className={cn(
        'px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5',
        tones[tone],
      )}
    >
      <span>{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  )
}

function StatPill({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div className="border rounded-md bg-white px-3 py-2 flex items-center justify-between">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={cn('text-base font-bold', color)}>{value}</span>
    </div>
  )
}

function BatchHeader({
  batch,
  count,
}: {
  batch: AIQuestionBatch
  count: number
}) {
  const time = new Date(batch.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
  return (
    <div className="px-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
      <span className="px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 font-medium border border-violet-100">
        Batch {batch.index}
      </span>
      <span>{count} questions</span>
      <span>\u00b7</span>
      <span className="capitalize">
        {batch.config.difficulties.join(', ') || 'mixed'}
      </span>
      <span>\u00b7</span>
      <span>{batch.config.categories.slice(0, 2).join(', ') || 'mixed'}</span>
      <span>\u00b7</span>
      <span>{time}</span>
    </div>
  )
}

function QuestionCard({
  question,
  showAnswer,
  onToggleSelect,
  onDelete,
  onRegenerate,
}: {
  question: GeneratedQuestion
  showAnswer: boolean
  onToggleSelect: (id: string) => void
  onDelete: (id: string) => void
  onRegenerate: (id: string) => void
}) {
  const diffColor =
    question.difficulty === 'easy'
      ? 'bg-green-100 text-green-700 border-green-200'
      : question.difficulty === 'medium'
        ? 'bg-amber-100 text-amber-700 border-amber-200'
        : 'bg-rose-100 text-rose-700 border-rose-200'
  return (
    <div
      className={cn(
        'rounded-lg border bg-white p-3.5 transition',
        question.selected ? 'border-blue-200 ring-1 ring-blue-100' : 'border-slate-200',
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={question.selected}
          onCheckedChange={() => onToggleSelect(question.id)}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <Badge variant="outline" className="text-[10px] font-medium bg-slate-50">
              Q{question.serial}
            </Badge>
            <Badge variant="outline" className={cn('text-[10px] uppercase', diffColor)}>
              {question.difficulty}
            </Badge>
            <Badge variant="outline" className="text-[10px] bg-violet-50 text-violet-700 border-violet-100">
              {question.category}
            </Badge>
            <span className="text-[11px] text-slate-500 ml-auto">
              {question.marks} marks \u00b7 {question.estimatedMinutes} min
            </span>
          </div>
          <p className="text-sm text-slate-800 mb-2.5">{question.questionText}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {question.options.map((o, idx) => {
              const isCorrect = showAnswer && idx === question.correctAnswerIndex
              return (
                <div
                  key={o.label}
                  className={cn(
                    'text-xs px-2.5 py-1.5 rounded-md border',
                    isCorrect
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-700',
                  )}
                >
                  <span className="font-semibold mr-1">{o.label}.</span>
                  {o.text}
                </div>
              )
            })}
          </div>
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-violet-600"
            onClick={() => onRegenerate(question.id)}
            title="Regenerate"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-rose-600"
            onClick={() => onDelete(question.id)}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function DeletedQuestionRow({
  question,
  onRestore,
}: {
  question: GeneratedQuestion
  onRestore: (id: string) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-dashed border-rose-200 bg-rose-50/40 px-3 py-2">
      <div className="min-w-0 flex items-center gap-2">
        <Trash2 className="h-3.5 w-3.5 text-rose-400 shrink-0" />
        <span className="text-xs text-slate-500 shrink-0">Q{question.serial} \u00b7 Deleted</span>
        <span className="text-xs text-slate-600 truncate">\u2014 {question.questionText}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs text-rose-600 hover:text-rose-700"
        onClick={() => onRestore(question.id)}
      >
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
    <div className="px-6 py-14 text-center">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mb-4">
        <Sparkles className="h-7 w-7 text-violet-600" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">No questions yet</h3>
      <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
        Configure the AI on the left and click Generate. Each click appends a new batch \u2014
        nothing you keep gets removed.
      </p>
      <Button
        onClick={onGenerate}
        disabled={!hasConfig || generating}
        className="mt-5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
      >
        {generating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating\u2026
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
          Finish the AI Configuration on the left to enable this.
        </p>
      )}
    </div>
  )
}

/* unused imports filter */
void Filter
