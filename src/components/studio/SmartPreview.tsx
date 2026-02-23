"use client";

import React, { useMemo } from 'react';
import { Sandpack } from "@codesandbox/sandpack-react";
import { Layout } from 'lucide-react';

export default function SmartPreview({ files, projectName, projectId }: { files: Record<string, { content: string }>, projectName?: string, projectId?: string }) {

    // Convert Vantage's file structure to Sandpack's virtual file system
    const sandpackFiles = useMemo(() => {
        const formatted: Record<string, string> = {};

        let hasAppTsx = false;

        Object.entries(files).forEach(([path, data]) => {
            // Strip any src/app/ or similar Next.js-isms to flatten for Sandpack
            let sandpackPath = path.replace(/^src\/app\//, '').replace(/^src\//, '/');
            if (!sandpackPath.startsWith('/')) {
                sandpackPath = `/${sandpackPath}`;
            }

            // If they wrote page.tsx, Map it to App.tsx
            if (sandpackPath === '/page.tsx') {
                sandpackPath = '/App.tsx';
            }

            if (sandpackPath === '/App.tsx') {
                hasAppTsx = true;
                // Add a simple export default wrapped App if they didn't export default
                let content = data.content;
                if (!content.includes('export default')) {
                    // Try to find the main component and export it
                    const match = content.match(/export (?:const|function) ([A-Z][a-zA-Z0-9_]*)/);
                    if (match) {
                        content += `\n\nexport default ${match[1]};`;
                    }
                }
                formatted[sandpackPath] = content;
            } else {
                formatted[sandpackPath] = data.content;
            }
        });

        // Always ensure we have an App.tsx if they didn't write one natively
        if (!hasAppTsx) {
            const possibleEntry = formatted['/index.tsx'] || formatted['/main.tsx'] || formatted['/page.tsx'] || null;
            if (possibleEntry) {
                formatted['/App.tsx'] = possibleEntry;
            } else if (Object.keys(formatted).length > 0) {
                formatted['/App.tsx'] = Object.values(formatted)[0];
            }
        }

        // Inject Tailwind CDN via public/index.html to ensure styles work flawlessly
        formatted['/public/index.html'] = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vantage Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              border: "hsl(var(--border))",
              background: "hsl(var(--background))",
              foreground: "hsl(var(--foreground))",
            }
          }
        }
      }
    </script>
    <style>
       body { margin: 0; padding: 0; font-family: ui-sans-serif, system-ui, sans-serif; background: #000; color: #fff; }
    </style>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

        // Supply a generic styles.css just in case
        formatted['/styles.css'] = `
body {
    background-color: #020204;
    color: #ffffff;
}
        `;

        return formatted;
    }, [files]);

    if (Object.keys(files).length === 0) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', background: '#050508' }}>
                <Layout size={48} strokeWidth={1} style={{ marginBottom: 16, opacity: 0.3 }} />
                <p style={{ fontSize: 14, fontWeight: 600 }}>{Object.keys(files).length === 0 ? 'Waiting on User Input...' : 'Awaiting Swarm Code...'}</p>
                <div style={{ display: 'flex', gap: 4, marginTop: 12 }}>
                    {[0, 1, 2].map(i => (
                        <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', opacity: 0.3 + (i * 0.3) }} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: '100%', background: '#000', borderRadius: 'inherit', overflow: 'hidden' }}>
            <Sandpack
                template="react-ts"
                theme="dark"
                files={sandpackFiles}
                customSetup={{
                    dependencies: {
                        "lucide-react": "latest",
                        "framer-motion": "latest",
                        "clsx": "latest",
                        "tailwind-merge": "latest"
                    }
                }}
                options={{
                    showNavigator: true,
                    showTabs: false,
                    editorHeight: '100%',
                    classes: {
                        "sp-layout": "h-full rounded-none border-0",
                        "sp-preview-container": "h-full bg-black rounded-none flex-1",
                    }
                }}
            />
            <style>{`
                .sp-layout { height: 100% !important; border: none !important; border-radius: 0 !important; }
                .sp-wrapper { height: 100% !important; }
                /* Hide the editor to make it pure preview */
                .sp-editor { display: none !important; }
                .sp-preview { background: #000; height: 100% !important; }
            `}</style>
        </div>
    );
}
