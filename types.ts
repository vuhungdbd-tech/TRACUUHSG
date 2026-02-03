
export interface StudentResult {
  id: string;
  full_name: string;
  sbd: string;
  cccd: string;
  school: string;
  subject: string;
  score: number;
  award: string;
}

export interface SearchParams {
  full_name: string;
  sbd: string;
  cccd: string;
}

export interface SiteConfig {
  header_top: string;
  header_sub: string;
  main_title: string;
  footer_copyright: string;
  footer_address: string;
  footer_support: string;
  favicon_url?: string;
}

export type ViewMode = 'search' | 'admin';

export interface AppConfig {
  examType: string;
  subject: string;
  grade: string | number;
  textbook: string;
  duration: number;
  cognitive: {
    nb: number;
    th: number;
    vd: number;
    vdc: number;
  };
  topics: string;
  structure: {
    multipleChoice: { count: number };
    trueFalse: { count: number };
    shortAnswer: { count: number };
    essay: { count: number };
  };
}
