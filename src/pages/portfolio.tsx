import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Target, Calendar } from 'lucide-react';
import { useTrades } from '@/hooks/useTrades';
import { useState, useMemo } from 'react';
import { format, subDays, subMonths, subYears } from 'date-fns';

const COLORS = ['#22c55e', '#16a34a', '#15803d', '#166534', '#14532d'];

export function PortfolioPage() {
  const { trades } = useTrades();
  const [timeRange, setTimeRange] = useState('3m');

  const getDateRange = () => {
    const now = new Date();
    switch (timeRange) {
      case '1w': return subDays(now, 7);
      case '1m': return subMonths(now, 1);
      case '3m': return subMonths(now, 3);
      case '6m': return subMonths(now, 6);
      case '1y': return subYears(now, 1);
      default: return subMonths(now, 3);
    }
  };

  const filteredTrades = useMemo(() => {
    const startDate = getDateRange();
    return trades
      .filter(trade => new Date(trade.trade_date) >= startDate)
      .sort((a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime());
  }, [trades, timeRange]);

  // Calculate portfolio metrics
  const closedTrades = filteredTrades.filter(t => t.exit_price !== null);
  const totalPL = closedTrades.reduce((sum, trade) => {
    return sum + ((trade.exit_price! - trade.entry_price) * trade.size);
  }, 0);
  
  const winningTrades = closedTrades.filter(t => (t.exit_price! - t.entry_price) * t.size > 0);
  const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
  
  const avgWin = winningTrades.length > 0 
    ? winningTrades.reduce((sum, t) => sum + ((t.exit_price! - t.entry_price) * t.size), 0) / winningTrades.length
    : 0;
  
  const losingTrades = closedTrades.filter(t => (t.exit_price! - t.entry_price) * t.size < 0);
  const avgLoss = losingTrades.length > 0 
    ? Math.abs(losingTrades.reduce((sum, t) => sum + ((t.exit_price! - t.entry_price) * t.size), 0) / losingTrades.length)
    : 0;

  // Create equity curve data
  const equityData = useMemo(() => {
    let cumulativePL = 0;
    const data: { date: string; equity: number; trade: string }[] = [];
    
    closedTrades.forEach(trade => {
      const pl = (trade.exit_price! - trade.entry_price) * trade.size;
      cumulativePL += pl;
      data.push({
        date: format(new Date(trade.trade_date), 'MMM dd'),
        equity: cumulativePL,
        trade: trade.ticker
      });
    });
    
    return data;
  }, [closedTrades]);

  // Setup distribution data
  const setupData = useMemo(() => {
    const setupCounts: { [key: string]: number } = {};
    filteredTrades.forEach(trade => {
      setupCounts[trade.setup_tag] = (setupCounts[trade.setup_tag] || 0) + 1;
    });
    
    return Object.entries(setupCounts).map(([name, value]) => ({ name, value }));
  }, [filteredTrades]);

  // Monthly performance data
  const monthlyData = useMemo(() => {
    const monthlyPL: { [key: string]: number } = {};
    
    closedTrades.forEach(trade => {
      const month = format(new Date(trade.trade_date), 'yyyy-MM');
      const pl = (trade.exit_price! - trade.entry_price) * trade.size;
      monthlyPL[month] = (monthlyPL[month] || 0) + pl;
    });
    
    return Object.entries(monthlyPL)
      .map(([month, pl]) => ({
        month: format(new Date(month + '-01'), 'MMM yyyy'),
        pl
      }))
      .slice(-6); // Last 6 months
  }, [closedTrades]);

  return (
    <div className="page-container">
      <div className="space-y-8 p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight soft-green-text">Portfolio Analytics</h1>
            <p className="text-muted-foreground mt-2">
              Track your trading performance and analyze patterns
            </p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 soft-input h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="soft-card border-green-200/30">
              <SelectItem value="1w" className="rounded-xl hover:bg-green-50/80 dark:hover:bg-green-900/20">1 Week</SelectItem>
              <SelectItem value="1m" className="rounded-xl hover:bg-green-50/80 dark:hover:bg-green-900/20">1 Month</SelectItem>
              <SelectItem value="3m" className="rounded-xl hover:bg-green-50/80 dark:hover:bg-green-900/20">3 Months</SelectItem>
              <SelectItem value="6m" className="rounded-xl hover:bg-green-50/80 dark:hover:bg-green-900/20">6 Months</SelectItem>
              <SelectItem value="1y" className="rounded-xl hover:bg-green-50/80 dark:hover:bg-green-900/20">1 Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="metric-card hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total P/L</CardTitle>
              <DollarSign className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${totalPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalPL >= 0 ? '+' : ''}${totalPL.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {filteredTrades.length} trades in period
              </p>
            </CardContent>
          </Card>

          <Card className="metric-card hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
              <Target className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{winRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {winningTrades.length} wins / {closedTrades.length} trades
              </p>
            </CardContent>
          </Card>

          <Card className="metric-card hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Win</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                +${avgWin.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Per winning trade
              </p>
            </CardContent>
          </Card>

          <Card className="metric-card hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Loss</CardTitle>
              <TrendingUp className="h-5 w-5 text-red-600 rotate-180" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                -${avgLoss.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Per losing trade
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
          {/* Equity Curve */}
          <Card className="lg:col-span-2 soft-card hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-xl text-green-700 dark:text-green-300">Equity Curve</CardTitle>
              <CardDescription>
                Cumulative profit and loss over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={equityData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Equity']}
                    labelFormatter={(label) => `Date: ${label}`}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(34, 197, 94, 0.2)',
                      borderRadius: '12px',
                      boxShadow: '0 4px 16px rgba(34, 197, 94, 0.1)',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="equity" 
                    stroke="#22c55e" 
                    strokeWidth={3}
                    dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Performance */}
          <Card className="soft-card hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-xl text-green-700 dark:text-green-300">Monthly P/L</CardTitle>
              <CardDescription>
                Profit and loss by month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'P/L']}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(34, 197, 94, 0.2)',
                      borderRadius: '12px',
                      boxShadow: '0 4px 16px rgba(34, 197, 94, 0.1)',
                    }}
                  />
                  <Bar 
                    dataKey="pl" 
                    fill="#22c55e"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Setup Distribution */}
          <Card className="soft-card hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-xl text-green-700 dark:text-green-300">Setup Distribution</CardTitle>
              <CardDescription>
                Breakdown of trading setups used
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={setupData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {setupData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(34, 197, 94, 0.2)',
                      borderRadius: '12px',
                      boxShadow: '0 4px 16px rgba(34, 197, 94, 0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {filteredTrades.length === 0 && (
          <Card className="soft-card">
            <CardContent className="text-center py-16">
              <Calendar className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
              <h3 className="text-xl font-semibold mb-3">No trades in selected period</h3>
              <p className="text-muted-foreground">
                Try selecting a different time range or add some trades to your journal.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}