'use client';

export default function JobDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <p>Job details for {params.id}</p>
    </div>
  );
}
