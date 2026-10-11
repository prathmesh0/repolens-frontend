export default function Template({ children }: { children: React.ReactNode }) {
  // A template re-mounts on every navigation, so this plays on each page change
  return <div className="animate-page-in h-full">{children}</div>;
}
