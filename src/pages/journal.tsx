import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, BookOpen, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { TradeForm } from '@/components/trades/trade-form';
import { TradeList } from '@/components/trades/trade-list';
import { useTrades } from '@/hooks/useTrades';
import { useToast } from '@/hooks/use-toast';

export function JournalPage() {
  const [showAddTrade, setShowAddTrade] = useState(false);
  const { trades, loading, addTrade, updateTrade, deleteTrade } = useTrades();
  const { toast } = useToast();

  const handleAddTrade = async (tradeData: any) => {
    const { error } = await addTrade(tradeData);
    if (error) {
      toast({
        title: 'Error adding trade',
        description: error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Trade added',
        description: `${tradeData.ticker} trade has been added to your journal.`,
      });
    }
    return { error };
  };

  // Calculate statistics
  const totalTrades = trades.length;
  const closedTrades = trades.filter(t => t.exit_price !== null);
  const winningTrades = closedTrades.filter(t => (t.exit_price! - t.entry_price) * t.size > 0);
  const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
  const totalPL = closedTrades.reduce((sum, trade) => {
    return sum + ((trade.exit_price! - trade.entry_price) * trade.size);
  }, 0);

  return (
    <div className="page-container">
      <div className="space-y-8 p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight soft-green-text">Trading Journal</h1>
            <p className="text-muted-foreground mt-2">
              Track and analyze your trading performance
            </p>
          </div>
          <Button 
            onClick={() => setShowAddTrade(true)}
            className="soft-button soft-gradient hover:soft-gradient-dark text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Trade
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="metric-card hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Trades</CardTitle>
              <BookOpen className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{totalTrades}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {closedTrades.length} closed, {totalTrades - closedTrades.length} open
              </p>
            </CardContent>
          </Card>
          
          <Card className="metric-card hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{winRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {winningTrades.length} of {closedTrades.length} trades
              </p>
            </CardContent>
          </Card>
          
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
                From {closedTrades.length} closed trades
              </p>
            </CardContent>
          </Card>
          
          <Card className="metric-card hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Trade</CardTitle>
              <TrendingDown className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                ${closedTrades.length > 0 ? (totalPL / closedTrades.length).toFixed(2) : '0.00'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Per closed trade
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Trades List */}
        <Card className="soft-card hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-xl text-green-700 dark:text-green-300">Trade History</CardTitle>
            <CardDescription>
              Manage and review your trading activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TradeList
              trades={trades}
              onUpdateTrade={updateTrade}
              onDeleteTrade={deleteTrade}
              loading={loading}
            />
          </CardContent>
        </Card>

        {/* Add Trade Dialog */}
        <Dialog open={showAddTrade} onOpenChange={setShowAddTrade}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto soft-card border-0 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl text-green-700 dark:text-green-300">Add New Trade</DialogTitle>
            </DialogHeader>
            <TradeForm
              onSubmit={handleAddTrade}
              onCancel={() => setShowAddTrade(false)}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}