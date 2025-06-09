/*
  # Create trades table for Thymos trading journal

  1. New Tables
    - `trades`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `ticker` (text, stock/crypto symbol)
      - `entry_price` (decimal, price when entering trade)
      - `exit_price` (decimal, price when exiting trade, nullable for open trades)
      - `size` (decimal, position size)
      - `confidence` (integer, 1-5 scale)
      - `setup_tag` (text, type of setup)
      - `emotion_tag` (text, emotional state during trade)
      - `notes` (text, additional notes)
      - `trade_date` (date, when trade was executed)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `trades` table
    - Add policy for users to only access their own trades
    - Add policies for CRUD operations
*/

CREATE TABLE IF NOT EXISTS trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ticker text NOT NULL,
  entry_price decimal(10,2) NOT NULL,
  exit_price decimal(10,2),
  size decimal(10,2) NOT NULL,
  confidence integer CHECK (confidence >= 1 AND confidence <= 5) NOT NULL,
  setup_tag text NOT NULL,
  emotion_tag text NOT NULL,
  notes text DEFAULT '',
  trade_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own trades"
  ON trades
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trades"
  ON trades
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trades"
  ON trades
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trades"
  ON trades
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS trades_user_id_idx ON trades(user_id);
CREATE INDEX IF NOT EXISTS trades_trade_date_idx ON trades(trade_date);
CREATE INDEX IF NOT EXISTS trades_ticker_idx ON trades(ticker);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_trades_updated_at
  BEFORE UPDATE ON trades
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();