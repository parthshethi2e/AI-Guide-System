import { useState, useEffect, useMemo } from "react";
import { useLocation, useParams } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  useGetAssessment, 
  useGetSurveyQuestions, 
  useSubmitAssessment,
  getGetAssessmentQueryKey,
  SurveyAnswer
} from "@workspace/api-client-react";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

export default function AssessmentWizard() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const assessmentId = Number(id);

  const { data: assessment, isLoading: assessmentLoading } = useGetAssessment(assessmentId, { 
    query: { enabled: !!assessmentId, queryKey: getGetAssessmentQueryKey(assessmentId) } 
  });
  
  const { data: categories, isLoading: questionsLoading } = useGetSurveyQuestions();
  const submitAssessment = useSubmitAssessment();

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, SurveyAnswer>>({});

  const isLoading = assessmentLoading || questionsLoading;
  
  // Initialize answers if assessment has previous responses
  useEffect(() => {
    if (assessment?.responses && Object.keys(answers).length === 0) {
      const initialAnswers: Record<string, SurveyAnswer> = {};
      assessment.responses.forEach(r => {
        initialAnswers[r.questionId] = {
          questionId: r.questionId,
          category: r.category,
          numericValue: r.numericValue,
          textValue: r.textValue
        };
      });
      setAnswers(initialAnswers);
    }
  }, [assessment, answers]);

  const handleAnswer = (questionId: string, categoryId: string, field: 'numericValue' | 'textValue', value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        questionId,
        category: categoryId,
        [field]: value
      }
    }));
  };

  if (isLoading || !categories) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full" />
          <Card>
            <CardContent className="p-8 space-y-8">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const isReviewStep = currentStep === categories.length;
  const currentCategory = categories[currentStep];
  
  const totalQuestions = categories.reduce((sum, cat) => sum + cat.questions.length, 0);
  const answeredQuestions = Object.keys(answers).length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  const handleNext = () => {
    if (currentStep <= categories.length) {
      window.scrollTo(0, 0);
      setCurrentStep(s => s + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      window.scrollTo(0, 0);
      setCurrentStep(s => s - 1);
    }
  };

  const handleSubmit = () => {
    const answersList = Object.values(answers);
    submitAssessment.mutate(
      { id: assessmentId, data: { answers: answersList } },
      {
        onSuccess: () => {
          setLocation(`/results/${assessmentId}`);
        }
      }
    );
  };

  const isCurrentCategoryComplete = currentCategory?.questions.every(q => {
    const answer = answers[q.id];
    if (!answer) return false;
    if (q.type === 'scale' || q.type === 'multiple_choice') return answer.numericValue !== undefined && answer.numericValue !== null;
    if (q.type === 'text') return !!answer.textValue?.trim();
    return false;
  });

  return (
    <Layout>
      <div className="max-w-3xl mx-auto animate-in fade-in duration-500 pb-20">
        <div className="mb-8 space-y-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              {isReviewStep ? "Review Answers" : currentCategory?.label}
            </h1>
            <p className="text-muted-foreground text-lg">
              {isReviewStep ? "Please review your responses before final submission." : currentCategory?.description}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground font-medium">
              <span>{isReviewStep ? 'Complete' : `Step ${currentStep + 1} of ${categories.length}`}</span>
              <span>{Math.round(progress)}% Answered</span>
            </div>
            <Progress value={progress} className="h-2.5" />
          </div>
        </div>

        {!isReviewStep ? (
          <div className="space-y-8">
            {currentCategory.questions.map((q, i) => {
              const currentAnswer = answers[q.id];
              return (
                <Card key={q.id} className="border-border/60 shadow-sm overflow-hidden">
                  <div className="bg-primary/5 px-6 py-4 border-b border-border/40">
                    <h3 className="font-semibold text-lg flex gap-3">
                      <span className="text-primary">{i + 1}.</span> {q.text}
                    </h3>
                    {q.helpText && <p className="text-muted-foreground mt-1 ml-6 text-sm">{q.helpText}</p>}
                  </div>
                  <CardContent className="p-6 pt-8">
                    {q.type === 'scale' && (
                      <div className="flex flex-col space-y-6">
                        <div className="flex justify-between text-xs font-medium text-muted-foreground px-2">
                          <span>Strongly Disagree</span>
                          <span>Strongly Agree</span>
                        </div>
                        <RadioGroup 
                          className="flex justify-between" 
                          value={currentAnswer?.numericValue?.toString()}
                          onValueChange={(val) => handleAnswer(q.id, currentCategory.id, 'numericValue', parseInt(val))}
                        >
                          {[1, 2, 3, 4, 5].map((val) => (
                            <div key={val} className="flex flex-col items-center gap-2">
                              <RadioGroupItem 
                                value={val.toString()} 
                                id={`${q.id}-${val}`} 
                                className="peer sr-only" 
                              />
                              <Label
                                htmlFor={`${q.id}-${val}`}
                                className={`flex items-center justify-center w-12 h-12 rounded-full border-2 cursor-pointer transition-all hover:bg-gray-50
                                  ${currentAnswer?.numericValue === val 
                                    ? 'border-primary bg-primary/10 text-primary scale-110 font-bold' 
                                    : 'border-border/60 text-muted-foreground'}`}
                              >
                                {val}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    )}

                    {q.type === 'multiple_choice' && q.options && (
                      <RadioGroup 
                        className="space-y-3"
                        value={currentAnswer?.numericValue?.toString()}
                        onValueChange={(val) => handleAnswer(q.id, currentCategory.id, 'numericValue', parseInt(val))}
                      >
                        {q.options.map((opt) => (
                          <div key={opt.value} className="flex items-center">
                            <RadioGroupItem value={opt.value.toString()} id={`${q.id}-${opt.value}`} className="peer sr-only" />
                            <Label
                              htmlFor={`${q.id}-${opt.value}`}
                              className={`flex-1 p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50
                                ${currentAnswer?.numericValue === opt.value 
                                  ? 'border-primary bg-primary/5 text-primary-foreground font-medium' 
                                  : 'border-border/60'}`}
                            >
                              {opt.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}

                    {q.type === 'text' && (
                      <Textarea 
                        placeholder="Enter your answer..." 
                        className="min-h-[120px] resize-none text-base"
                        value={currentAnswer?.textValue || ''}
                        onChange={(e) => handleAnswer(q.id, currentCategory.id, 'textValue', e.target.value)}
                      />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="bg-primary/5 border-b border-border/40">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Assessment Summary
                </CardTitle>
                <CardDescription>
                  You've answered {answeredQuestions} of {totalQuestions} questions.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/40">
                  {categories.map((cat, i) => {
                    const catQuestions = cat.questions.length;
                    const catAnswered = cat.questions.filter(q => answers[q.id]).length;
                    const isComplete = catQuestions === catAnswered;
                    
                    return (
                      <div key={cat.id} className="flex items-center justify-between p-6">
                        <div>
                          <p className="font-semibold">{cat.label}</p>
                          <p className="text-sm text-muted-foreground">{catAnswered} of {catQuestions} answered</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setCurrentStep(i)}
                          className="text-primary hover:text-primary hover:bg-primary/10"
                        >
                          Edit
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            {answeredQuestions < totalQuestions && (
              <div className="bg-amber-50 text-amber-800 p-4 rounded-lg border border-amber-200 flex items-start gap-3">
                <div className="mt-0.5"><div className="w-2 h-2 rounded-full bg-amber-500" /></div>
                <div>
                  <p className="font-medium text-sm">Incomplete Assessment</p>
                  <p className="text-sm opacity-90 mt-1">You can still submit, but missing answers will be treated as the lowest maturity level (0) which will negatively impact your overall score.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white/80 backdrop-blur-md border-t border-border/60 p-4 z-10 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
          <div className="max-w-3xl mx-auto flex justify-between items-center">
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handlePrev} 
              disabled={currentStep === 0 || submitAssessment.isPending}
              className="min-w-[120px]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Previous
            </Button>

            {!isReviewStep ? (
              <Button 
                size="lg" 
                onClick={handleNext}
                className="min-w-[120px]"
              >
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                size="lg" 
                onClick={handleSubmit} 
                disabled={submitAssessment.isPending}
                className="min-w-[200px] bg-primary hover:bg-primary/90 text-white font-semibold"
              >
                {submitAssessment.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Results...</>
                ) : (
                  <>Submit & View Results <CheckCircle2 className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
