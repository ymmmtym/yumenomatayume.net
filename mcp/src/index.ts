#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerListPosts } from "./tools/list_posts.js";
import { registerGetPost } from "./tools/get_post.js";
import { registerSearchPosts } from "./tools/search_posts.js";

const server = new McpServer({
  name: "yumenomatayume-mcp-server",
  version: "0.1.0",
});

registerListPosts(server);
registerGetPost(server);
registerSearchPosts(server);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("yumenomatayume MCP server started (stdio)");
}

main().catch((err: unknown) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
