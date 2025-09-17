import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

console.log('🔑 OpenAI API Key debug:', {
  hasKey: !!OPENAI_API_KEY,
  keyLength: OPENAI_API_KEY ? OPENAI_API_KEY.length : 0,
  keyPrefix: OPENAI_API_KEY ? OPENAI_API_KEY.substring(0, 10) + '...' : 'none',
  keyType: typeof OPENAI_API_KEY,
  startsWithSk: OPENAI_API_KEY ? OPENAI_API_KEY.startsWith('sk-') : false,
  envVarExists: 'OPENAI_API_KEY' in Deno.env.toObject()
});

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface RecipeRequest {
  userId: string | null;
  moodId: string;
  goalId: string;
}

// Fallback recipe generator for when OpenAI fails
function generateFallbackRecipe(moodId: string, goalId: string): any {
  const fallbackRecipes = {
    'tired-energy': {
      name: 'Energizing Green Boost',
      emoji: '⚡',
      color: '#22c55e',
      description: 'A natural energy boost to combat fatigue',
      ingredients: [
        { name: 'Spinach', amount: '2', unit: 'cups' },
        { name: 'Green apple', amount: '1', unit: 'medium' },
        { name: 'Lemon', amount: '1/2', unit: 'juice of' },
        { name: 'Ginger', amount: '1', unit: 'inch piece' }
      ],
      steps: [
        'Wash all ingredients thoroughly',
        'Core the apple and cut into chunks',
        'Add spinach and apple to blender',
        'Add fresh lemon juice and ginger',
        'Blend until smooth and creamy',
        'Serve immediately over ice'
      ],
      benefits: [
        'High in iron for natural energy',
        'Vitamin C boosts immunity',
        'Ginger aids digestion'
      ]
    },
    'stressed-focus': {
      name: 'Calming Citrus Blend',
      emoji: '🧘',
      color: '#f59e0b',
      description: 'A soothing blend to reduce stress and improve focus',
      ingredients: [
        { name: 'Orange', amount: '2', unit: 'medium' },
        { name: 'Carrot', amount: '1', unit: 'large' },
        { name: 'Turmeric', amount: '1/2', unit: 'tsp' },
        { name: 'Honey', amount: '1', unit: 'tsp' }
      ],
      steps: [
        'Peel oranges and carrot',
        'Cut carrot into small pieces',
        'Juice oranges and carrot',
        'Stir in turmeric and honey',
        'Mix well and serve fresh'
      ],
      benefits: [
        'Vitamin C reduces stress hormones',
        'Beta-carotene supports brain function',
        'Turmeric has anti-inflammatory properties'
      ]
    }
  };

  const key = `${moodId}-${goalId}`;
  const recipe = fallbackRecipes[key] || fallbackRecipes['tired-energy'];

  return {
    ...recipe,
    prepTime: 5,
    servings: 1
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ 
        error: 'Method not allowed. Use POST to generate recipes.',
        usage: { remainingToday: 0, limit: 3, pro: false }
      }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const body = await req.json();
    const { userId, moodId, goalId }: RecipeRequest = body;

    // Input validation - only return 4xx for truly invalid input
    if (!moodId || !goalId) {
      console.error('❌ Invalid input - missing required fields:', { moodId, goalId });
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: moodId and goalId are required',
          usage: { remainingToday: 0, limit: 3, pro: false }
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('📥 Recipe generation request:', { userId, moodId, goalId });

    // Initialize usage tracking variables
    let remainingToday = 3;
    let isPro = false;
    let currentCount = 0;

    if (userId) {
      try {
        // Check if user has active subscription
        const { data: subscription } = await supabase
          .from('user_subscriptions')
          .select('status')
          .eq('user_id', userId)
          .single();

        isPro = subscription?.status === 'active';
        console.log('💎 Pro status check:', { userId, isPro, subscriptionStatus: subscription?.status });

        // If pro user, skip usage cap entirely
        if (!isPro) {
          const today = new Date().toISOString().split('T')[0]; // UTC date
          
          // Get current usage count BEFORE generation
          const { data: usage } = await supabase
            .from('usage_daily')
            .select('gen_count')
            .eq('user_id', userId)
            .eq('day', today)
            .single();

          currentCount = usage?.gen_count || 0;
          console.log('📊 Current usage check:', { userId, today, currentCount });

          // Check limit BEFORE OpenAI call - block if at cap
          if (currentCount >= 3) {
            console.log('🚫 User at daily limit, returning cap response without OpenAI');
            return new Response(
              JSON.stringify({
                id: crypto.randomUUID(),
                name: 'Daily Limit Reached',
                emoji: '🚀',
                color: '#22c55e',
                description: 'You have reached your daily limit of 3 free recipes',
                ingredients: [
                  { name: 'Upgrade to Pro', amount: '∞', unit: 'recipes' }
                ],
                steps: ['Upgrade to Pro for unlimited daily access'],
                benefits: ['Unlimited recipe generation', 'Save unlimited favorites', 'Priority AI processing'],
                prepTime: 0,
                servings: 0,
                moodId,
                goalId,
                usage: {
                  remainingToday: 0,
                  limit: 3,
                  pro: false,
                },
                isLimitReached: true,
              }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }
          
          // Don't increment yet - wait for successful OpenAI response
          remainingToday = Math.max(0, 3 - currentCount);
          console.log(`📊 Current remaining: ${remainingToday} (before generation)`);
        }
      } catch (dbError) {
        console.error('⚠️ Database error (non-fatal):', dbError);
        // Continue with default values instead of failing
        remainingToday = 2; // Conservative fallback
        isPro = false;
      }
    } else {
      console.log('👤 Guest user - no server tracking');
      remainingToday = 3; // Default for guests
    }

    // Generate recipe with OpenAI or fallback
    let recipeData;
    
    console.log('🤖 OpenAI validation check:', {
      hasKey: !!OPENAI_API_KEY,
      startsWithSk: OPENAI_API_KEY ? OPENAI_API_KEY.startsWith('sk-') : false,
      willUseOpenAI: !!(OPENAI_API_KEY && OPENAI_API_KEY.startsWith('sk-'))
    });
    
    if (OPENAI_API_KEY && OPENAI_API_KEY.trim().startsWith('sk-')) {
      try {
        console.log('🤖 Calling OpenAI API...');
        
        const prompt = `Create a healthy juice recipe for someone feeling "${moodId}" who wants to achieve "${goalId}".

Requirements:
- Use only fruits, vegetables, and herbs (no supplements)
- Keep it simple and practical
- Focus on natural ingredients
- Make it tasty and nutritious

Return ONLY valid JSON with this exact structure:
{
  "name": "Recipe Name",
  "emoji": "🥤",
  "color": "#22c55e",
  "description": "Short description",
  "ingredients": [{"name":"ingredient","amount":"1","unit":"cup"}],
  "steps": ["Step 1", "Step 2"],
  "benefits": ["Benefit 1", "Benefit 2"],
  "prepTime": 5,
  "servings": 1
}`;

        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY.trim()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are a nutritionist creating healthy juice recipes. Always respond with valid JSON only.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 1000,
            temperature: 0.7,
            response_format: { type: 'json_object' },
          }),
        });

        if (!openaiResponse.ok) {
          const errorText = await openaiResponse.text();
          console.error('❌ OpenAI API error details:', { 
            status: openaiResponse.status, 
            statusText: openaiResponse.statusText,
            error: errorText,
            headers: Object.fromEntries(openaiResponse.headers.entries())
          });
          throw new Error(`OpenAI API error: ${openaiResponse.status}`);
        }

        const data = await openaiResponse.json();
        const recipeContent = data.choices[0]?.message?.content;

        if (!recipeContent) {
          console.error('⚠️ No content from OpenAI (using fallback)');
          throw new Error('No recipe content generated');
        }

        try {
          recipeData = JSON.parse(recipeContent);
          console.log('✅ OpenAI recipe parsed successfully');
          
          // SUCCESS: Increment usage count atomically AFTER successful OpenAI call
          if (userId && !isPro) {
            try {
              const today = new Date().toISOString().split('T')[0]; // UTC date
              console.log(`📈 Atomically incrementing usage for user ${userId} on ${today}`);
              
              const { data: updatedUsage, error: incrementError } = await supabase
                .rpc('increment_daily_usage', {
                  p_user_id: userId,
                  p_day: today
                });
              
              if (incrementError) {
                console.error('⚠️ Failed to increment usage (non-fatal):', incrementError);
                // Continue with recipe - don't fail the request
              } else {
                const newCount = updatedUsage || (currentCount + 1);
                remainingToday = Math.max(0, 3 - newCount);
                console.log(`📊 Usage incremented to ${newCount}, remaining: ${remainingToday}`);
              }
            } catch (incrementError) {
              console.error('⚠️ Usage increment error (non-fatal):', incrementError);
              // Continue with recipe - don't fail the request
            }
          }
        } catch (parseError) {
          console.error('⚠️ Failed to parse OpenAI response (using fallback):', parseError);
          throw parseError;
        }

      } catch (openaiError) {
        console.error('💥 OpenAI error details:', openaiError);
        console.log('🔄 OpenAI failed, using fallback recipe');
        recipeData = generateFallbackRecipe(moodId, goalId);
        // Don't increment usage on OpenAI failure - keep current remainingToday
      }
    } else {
      console.log('🔄 No valid OpenAI key found, using fallback recipe');
      console.log('Expected format: sk-... but got:', OPENAI_API_KEY ? 'invalid format' : 'no key');
      recipeData = generateFallbackRecipe(moodId, goalId);
      // Don't increment usage for fallback - keep current remainingToday
    }

    // Always return standard JSON response with usage data
    const result = {
      id: crypto.randomUUID(),
      name: recipeData.name || 'Custom Juice',
      emoji: recipeData.emoji || '🥤',
      color: recipeData.color || '#22c55e',
      description: recipeData.description || 'A healthy juice recipe',
      ingredients: recipeData.ingredients || [],
      steps: recipeData.steps || [],
      benefits: recipeData.benefits || [],
      prepTime: recipeData.prepTime || 5,
      servings: recipeData.servings || 1,
      moodId,
      goalId,
      usage: {
        remainingToday,
        limit: 3,
        pro: isPro,
      },
    };

    console.log('✅ Returning recipe with usage:', {
      remainingToday: result.usage.remainingToday,
      limit: result.usage.limit,
      pro: result.usage.pro,
    });

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('💥 Unexpected error in recipe generation:', error);

    // Even for unexpected errors, return 200 with fallback
    return new Response(
      JSON.stringify({
        id: crypto.randomUUID(),
        name: 'Simple Green Juice',
        emoji: '🥬',
        color: '#22c55e',
        description: 'A basic green juice recipe',
        ingredients: [
          { name: 'Spinach', amount: '2', unit: 'cups' },
          { name: 'Apple', amount: '1', unit: 'medium' },
          { name: 'Lemon', amount: '1/2', unit: 'juice of' }
        ],
        steps: [
          'Wash all ingredients',
          'Add to blender',
          'Blend until smooth',
          'Serve fresh'
        ],
        benefits: ['Rich in vitamins', 'Natural energy boost'],
        prepTime: 5,
        servings: 1,
        moodId: 'tired',
        goalId: 'energy',
        usage: {
          remainingToday: 0,
          limit: 3,
          pro: false,
        },
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});