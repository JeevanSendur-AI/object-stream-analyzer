import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Video, Users, TrendingUp, Settings, LogOut, Eye, AlertCircle } from "lucide-react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { VideoAnalyticsSidebar } from "@/components/VideoAnalyticsSidebar";
import { useInferenceData } from "@/hooks/useInferenceData";
import { useAuth } from "@/hooks/useAuth";

interface StreamData {
  id: number;
  name: string;
  url: string;
}

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const streams: StreamData[] = location.state?.streams || [];
  
  const [selectedView, setSelectedView] = useState<string>("overall");
  const { inferenceData, objectCounts, historyData } = useInferenceData(streams);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const getCurrentData = () => {
    if (selectedView === "overall") {
      return {
        counts: objectCounts.overall || {},
        history: historyData.overall || [],
        totalCount: Object.values(objectCounts.overall || {}).reduce((sum, count) => sum + count, 0)
      };
    } else {
      return {
        counts: objectCounts[selectedView] || {},
        history: historyData[selectedView] || [],
        totalCount: Object.values(objectCounts[selectedView] || {}).reduce((sum, count) => sum + count, 0)
      };
    }
  };

  const currentData = getCurrentData();

  if (streams.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="bg-dashboard-card border-border">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No Streams Configured</h2>
            <p className="text-muted-foreground mb-4">Please configure your video streams first</p>
            <Button onClick={() => navigate("/setup")} className="bg-primary hover:bg-primary/90">
              Go to Setup
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <VideoAnalyticsSidebar 
          streams={streams} 
          selectedView={selectedView}
          onViewChange={setSelectedView}
          objectCounts={objectCounts}
        />
        
        <SidebarInset className="flex-1">
          {/* Header */}
          <div className="border-b border-border bg-dashboard-card">
            <div className="flex h-16 items-center px-6 justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="mr-2" />
                <Video className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-semibold text-foreground">
                  Object Detection Dashboard - {selectedView === "overall" ? "Overall" : `Source ${selectedView.replace("source", "")}`}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate("/setup")}>
                  <Settings className="w-4 h-4 mr-2" />
                  Setup
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-dashboard-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">Total Objects</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-dashboard-accent">{currentData.totalCount}</div>
                  <p className="text-xs text-muted-foreground">Currently detected</p>
                </CardContent>
              </Card>
              
              <Card className="bg-dashboard-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">Active Streams</CardTitle>
                  <Video className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-dashboard-success">
                    {selectedView === "overall" ? streams.length : 1}
                  </div>
                  <p className="text-xs text-muted-foreground">Video feeds</p>
                </CardContent>
              </Card>

              <Card className="bg-dashboard-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">Detection Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-dashboard-warning">
                    {currentData.history.length > 0 ? (currentData.history[currentData.history.length - 1]?.count || 0) : 0}/s
                  </div>
                  <p className="text-xs text-muted-foreground">Objects per frame</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Video Streams */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">
                  {selectedView === "overall" ? "All Live Streams" : `Stream ${selectedView.replace("source", "")}`}
                </h2>
                {(selectedView === "overall" ? streams : streams.filter(s => `source${s.id}` === selectedView)).map((stream) => (
                  <Card key={stream.id} className="bg-dashboard-card border-border">
                    <CardHeader>
                      <CardTitle className="text-base text-foreground">{stream.name}</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        {stream.url}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video bg-stream-bg border border-stream-border rounded-lg overflow-hidden relative">
                        <img 
                          src={stream.url.endsWith('/video') ? stream.url : `${stream.url}/video`}
                          alt={`${stream.name} live feed`}
                          className="w-full h-full object-cover"
                          style={{ maxWidth: '100%', height: 'auto' }}
                          onError={(e) => {
                            console.error(`Failed to load video stream: ${stream.url}`);
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Analytics */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Analytics</h2>
                
                {/* Object Count History */}
                <Card className="bg-dashboard-card border-border">
                  <CardHeader>
                    <CardTitle className="text-base text-foreground">Detection History</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Real-time object count over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={currentData.history}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="time" 
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                          />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: "hsl(var(--dashboard-card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px"
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="count" 
                            stroke="hsl(var(--dashboard-accent))" 
                            strokeWidth={2}
                            dot={{ fill: "hsl(var(--dashboard-accent))", strokeWidth: 2 }}
                            isAnimationActive={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Current Detections */}
                <Card className="bg-dashboard-card border-border">
                  <CardHeader>
                    <CardTitle className="text-base text-foreground">Current Detections</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Objects detected in the latest frame
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(currentData.counts).map(([objClass, count]) => (
                        <div key={objClass} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground capitalize">
                              {objClass}
                            </span>
                          </div>
                          <Badge variant="secondary" className="bg-dashboard-accent/10 text-dashboard-accent">
                            {count}
                          </Badge>
                        </div>
                      ))}
                      {Object.keys(currentData.counts).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No objects detected
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;