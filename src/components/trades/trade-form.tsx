import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Database } from '@/lib/supabase';

type Trade = Database['public']['Tables']['trades']['Row'];
type NewTrade = Database['public']['Tables']['trades']['Insert'];

interface TradeFormProps {
  trade?: Trade;
  onSubmit: (trade: Omit<NewTrade, 'user_id'>) => Promise<{ error: string | null }>;
  onCancel: () => void;
  loading?: boolean;
}

const setupTags = [
  'Breakout',
  'Pullback',
  'Support/Resistance',
  'Moving Average',
  'Chart Pattern',
  'News Event',
  'Earnings',
  'Other'
];

const emotionTags = [
  'Confident',
  'Nervous',
  'Excited',
  'Fearful',
  'Greedy',
  'Calm',
  'Impulsive',
  'Disciplined'
];

export function TradeForm({ trade, onSubmit, onCancel, loading = false }: TradeFormProps) {
  const [formData, setFormData] = useState({
    ticker: trade?.ticker || '',
    entry_price: trade?.entry_price || 0,
    exit_price: trade?.exit_price || null,
    size: trade?.size || 0,
    confidence: trade?.confidence || 3,
    setup_tag: trade?.setup_tag || '',
    emotion_tag: trade?.emotion_tag || '',
    notes: trade?.notes || '',
    trade_date: trade?.trade_date ? new Date(trade.trade_date) : new Date(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const tradeData = {
      ...formData,
      trade_date: format(formData.trade_date, 'yyyy-MM-dd'),
    };
    
    const { error } = await onSubmit(tradeData);
    if (!error) {
      onCancel();
    }
  };

  const profitLoss = formData.exit_price 
    ? (formData.exit_price - formData.entry_price) * formData.size
    : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-3">
          <Label htmlFor="ticker" className="text-sm font-medium">Ticker Symbol</Label>
          <Input
            id="ticker"
            placeholder="AAPL, TSLA, etc."
            value={formData.ticker}
            onChange={(e) => setFormData(prev => ({ ...prev, ticker: e.target.value.toUpperCase() }))}
            className="soft-input h-12"
            required
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="trade-date" className="text-sm font-medium">Trade Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full h-12 justify-start text-left font-normal soft-input border-border/50',
                  !formData.trade_date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.trade_date ? format(formData.trade_date, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-2xl border-border/50 bg-card/90 backdrop-blur-xl">
              <Calendar
                mode="single"
                selected={formData.trade_date}
                onSelect={(date) => date && setFormData(prev => ({ ...prev, trade_date: date }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-3">
          <Label htmlFor="entry-price" className="text-sm font-medium">Entry Price</Label>
          <Input
            id="entry-price"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.entry_price || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, entry_price: parseFloat(e.target.value) || 0 }))}
            className="soft-input h-12"
            required
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="exit-price" className="text-sm font-medium">Exit Price (optional)</Label>
          <Input
            id="exit-price"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.exit_price || ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              exit_price: e.target.value ? parseFloat(e.target.value) : null 
            }))}
            className="soft-input h-12"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="size" className="text-sm font-medium">Position Size</Label>
          <Input
            id="size"
            type="number"
            step="0.01"
            placeholder="100"
            value={formData.size || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, size: parseFloat(e.target.value) || 0 }))}
            className="soft-input h-12"
            required
          />
        </div>

        <div className="space-y-4">
          <Label className="text-sm font-medium">Confidence Level: {formData.confidence}</Label>
          <Slider
            value={[formData.confidence]}
            onValueChange={(value) => setFormData(prev => ({ ...prev, confidence: value[0] }))}
            max={5}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Low (1)</span>
            <span>High (5)</span>
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="setup-tag" className="text-sm font-medium">Setup Type</Label>
          <Select
            value={formData.setup_tag}
            onValueChange={(value) => setFormData(prev => ({ ...prev, setup_tag: value }))}
          >
            <SelectTrigger className="soft-input h-12">
              <SelectValue placeholder="Select setup type" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/50 bg-card/90 backdrop-blur-xl">
              {setupTags.map((tag) => (
                <SelectItem key={tag} value={tag} className="rounded-xl">
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label htmlFor="emotion-tag" className="text-sm font-medium">Emotion State</Label>
          <Select
            value={formData.emotion_tag}
            onValueChange={(value) => setFormData(prev => ({ ...prev, emotion_tag: value }))}
          >
            <SelectTrigger className="soft-input h-12">
              <SelectValue placeholder="Select emotion" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/50 bg-card/90 backdrop-blur-xl">
              {emotionTags.map((tag) => (
                <SelectItem key={tag} value={tag} className="rounded-xl">
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {profitLoss !== null && (
        <div className={cn(
          'rounded-2xl border p-6',
          profitLoss >= 0 ? 'border-soft-green-200 bg-soft-green-50 dark:border-soft-green-700 dark:bg-soft-green-900' : 'border-soft-red-200 bg-soft-red-50 dark:border-soft-red-700 dark:bg-soft-red-900'
        )}>
          <p className={cn(
            'text-lg font-semibold',
            profitLoss >= 0 ? 'text-soft-green-700 dark:text-soft-green-300' : 'text-soft-red-700 dark:text-soft-red-300'
          )}>
            P/L: {profitLoss >= 0 ? '+' : ''}${profitLoss.toFixed(2)}
          </p>
        </div>
      )}

      <div className="space-y-3">
        <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Add any additional notes about this trade..."
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          rows={4}
          className="soft-input resize-none"
        />
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="soft-button border-border/50 hover:bg-accent/50">
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
          className="soft-button soft-gradient hover:soft-gradient-dark text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {trade ? 'Update Trade' : 'Add Trade'}
        </Button>
      </div>
    </form>
  );
}