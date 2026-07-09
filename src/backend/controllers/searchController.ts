import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { db } from "../database/db";
import { ResponseHandler } from "../utils/apiResponse";

export class SearchController {
  async search(req: AuthenticatedRequest, res: Response) {
    try {
      const q = (req.query.q as string || "").trim();
      const workspaceId = req.query.workspaceId as string || "";
      const tech = (req.query.tech as string || "postgresql").toLowerCase();

      if (!q) {
        return ResponseHandler.success(res, {
          results: [],
          compiledPostgresSql: "",
          compiledElasticsearchQuery: null,
          stats: { tasks: 0, projects: 0, users: 0, comments: 0, documents: 0, total: 0 }
        }, "Search query is empty.");
      }

      // Tokenize query for prefix / keyword matching
      const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);

      // Relevance score helper
      const getScore = (text: string, weight = 1) => {
        if (!text) return 0;
        const lowerText = text.toLowerCase();
        let score = 0;
        for (const token of tokens) {
          if (lowerText === token) {
            score += weight * 3; // exact match gets heavy weight
          } else if (lowerText.includes(token)) {
            score += weight;
          }
        }
        return score;
      };

      // 1. Search Tasks
      const tasks = db.tasks.filter(t => {
        const matchesWorkspace = !workspaceId || t.workspaceId === workspaceId;
        const textToSearch = `${t.title} ${t.description || ""} ${t.tags.join(" ")} ${t.labels.join(" ")}`;
        const matchesQuery = tokens.some(tok => textToSearch.toLowerCase().includes(tok));
        return matchesWorkspace && matchesQuery;
      }).map(t => {
        let score = getScore(t.title, 5); // Title has weight 5
        score += getScore(t.description || "", 1.5); // Description weight 1.5
        t.tags.forEach(tag => { score += getScore(tag, 2); }); // Tags weight 2
        t.labels.forEach(lbl => { score += getScore(lbl, 2); }); // Labels weight 2

        return {
          type: "task",
          id: t.id,
          title: t.title,
          subtitle: `In ${t.status} • Priority ${t.priority}`,
          description: t.description || "",
          projectId: t.projectId,
          score,
          url: `/tasks/${t.id}`
        };
      });

      // 2. Search Projects
      const projects = db.projects.filter(p => {
        const matchesWorkspace = !workspaceId || p.workspaceId === workspaceId;
        const textToSearch = `${p.name} ${p.description || ""} ${p.template}`;
        const matchesQuery = tokens.some(tok => textToSearch.toLowerCase().includes(tok));
        return matchesWorkspace && matchesQuery;
      }).map(p => {
        let score = getScore(p.name, 5);
        score += getScore(p.description || "", 1.5);
        score += getScore(p.template, 1);

        return {
          type: "project",
          id: p.id,
          title: p.name,
          subtitle: `Project template: ${p.template}`,
          description: p.description || "",
          score,
          url: `/projects/${p.id}`
        };
      });

      // 3. Search Users
      const users = db.users.filter(u => {
        const textToSearch = `${u.name} ${u.email} ${u.bio || ""}`;
        return tokens.some(tok => textToSearch.toLowerCase().includes(tok));
      }).map(u => {
        let score = getScore(u.name, 5);
        score += getScore(u.email, 3);
        score += getScore(u.bio || "", 1);

        return {
          type: "user",
          id: u.id,
          title: u.name,
          subtitle: u.role,
          description: u.email + (u.bio ? ` - ${u.bio}` : ""),
          score,
          url: `/users/${u.id}`
        };
      });

      // 4. Search Comments
      // Comments are sub-items of tasks. We aggregate them from tasks.
      const comments: any[] = [];
      db.tasks.forEach(t => {
        const matchesWorkspace = !workspaceId || t.workspaceId === workspaceId;
        if (!matchesWorkspace) return;

        if (t.comments && Array.isArray(t.comments)) {
          t.comments.forEach(c => {
            if (tokens.some(tok => c.content.toLowerCase().includes(tok))) {
              const author = db.users.find(u => u.id === c.userId);
              const score = getScore(c.content, 4);

              comments.push({
                type: "comment",
                id: c.id,
                title: `Comment by ${author?.name || "Member"}`,
                subtitle: `On Task: ${t.title}`,
                description: c.content,
                taskId: t.id,
                score,
                url: `/tasks/${t.id}`
              });
            }
          });
        }
      });

      // 5. Search Documents
      const documents = db.documents.filter(d => {
        const matchesWorkspace = !workspaceId || d.workspaceId === workspaceId;
        const textToSearch = `${d.title} ${d.content}`;
        const matchesQuery = tokens.some(tok => textToSearch.toLowerCase().includes(tok));
        return matchesWorkspace && matchesQuery;
      }).map(d => {
        let score = getScore(d.title, 6); // Document title has weight 6
        score += getScore(d.content, 2); // Document content weight 2

        return {
          type: "document",
          id: d.id,
          title: d.title,
          subtitle: `Internal Wiki / Document`,
          description: d.content.substring(0, 160) + (d.content.length > 160 ? "..." : ""),
          score,
          url: `/documents/${d.id}`
        };
      });

      // Combine and Sort by score descending
      const allResults = [...tasks, ...projects, ...users, ...comments, ...documents]
        .sort((a, b) => b.score - a.score);

      // Generate the production PostgreSQL Full-Text Search SQL matching this query
      const sqlSearchTerms = tokens.map(t => `${t}:*`).join(" & ");
      const compiledPostgresSql = `
-- ====================================================================
-- PostgreSQL FULL-TEXT SEARCH QUERY (Small-Scale Architecture)
-- ====================================================================
WITH search_query AS (
  SELECT to_tsquery('english', '${sqlSearchTerms}') AS query
),
ranked_tasks AS (
  SELECT 
    'task' as type,
    id,
    title,
    description as content,
    ts_rank_cd(
      setweight(to_tsvector('english', title), 'A') ||
      setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
      setweight(to_tsvector('english', array_to_string(tags, ' ')), 'C'),
      query
    ) as rank
  FROM "Task", search_query
  WHERE to_tsvector('english', title || ' ' || coalesce(description, '') || ' ' || array_to_string(tags, ' ')) @@ query
    ${workspaceId ? `AND "workspaceId" = '${workspaceId}'` : ""}
),
ranked_projects AS (
  SELECT 
    'project' as type,
    id,
    name as title,
    description as content,
    ts_rank_cd(
      setweight(to_tsvector('english', name), 'A') ||
      setweight(to_tsvector('english', coalesce(description, '')), 'B'),
      query
    ) as rank
  FROM "Project", search_query
  WHERE to_tsvector('english', name || ' ' || coalesce(description, '')) @@ query
    ${workspaceId ? `AND "workspaceId" = '${workspaceId}'` : ""}
),
ranked_documents AS (
  SELECT 
    'document' as type,
    id,
    title,
    content,
    ts_rank_cd(
      setweight(to_tsvector('english', title), 'A') ||
      setweight(to_tsvector('english', content), 'B'),
      query
    ) as rank
  FROM "Document", search_query
  WHERE to_tsvector('english', title || ' ' || content) @@ query
    ${workspaceId ? `AND "workspaceId" = '${workspaceId}'` : ""}
)
SELECT * FROM ranked_tasks
UNION ALL
SELECT * FROM ranked_projects
UNION ALL
SELECT * FROM ranked_documents
ORDER BY rank DESC
LIMIT 50;
`.trim();

      // Generate the production Elasticsearch / OpenSearch JSON query matching this query
      const compiledElasticsearchQuery = {
        explain: "Elasticsearch/OpenSearch Large-Scale Query DSL",
        index: "taskflow-enterprise-search",
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: q,
                  fields: [
                    "title^4",
                    "name^4",
                    "content^2",
                    "description^1.5",
                    "tags^2",
                    "email^3",
                    "bio"
                  ],
                  type: "best_fields",
                  fuzziness: "AUTO",
                  operator: "or"
                }
              }
            ],
            filter: workspaceId ? [
              {
                term: {
                  workspaceId: workspaceId
                }
              }
            ] : []
          }
        },
        highlight: {
          fields: {
            title: {},
            content: {},
            description: {}
          }
        }
      };

      const stats = {
        tasks: tasks.length,
        projects: projects.length,
        users: users.length,
        comments: comments.length,
        documents: documents.length,
        total: allResults.length
      };

      return ResponseHandler.success(res, {
        results: allResults,
        compiledPostgresSql,
        compiledElasticsearchQuery,
        stats
      }, "Enterprise search completed.");

    } catch (e) {
      return ResponseHandler.internalError(res, e);
    }
  }
}

export const searchController = new SearchController();
