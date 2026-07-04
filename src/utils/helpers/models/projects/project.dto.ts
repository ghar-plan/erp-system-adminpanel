export interface Project {
  id: string;
  siteName: string;
  region: string;
  subregion: string;
  mediaId?: string | null;
  media?: {
    id: string;
    url: string;
  } | null;
  created_at: string;
}

export class ProjectDTO {
  id: string = "";
  siteName: string = "";
  region: string = "";
  subregion: string = "";
  mediaId?: string | null = null;
  media?: {
    id: string;
    url: string;
  } | null = null;
  created_at: string = "";
}
