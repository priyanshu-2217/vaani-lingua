import { useState, useRef, useEffect } from "react";
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
import { Mic, Loader2 } from "lucide-react";

export default function AuthPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [language, setLanguage] = useState("Hindi");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const sendOtp = async () => {
    if (!email) return toast.error("Please enter your email");
    if (tab === "signup" && !fullName) return toast.error("Please enter your name");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: tab === "signup" ? { full_name: fullName, preferred_language: language } : undefined,
        },
      });
      if (error) throw error;
      setOtpSent(true);
      setCountdown(45);
      toast.success("OTP sent to your email ✓");
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (e: any) {
      toast.error(e.message || "Failed to send OTP");
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    const token = otp.join("");
    if (token.length !== 6) return toast.error("Please enter the full OTP");
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
      if (error) throw error;

      if (tab === "signup") {
        const { data: { user: u } } = await supabase.auth.getUser();
        if (u) {
          await supabase.from("profiles").update({
            full_name: fullName,
            preferred_language: language,
          }).eq("id", u.id);
        }
      }

      toast.success("Welcome to VaaniScript! 🎉");
      navigate("/dashboard");
    } catch (e: any) {
      toast.error(e.message || "Invalid OTP. Try again.");
    }
    setLoading(false);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
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
          <Tabs value={tab} onValueChange={(v) => { setTab(v); setOtpSent(false); setOtp(["","","","","",""]); }}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={otpSent} />
              </div>
              {!otpSent ? (
                <Button className="w-full" onClick={sendOtp} disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Send OTP
                </Button>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Enter OTP</Label>
                    <div className="flex justify-center gap-2">
                      {otp.map((d, i) => (
                        <Input
                          key={i}
                          ref={(el) => { inputRefs.current[i] = el; }}
                          className="h-12 w-12 text-center text-lg font-semibold"
                          maxLength={1}
                          value={d}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        />
                      ))}
                    </div>
                  </div>
                  <Button className="w-full" onClick={verifyOtp} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Verify & Sign In
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    {countdown > 0 ? `Resend OTP in 0:${countdown.toString().padStart(2, "0")}` : (
                      <button className="text-primary underline" onClick={sendOtp}>Resend OTP</button>
                    )}
                  </p>
                </>
              )}
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input placeholder="Your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={otpSent} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={otpSent} />
              </div>
              <div className="space-y-2">
                <Label>Preferred Language</Label>
                <Select value={language} onValueChange={setLanguage} disabled={otpSent}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {INDIAN_LANGUAGES.map((l) => (
                      <SelectItem key={l.code} value={l.name}>{l.name} ({l.nativeName})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {!otpSent ? (
                <Button className="w-full" onClick={sendOtp} disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Send OTP
                </Button>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Enter OTP</Label>
                    <div className="flex justify-center gap-2">
                      {otp.map((d, i) => (
                        <Input
                          key={i}
                          ref={(el) => { inputRefs.current[i] = el; }}
                          className="h-12 w-12 text-center text-lg font-semibold"
                          maxLength={1}
                          value={d}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        />
                      ))}
                    </div>
                  </div>
                  <Button className="w-full" onClick={verifyOtp} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Verify & Create Account
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    {countdown > 0 ? `Resend OTP in 0:${countdown.toString().padStart(2, "0")}` : (
                      <button className="text-primary underline" onClick={sendOtp}>Resend OTP</button>
                    )}
                  </p>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
