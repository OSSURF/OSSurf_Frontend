import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function OverviewPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        const session = await authClient.getSession();
        if (session.data) {
          setUser(session.data.user);
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Failed to get session:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    getSession();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to logout");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-foreground">No user found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <div className="border border-border rounded-lg shadow-lg p-8 bg-card">
          <h1 className="text-3xl font-bold text-foreground mb-8">
            Welcome back!
          </h1>

          <div className="space-y-6">
            <div className="border border-border rounded-lg p-6 bg-background">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Your Profile
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="text-lg font-medium text-foreground">
                    {user.name || user.email || "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-lg font-medium text-foreground">
                    {user.email}
                  </p>
                </div>
                {user.username && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      GitHub Username
                    </p>
                    <p className="text-lg font-medium text-foreground">
                      {user.username}
                    </p>
                  </div>
                )}
                {user.id && (
                  <div>
                    <p className="text-sm text-muted-foreground">User ID</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {user.id}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="border border-border rounded-lg p-6 bg-background">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Raw User Data
              </h2>
              <pre className="bg-muted p-4 rounded text-sm text-foreground overflow-auto max-h-64">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>

            <div>
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
