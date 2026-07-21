export interface Project {
  id: string;
  siteName: string;
  region: string;
  subregion: string;
  startDate?: string | null;
  mediaId?: string | null;
  media?: {
    id: string;
    url: string;
  } | null;
  cashflowsIn?: any[];
  cashflowsOut?: any[];
  created_at: string;
}

export class ProjectDTO {
  id: string = "";
  siteName: string = "";
  region: string = "";
  subregion: string = "";
  startDate?: string | null = null;
  mediaId?: string | null = null;
  media?: {
    id: string;
    url: string;
  } | null = null;
  created_at: string = "";
}
