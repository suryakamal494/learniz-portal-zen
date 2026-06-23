/** Centralised glossary for the Programs / Calendar Automation module.
 *  Keep terminology consistent across cards, headers and previews.
 */

export const PROGRAM_TOOLTIPS = {
  subjects: 'Number of subjects taught in this program.',
  chapters: 'Total chapters across all subjects in this program.',
  topics: 'Total teachable topics. Each topic has its own hour budget.',
  hours: 'Sum of teaching hours across all topics in this program.',
  periods:
    'Hours converted to class periods using this program\u2019s period length. Periods = ceil(hours \u00d7 60 \u00f7 period length).',
  periodLength:
    'Length of one class period, in minutes. Used to convert teaching hours into period counts everywhere on this page.',
  topicHours: 'Teaching hours allotted to this single topic. Accepts 0.25 h increments.',
  chapterRollup: 'Sum of all topic hours in this chapter, and the periods they require.',
  subjectRollup: 'Sum of all chapter hours in this subject, and the periods they require.',
  termWindow:
    'Calendar window when this program will be taught \u2014 derived from the start date, working days and period length.',
  topicDates:
    'Start and end calendar dates for this topic, computed by laying out topics round-robin across working days.',
  hoursFinalised:
    'When hours are marked final, the schedule can be generated. Unlock to edit again.',
  notScheduled:
    'No calendar has been generated yet. Finalise hours and run the scheduler from the Schedule workspace.',
} as const;

export type ProgramTooltipKey = keyof typeof PROGRAM_TOOLTIPS;
