import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Loader2, TrendingUp, AlertTriangle, Target, Lightbulb, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTrades } from '@/hooks/useTrades';
import { useInsights } from '@/hooks/useInsights';
import { format } from 'date-fns';

const insightTypes = {
  performance: { icon: TrendingUp, color: 'text-green-600' },
  pattern: { icon: Target, color: 'text-green-600' },
  risk: { icon: AlertTriangle, color: 'text-orange-600' },
  recommendation: { icon: Lightbulb, color: 'text-green-600' },
};

export function InsightsPage() {
  const { trades } = useTrades();
  const { insights, loading, error, generateInsights, fetchStoredInsights } = useInsights();
  const { toast } = useToast();

  useEffect(() => {
    // Fetch any previously stored insights when the component mounts
    fetchStoredInsights();
  }, []);

  const handleGenerateInsights = async () => {
    if (trades.length === 0) {
      toast({
        title: 'No trades found',
        description: 'Add some trades to your journal first to generate insights.',
        variant: 'destructive',
      });
      return;
    }

    const { insights: newInsights, error } = await generateInsights();
    
    if (error) {
      toast({
        title: 'Error generating insights',
        description: error,
        variant: 'destructive',
      });
    } else if (newInsights) {
      toast({
        title: 'Insights generated',
        description: `Generated ${newInsights.length} AI-powered insights from your trading data.`,
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'border-green-200/50 bg-green-50/80 dark:border-green-700/50 dark:bg-green-900/20';
      case 'warning': return 'border-orange-200/50 bg-orange-50/80 dark:border-orange-700/50 dark:bg-orange-900/20';
      case 'info': return 'border-green-200/30 bg-green-50/50 dark:border-green-700/30 dark:bg-green-900/10';
      default: return 'border-green-200/30 bg-green-50/30 dark:border-green-700/30 dark:bg-green-900/10';
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200';
      case 'warning': return 'bg-orange-100 text-orange-700 dark:bg-orange-800 dark:text-orange-200';
      case 'info': return 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200';
      default: return 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200';
    }
  };

  return (
    <div className="page-container">
      <div className="space-y-8 p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight soft-green-text">AI Insights</h1>
            <p className="text-muted-foreground mt-2">
              Get AI-powered analysis of your trading patterns and performance
            </p>
          </div>
          <Button 
            onClick={handleGenerateInsights}
            disabled={loading || trades.length === 0}
            className="soft-button soft-gradient hover:soft-gradient-dark text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Brain className="mr-2 h-4 w-4" />
            )}
            {insights.length > 0 ? 'Regenerate Insights' : 'Generate Insights'}
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="rounded-2xl border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            <Card className="soft-card">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Brain className="h-6 w-6 text-green-600 animate-soft-pulse" />
                  <CardTitle className="text-xl text-green-700 dark:text-green-300">Analyzing your trading data...</CardTitle>
                </div>
                <CardDescription>
                  Our AI is examining your trades to identify patterns and opportunities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4 rounded-xl" />
                <Skeleton className="h-4 w-1/2 rounded-xl" />
              </CardContent>
            </Card>
          </div>
        )}

        {/* No Insights State */}
        {!loading && insights.length === 0 && !error && (
          <Card className="soft-card">
            <CardContent className="text-center py-16">
              <Brain className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
              <h3 className="text-xl font-semibold mb-3">No insights yet</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Generate AI-powered insights from your trading data to identify patterns, 
                improve performance, and discover optimization opportunities.
              </p>
              <Button 
                onClick={handleGenerateInsights}
                disabled={trades.length === 0}
                className="soft-button soft-gradient hover:soft-gradient-dark text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Brain className="mr-2 h-4 w-4" />
                Get Started
              </Button>
              {trades.length === 0 && (
                <p className="text-sm text-muted-foreground mt-3">
                  Add some trades to your journal first
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Insights Display */}
        {!loading && insights.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-green-700 dark:text-green-300">Your AI Insights</h2>
              <Button
                variant="outline"
                onClick={handleGenerateInsights}
                disabled={loading}
                className="soft-button border-green-200/50 hover:bg-green-50/80 dark:hover:bg-green-900/20"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              {insights.map((insight) => {
                const IconComponent = insightTypes[insight.type]?.icon || Lightbulb;
                const iconColor = insightTypes[insight.type]?.color || 'text-green-600';
                
                return (
                  <Card key={insight.id} className={`soft-card hover:shadow-xl transition-all duration-300 ${getSeverityColor(insight.severity)}`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <IconComponent className={`h-6 w-6 ${iconColor}`} />
                          <CardTitle className="text-lg text-green-700 dark:text-green-300">{insight.title}</CardTitle>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs rounded-xl ${getSeverityBadgeColor(insight.severity)}`}
                        >
                          {insight.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap leading-relaxed">
                        {insight.content}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Generated {format(insight.createdAt, 'MMM dd, yyyy \'at\' h:mm a')}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}