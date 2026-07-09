/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// Apply auth so it is a secure enterprise endpoint
router.use(authMiddleware);

// Generate 5,000 highly realistic, enterprise-grade mock log events
const LOG_ACTIONS = [
  "DB_QUERY_OPTIMIZED", "REDIS_CACHE_HIT", "REDIS_CACHE_MISS", "INDEX_REBUILT",
  "ES_SYNC_COMPLETED", "SOCKET_MESSAGE_BROADCAST", "CRON_JOB_EXECUTED",
  "OAUTH_TOKEN_REFRESHED", "SECURITY_AUDIT_PASSED", "HEAVY_ANALYTICS_COMPILED",
  "VM_AUTOSCALED_UP", "LOAD_BALANCER_HEALTHY", "FAILOVER_CLUSTER_READY"
];

const LOG_MODULES = [
  "DatabaseConnector", "SessionStore", "SearchIndexService", "SocketIOHandler",
  "AutomationEngine", "AIService", "SecurityAuditor", "BillingGateway", "IngressController"
];

const MOCK_LOGS = Array.from({ length: 5000 }, (_, i) => {
  const timestamp = new Date(Date.now() - i * 45000).toISOString(); // spacing logs every 45s
  const action = LOG_ACTIONS[i % LOG_ACTIONS.length];
  const moduleName = LOG_MODULES[i % LOG_MODULES.length];
  const durationMs = Math.floor(Math.random() * 85) + 5; // 5ms - 90ms
  const status = Math.random() > 0.02 ? "SUCCESS" : "WARNING"; // 2% warning rate
  
  return {
    id: `log-seq-${100000 + i}`,
    timestamp,
    module: moduleName,
    action,
    message: `${action} completed in ${durationMs}ms with status code ${status === "SUCCESS" ? "200 OK" : "499 LIMIT_WARN"}`,
    durationMs,
    status,
    operator: i % 3 === 0 ? "system-agent" : i % 3 === 1 ? "cron-daemon" : "admin-user",
    comments: [] as Array<{ id: string; user: string; text: string; createdAt: string }>
  };
});

// GET /api/performance/logs
// Supports offset pagination or page-based infinite queries
router.get("/logs", (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const searchQuery = (req.query.search as string || "").toLowerCase();
  
  // Filter logs if search is specified
  let filtered = MOCK_LOGS;
  if (searchQuery) {
    filtered = MOCK_LOGS.filter(l => 
      l.module.toLowerCase().includes(searchQuery) ||
      l.action.toLowerCase().includes(searchQuery) ||
      l.message.toLowerCase().includes(searchQuery) ||
      l.id.toLowerCase().includes(searchQuery)
    );
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const data = filtered.slice(offset, offset + limit);

  // Simulate network latency if requested, or normal 120ms standard API latency
  const delayMs = parseInt(req.query.latency as string) || 80;

  setTimeout(() => {
    res.json({
      success: true,
      data: {
        results: data,
        stats: {
          total,
          page,
          limit,
          totalPages,
          hasMore: page < totalPages
        }
      }
    });
  }, delayMs);
});

// POST /api/performance/logs/:id/comments
// Allows adding comments to logs. Supports configurable error simulation to test optimistic UI updates!
router.post("/logs/:id/comments", (req: Request, res: Response) => {
  const { id } = req.params;
  const { text, simulateError } = req.body;
  const user = (req as any).user?.name || "Anonymous Developer";

  const logIndex = MOCK_LOGS.findIndex(l => l.id === id);
  if (logIndex === -1) {
    return res.status(404).json({ success: false, error: "Log event not found" });
  }

  // Simulate latency
  const delayMs = parseInt(req.query.latency as string) || 600; // longer latency to visualize optimistic update

  setTimeout(() => {
    if (simulateError) {
      return res.status(500).json({
        success: false,
        error: "[DB_WRITE_LOCK_REJECTED] Optimistic update failed to persist in distributed ledger."
      });
    }

    const newComment = {
      id: `comment-${Date.now()}`,
      user,
      text,
      createdAt: new Date().toISOString()
    };

    MOCK_LOGS[logIndex].comments.push(newComment);

    res.json({
      success: true,
      data: newComment
    });
  }, delayMs);
});

export default router;
