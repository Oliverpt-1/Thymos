/*
  # Create insights table for AI-generated trading insights

  1. New Tables
    - `insights`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `content` (text, AI-generated insight content)
      - `insight_type` (text, type of insight - performance, pattern, etc.)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `insights` table
    - Add policies for users to access their own insights
*/

CREATE TABLE IF NOT EXISTS insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  insight_type text NOT NULL DEFAULT 'general',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own insights"
  ON insights
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own insights"
  ON insights
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own insights"
  ON insights
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS insights_user_id_idx ON insights(user_id);
CREATE INDEX IF NOT EXISTS insights_created_at_idx ON insights(created_at);