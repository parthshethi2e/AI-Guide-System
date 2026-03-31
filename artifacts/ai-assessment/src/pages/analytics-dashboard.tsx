import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  useGetDashboardStats, 
  useGetMaturityDistribution,
  useGetRecentAssessments,
  useGetIndustryBenchmarks 
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Activity, Building2, TrendingUp, Users } from "lucide-react";

export default function AnalyticsDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: distribution, isLoading: distLoading } = useGetMaturityDistribution();
  const { data: recent, isLoading: recentLoading } = useGetRecentAssessments();
  const { data: benchmarks, isLoading: benchLoading } = useGetIndustryBenchmarks();

  const getMaturityColor = (level: string) => {
    switch(level) {
      case 'nascent': return 'hsl(0, 84%, 60%)';
      case 'emerging': return 'hsl(30, 80%, 55%)';
      case 'developing': return 'hsl(45, 93%, 47%)';
      case 'advanced': return 'hsl(217, 91%, 60%)';
      case 'leading': return 'hsl(160, 84%, 39%)';
      default: return 'hsl(244, 76%, 51%)';
    }
  };

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Analytics</h1>
          <p className="text-muted-foreground mt-1">Aggregate insights and benchmarks across all assessments.</p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Assessments</p>
                  {statsLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-3xl font-bold">{stats?.totalAssessments}</p>}
                </div>
                <div className="p-2 bg-primary/10 rounded-lg text-primary"><Activity className="w-5 h-5" /></div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                  {statsLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-3xl font-bold">{stats?.averageScore.toFixed(1)}</p>}
                </div>
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600"><TrendingUp className="w-5 h-5" /></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Avg. Maturity</p>
                  {statsLoading ? <Skeleton className="h-8 w-24" /> : <p className="text-xl font-bold capitalize mt-1">{stats?.averageMaturityLevel?.replace('_', ' ')}</p>}
                </div>
                <div className="p-2 bg-green-500/10 rounded-lg text-green-600"><Users className="w-5 h-5" /></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Top Industry</p>
                  {statsLoading ? <Skeleton className="h-8 w-24" /> : <p className="text-lg font-bold mt-1 line-clamp-1">{stats?.topIndustry}</p>}
                </div>
                <div className="p-2 bg-orange-500/10 rounded-lg text-orange-600"><Building2 className="w-5 h-5" /></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Distribution Chart */}
          <Card className="border-border/60 shadow-sm col-span-1">
            <CardHeader>
              <CardTitle>Maturity Distribution</CardTitle>
              <CardDescription>Number of organizations at each maturity level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                {distLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <Tooltip 
                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {distribution?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getMaturityColor(entry.level)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Industry Benchmarks */}
          <Card className="border-border/60 shadow-sm col-span-1">
            <CardHeader>
              <CardTitle>Industry Benchmarks</CardTitle>
              <CardDescription>Average scores by sector</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5 mt-2">
                {benchLoading ? (
                  <div className="space-y-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
                ) : (
                  benchmarks?.map((bench) => (
                    <div key={bench.industry} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{bench.industry}</span>
                        <span className="text-muted-foreground">{bench.averageScore.toFixed(1)} avg ({bench.assessmentCount} orgs)</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-1000" 
                          style={{ width: `${bench.averageScore}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Assessments List */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Assessments</CardTitle>
            <CardDescription>Latest completed assessments across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-gray-50 border-b border-border/60">
                  <tr>
                    <th className="px-4 py-3 font-medium">Organization</th>
                    <th className="px-4 py-3 font-medium">Industry</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Score</th>
                    <th className="px-4 py-3 font-medium">Level</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLoading ? (
                    <tr><td colSpan={5} className="p-4"><Skeleton className="h-20 w-full" /></td></tr>
                  ) : recent?.length === 0 ? (
                    <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No recent assessments found</td></tr>
                  ) : (
                    recent?.map((item) => (
                      <tr key={item.id} className="border-b border-border/40 last:border-0 hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium">{item.organizationName}</td>
                        <td className="px-4 py-3 text-muted-foreground">{item.industry}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.completedAt ? format(new Date(item.completedAt), "MMM d, yyyy") : "-"}
                        </td>
                        <td className="px-4 py-3 font-medium">{item.overallScore ? item.overallScore.toFixed(1) : "-"}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="capitalize">
                            {item.maturityLevel?.replace('_', ' ') || '-'}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
