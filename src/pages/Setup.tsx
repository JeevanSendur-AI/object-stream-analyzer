import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Video, Plus, Trash2, Monitor } from "lucide-react";

const Setup = () => {
  const [streams, setStreams] = useState([
    { id: 1, url: "http://127.0.0.1:5000/video", name: "Camera 1" }
  ]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const addStream = () => {
    const newId = Math.max(...streams.map(s => s.id), 0) + 1;
    setStreams([...streams, {
      id: newId,
      url: "",
      name: `Camera ${newId}`
    }]);
  };

  const removeStream = (id: number) => {
    setStreams(streams.filter(s => s.id !== id));
  };

  const updateStream = (id: number, field: string, value: string) => {
    setStreams(streams.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const startMonitoring = () => {
    const validStreams = streams.filter(s => s.url.trim());
    if (validStreams.length === 0) {
      toast({
        title: "No Streams Configured",
        description: "Please add at least one valid stream URL",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Starting Monitoring",
      description: `Connecting to ${validStreams.length} stream(s)`,
    });
    
    // Pass streams to dashboard via state or context
    navigate("/dashboard", { state: { streams: validStreams } });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Stream Configuration</h1>
          <p className="text-muted-foreground">Configure your video streams for real-time object detection</p>
        </div>

        <Card className="bg-dashboard-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Video className="w-5 h-5" />
              Video Streams
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Add localhost ports or URLs where your video streams are hosted
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {streams.map((stream) => (
              <div key={stream.id} className="flex gap-4 items-end p-4 bg-stream-bg rounded-lg border border-stream-border">
                <div className="flex-1">
                  <Label htmlFor={`name-${stream.id}`} className="text-sm font-medium text-foreground mb-2 block">
                    Stream Name
                  </Label>
                  <Input
                    id={`name-${stream.id}`}
                    placeholder="Camera 1"
                    value={stream.name}
                    onChange={(e) => updateStream(stream.id, "name", e.target.value)}
                    className="bg-input border-border"
                  />
                </div>
                <div className="flex-2">
                  <Label htmlFor={`url-${stream.id}`} className="text-sm font-medium text-foreground mb-2 block">
                    Stream URL
                  </Label>
                  <Input
                    id={`url-${stream.id}`}
                    placeholder="http://127.0.0.1:5000/video"
                    value={stream.url}
                    onChange={(e) => updateStream(stream.id, "url", e.target.value)}
                    className="bg-input border-border"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeStream(stream.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  disabled={streams.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            
            <Button
              variant="outline"
              onClick={addStream}
              className="w-full border-dashed border-border hover:bg-accent/10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Stream
            </Button>
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-end">
          <Button 
            onClick={startMonitoring}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Monitor className="w-4 h-4 mr-2" />
            Start Monitoring
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Setup;