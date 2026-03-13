export enum HabitFrequency {
  Daily = 'daily',
  Weekly = 'weekly',
  Custom = 'custom',
}

export enum HabitLogStatus {
  Done = 'done',
  DoneLater = 'done_later',
  Skipped = 'skipped',
}

export interface HabitVersion {
  id: string
  habit_id: string
  user_id: string
  frequency: HabitFrequency
  custom_days: number[] | null
  valid_from: string
  valid_to: string | null
}

export interface HabitRow {
  id: string
  user_id: string
  archived_at: string | null
}

export interface HabitLogRow {
  habit_id: string
  log_date: string
}

export interface SkipLogInsert {
  user_id: string
  habit_id: string
  habit_version_id: string
  log_date: string
  completed: false
  status: HabitLogStatus.Skipped
  note: null
  updated_at: string
}
