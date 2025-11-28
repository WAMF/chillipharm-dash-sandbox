export interface StudyArmData {
  arm: string;
  count: number;
  percentage: number;
}

export interface StudyEventData {
  event: string;
  count: number;
  reviewedCount: number;
  reviewRate: number;
}

export interface StudyProcedureData {
  procedure: string;
  count: number;
  sites: number;
  avgDuration: string;
}

export interface ProcedureLagData {
  procedure: string;
  avgLagDays: number;
  count: number;
}

export interface CommentStats {
  totalWithComments: number;
  commentRate: number;
  avgCommentLength: number;
  topCommenters: CommenterStat[];
}

export interface CommenterStat {
  name: string;
  commentCount: number;
}
