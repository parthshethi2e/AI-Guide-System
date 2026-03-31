import { useLocation, useParams } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  useGetAssessmentResult, 
  getGetAssessmentResultQueryKey 
} from "@workspace/api-client-react";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from "recharts";
import { 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  Download, 
  ExternalLink, 
  Target, 
  Zap, 
  Clock, 
  Activity, 
  Lightbulb
} from "lucide-react";

export default function AssessmentResults() {
  const { id } = useParams();
  const assessmentId = Number(id);

  const { data: result, isLoading } = useGetAssessmentResult(assessmentId, {
    query: { enabled: !!assessmentId, queryKey: getGetAssessmentResultQueryKey(assessmentId) }
  });

  if (isLoading || !result) {
    return (
      <Layout>
        <div className="space-y-8">
          <Skeleton className="h-16 w-1/3" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="h-96 col-span-2" />
            <Skeleton className="h-96 col-span-1" />
          </div>
        </div>
      </Layout>
    );
  }

  const getMaturityColor = (level: string) => {
    switch(level) {
      case 'nascent': return { bg: 'bg-red-500', text: 'text-red-700', border: 'border-red-200', lightBg: 'bg-red-50' };
      case 'emerging': return { bg: 'bg-orange-500', text: 'text-orange-700', border: 'border-orange-200', lightBg: 'bg-orange-50' };
      case 'developing': return { bg: 'bg-yellow-500', text: 'text-yellow-700', border: 'border-yellow-200', lightBg: 'bg-yellow-50' };
      case 'advanced': return { bg: 'bg-blue-500', text: 'text-blue-700', border: 'border-blue-200', lightBg: 'bg-blue-50' };
      case 'leading': return { bg: 'bg-green-500', text: 'text-green-700', border: 'border-green-200', lightBg: 'bg-green-50' };
      default: return { bg: 'bg-gray-500', text: 'text-gray-700', border: 'border-gray-200', lightBg: 'bg-gray-50' };
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'critical': return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-0">Critical</Badge>;
      case 'high': return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 border-0">High</Badge>;
      case 'medium': return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-0">Medium</Badge>;
      default: return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-0">Low</Badge>;
    }
  };

  const colors = getMaturityColor(result.maturityLevel);

  // Prepare chart data
  const chartData = result.categoryScores.map(cat => ({
    subject: cat.categoryLabel,
    A: cat.percentage,
    fullMark: 100,
  }));

  const shortTerm = result.recommendations.filter(r => r.timeframe === 'short_term');
  const midTerm = result.recommendations.filter(r => r.timeframe === 'mid_term');
  const longTerm = result.recommendations.filter(r => r.timeframe === 'long_term');

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <h1 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Assessment Results</h1>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{result.organizationName}</h2>
            <div className="flex items-center gap-4 text-muted-foreground mt-2">
              <span>{result.industry}</span>
              <span className="w-1 h-1 rounded-full bg-border"></span>
              <span>{result.companySize}</span>
            </div>
          </div>
          <Button variant="outline" className="shrink-0 gap-2 font-medium">
            <Download className="w-4 h-4" /> Export Report
          </Button>
        </div>

        {/* Top Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className={`col-span-1 md:col-span-2 border-2 ${colors.border} shadow-sm overflow-hidden relative`}>
            <div className={`absolute top-0 right-0 w-64 h-64 opacity-10 rounded-full blur-3xl -mr-20 -mt-20 ${colors.bg}`}></div>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 h-full">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    <Target className="w-4 h-4" /> Overall Maturity Level
                  </div>
                  <div>
                    <div className={`text-5xl font-bold mb-2 ${colors.text}`}>{result.maturityLabel}</div>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {result.executiveSummary}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center shrink-0 w-40 h-40 rounded-full border-8 border-gray-50 bg-white shadow-inner relative">
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle 
                      cx="50%" cy="50%" r="46%" 
                      className="fill-transparent stroke-gray-100" strokeWidth="8"
                    />
                    <circle 
                      cx="50%" cy="50%" r="46%" 
                      className={`fill-transparent ${colors.text.replace('text-', 'stroke-')} transition-all duration-1000 ease-out`} 
                      strokeWidth="8"
                      strokeDasharray="289"
                      strokeDashoffset={289 - (289 * result.percentage) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="text-center z-10">
                    <span className="text-4xl font-bold block leading-none">{Math.round(result.overallScore)}</span>
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Score</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 shadow-sm border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Key Findings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold flex items-center text-green-700 mb-3"><CheckCircle2 className="w-4 h-4 mr-2" /> Strengths</h4>
                <ul className="space-y-2">
                  {result.strengthAreas.slice(0,2).map((s, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" /> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="h-px w-full bg-border/50"></div>
              <div>
                <h4 className="text-sm font-semibold flex items-center text-red-700 mb-3"><AlertCircle className="w-4 h-4 mr-2" /> Key Gaps</h4>
                <ul className="space-y-2">
                  {result.gapAreas.slice(0,2).map((g, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" /> {g}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart & Category Scores */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="col-span-1 shadow-sm border-border/60 flex flex-col">
            <CardHeader>
              <CardTitle>Capability Radar</CardTitle>
              <CardDescription>Dimensional breakdown of AI maturity</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center p-0">
              <div className="w-full h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="65%" data={chartData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar 
                      name="Score" 
                      dataKey="A" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))" 
                      fillOpacity={0.3} 
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 lg:col-span-2 shadow-sm border-border/60">
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>Detailed scoring across all 7 assessment dimensions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {result.categoryScores.map((cat, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium">{cat.categoryLabel}</span>
                      <span className="font-bold">{cat.percentage.toFixed(0)}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          cat.percentage < 30 ? 'bg-red-500' :
                          cat.percentage < 50 ? 'bg-orange-500' :
                          cat.percentage < 70 ? 'bg-yellow-500' :
                          cat.percentage < 85 ? 'bg-blue-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <div className="pt-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight mb-2">Transformation Roadmap</h2>
            <p className="text-muted-foreground">Actionable steps to elevate your AI maturity, ordered by timeframe.</p>
          </div>

          <Tabs defaultValue="short" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 h-12 p-1 bg-gray-100/80">
              <TabsTrigger value="short" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md font-medium">
                Short Term (0-6 mo)
              </TabsTrigger>
              <TabsTrigger value="mid" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md font-medium">
                Mid Term (6-18 mo)
              </TabsTrigger>
              <TabsTrigger value="long" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md font-medium">
                Long Term (18+ mo)
              </TabsTrigger>
            </TabsList>
            
            {[
              { id: 'short', data: shortTerm },
              { id: 'mid', data: midTerm },
              { id: 'long', data: longTerm }
            ].map(tab => (
              <TabsContent key={tab.id} value={tab.id} className="space-y-4 outline-none focus:ring-0 mt-0">
                {tab.data.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                    No recommendations for this timeframe.
                  </div>
                ) : (
                  tab.data.map((rec, i) => (
                    <Card key={i} className="shadow-sm border-border/60 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start gap-6">
                          <div className="flex-1 space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                              {getPriorityBadge(rec.priority)}
                              <Badge variant="outline" className="text-muted-foreground">{rec.category}</Badge>
                            </div>
                            <div>
                              <h3 className="text-lg font-bold mb-2">{rec.title}</h3>
                              <p className="text-muted-foreground leading-relaxed">{rec.description}</p>
                            </div>
                            
                            {rec.tools && rec.tools.length > 0 && (
                              <div className="pt-2 flex flex-wrap gap-2">
                                <span className="text-sm font-medium text-muted-foreground mr-2 flex items-center">
                                  <Lightbulb className="w-4 h-4 mr-1" /> Suggested Tools:
                                </span>
                                {rec.tools.map(tool => (
                                  <Badge key={tool} variant="secondary" className="bg-primary/5 text-primary hover:bg-primary/10 border-0">
                                    {tool}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="bg-gray-50 rounded-xl p-4 md:w-56 shrink-0 space-y-4 self-stretch flex flex-col justify-center">
                            <div>
                              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center">
                                <Activity className="w-3.5 h-3.5 mr-1" /> Effort
                              </div>
                              <div className="font-medium capitalize">{rec.effort}</div>
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center">
                                <Zap className="w-3.5 h-3.5 mr-1" /> Impact
                              </div>
                              <div className="font-medium capitalize text-primary">{rec.impact}</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>

      </div>
    </Layout>
  );
}
