import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { AGENT_PERSONAS, Role } from './roles';

export interface ProjectFile {
    path: string;
    content: string;
}

export interface SwarmMessage {
    role: Role;
    content: string;
    timestamp: Date;
    files?: ProjectFile[];
}

export class SwarmManager {
    private messages: SwarmMessage[] = [];
    private openai: OpenAI | null = null;
    private anthropic: Anthropic | null = null;
    private projectFiles: ProjectFile[] = [];

    constructor() {
        const oaiKey = process.env.OPENAI_API_KEY;
        const antKey = process.env.ANTHROPIC_API_KEY;

        if (oaiKey) this.openai = new OpenAI({ apiKey: oaiKey });
        if (antKey) this.anthropic = new Anthropic({ apiKey: antKey });
    }

    async processRequest(userPrompt: string) {
        if (!this.openai && !this.anthropic) {
            this.addLog('Manager', "Error: No API Keys found. Please add OpenAI or Anthropic keys to .env.local");
            return;
        }

        this.addLog('Manager', `Initializing Multi-LLM swarm for: "${userPrompt}"`);

        // Stage 1: Architect Plans (GPT-4o)
        await this.runAgent('Architect', userPrompt, 'openai');

        // Stage 2: Designer Sketches (Claude 3.5 Sonnet)
        await this.runAgent('Designer', `Based on the Architect's plan, design the UI for: ${userPrompt}`, 'anthropic');

        // Stage 3: Coder Implements (Claude 3.5 Sonnet)
        await this.runAgent('Coder', `Implement the following SaaS idea following the Architect's plan and Designer's aesthetics: ${userPrompt}`, 'anthropic');

        this.addLog('Manager', "Swarm mission complete. Final code is ready.");
    }

    private async runAgent(role: Role, prompt: string, provider: 'openai' | 'anthropic' = 'openai') {
        const persona = AGENT_PERSONAS[role];
        this.addLog(role, `Thinking with ${provider === 'openai' ? 'GPT-4o' : 'Claude 3.5 Sonnet'}...`);

        try {
            let content = "";

            if (provider === 'openai' && this.openai) {
                const response = await this.openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: [
                        { role: "system", content: persona.systemPrompt },
                        { role: "user", content: prompt }
                    ],
                });
                content = response.choices[0].message.content || "";
            } else if (provider === 'anthropic' && this.anthropic) {
                const response = await this.anthropic.messages.create({
                    model: "claude-3-5-sonnet-20240620",
                    max_tokens: 4096,
                    system: persona.systemPrompt,
                    messages: [{ role: "user", content: prompt }],
                });
                content = (response.content[0] as any).text || "";
            }

            // If it's the coder, try to parse files
            let files: ProjectFile[] | undefined;
            if (role === 'Coder') {
                try {
                    // Find JSON block if it's wrapped in markdown
                    const jsonMatch = content.match(/\{[\s\S]*\}/);
                    const jsonStr = jsonMatch ? jsonMatch[0] : content;
                    const parsed = JSON.parse(jsonStr);
                    if (parsed.files) {
                        files = parsed.files;
                        this.projectFiles = files || [];
                        content = "Source code generated successfully.";
                    }
                } catch (e) {
                    console.error("Failed to parse files from Coder", e);
                }
            }

            this.addLog(role, content || "I have completed my task.", files);
        } catch (error) {
            this.addLog(role, `Error: Failed to communicate with ${provider}.`);
            console.error(error);
        }
    }

    private addLog(role: Role, content: string, files?: ProjectFile[]) {
        const msg: SwarmMessage = { role, content, timestamp: new Date(), files };
        this.messages.push(msg);
        console.log(`[${role}] ${content}`);
    }

    getMessages() {
        return this.messages;
    }

    getProjectFiles() {
        return this.projectFiles;
    }
}
