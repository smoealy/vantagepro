import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    const { messages, projectId } = await req.json();

    const result = await streamText({
        model: openai('gpt-4o'),
        system: `You are the Manager of Vantage Swarm — an elite AI development team that builds SaaS products.

You orchestrate three specialized agents:
- **Architect**: Plans the system design and file structure  
- **Coder**: Writes the actual code
- **Designer**: Handles UI/UX decisions

Your workflow for EVERY request:
Phase 1: Discovery (Crucial for uniqueness)
- **Manager Thought**: Call logSwarmThought. ANALYZE the user's prompt. Is it a generic request like "make a dashboard" or "build a fitness app"? 
- If YES (generic): You MUST call logSwarmThought with type "question" asking the user a single, highly specific question to gather details (e.g., target audience, unique features, aesthetic vibe). DO NOT PROCEED TO PHASE 2. Stop executing here.
- If NO (detailed): Proceed to Phase 2.

Phase 2: Execution (Only if prompt is detailed)
1. **Architect Thought**: Call logSwarmThought. Design a MODULAR file structure. Don't put everything in App.tsx. Suggested components: Header.tsx, Hero.tsx, Features.tsx, Pricing.tsx, Dashboard.tsx.
2. **Designer Thought**: Call logSwarmThought. Define the visual aesthetic (Luxurious, Technical, Playful, etc.).
3. **Execution**: Call writeFile for EACH file. BE THOROUGH. Write FULL, production-ready React code.
4. **Coder Thought**: Call logSwarmThought after writing all files to confirm the build is ready.

Rules for Code Execution (Sandpack Environment):
- YOU MUST write an \`App.tsx\` file as the main entry point. This is critical. Do NOT write \`page.tsx\`.
- Use Tailwind CSS utility classes. They are pre-configured in the environment.
- Use \`lucide-react\` for icons.
- You can write multiple components (e.g., \`Header.tsx\`, \`Dashboard.tsx\`) and import them into \`App.tsx\`.
- NO PLACEHOLDERS. Write REAL logic. Complete all features requested.
- If the prompt is about "Crypto", use crypto terms. If "Fitness", use fitness terms.`,
        messages,
        tools: {
            writeFile: {
                description: 'Writes a complete file to the project. Call this for each file you create.',
                parameters: z.object({
                    path: z.string().describe('File path like src/App.tsx'),
                    content: z.string().describe('Complete file content — full working code'),
                    description: z.string().describe('One-line description of what this file does'),
                }),
                execute: async (args) => {
                    if (projectId) {
                        const { error } = await supabaseAdmin.from('files').upsert({
                            project_id: projectId,
                            path: args.path,
                            content: args.content,
                        }, { onConflict: 'project_id,path' });

                        if (error) console.error('Supabase File Error:', error);
                    }
                    return { status: 'written', path: args.path };
                },
            },
            logSwarmThought: {
                description: 'Logs a thought or communication from one of the agents. Use this frequently.',
                parameters: z.object({
                    agent: z.enum(['Manager', 'Architect', 'Coder', 'Designer']),
                    thought: z.string().describe('What this agent is thinking or doing right now'),
                    type: z.enum(['planning', 'coding', 'designing', 'reviewing', 'decision', 'question']),
                }),
                execute: async (args) => {
                    if (projectId) {
                        const { error } = await supabaseAdmin.from('messages').insert({
                            project_id: projectId,
                            role: args.agent,
                            content: args.thought,
                        });

                        if (error) console.error('Supabase Message Error:', error);
                    }
                    return { status: 'logged', agent: args.agent };
                },
            },
        },
        maxSteps: 10,
        onFinish: async () => {
            if (projectId) {
                await supabaseAdmin.from('projects').update({ status: 'ready' }).eq('id', projectId);
            }
        },
    });

    return result.toDataStreamResponse();
}
