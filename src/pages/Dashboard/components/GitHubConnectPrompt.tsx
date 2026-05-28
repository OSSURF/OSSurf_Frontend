import { Github } from "lucide-react";
import { authClient } from "@/lib/auth-client";

type GitHubConnectPromptProps = {
  callbackPath?: string;
  className?: string;
};

export function GitHubConnectPrompt({
  callbackPath = "/overview",
  className = "mx-6 sm:mx-0 mt-6 mb-6",
}: GitHubConnectPromptProps) {
  return (
    <div className={className}>
      <div className="border border-border bg-card p-8 flex flex-col items-center text-center gap-4">
        <div className="flex items-center justify-center size-14 rounded-full bg-muted/50">
          <Github className="size-7 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            Login with GitHub to see your total PRs and Issues
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            You can still view and manage manually tracked PRs and issues from the
            overview. To see your full GitHub profile and stats, connect your GitHub
            account.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            authClient.signIn.social({
              provider: "github",
              callbackURL: `${window.location.origin}${callbackPath}`,
            });
          }}
          className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 bg-foreground text-background font-medium text-sm hover:bg-foreground/90 transition-colors cursor-pointer"
        >
          <Github className="size-4" />
          Login with GitHub
          <span aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}
