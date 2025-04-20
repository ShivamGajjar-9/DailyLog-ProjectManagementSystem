export default function TaskLoading() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 md:px-6 pb-6 animate-pulse">
      <div className="flex-1 space-y-4">
        <div className="h-8 w-3/4 bg-muted rounded-md" />
        <div className="h-4 w-1/2 bg-muted rounded-md" />
        <div className="h-32 w-full bg-muted rounded-md" />
      </div>
      <div className="w-full lg:w-[400px] space-y-4">
        <div className="h-8 w-full bg-muted rounded-md" />
        <div className="space-y-2">
          <div className="h-20 w-full bg-muted rounded-md" />
          <div className="h-20 w-full bg-muted rounded-md" />
        </div>
      </div>
    </div>
  );
}
