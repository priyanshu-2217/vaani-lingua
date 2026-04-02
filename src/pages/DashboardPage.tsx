import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import LiveTranscription from "@/components/dashboard/LiveTranscription";
import FileUpload from "@/components/dashboard/FileUpload";
import Navbar from "@/components/layout/Navbar";
import { Mic, Upload, BarChart3, Clock, Languages } from "lucide-react";

export default function DashboardPage() {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card className="card-gradient border-border">
            <CardContent className="flex items-center gap-3 p-4">
              <BarChart3 className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{profile?.total_transcriptions ?? 0}</p>
                <p className="text-xs text-muted-foreground">Total Transcriptions</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-gradient border-border">
            <CardContent className="flex items-center gap-3 p-4">
              <Clock className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{(profile?.total_audio_minutes ?? 0).toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Audio Minutes</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-gradient border-border">
            <CardContent className="flex items-center gap-3 p-4">
              <Languages className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold text-foreground">{profile?.preferred_language ?? "Hindi"}</p>
                <p className="text-xs text-muted-foreground">Preferred Language</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-gradient border-border">
            <CardContent className="flex items-center gap-3 p-4">
              <Mic className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold text-foreground">13</p>
                <p className="text-xs text-muted-foreground">Languages Available</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Transcription Area */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Transcription Studio</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="live">
              <TabsList className="mb-6 grid w-full grid-cols-2">
                <TabsTrigger value="live" className="gap-2">
                  <Mic className="h-4 w-4" /> Live Transcription
                </TabsTrigger>
                <TabsTrigger value="upload" className="gap-2">
                  <Upload className="h-4 w-4" /> Upload File
                </TabsTrigger>
              </TabsList>
              <TabsContent value="live">
                <LiveTranscription />
              </TabsContent>
              <TabsContent value="upload">
                <FileUpload />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
