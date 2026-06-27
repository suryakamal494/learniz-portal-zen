/** Centralised glossary for the Programs / Calendar Automation module.
 *  Keep terminology consistent across cards, headers and previews.
 */

export const PROGRAM_TOOLTIPS = {
  subjects: 'Number of subjects taught in this program.',
  chapters: 'Total chapters across all subjects in this program.',
  topics: 'Total teachable topics. Each topic gets its own period budget.',
  hours: 'Sum of periods across all topics in this program.',
  periods:
    'Total class periods in the academic window — working days multiplied by periods per day.',
  periodLength:
    'Length of one class period, in minutes. Sets the day length and per-period times.',
  topicHours: 'Periods allotted to this topic.',
  chapterRollup: 'Sum of all topic periods in this chapter.',
  subjectRollup: 'Sum of all chapter periods in this subject.',
  termWindow:
    'Calendar window when this program will be taught — derived from start date and working days.',
  topicDates:
    'Start and end calendar dates for this topic, computed by laying out topics across working days.',
  hoursFinalised:
    'When periods are fully allotted, the schedule can be generated. Unlock to edit again.',
  notScheduled:
    'No calendar has been generated yet. Allot all periods in Step 2, build the timetable in Step 3, then preview.',
} as const;

export type ProgramTooltipKey = keyof typeof PROGRAM_TOOLTIPS;

