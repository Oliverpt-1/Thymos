import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, Edit, Trash2, Search, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Database } from '@/lib/supabase';
import { TradeForm } from './trade-form';
import { useToast } from '@/hooks/use-toast';

type Trade = Database['public']['Tables']['trades']['Row'];

interface TradeListProps {
  trades: Trade[];
  onUpdateTrade: (id: string, updates: any) => Promise<{ error: string | null }>;
  onDeleteTrade: (id: string) => Promise<{ error: string | null }>;
  loading?: boolean;
}

export function TradeList({ trades, onUpdateTrade, onDeleteTrade, loading = false }: TradeListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSetup, setFilterSetup] = useState<string>('all');
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const { toast } = useToast();

  const filteredTrades = trades.filter(trade => {
    const matchesSearch = trade.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trade.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSetup === 'all' || trade.setup_tag === filterSetup;
    return matchesSearch && matchesFilter;
  });

  const handleEdit = (trade: Trade) => {
    setEditingTrade(trade);
  };

  const handleDelete = async (trade: Trade) => {
    if (confirm(`Are you sure you want to delete the ${trade.ticker} trade?`)) {
      const { error } = await onDeleteTrade(trade.id);
      if (error) {
        toast({
          title: 'Error deleting trade',
          description: error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Trade deleted',
          description: `${trade.ticker} trade has been removed.`,
        });
      }
    }
  };

  const handleUpdateTrade = async (tradeData: any) => {
    if (!editingTrade) return { error: 'No trade selected' };
    
    const { error } = await onUpdateTrade(editingTrade.id, tradeData);
    if (error) {
      toast({
        title: 'Error updating trade',
        description: error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Trade updated',
        description: `${tradeData.ticker} trade has been updated.`,
      });
    }
    return { error };
  };

  const calculatePL = (trade: Trade) => {
    if (!trade.exit_price) return null;
    return (trade.exit_price - trade.entry_price) * trade.size;
  };

  const setupTags = Array.from(new Set(trades.map(t => t.setup_tag))).filter(tag => tag !== '').sort();

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search trades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full sm:w-64 soft-input h-12"
          />
        </div>
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterSetup} onValueChange={setFilterSetup}>
            <SelectTrigger className="w-40 soft-input h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/50 bg-card/90 backdrop-blur-xl">
              <SelectItem value="all" className="rounded-xl">All Setups</SelectItem>
              {setupTags.map((tag) => (
                <SelectItem key={tag} value={tag} className="rounded-xl">
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Trade Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTrades.map((trade) => {
          const pl = calculatePL(trade);
          const isProfit = pl !== null && pl > 0;
          
          return (
            <Card key={trade.id} className="soft-card border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">
                    {trade.ticker}
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-2xl border-border/50 bg-card/90 backdrop-blur-xl">
                      <DropdownMenuItem onClick={() => handleEdit(trade)} className="rounded-xl">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(trade)}
                        className="text-destructive rounded-xl"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(trade.trade_date), 'MMM dd, yyyy')}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Entry</p>
                    <p className="font-semibold">${trade.entry_price.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Exit</p>
                    <p className="font-semibold">
                      {trade.exit_price ? `$${trade.exit_price.toFixed(2)}` : 'Open'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Size</p>
                    <p className="font-semibold">{trade.size}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Confidence</p>
                    <p className="font-semibold">{trade.confidence}/5</p>
                  </div>
                </div>

                {pl !== null && (
                  <div className={cn(
                    'flex items-center justify-between rounded-2xl p-4',
                    isProfit 
                      ? 'bg-emerald-50 dark:bg-emerald-900' 
                      : 'bg-red-50 dark:bg-red-900'
                  )}>
                    <span className="text-sm font-medium">P/L</span>
                    <div className={cn(
                      'flex items-center gap-2 font-semibold',
                      isProfit 
                        ? 'text-emerald-700 dark:text-emerald-300' 
                        : 'text-red-700 dark:text-red-300'
                    )}>
                      {isProfit ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      {isProfit ? '+' : ''}${pl.toFixed(2)}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs rounded-xl border-border/50 bg-muted/30">
                    {trade.setup_tag}
                  </Badge>
                  <Badge variant="outline" className="text-xs rounded-xl border-border/50 bg-muted/30">
                    {trade.emotion_tag}
                  </Badge>
                </div>

                {trade.notes && (
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {trade.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTrades.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">
            {searchTerm || filterSetup !== 'all' 
              ? 'No trades match your filters.' 
              : 'No trades yet. Add your first trade to get started!'
            }
          </p>
        </div>
      )}

      {/* Edit Trade Dialog */}
      <Dialog open={!!editingTrade} onOpenChange={() => setEditingTrade(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto soft-card border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Trade</DialogTitle>
          </DialogHeader>
          {editingTrade && (
            <TradeForm
              trade={editingTrade}
              onSubmit={handleUpdateTrade}
              onCancel={() => setEditingTrade(null)}
              loading={loading}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}