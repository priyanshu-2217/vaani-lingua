import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { INDIAN_LANGUAGES } from "@/lib/languages";
import { downloadAsTxt, downloadAsPdf } from "@/lib/pdfExport";
import { toast } from "sonner";
import type { Transcription } from "@/types";
import {
  Search, Download, FileText, Trash2, Eye, Calendar, Hash, Mic, Upload,
  Save, ChevronLeft, ChevronRight, User
} from "lucide-react";

export default function HistoryPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Transcription | null>(null);
  const perPage = 10;

  // Profile edit
  const [editName, setEditName] = useState("");
  const [editLang, setEditLang] = useState("Hindi");

  useEffect(() => {
    if (profile) {
      setEditName(profile.full_name || "");
      setEditLang(profile.preferred_language || "Hindi");
    }
  }, [profile]);

  useEffect(() => {
    fetchTranscriptions();
  }, [user]);

  const fetchTranscriptions = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("transcriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setTranscriptions((data as Transcription[]) || []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("transcriptions").delete().eq("id", id);
    setTranscriptions((prev) => prev.filter((t) => t.id !== id));
    toast.success("Deleted");
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({
      full_name: editName,
      preferred_language: editLang,
    }).eq("id", user.id);
    if (error) toast.error("Failed to save");
    else { toast.success("Profile updated! ✓"); refreshProfile(); }
  };

  // Filter & sort
  let filtered = transcriptions.filter((t) => {
    if (search && !t.content.toLowerCase().includes(search.toLowerCase()) && !t.title?.toLowerCase().includes(search.toLowerCase())) return false;
    if (langFilter !== "all" && t.language !== langFilter) return false;
    return true;
  });

  if (sortBy === "oldest") filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  else if (sortBy === "words") filtered.sort((a, b) => (b.word_count || 0) - (a.word_count || 0));

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const initials = (profile?.full_name || "U").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="transcripts">
          <TabsList className="mb-6 grid w-full grid-cols-2">
            <TabsTrigger value="transcripts">My Transcripts</TabsTrigger>
            <TabsTrigger value="profile">My Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="transcripts" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search transcripts..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
              </div>
              <Select value={langFilter} onValueChange={(v) => { setLangFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {INDIAN_LANGUAGES.map((l) => (
                    <SelectItem key={l.code} value={l.name}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="words">Word Count</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* List */}
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
              </div>
            ) : paginated.length === 0 ? (
              <div className="py-16 text-center">
                <Mic className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-lg font-medium text-muted-foreground">No transcriptions yet</p>
                <p className="text-sm text-muted-foreground">Start by recording or uploading audio.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {paginated.map((t) => (
                  <Card key={t.id} className="border-border transition-all hover:glow-primary">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {t.source === "live" ? <Mic className="h-4 w-4 text-primary" /> : <Upload className="h-4 w-4 text-accent" />}
                          <p className="truncate font-medium text-foreground">{t.title || "Untitled"}</p>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span>{t.language}</span>
                          <span>{t.word_count} words</span>
                          <span>{new Date(t.created_at).toLocaleDateString()}</span>
                          {t.noise_cleaned && <span className="text-accent">✓ Noise cleaned</span>}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setSelected(t)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => downloadAsTxt(t.content, `${t.title}.txt`)}><Download className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => downloadAsPdf(t.content, t.language, t.duration_seconds || 0, `${t.title}.pdf`)}><FileText className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                <Button variant="outline" size="icon" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile">
            <Card className="border-border">
              <CardContent className="space-y-6 p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                    {initials}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground">{profile?.full_name || "User"}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    <p className="text-xs text-muted-foreground">Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Full Name</Label>
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  </div>
                  <div>
                    <Label>Preferred Language</Label>
                    <Select value={editLang} onValueChange={setEditLang}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {INDIAN_LANGUAGES.map((l) => (
                          <SelectItem key={l.code} value={l.name}>{l.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="rounded-lg bg-muted/50 p-3 text-center">
                    <p className="text-xl font-bold text-foreground">{profile?.total_transcriptions ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Total Transcriptions</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3 text-center">
                    <p className="text-xl font-bold text-foreground">{(profile?.total_audio_minutes ?? 0).toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">Total Minutes</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3 text-center">
                    <p className="text-xl font-bold text-foreground">{profile?.preferred_language || "—"}</p>
                    <p className="text-xs text-muted-foreground">Most Used Language</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3 text-center">
                    <p className="text-xl font-bold text-foreground">
                      {transcriptions.length > 0 ? new Date(transcriptions[0].created_at).toLocaleDateString() : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">Last Active</p>
                  </div>
                </div>

                <Button onClick={handleSaveProfile} className="gap-1"><Save className="h-4 w-4" /> Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* View Modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">{selected?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span>{selected?.language}</span>
              <span>{selected?.word_count} words</span>
              <span>{selected?.created_at ? new Date(selected.created_at).toLocaleDateString() : ""}</span>
              <span className="capitalize">{selected?.source}</span>
            </div>
            <p className="whitespace-pre-wrap text-sm text-foreground">{selected?.content}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
