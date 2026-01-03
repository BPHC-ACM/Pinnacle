export interface CreateAnnouncementRequest {
  title: string;
  content: string;
}

export interface AnnouncementResponse {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  sender: {
    id: string;
    name: string;
    email: string;
  } | null;
}
