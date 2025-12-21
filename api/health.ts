/**
 * @fileoverview Health check endpoint for Vercel
 * @version 1.0.0
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MCP_SERVER, APP } from '../src/shared/constants/index.js';

export default function handler(
    req: VercelRequest,
    res: VercelResponse
): void {
    res.setHeader('Access-Control-Allow-Origin', '*');

    res.status(200).json({
        name: APP.NAME,
        version: APP.VERSION,
        mcpVersion: MCP_SERVER.PROTOCOL_VERSION,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/api/health',
            mcp: '/api/mcp',
            sse: '/api/mcp/sse',
        },
        documentation: 'https://github.com/quangminh1212/MCP_IntelliBench',
    });
}
