"use client";

import React, { useMemo } from 'react';
import { Sandpack } from "@codesandbox/sandpack-react";
import { Layout } from 'lucide-react';

export default function SmartPreview({ files, projectName, projectId }: { files: Record<string, { content: string }>, projectName?: string, projectId?: string }) {

    // Convert Vantage's file structure to Sandpack's virtual file system
    const sandpackFiles = useMemo(() => {
        const formatted: Record<string, string> = {};
        const externalImports = new Set<string>();

        function normalizePath(path: string) {
            let sandpackPath = path.replace(/^src\/app\//, '').replace(/^src\//, '/');
            if (!sandpackPath.startsWith('/')) {
                sandpackPath = `/${sandpackPath}`;
            }
            return sandpackPath === '/page.tsx' ? '/App.tsx' : sandpackPath;
        }

        function dirname(path: string) {
            const parts = path.split('/').filter(Boolean);
            parts.pop();
            return `/${parts.join('/')}`;
        }

        function relativePath(fromDir: string, toPath: string) {
            const from = fromDir.split('/').filter(Boolean);
            const to = toPath.split('/').filter(Boolean);
            while (from.length && to.length && from[0] === to[0]) {
                from.shift();
                to.shift();
            }
            const ups = from.map(() => '..');
            const joined = [...ups, ...to].join('/');
            return joined.startsWith('.') ? joined : `./${joined}`;
        }

        const rawFiles: Record<string, string> = {};
        Object.entries(files).forEach(([path, data]) => {
            rawFiles[normalizePath(path)] = data.content;
        });

        const allPaths = new Set(Object.keys(rawFiles));

        function findAliasTarget(aliasPath: string): string | null {
            const candidates = [
                aliasPath,
                `${aliasPath}.tsx`,
                `${aliasPath}.ts`,
                `${aliasPath}.jsx`,
                `${aliasPath}.js`,
                `${aliasPath}.css`,
                `${aliasPath}/index.tsx`,
                `${aliasPath}/index.ts`,
                `${aliasPath}/index.jsx`,
                `${aliasPath}/index.js`,
            ];
            if (aliasPath.startsWith('/app/')) {
                const trimmed = aliasPath.replace(/^\/app\//, '/');
                candidates.push(
                    trimmed,
                    `${trimmed}.tsx`,
                    `${trimmed}.ts`,
                    `${trimmed}.jsx`,
                    `${trimmed}.js`,
                    `${trimmed}.css`,
                );
            }
            for (const candidate of candidates) {
                if (allPaths.has(candidate)) return candidate;
            }
            return null;
        }

        function rewriteImports(content: string, currentPath: string) {
            const currentDir = dirname(currentPath);

            const rewriteSpecifier = (specifier: string) => {
                if (!specifier.startsWith('.') && !specifier.startsWith('/')) {
                    const pkgName = specifier.startsWith('@')
                        ? specifier.split('/').slice(0, 2).join('/')
                        : specifier.split('/')[0];
                    if (!pkgName.startsWith('next') && pkgName !== 'react' && pkgName !== 'react-dom') {
                        externalImports.add(pkgName);
                    }
                }
                if (specifier.startsWith('@/')) {
                    const aliasPath = `/${specifier.slice(2)}`;
                    const target = findAliasTarget(aliasPath);
                    if (target) {
                        return relativePath(currentDir, target);
                    }
                    return specifier;
                }
                if (specifier === 'next/link') {
                    return relativePath(currentDir, '/__mocks__/next-link.tsx');
                }
                if (specifier === 'next/image') {
                    return relativePath(currentDir, '/__mocks__/next-image.tsx');
                }
                if (specifier === 'next/navigation' || specifier === 'next/router') {
                    return relativePath(currentDir, '/__mocks__/next-navigation.ts');
                }
                return specifier;
            };

            let rewritten = content;
            rewritten = rewritten.replace(
                /(from\s+['"])([^'"]+)(['"])/g,
                (_m, p1, specifier, p3) => `${p1}${rewriteSpecifier(specifier)}${p3}`,
            );
            rewritten = rewritten.replace(
                /(import\s+['"])([^'"]+)(['"])/g,
                (_m, p1, specifier, p3) => `${p1}${rewriteSpecifier(specifier)}${p3}`,
            );
            return rewritten;
        }

        let hasAppTsx = false;
        Object.entries(rawFiles).forEach(([sandpackPath, rawContent]) => {
            let content = rewriteImports(rawContent, sandpackPath);
            if (sandpackPath === '/App.tsx') {
                hasAppTsx = true;
                if (!content.includes('export default')) {
                    const match = content.match(/export (?:const|function) ([A-Z][a-zA-Z0-9_]*)/);
                    if (match) {
                        content += `\n\nexport default ${match[1]};`;
                    }
                }
            }
            formatted[sandpackPath] = content;
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

        // Mocks for common Next.js imports so preview keeps rendering in react-ts template.
        formatted['/__mocks__/next-link.tsx'] = `
import React from 'react';
export default function Link({ href, children, ...props }: any) {
  return <a href={href} {...props}>{children}</a>;
}
        `;
        formatted['/__mocks__/next-image.tsx'] = `
import React from 'react';
export default function Image({ src, alt, ...props }: any) {
  return <img src={typeof src === 'string' ? src : ''} alt={alt ?? ''} {...props} />;
}
        `;
        formatted['/__mocks__/next-navigation.ts'] = `
export function useRouter() {
  return { push() {}, replace() {}, back() {}, prefetch: async () => {} };
}
export function useParams() { return {}; }
export function useSearchParams() {
  return { get() { return null; }, toString() { return ''; } };
}
        `;

        // Supply a generic styles.css just in case
        formatted['/styles.css'] = `
body {
    background-color: #020204;
    color: #ffffff;
}
        `;

        const presetVersions: Record<string, string> = {
            'lucide-react': 'latest',
            'framer-motion': 'latest',
            'clsx': 'latest',
            'tailwind-merge': 'latest',
            'date-fns': 'latest',
            'dayjs': 'latest',
            'axios': 'latest',
            'zustand': 'latest',
            'recharts': 'latest',
            'chart.js': 'latest',
            'react-chartjs-2': 'latest',
            'react-hook-form': 'latest',
            'zod': 'latest',
            '@tanstack/react-query': 'latest',
            '@headlessui/react': 'latest',
            '@heroicons/react': 'latest',
            '@radix-ui/react-dialog': 'latest',
            '@radix-ui/react-dropdown-menu': 'latest',
            '@radix-ui/react-tabs': 'latest',
            '@radix-ui/react-popover': 'latest',
            '@radix-ui/react-tooltip': 'latest',
            '@radix-ui/react-select': 'latest',
            '@radix-ui/react-toast': 'latest',
        };

        const dynamicDependencies: Record<string, string> = {
            react: '^18.3.1',
            'react-dom': '^18.3.1',
        };

        externalImports.forEach((pkg) => {
            dynamicDependencies[pkg] = presetVersions[pkg] ?? 'latest';
        });

        formatted['/package.json'] = JSON.stringify({
            name: 'vantage-preview',
            private: true,
            version: '0.0.0',
            dependencies: dynamicDependencies,
        }, null, 2);

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
                        "react": "^18.3.1",
                        "react-dom": "^18.3.1",
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
