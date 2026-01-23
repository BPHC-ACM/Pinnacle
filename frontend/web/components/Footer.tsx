export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>© {new Date().getFullYear()} Pinnacle. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a
              href="/privacy"
              className="text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
