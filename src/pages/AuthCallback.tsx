import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Let Supabase handle the hash/query params from the magic link
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (data.session) {
          navigate("/dashboard", { replace: true });
        } else {
          // Retry once after a short delay (proxy timing issue)
          await new Promise((r) => setTimeout(r, 1500));
          const retry = await supabase.auth.getSession();
          if (retry.data.session) {
            navigate("/dashboard", { replace: true });
          } else {
            navigate("/auth", { replace: true });
          }
        }
      } catch {
        navigate("/auth", { replace: true });
      }
    };
    handleCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Signing you in...</p>
      </div>
    </div>
  );
}
