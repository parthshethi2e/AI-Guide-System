import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import StartAssessment from "@/pages/start-assessment";
import AssessmentList from "@/pages/assessment-list";
import AnalyticsDashboard from "@/pages/analytics-dashboard";
import AssessmentWizard from "@/pages/assessment-wizard";
import AssessmentResults from "@/pages/assessment-results";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/start" component={StartAssessment} />
      <Route path="/assessments" component={AssessmentList} />
      <Route path="/dashboard" component={AnalyticsDashboard} />
      <Route path="/assess/:id" component={AssessmentWizard} />
      <Route path="/results/:id" component={AssessmentResults} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
