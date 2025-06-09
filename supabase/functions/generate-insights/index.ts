import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface Trade {
  id: string;
  ticker: string;
  entry_price: number;
  exit_price: number | null;
  size: number;
  confidence: number;
  setup_tag: string;
  emotion_tag: string;
  notes: string;
  trade_date: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Fetch user's trades
    const { data: trades, error: tradesError } = await supabaseClient
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('trade_date', { ascending: true });

    if (tradesError) {
      throw new Error(`Failed to fetch trades: ${tradesError.message}`);
    }

    if (!trades || trades.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No trades found. Add some trades to generate insights.' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Prepare trading data for analysis
    const tradingData = prepareTradingData(trades);

    // Generate insights (with fallback if OpenAI is not available)
    const insights = await generateInsights(tradingData);

    // Store insights in database
    const { error: insertError } = await supabaseClient
      .from('insights')
      .insert(
        insights.map(insight => ({
          user_id: user.id,
          content: insight.content,
          insight_type: insight.type,
        }))
      );

    if (insertError) {
      console.error('Failed to store insights:', insertError);
      // Continue anyway, return the insights even if storage fails
    }

    return new Response(
      JSON.stringify({ insights }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error generating insights:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate insights' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function prepareTradingData(trades: Trade[]) {
  const closedTrades = trades.filter(t => t.exit_price !== null);
  
  // Calculate basic metrics
  const totalTrades = trades.length;
  const totalClosedTrades = closedTrades.length;
  const winningTrades = closedTrades.filter(t => (t.exit_price! - t.entry_price) * t.size > 0);
  const winRate = totalClosedTrades > 0 ? (winningTrades.length / totalClosedTrades) * 100 : 0;
  
  const totalPL = closedTrades.reduce((sum, trade) => {
    return sum + ((trade.exit_price! - trade.entry_price) * trade.size);
  }, 0);

  // Analyze by setup
  const setupAnalysis = analyzeByCategory(closedTrades, 'setup_tag');
  
  // Analyze by emotion
  const emotionAnalysis = analyzeByCategory(closedTrades, 'emotion_tag');
  
  // Analyze by confidence
  const confidenceAnalysis = analyzeByConfidence(closedTrades);

  return {
    totalTrades,
    totalClosedTrades,
    winRate: Math.round(winRate * 10) / 10,
    totalPL: Math.round(totalPL * 100) / 100,
    avgTradeSize: Math.round((trades.reduce((sum, t) => sum + t.size, 0) / totalTrades) * 100) / 100,
    setupAnalysis,
    emotionAnalysis,
    confidenceAnalysis,
    recentTrades: trades.slice(-10).map(t => ({
      ticker: t.ticker,
      setup: t.setup_tag,
      emotion: t.emotion_tag,
      confidence: t.confidence,
      pl: t.exit_price ? Math.round(((t.exit_price - t.entry_price) * t.size) * 100) / 100 : null
    }))
  };
}

function analyzeByCategory(trades: Trade[], category: 'setup_tag' | 'emotion_tag') {
  const analysis: { [key: string]: { count: number; wins: number; totalPL: number; winRate: number } } = {};
  
  trades.forEach(trade => {
    const key = trade[category];
    const pl = (trade.exit_price! - trade.entry_price) * trade.size;
    
    if (!analysis[key]) {
      analysis[key] = { count: 0, wins: 0, totalPL: 0, winRate: 0 };
    }
    
    analysis[key].count++;
    analysis[key].totalPL += pl;
    if (pl > 0) analysis[key].wins++;
  });
  
  // Calculate win rates
  Object.keys(analysis).forEach(key => {
    analysis[key].winRate = Math.round((analysis[key].wins / analysis[key].count) * 1000) / 10;
    analysis[key].totalPL = Math.round(analysis[key].totalPL * 100) / 100;
  });
  
  return analysis;
}

function analyzeByConfidence(trades: Trade[]) {
  const analysis: { [key: number]: { count: number; wins: number; totalPL: number; winRate: number } } = {};
  
  trades.forEach(trade => {
    const confidence = trade.confidence;
    const pl = (trade.exit_price! - trade.entry_price) * trade.size;
    
    if (!analysis[confidence]) {
      analysis[confidence] = { count: 0, wins: 0, totalPL: 0, winRate: 0 };
    }
    
    analysis[confidence].count++;
    analysis[confidence].totalPL += pl;
    if (pl > 0) analysis[confidence].wins++;
  });
  
  // Calculate win rates
  Object.keys(analysis).forEach(key => {
    const conf = parseInt(key);
    analysis[conf].winRate = Math.round((analysis[conf].wins / analysis[conf].count) * 1000) / 10;
    analysis[conf].totalPL = Math.round(analysis[conf].totalPL * 100) / 100;
  });
  
  return analysis;
}

async function generateInsights(tradingData: any) {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  // If OpenAI API key is available, use AI-generated insights
  if (openaiApiKey) {
    try {
      return await generateInsightsWithOpenAI(tradingData, openaiApiKey);
    } catch (error) {
      console.error('OpenAI API failed, falling back to rule-based insights:', error);
      // Fall back to rule-based insights if OpenAI fails
    }
  }
  
  // Generate rule-based insights when OpenAI is not available
  return generateRuleBasedInsights(tradingData);
}

async function generateInsightsWithOpenAI(tradingData: any, apiKey: string) {
  const prompt = `You are an expert trading coach analyzing a trader's performance. Based on the data below, provide 3-5 specific, actionable insights in a conversational, encouraging tone.

Trading Performance Summary:
- Total Trades: ${tradingData.totalTrades} (${tradingData.totalClosedTrades} closed)
- Win Rate: ${tradingData.winRate}%
- Total P/L: $${tradingData.totalPL}
- Average Position Size: ${tradingData.avgTradeSize} shares

Setup Performance:
${Object.entries(tradingData.setupAnalysis).map(([setup, data]: [string, any]) => 
  `- ${setup}: ${data.count} trades, ${data.winRate}% win rate, $${data.totalPL} P/L`
).join('\n')}

Emotional State Performance:
${Object.entries(tradingData.emotionAnalysis).map(([emotion, data]: [string, any]) => 
  `- ${emotion}: ${data.count} trades, ${data.winRate}% win rate, $${data.totalPL} P/L`
).join('\n')}

Confidence Level Performance:
${Object.entries(tradingData.confidenceAnalysis).map(([conf, data]: [string, any]) => 
  `- Level ${conf}: ${data.count} trades, ${data.winRate}% win rate, $${data.totalPL} P/L`
).join('\n')}

Write insights that:
1. Highlight their strongest performing setups/emotions with specific numbers
2. Identify areas for improvement with actionable advice
3. Analyze confidence calibration
4. Provide specific recommendations based on their data
5. Use an encouraging, coach-like tone

Format each insight as a clear paragraph with a strong opening statement followed by supporting data and actionable advice. Make it feel personal and specific to their trading data.

Respond with ONLY a JSON array in this exact format:
[
  {
    "type": "performance|pattern|risk|recommendation",
    "title": "Clear, engaging title (max 60 chars)",
    "content": "Detailed insight with specific data and actionable advice (2-3 sentences)",
    "severity": "info|warning|success"
  }
]`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert trading coach. Provide specific, actionable insights in a conversational tone. Always respond with valid JSON only, no additional text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1200,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('No content received from OpenAI');
  }

  try {
    // Clean the response to ensure it's valid JSON
    const cleanedContent = content.trim();
    const insights = JSON.parse(cleanedContent);
    
    // Validate and format the insights
    const formattedInsights = (Array.isArray(insights) ? insights : [insights]).map((insight, index) => ({
      type: insight.type || 'recommendation',
      title: insight.title || `Trading Insight #${index + 1}`,
      content: insight.content || 'No content available',
      severity: insight.severity || 'info'
    }));

    return formattedInsights;
  } catch (parseError) {
    console.error('Failed to parse OpenAI response:', content);
    
    // If JSON parsing fails, create insights from the raw content
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    return sentences.slice(0, 3).map((sentence, index) => ({
      type: 'recommendation',
      title: `AI Trading Insight #${index + 1}`,
      content: sentence.trim() + '.',
      severity: 'info'
    }));
  }
}

function generateRuleBasedInsights(tradingData: any) {
  const insights = [];
  
  // Overall performance insight
  if (tradingData.totalClosedTrades > 0) {
    const performanceType = tradingData.totalPL > 0 ? 'success' : 'warning';
    const performanceTitle = tradingData.totalPL > 0 ? 'Strong Trading Performance' : 'Performance Review Needed';
    
    insights.push({
      type: 'performance',
      title: performanceTitle,
      content: `You've completed ${tradingData.totalClosedTrades} trades with a ${tradingData.winRate}% win rate, generating $${tradingData.totalPL} in total P/L. ${tradingData.totalPL > 0 ? 'Your consistent profitability shows good discipline and strategy execution.' : 'Focus on refining your entry criteria and risk management to improve profitability.'}`,
      severity: performanceType
    });
  }

  // Setup analysis
  const setupEntries = Object.entries(tradingData.setupAnalysis);
  if (setupEntries.length > 1) {
    const bestSetup = setupEntries.reduce((best, current) => 
      (current[1] as any).totalPL > (best[1] as any).totalPL ? current : best
    );
    const worstSetup = setupEntries.reduce((worst, current) => 
      (current[1] as any).totalPL < (worst[1] as any).totalPL ? current : worst
    );

    if ((bestSetup[1] as any).totalPL !== (worstSetup[1] as any).totalPL) {
      insights.push({
        type: 'pattern',
        title: 'Setup Performance Standouts',
        content: `Your "${bestSetup[0]}" setups are your strongest performers with $${(bestSetup[1] as any).totalPL} P/L and a ${(bestSetup[1] as any).winRate}% win rate. Consider allocating more capital to this strategy while reviewing your "${worstSetup[0]}" approach which has generated $${(worstSetup[1] as any).totalPL} P/L.`,
        severity: 'info'
      });
    }
  }

  // Emotion analysis
  const emotionEntries = Object.entries(tradingData.emotionAnalysis);
  if (emotionEntries.length > 1) {
    const bestEmotion = emotionEntries.reduce((best, current) => 
      (current[1] as any).totalPL > (best[1] as any).totalPL ? current : best
    );
    const worstEmotion = emotionEntries.reduce((worst, current) => 
      (current[1] as any).totalPL < (worst[1] as any).totalPL ? current : worst
    );

    if ((bestEmotion[1] as any).totalPL !== (worstEmotion[1] as any).totalPL) {
      insights.push({
        type: 'pattern',
        title: 'Emotional Trading Patterns',
        content: `You trade most effectively when feeling "${bestEmotion[0]}" (generating $${(bestEmotion[1] as any).totalPL} P/L), but struggle when "${worstEmotion[0]}" ($${(worstEmotion[1] as any).totalPL} P/L). Consider implementing a pre-trade emotional check-in to optimize your trading state.`,
        severity: 'info'
      });
    }
  }

  // Confidence analysis
  const confidenceEntries = Object.entries(tradingData.confidenceAnalysis);
  if (confidenceEntries.length > 1) {
    const highConfidence = confidenceEntries.filter(([conf]) => parseInt(conf) >= 4);
    const lowConfidence = confidenceEntries.filter(([conf]) => parseInt(conf) <= 2);
    
    if (highConfidence.length > 0 && lowConfidence.length > 0) {
      const highConfPL = highConfidence.reduce((sum, [, data]) => sum + (data as any).totalPL, 0);
      const lowConfPL = lowConfidence.reduce((sum, [, data]) => sum + (data as any).totalPL, 0);
      
      const calibrationStatus = highConfPL > lowConfPL ? 'well-calibrated' : 'needs adjustment';
      const advice = highConfPL > lowConfPL 
        ? 'Your confidence levels align well with outcomes - trust your high-confidence setups.'
        : 'Your confidence assessment may need refinement - analyze what makes you confident versus what actually works.';
      
      insights.push({
        type: 'risk',
        title: 'Confidence Calibration Analysis',
        content: `Your high-confidence trades (4-5) generated $${Math.round(highConfPL * 100) / 100} P/L while low-confidence trades (1-2) generated $${Math.round(lowConfPL * 100) / 100} P/L. Your confidence appears ${calibrationStatus}. ${advice}`,
        severity: highConfPL > lowConfPL ? 'success' : 'warning'
      });
    }
  }

  // Win rate insights
  if (tradingData.winRate < 40) {
    insights.push({
      type: 'recommendation',
      title: 'Win Rate Enhancement Opportunity',
      content: `Your ${tradingData.winRate}% win rate suggests room for improvement in trade selection. Focus on waiting for higher-probability setups, tightening your entry criteria, and consider paper trading new strategies before implementing them with real capital.`,
      severity: 'warning'
    });
  } else if (tradingData.winRate > 70) {
    insights.push({
      type: 'recommendation',
      title: 'Excellent Win Rate Achievement',
      content: `Your impressive ${tradingData.winRate}% win rate demonstrates strong trade selection skills. Ensure you're maximizing this edge by letting winners run longer and not cutting profits too early - your high accuracy suggests you can afford to be more aggressive with profit targets.`,
      severity: 'success'
    });
  }

  // Risk management insight
  if (tradingData.totalTrades >= 5) {
    const avgPL = tradingData.totalPL / tradingData.totalClosedTrades;
    if (Math.abs(avgPL) > tradingData.avgTradeSize * 0.1) {
      insights.push({
        type: 'risk',
        title: 'Position Sizing Consideration',
        content: `With an average P/L of $${Math.round(avgPL * 100) / 100} per trade and average position size of ${tradingData.avgTradeSize} shares, your risk-reward profile shows ${avgPL > 0 ? 'good' : 'concerning'} results. ${avgPL > 0 ? 'Consider gradually increasing position sizes on your best setups.' : 'Review your stop-loss levels and consider reducing position sizes until consistency improves.'}`,
        severity: avgPL > 0 ? 'success' : 'warning'
      });
    }
  }

  return insights.length > 0 ? insights : [{
    type: 'recommendation',
    title: 'Building Your Trading Foundation',
    content: 'Continue logging trades consistently to build a robust dataset. The more data you provide, the more specific and actionable insights I can generate about your trading patterns and performance.',
    severity: 'info'
  }];
}