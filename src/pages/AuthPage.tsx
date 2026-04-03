import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { INDIAN_LANGUAGES } from "@/lib/languages";
import { toast } from "sonner";
import { Mic, Loader2, Mail, CheckCircle } from "lucide-react";

export default function AuthPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [language, setLanguage] = useState("Hindi");
  const [linkSent, setLinkSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const sendMagicLink = async () => {
    if (!email) return toast.error("Please enter your email");
    if (tab === "signup" && !fullName) return toast.error("Please enter your name");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: tab === "signup" ? { full_name: fullName, preferred_language: language } : undefined,
          emailRedirectTo: window.location.origin + "/auth/callback",
        },
      });
      if (error) throw error;
      setLinkSent(true);
      setCountdown(60);
      toast.success("Magic link sent to your email ✓");
    } catch (e: any) {
      toast.error(e.message || "Failed to send link");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-border">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Mic className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl text-foreground">Welcome to VaaniScript</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(v) => { setTab(v); setLinkSent(false); }}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4 pt-4">
              {!linkSent ? (
                <>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <Button className="w-full" onClick={sendMagicLink} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                    Send Magic Link
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                  <CheckCircle className="h-12 w-12 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Check your email!</h3>
                  <p className="text-sm text-muted-foreground">
                    We sent a magic link to <strong>{email}</strong>. Click the link in your email to sign in.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {countdown > 0 ? `Resend in 0:${countdown.toString().padStart(2, "0")}` : (
                      <button className="text-primary underline" onClick={sendMagicLink}>Resend magic link</button>
                    )}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 pt-4">
              {!linkSent ? (
                <>
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input placeholder="Your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Preferred Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {INDIAN_LANGUAGES.map((l) => (
                          <SelectItem key={l.code} value={l.name}>{l.name} ({l.nativeName})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full" onClick={sendMagicLink} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                    Send Magic Link
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                  <CheckCircle className="h-12 w-12 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Check your email!</h3>
                  <p className="text-sm text-muted-foreground">
                    We sent a magic link to <strong>{email}</strong>. Click the link to create your account.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {countdown > 0 ? `Resend in 0:${countdown.toString().padStart(2, "0")}` : (
                      <button className="text-primary underline" onClick={sendMagicLink}>Resend magic link</button>
                    )}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
