export interface AnnouncementSender {
  id: string;
  name: string;
  email: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  sender: AnnouncementSender;
}

export interface AnnouncementsResponse {
  status: string;
  data: {
    announcements: Announcement[];
    total: number;
    pages: number;
  };
}
