interface LoadingIndicatorProps {
  message?: string;
}

export function LoadingIndicator({
  message = "Loading...",
}: LoadingIndicatorProps) {
  return (
    <div className="loading-container">
      <div className="loading-spinner" />
      <span className="loading-text">{message}</span>
    </div>
  );
}
