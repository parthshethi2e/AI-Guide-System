import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useListAssessments } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { format } from "date-fns";
import { Building2, Globe2, Briefcase, Calendar, ChevronRight } from "lucide-react";

export default function AssessmentList() {
  const { data: assessments, isLoading } = useListAssessments();

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed': return <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">Completed</Badge>;
      case 'in_progress': return <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">In Progress</Badge>;
      default: return <Badge variant="outline" className="text-gray-500">Draft</Badge>;
    }
  };

  const getMaturityBadge = (level?: string | null) => {
    if (!level) return null;
    const colors: Record<string, string> = {
      nascent: "bg-red-50 text-red-700 border-red-200",
      emerging: "bg-orange-50 text-orange-700 border-orange-200",
      developing: "bg-yellow-50 text-yellow-700 border-yellow-200",
      advanced: "bg-blue-50 text-blue-700 border-blue-200",
      leading: "bg-green-50 text-green-700 border-green-200"
    };
    const colorClass = colors[level] || "bg-gray-50 text-gray-700 border-gray-200";
    return <Badge variant="outline" className={`capitalize ${colorClass}`}>{level.replace('_', ' ')}</Badge>;
  };

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">All Assessments</h1>
            <p className="text-muted-foreground mt-1">View and manage organization AI maturity evaluations.</p>
          </div>
          <Link href="/start">
            <Button>New Assessment</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
          </div>
        ) : assessments?.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-border/60 rounded-xl bg-gray-50/50">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
              <Building2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No assessments yet</h2>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Start an evaluation to benchmark an organization's AI capabilities.</p>
            <Link href="/start">
              <Button>Start First Assessment</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {assessments?.map((assessment) => (
              <Card key={assessment.id} className="border-border/60 shadow-sm overflow-hidden hover:border-primary/30 transition-colors group">
                <div className="flex flex-col md:flex-row">
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold">{assessment.organizationName}</h3>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center"><Briefcase className="w-4 h-4 mr-1.5" /> {assessment.industry}</span>
                          <span className="flex items-center"><Globe2 className="w-4 h-4 mr-1.5" /> {assessment.geography}</span>
                          <span className="flex items-center"><Calendar className="w-4 h-4 mr-1.5" /> {format(new Date(assessment.createdAt), "MMM d, yyyy")}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(assessment.status)}
                        {getMaturityBadge(assessment.maturityLevel)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 md:w-48 p-6 flex flex-col justify-center items-center md:border-l border-t md:border-t-0 border-border/40">
                    {assessment.status === 'completed' ? (
                      <>
                        <div className="text-3xl font-bold text-primary mb-1">{assessment.overallScore?.toFixed(0)}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">Overall Score</div>
                        <Link href={`/results/${assessment.id}`}>
                          <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            View Results <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-muted-foreground mb-3 text-center">Assessment incomplete</div>
                        <Link href={`/assess/${assessment.id}`}>
                          <Button variant="default" size="sm" className="w-full">
                            Continue
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
