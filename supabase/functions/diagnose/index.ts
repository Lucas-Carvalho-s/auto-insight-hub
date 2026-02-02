import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface DiagnoseRequest {
  message: string;
  threadId?: string;
}

interface OpenAIMessage {
  id: string;
  role: string;
  content: Array<{
    type: string;
    text?: { value: string };
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const OPENAI_ASSISTANT_ID = Deno.env.get('OPENAI_ASSISTANT_ID');

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    if (!OPENAI_ASSISTANT_ID) {
      throw new Error('OPENAI_ASSISTANT_ID is not configured');
    }

    const { message, threadId: existingThreadId }: DiagnoseRequest = await req.json();

    if (!message || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing diagnosis request:', { message, existingThreadId });

    // Step 1: Create or reuse a Thread
    let threadId = existingThreadId;
    
    if (!threadId) {
      console.log('Creating new thread...');
      const threadResponse = await fetch('https://api.openai.com/v1/threads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({})
      });

      if (!threadResponse.ok) {
        const errorText = await threadResponse.text();
        console.error('Failed to create thread:', errorText);
        throw new Error(`Failed to create thread: ${threadResponse.status}`);
      }

      const threadData = await threadResponse.json();
      threadId = threadData.id;
      console.log('Thread created:', threadId);
    }

    // Step 2: Add the user message to the Thread
    console.log('Adding message to thread...');
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        role: 'user',
        content: message
      })
    });

    if (!messageResponse.ok) {
      const errorText = await messageResponse.text();
      console.error('Failed to add message:', errorText);
      throw new Error(`Failed to add message: ${messageResponse.status}`);
    }

    await messageResponse.json();
    console.log('Message added to thread');

    // Step 3: Create a Run with the Assistant
    console.log('Creating run with assistant:', OPENAI_ASSISTANT_ID);
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        assistant_id: OPENAI_ASSISTANT_ID
      })
    });

    if (!runResponse.ok) {
      const errorText = await runResponse.text();
      console.error('Failed to create run:', errorText);
      throw new Error(`Failed to create run: ${runResponse.status}`);
    }

    const runData = await runResponse.json();
    const runId = runData.id;
    console.log('Run created:', runId);

    // Step 4: Poll for completion
    let runStatus = runData.status;
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds max wait

    while (runStatus !== 'completed' && runStatus !== 'failed' && runStatus !== 'cancelled' && runStatus !== 'expired') {
      if (attempts >= maxAttempts) {
        throw new Error('Run timed out');
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;

      const statusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      });

      if (!statusResponse.ok) {
        const errorText = await statusResponse.text();
        console.error('Failed to check run status:', errorText);
        throw new Error(`Failed to check run status: ${statusResponse.status}`);
      }

      const statusData = await statusResponse.json();
      runStatus = statusData.status;
      console.log(`Run status (attempt ${attempts}):`, runStatus);
    }

    if (runStatus !== 'completed') {
      throw new Error(`Run ended with status: ${runStatus}`);
    }

    // Step 5: Retrieve the assistant's response
    console.log('Retrieving messages...');
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages?order=desc&limit=1`, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'assistants=v2'
      }
    });

    if (!messagesResponse.ok) {
      const errorText = await messagesResponse.text();
      console.error('Failed to retrieve messages:', errorText);
      throw new Error(`Failed to retrieve messages: ${messagesResponse.status}`);
    }

    const messagesData = await messagesResponse.json();
    const assistantMessage = messagesData.data.find((msg: OpenAIMessage) => msg.role === 'assistant');

    if (!assistantMessage) {
      throw new Error('No assistant response found');
    }

    const responseText = assistantMessage.content
      .filter((c: { type: string }) => c.type === 'text')
      .map((c: { type: string; text?: { value: string } }) => c.text?.value || '')
      .join('\n');

    console.log('Diagnosis complete');

    return new Response(
      JSON.stringify({
        threadId,
        response: responseText,
        messageId: assistantMessage.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Diagnosis error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
