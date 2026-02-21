export interface UserProfile {
  countryCode: string
  countryName: string
  ageGroup: AgeGroup
  sessionId: string
}

export type AgeGroup = '0-12' | '13-17' | '18-24' | '25-34' | '35-44' | '45-54' | '55-64' | '65+'

export interface CountryStat {
  code: string
  name: Record<string, string>
  clicks: string
  percentage: number
}

export interface AgeGroupStat {
  group: AgeGroup
  clicks: string
  percentage: number
}

export interface GlobalStats {
  totalClicks: string
  clearThreshold: string
  isCleared: boolean
  clearedAt: string | null
  countries: CountryStat[]
  ageGroups: AgeGroupStat[]
}

export interface ClickResponse {
  success: boolean
  data?: {
    totalClicks: string
    isCleared: boolean
    clearedAt: string | null
    countryRank: number
    ageGroupRank: number
  }
  error?: {
    code: string
    message: string
    retryAfter?: number
  }
}

export interface Country {
  code: string
  name: Record<string, string>
}
