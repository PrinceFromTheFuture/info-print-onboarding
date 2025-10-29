export default function LoadingSpinner({ title = "Loading..." }: { title?: string }) {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">{title}</p>
      </div>
    </div>
  );
}
