'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { announcementService } from '@/services/announcement.service';
import type { Announcement } from '@/types/announcement.types';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';

export default function AnnouncementsFeed() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  const lastAnnouncementElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        const response = await announcementService.getAnnouncements(page, 10);
        const newAnnouncements = response.data.announcements;

        setAnnouncements((prev) => {
          const existingIds = new Set(prev.map((a) => a.id));
          const uniqueNew = newAnnouncements.filter((a) => !existingIds.has(a.id));
          return [...prev, ...uniqueNew];
        });

        setHasMore(page < response.data.pages);
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [page]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Announcements</h2>
      <div className="space-y-4">
        {announcements.map((announcement, index) => {
          if (announcements.length === index + 1) {
            return (
              <div
                ref={lastAnnouncementElementRef}
                key={announcement.id}
                className="p-4 border border-border rounded-lg shadow-sm bg-card text-card-foreground"
              >
                <h3 className="text-xl font-semibold">{announcement.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {new Date(announcement.createdAt).toLocaleDateString()} •{' '}
                  {announcement.sender.name}
                </p>
                <div className="text-card-foreground">
                  <ReactMarkdown
                    remarkPlugins={[remarkBreaks]}
                    components={{
                      p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                      a: ({ ...props }) => (
                        <a className="text-blue-500 hover:underline" {...props} />
                      ),
                      strong: ({ ...props }) => <strong className="font-bold" {...props} />,
                      em: ({ ...props }) => <em className="italic" {...props} />,
                    }}
                  >
                    {announcement.content}
                  </ReactMarkdown>
                </div>
              </div>
            );
          } else {
            return (
              <div
                key={announcement.id}
                className="p-4 border border-border rounded-lg shadow-sm bg-card text-card-foreground"
              >
                <h3 className="text-xl font-semibold">{announcement.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {new Date(announcement.createdAt).toLocaleDateString()} •{' '}
                  {announcement.sender.name}
                </p>
                <div className="text-card-foreground">
                  <ReactMarkdown
                    remarkPlugins={[remarkBreaks]}
                    components={{
                      p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                      a: ({ ...props }) => (
                        <a className="text-blue-500 hover:underline" {...props} />
                      ),
                      strong: ({ ...props }) => <strong className="font-bold" {...props} />,
                      em: ({ ...props }) => <em className="italic" {...props} />,
                    }}
                  >
                    {announcement.content}
                  </ReactMarkdown>
                </div>
              </div>
            );
          }
        })}
      </div>
      {loading && (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      {!hasMore && announcements.length > 0 && (
        <p className="text-center text-muted-foreground mt-4">No more announcements</p>
      )}
      {!loading && announcements.length === 0 && (
        <p className="text-center text-muted-foreground mt-4">No announcements found</p>
      )}
    </div>
  );
}
