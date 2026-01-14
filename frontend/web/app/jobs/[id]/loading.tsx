export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 animate-pulse">
      {/* Title */}
      <div className="h-7 w-3/4 rounded bg-muted" />

      {/* Subtitle */}
      <div className="mt-2 h-4 w-1/2 rounded bg-muted" />

      {/* Meta */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="h-10 rounded bg-muted" />
        <div className="h-10 rounded bg-muted" />
        <div className="h-10 rounded bg-muted" />
        <div className="h-10 rounded bg-muted" />
      </div>

      {/* Description */}
      <div className="mt-8 space-y-3">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
        <div className="h-4 w-2/3 rounded bg-muted" />
      </div>

      {/* Button */}
      <div className="mt-10 h-10 w-40 rounded bg-muted" />
    </div>
  );
}
