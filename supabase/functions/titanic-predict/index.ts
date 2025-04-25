
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Preprocess the input data
function preprocessData(data: {
  age: number;
  sex: string;
  passengerClass: string;
  siblings: number;
  parents: number;
}) {
  const normalizedAge = data.age / 100;
  const sexEncoded = data.sex === 'male' ? 1 : 0;
  const classEncoded = parseInt(data.passengerClass);
  const normalizedSiblings = data.siblings / 10;
  const normalizedParents = data.parents / 10;
  
  return [
    normalizedAge,
    sexEncoded,
    classEncoded,
    normalizedSiblings,
    normalizedParents
  ];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { age, sex, passengerClass, siblings, parents } = await req.json()

    // Preprocess the input data
    const features = preprocessData({ age, sex, passengerClass, siblings, parents })
    
    // Use the Hugging Face API to get predictions
    const response = await fetch(
      "https://api-inference.huggingface.co/models/Xenova/titanic-survival-prediction",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(features.join(' ')),
      }
    );

    const result = await response.json();
    
    // Add debug logging to see the actual response structure
    console.log('Hugging Face API response:', JSON.stringify(result));
    
    // Handle different possible response formats
    let prediction, probability;
    
    if (Array.isArray(result) && result.length > 0 && result[0].label) {
      // Format: [{label: 'SURVIVED', score: 0.95}]
      prediction = result[0].label === 'SURVIVED' ? 'Survived' : 'Did Not Survive';
      probability = result[0].score;
    } else if (result.label) {
      // Format: {label: 'SURVIVED', score: 0.95}
      prediction = result.label === 'SURVIVED' ? 'Survived' : 'Did Not Survive';
      probability = result.score;
    } else if (typeof result === 'string') {
      // Just in case it returns a direct string result
      prediction = result.includes('SURVIVED') ? 'Survived' : 'Did Not Survive';
      probability = 0.75; // Default confidence if not provided
    } else {
      // If we can't parse the response in any expected format, use a default response
      prediction = 'Unable to determine';
      probability = 0.5;
      console.error('Unexpected response format from Hugging Face API:', result);
    }
    
    return new Response(
      JSON.stringify({
        prediction: prediction,
        probability: probability
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Prediction error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to make prediction', details: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
