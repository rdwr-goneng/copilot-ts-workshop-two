import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface Powerstats {
    intelligence: number;
    strength: number;
    speed: number;
    durability: number;
    power: number;
    combat: number;
}

interface Superhero {
    id: string | number;
    name: string;
    image: string;
    powerstats: Powerstats;
}

async function loadSuperheroes(): Promise<Superhero[]> {
    try {
        const data = await fs.promises.readFile(
            path.join(__dirname, "../data", "superheroes.json"),
            "utf-8"
        );
        return JSON.parse(data);
    } catch (err) {
        throw new Error(`Failed to load superheroes data: ${err instanceof Error ? err.message : String(err)}`);
    }
}

function formatSuperheroMarkdown(hero: Superhero): string {
    return `Here is the data for ${hero.name} retrieved using the superheroes MCP:

• Name: ${hero.name}
• Image: <img src="${hero.image}" alt="${hero.name}"/>
• Powerstats:
  • Intelligence: ${hero.powerstats.intelligence}
  • Strength: ${hero.powerstats.strength}
  • Speed: ${hero.powerstats.speed}
  • Durability: ${hero.powerstats.durability}
  • Power: ${hero.powerstats.power}
  • Combat: ${hero.powerstats.combat}`;
}

// Create MCP server
const server = new McpServer({
    name: "superheroes-mcp",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {}
    }
});

// Register the get_superhero tool
server.registerTool(
    "get_superhero",
    {
        title: "Get Superhero",
        description: "Get superhero details by name or id",
        inputSchema: {
            name: z.string().optional().describe("Name of the superhero (optional)"),
            id: z.string().optional().describe("ID of the superhero (optional)")
        }
    },
    async ({ name, id }: { name?: string; id?: string }) => {
        const superheroes = await loadSuperheroes();
        
        const nameLc = name?.toLowerCase() ?? "";
        const idStr = id ?? "";
        
        const hero = superheroes.find(h => {
            const heroNameLc = h.name?.toLowerCase() ?? "";
            const heroIdStr = h.id?.toString() ?? "";
            return (name && heroNameLc === nameLc) || (id && heroIdStr === idStr);
        });
        
        if (!hero) {
            throw new Error("Superhero not found");
        }
        
        return {
            content: [{
                type: "text" as const,
                text: formatSuperheroMarkdown(hero)
            }]
        };
    }
);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Superhero MCP Server running on stdio");
}

main().catch(error => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});