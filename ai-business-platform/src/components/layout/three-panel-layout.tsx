"use client";

import { useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  MessageSquare, 
  FileText, 
  Code, 
  Eye, 
  Settings,
  Lightbulb,
  BarChart3,
  Users,
  Zap
} from "lucide-react";

export function ThreePanelLayout() {
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  return (
    <div className="h-screen w-full flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4">
          <div className="flex items-center space-x-2">
            <Zap className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold">AI Business Platform</h1>
          </div>
          <div className="ml-auto flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* Left Panel - Context */}
          <Panel 
            defaultSize={25} 
            minSize={15} 
            maxSize={40}
            collapsible={true}
            onCollapse={() => setLeftPanelCollapsed(true)}
            onExpand={() => setLeftPanelCollapsed(false)}
          >
            <div className="h-full border-r bg-muted/20">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-medium">Project Context</h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                </div>
                
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="files">Files</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center">
                          <Lightbulb className="h-4 w-4 mr-2" />
                          Current Project
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-xs text-muted-foreground">
                          No project selected
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Business Metrics
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-xs text-muted-foreground">
                          Market size: TBD
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          Target Users
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-xs text-muted-foreground">
                          Not defined yet
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="files" className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      No files generated yet
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="w-2 bg-border hover:bg-border-foreground/20 transition-colors" />

          {/* Center Panel - Main Canvas */}
          <Panel defaultSize={50} minSize={30}>
            <div className="h-full bg-background">
              <Tabs defaultValue="business-plan" className="h-full flex flex-col">
                <div className="border-b px-4 py-2">
                  <TabsList>
                    <TabsTrigger value="business-plan" className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>Business Plan</span>
                    </TabsTrigger>
                    <TabsTrigger value="generated-app" className="flex items-center space-x-2">
                      <Eye className="h-4 w-4" />
                      <span>Generated App</span>
                    </TabsTrigger>
                    <TabsTrigger value="code-view" className="flex items-center space-x-2">
                      <Code className="h-4 w-4" />
                      <span>Code</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <div className="flex-1 overflow-auto">
                  <TabsContent value="business-plan" className="h-full p-6">
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle>Business Plan Canvas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4 h-96">
                          <Card className="p-4">
                            <h3 className="font-medium mb-2">Key Partners</h3>
                            <p className="text-sm text-muted-foreground">Who are your key partners and suppliers?</p>
                          </Card>
                          <Card className="p-4">
                            <h3 className="font-medium mb-2">Key Activities</h3>
                            <p className="text-sm text-muted-foreground">What key activities does your value proposition require?</p>
                          </Card>
                          <Card className="p-4">
                            <h3 className="font-medium mb-2">Value Propositions</h3>
                            <p className="text-sm text-muted-foreground">What value do you deliver to customers?</p>
                          </Card>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="generated-app" className="h-full p-6">
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle>Live Preview</CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center justify-center h-96">
                        <div className="text-center">
                          <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">No app generated yet</p>
                          <p className="text-sm text-muted-foreground mt-2">Start by describing your business idea in the AI assistant</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="code-view" className="h-full p-6">
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle>Generated Code</CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center justify-center h-96">
                        <div className="text-center">
                          <Code className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">No code generated yet</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </Panel>

          <PanelResizeHandle className="w-2 bg-border hover:bg-border-foreground/20 transition-colors" />

          {/* Right Panel - AI Assistant */}
          <Panel 
            defaultSize={25} 
            minSize={15} 
            maxSize={40}
            collapsible={true}
            onCollapse={() => setRightPanelCollapsed(true)}
            onExpand={() => setRightPanelCollapsed(false)}
          >
            <div className="h-full border-l bg-muted/20">
              <div className="p-4 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-medium flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    AI Assistant
                  </h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Chat messages area */}
                <div className="flex-1 overflow-auto mb-4">
                  <div className="space-y-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <p className="text-sm">
                        👋 Welcome! I&apos;m your AI business assistant. I can help you:
                      </p>
                      <ul className="text-xs mt-2 space-y-1 text-muted-foreground">
                        <li>• Validate business ideas</li>
                        <li>• Generate applications</li>
                        <li>• Analyze competitors</li>
                        <li>• Create business plans</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                {/* Input area */}
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="text-xs">
                      New Idea
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs">
                      Generate App
                    </Button>
                  </div>
                  <div className="flex space-x-2">
                    <input 
                      type="text" 
                      placeholder="Describe your business idea..." 
                      className="flex-1 px-3 py-2 border rounded-md text-sm"
                    />
                    <Button size="sm">Send</Button>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}