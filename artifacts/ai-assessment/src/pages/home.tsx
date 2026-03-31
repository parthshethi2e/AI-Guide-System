import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, BarChart, CheckCircle2, ChevronRight, Zap } from "lucide-react";
import { useGetDashboardStats } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: stats, isLoading } = useGetDashboardStats();

  return (
    <Layout>
      <div className="flex flex-col gap-12 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground border border-primary-border shadow-xl">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>
          
          <div className="relative px-8 py-16 md:px-16 md:py-24 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-medium mb-6">
              <Zap className="w-4 h-4 text-sidebar-primary" />
              <span>Enterprise AI Transformation</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
              Measure your organization's AI maturity.
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl leading-relaxed">
              A comprehensive, data-driven framework to benchmark your current capabilities, identify gaps, and generate an actionable strategic roadmap.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-gray-100 font-semibold h-14 px-8 text-base shadow-md"
                onClick={() => setLocation("/start")}
              >
                Start Assessment <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-primary-foreground/10 border-primary-foreground/20 hover:bg-primary-foreground/20 text-white h-14 px-8 text-base"
                onClick={() => setLocation("/dashboard")}
              >
                View Analytics
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Row */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-sm border-border/60">
            <CardContent className="p-6">
              <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                <BarChart className="w-4 h-4 mr-2" /> Total Assessments
              </div>
              {isLoading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <div className="text-4xl font-bold">{stats?.totalAssessments || 0}</div>
              )}
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/60">
            <CardContent className="p-6">
              <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2" /> Global Average Score
              </div>
              {isLoading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <div className="text-4xl font-bold text-primary">
                  {stats?.averageScore.toFixed(1)}<span className="text-xl text-muted-foreground font-normal">/100</span>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/60">
            <CardContent className="p-6">
              <div className="text-sm font-medium text-muted-foreground mb-2">Most Common Level</div>
              {isLoading ? (
                <Skeleton className="h-10 w-48" />
              ) : (
                <div className="text-2xl font-bold capitalize">
                  {stats?.averageMaturityLevel?.replace('_', ' ') || 'Unknown'}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Methodology */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">The Maturity Scale</h2>
            <p className="text-muted-foreground mt-2">Our framework evaluates organizations across five distinct stages of AI adoption.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { level: "Nascent", desc: "No structured AI approach. Ad-hoc experimentation.", color: "bg-red-50 text-red-700 border-red-200" },
              { level: "Emerging", desc: "Siloed AI initiatives. Basic data infrastructure.", color: "bg-orange-50 text-orange-700 border-orange-200" },
              { level: "Developing", desc: "Coordinated strategy. Dedicated AI teams forming.", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
              { level: "Advanced", desc: "AI integrated into core processes. Strong governance.", color: "bg-blue-50 text-blue-700 border-blue-200" },
              { level: "Leading", desc: "AI-first organization. Continuous innovation loop.", color: "bg-green-50 text-green-700 border-green-200" }
            ].map((stage, i) => (
              <div key={stage.level} className={`rounded-xl border p-5 flex flex-col relative ${stage.color}`}>
                <div className="text-sm font-bold opacity-50 mb-1">Stage 0{i + 1}</div>
                <h3 className="text-lg font-bold mb-2">{stage.level}</h3>
                <p className="text-sm opacity-90 leading-relaxed flex-1">{stage.desc}</p>
                {i < 4 && <ChevronRight className="hidden md:block absolute -right-6 top-1/2 -translate-y-1/2 text-gray-300 w-8 h-8" />}
              </div>
            ))}
          </div>
        </section>

      </div>
    </Layout>
  );
}
