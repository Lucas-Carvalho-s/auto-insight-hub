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

interface ErrorResponse {
  error: string;
  details?: string;
  code?: string;
}

// Helper function to create consistent error responses with CORS
function createErrorResponse(
  error: string, 
  status: number, 
  details?: string,
  code?: string
): Response {
  const body: ErrorResponse = { error };
  if (details) body.details = details;
  if (code) body.code = code;
  
  console.error(`[Error ${status}] ${error}`, details ? `- ${details}` : '');
  
  return new Response(
    JSON.stringify(body),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

// Helper to safely parse JSON with fallback
function safeJsonParse<T>(text: string, fallback: T): { data: T; success: boolean } {
  try {
    return { data: JSON.parse(text) as T, success: true };
  } catch {
    console.warn('[JSON Parse Warning] Failed to parse:', text.substring(0, 500));
    return { data: fallback, success: false };
  }
}

// Helper to make OpenAI API calls with timeout and error handling
async function fetchOpenAI(
  url: string, 
  options: RequestInit,
  timeoutMs: number = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('TIMEOUT: OpenAI API request timed out after ' + timeoutMs + 'ms');
    }
    throw error;
  }
}

// Helper to handle OpenAI API errors
function handleOpenAIError(response: Response, context: string): Response | null {
  if (response.ok) return null;
  
  const status = response.status;
  
  if (status === 401) {
    return createErrorResponse(
      'Erro de autenticação com o serviço de IA',
      502,
      'Chave da API OpenAI inválida ou expirada',
      'OPENAI_AUTH_ERROR'
    );
  }
  
  if (status === 429) {
    return createErrorResponse(
      'Serviço de IA temporariamente indisponível',
      503,
      'Limite de requisições da OpenAI excedido. Tente novamente em alguns segundos.',
      'OPENAI_RATE_LIMIT'
    );
  }
  
  if (status === 500 || status === 502 || status === 503) {
    return createErrorResponse(
      'Serviço de IA indisponível',
      502,
      `OpenAI retornou status ${status} durante ${context}`,
      'OPENAI_SERVICE_ERROR'
    );
  }
  
  return createErrorResponse(
    'Erro ao comunicar com o serviço de IA',
    502,
    `OpenAI retornou status ${status} durante ${context}`,
    'OPENAI_ERROR'
  );
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ========== STEP 1: Validate Environment Variables ==========
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const OPENAI_ASSISTANT_ID = Deno.env.get('OPENAI_ASSISTANT_ID');

    if (!OPENAI_API_KEY) {
      return createErrorResponse(
        'Configuração do servidor incompleta',
        500,
        'OPENAI_API_KEY não está configurada',
        'CONFIG_ERROR'
      );
    }

    if (!OPENAI_ASSISTANT_ID) {
      return createErrorResponse(
        'Configuração do servidor incompleta',
        500,
        'OPENAI_ASSISTANT_ID não está configurada',
        'CONFIG_ERROR'
      );
    }

    // ========== STEP 2: Parse and Validate Request Body ==========
    let requestBody: DiagnoseRequest;
    
    try {
      requestBody = await req.json();
    } catch (parseError) {
      return createErrorResponse(
        'Corpo da requisição inválido',
        400,
        'O corpo da requisição deve ser um JSON válido',
        'INVALID_REQUEST_JSON'
      );
    }

    const { message, threadId: existingThreadId } = requestBody;

    // Validate message is provided and not empty
    if (!message || typeof message !== 'string') {
      return createErrorResponse(
        'Mensagem não fornecida',
        400,
        'O campo "message" é obrigatório e deve ser uma string',
        'MISSING_MESSAGE'
      );
    }

    if (message.trim().length === 0) {
      return createErrorResponse(
        'Mensagem vazia',
        400,
        'A mensagem não pode estar vazia',
        'EMPTY_MESSAGE'
      );
    }

    // Validate message length (prevent abuse)
    if (message.length > 10000) {
      return createErrorResponse(
        'Mensagem muito longa',
        400,
        'A mensagem deve ter no máximo 10.000 caracteres',
        'MESSAGE_TOO_LONG'
      );
    }

    console.log('[Diagnose] Processing request:', { 
      messageLength: message.length, 
      hasExistingThread: !!existingThreadId 
    });

    // ========== STEP 3: Create or Reuse Thread ==========
    let threadId = existingThreadId;
    
    if (!threadId) {
      console.log('[Diagnose] Creating new thread...');
      
      let threadResponse: Response;
      try {
        threadResponse = await fetchOpenAI('https://api.openai.com/v1/threads', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'assistants=v2'
          },
          body: JSON.stringify({})
        });
      } catch (fetchError) {
        const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown error';
        return createErrorResponse(
          'Falha ao conectar com o serviço de IA',
          502,
          `Erro de conexão ao criar thread: ${errorMessage}`,
          'OPENAI_CONNECTION_ERROR'
        );
      }

      const threadError = handleOpenAIError(threadResponse, 'criação de thread');
      if (threadError) return threadError;

      const threadText = await threadResponse.text();
      const { data: threadData, success: threadParseSuccess } = safeJsonParse<{ id?: string }>(threadText, {});
      
      if (!threadParseSuccess || !threadData.id) {
        return createErrorResponse(
          'Resposta inesperada do serviço de IA',
          502,
          'OpenAI retornou dados inválidos ao criar thread',
          'OPENAI_INVALID_RESPONSE'
        );
      }

      threadId = threadData.id;
      console.log('[Diagnose] Thread created:', threadId);
    }

    // ========== STEP 4: Add Message to Thread ==========
    console.log('[Diagnose] Adding message to thread...');
    
    let messageResponse: Response;
    try {
      messageResponse = await fetchOpenAI(`https://api.openai.com/v1/threads/${threadId}/messages`, {
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
    } catch (fetchError) {
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown error';
      return createErrorResponse(
        'Falha ao enviar mensagem para o serviço de IA',
        502,
        `Erro de conexão ao adicionar mensagem: ${errorMessage}`,
        'OPENAI_CONNECTION_ERROR'
      );
    }

    const messageError = handleOpenAIError(messageResponse, 'envio de mensagem');
    if (messageError) return messageError;

    // Consume response body
    await messageResponse.text();
    console.log('[Diagnose] Message added to thread');

    // ========== STEP 5: Create Run with Assistant ==========
    console.log('[Diagnose] Creating run with assistant:', OPENAI_ASSISTANT_ID);
    
    let runResponse: Response;
    try {
      runResponse = await fetchOpenAI(`https://api.openai.com/v1/threads/${threadId}/runs`, {
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
    } catch (fetchError) {
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown error';
      return createErrorResponse(
        'Falha ao iniciar análise de diagnóstico',
        502,
        `Erro de conexão ao criar run: ${errorMessage}`,
        'OPENAI_CONNECTION_ERROR'
      );
    }

    const runError = handleOpenAIError(runResponse, 'criação de run');
    if (runError) return runError;

    const runText = await runResponse.text();
    const { data: runData, success: runParseSuccess } = safeJsonParse<{ id?: string; status?: string }>(runText, {});
    
    if (!runParseSuccess || !runData.id) {
      return createErrorResponse(
        'Resposta inesperada do serviço de IA',
        502,
        'OpenAI retornou dados inválidos ao criar run',
        'OPENAI_INVALID_RESPONSE'
      );
    }

    const runId = runData.id;
    console.log('[Diagnose] Run created:', runId);

    // ========== STEP 6: Poll for Completion ==========
    let runStatus = runData.status;
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds max wait

    while (runStatus !== 'completed' && runStatus !== 'failed' && runStatus !== 'cancelled' && runStatus !== 'expired') {
      if (attempts >= maxAttempts) {
        return createErrorResponse(
          'Tempo limite de análise excedido',
          504,
          `O diagnóstico não foi concluído após ${maxAttempts} segundos`,
          'DIAGNOSIS_TIMEOUT'
        );
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;

      let statusResponse: Response;
      try {
        statusResponse = await fetchOpenAI(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        });
      } catch (fetchError) {
        console.warn(`[Diagnose] Status check attempt ${attempts} failed, retrying...`);
        continue; // Retry on connection error
      }

      if (!statusResponse.ok) {
        console.warn(`[Diagnose] Status check returned ${statusResponse.status}, retrying...`);
        continue; // Retry on API error
      }

      const statusText = await statusResponse.text();
      const { data: statusData } = safeJsonParse<{ status?: string }>(statusText, {});
      
      if (statusData.status) {
        runStatus = statusData.status;
        console.log(`[Diagnose] Run status (attempt ${attempts}):`, runStatus);
      }
    }

    if (runStatus === 'failed') {
      return createErrorResponse(
        'Análise de diagnóstico falhou',
        500,
        'O assistente de IA encontrou um erro durante a análise',
        'DIAGNOSIS_FAILED'
      );
    }

    if (runStatus === 'cancelled') {
      return createErrorResponse(
        'Análise de diagnóstico cancelada',
        500,
        'A análise foi cancelada pelo sistema',
        'DIAGNOSIS_CANCELLED'
      );
    }

    if (runStatus === 'expired') {
      return createErrorResponse(
        'Sessão de análise expirada',
        500,
        'A sessão do assistente expirou',
        'DIAGNOSIS_EXPIRED'
      );
    }

    // ========== STEP 7: Retrieve Assistant Response ==========
    console.log('[Diagnose] Retrieving messages...');
    
    let messagesResponse: Response;
    try {
      messagesResponse = await fetchOpenAI(`https://api.openai.com/v1/threads/${threadId}/messages?order=desc&limit=1`, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      });
    } catch (fetchError) {
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown error';
      return createErrorResponse(
        'Falha ao recuperar resultado do diagnóstico',
        502,
        `Erro de conexão ao recuperar mensagens: ${errorMessage}`,
        'OPENAI_CONNECTION_ERROR'
      );
    }

    const messagesError = handleOpenAIError(messagesResponse, 'recuperação de mensagens');
    if (messagesError) return messagesError;

    const messagesText = await messagesResponse.text();
    const { data: messagesData, success: messagesParseSuccess } = safeJsonParse<{ data?: OpenAIMessage[] }>(messagesText, { data: [] });

    if (!messagesParseSuccess) {
      return createErrorResponse(
        'Resposta inesperada do serviço de IA',
        502,
        'OpenAI retornou dados inválidos ao recuperar mensagens',
        'OPENAI_INVALID_RESPONSE'
      );
    }

    const assistantMessage = messagesData.data?.find((msg: OpenAIMessage) => msg.role === 'assistant');

    if (!assistantMessage) {
      return createErrorResponse(
        'Nenhuma resposta do assistente encontrada',
        500,
        'O assistente não gerou uma resposta para o diagnóstico',
        'NO_ASSISTANT_RESPONSE'
      );
    }

    const responseText = assistantMessage.content
      .filter((c: { type: string }) => c.type === 'text')
      .map((c: { type: string; text?: { value: string } }) => c.text?.value || '')
      .join('\n');

    if (!responseText || responseText.trim().length === 0) {
      return createErrorResponse(
        'Resposta vazia do assistente',
        500,
        'O assistente retornou uma resposta vazia',
        'EMPTY_ASSISTANT_RESPONSE'
      );
    }

    console.log('[Diagnose] Diagnosis complete, response length:', responseText.length);

    // ========== SUCCESS: Return Result ==========
    return new Response(
      JSON.stringify({
        threadId,
        response: responseText,
        messageId: assistantMessage.id,
        success: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // ========== CATCH-ALL: Unexpected Errors ==========
    console.error('[Diagnose] Unexpected error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return createErrorResponse(
      'Erro interno do servidor',
      500,
      errorMessage,
      'INTERNAL_ERROR'
    );
  }
});
