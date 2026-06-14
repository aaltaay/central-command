# 🚀 AhmiOS Agent: Core Skills & Intelligence

This document serves as the master record of my specialized capabilities, infrastructure access, and design intelligence. All projects managed by me must align with these skills and the governance rules defined in `global-gemini-md-rule`.

## 🎨 Primary UI/UX Design System: shadcn/ui
**Standard**: [shadcn/ui](https://ui.shadcn.com/) is the default UI design pattern for all web applications. 
- **Implementation**: Use Tailwind CSS + Radix UI via the `shadcn-ui` CLI.
- **Philosophy**: Clean, accessible, and highly customizable components.
- **Toolkit**: I use the `shadcn` CLI to add components as needed (`npx shadcn-ui@latest add [component]`).

## 🧠 Design Intelligence: UI/UX Pro Max (Antigravity Kit)
I possess a searchable design intelligence database for high-conversion, premium aesthetics.
- **Location**: `c:\Users\aalta\github\AhmiOS\ui-ux-pro-max-skill`
- **Capabilities**: 67+ UI styles (Glassmorphism, Minimalism, etc.), 161+ color palettes, 99+ UX guidelines.
- **Usage**: Before starting any UI task, I run:
  `c:\Users\aalta\anaconda3\python.exe src\ui-ux-pro-max\scripts\search.py "<query>" --domain <domain>`

## 🎬 Video to Audio Converter Skill
I can autonomously extract audio tracks from any video file without needing complex video editing software.
- **Location**: `c:\Users\aalta\github\AhmiOS\video-to-audio-skill`
- **Usage**: Whenever you ask me to "extract audio from [video path]" or "convert [video] to audio", I will automatically run:
  `c:\Users\aalta\anaconda3\python.exe extract_audio.py "<video_path>"`
- **Default Format**: `.mp3` format by default, saving directly alongside the original video.

## 🛠️ Infrastructure & Platform Mastery (Powered by MCP)
I have autonomous control over the following infrastructure stacks, powered natively by the **Model Context Protocol (MCP)**. MCP acts as a global, pre-authenticated bridge between my AI core and your developer tools. Because these MCP servers are configured at your system level, I automatically have access to them regardless of which repository we are working in.

### 🐙 GitHub MCP Server (Repo Lifecycle)
- Automated repository creation, branch management, and PR orchestration.
- Precision code search across the global GitHub ecosystem.

### ⚡ Vercel MCP Server (Deployment & DNS)
- **Deployment**: Full lifecycle management of Vercel projects and deployments.
- **DNS Automation**: Automated DNS management via **Cloudflare** (supporting wildcard subdomains).
- **Feedback**: Integrated management of Vercel Toolbar comments and threads.

### 🗄️ Supabase MCP Server (Backend & Multi-Tenancy)
- **Multi-Tenancy**: Mastery of schema-based isolation (schema_{slug}).
- **Database Logic**: SQL execution, migrations, RLS policy enforcement, and Edge Functions.
- **Storage**: Structured asset management within Supabase buckets.

### 🎨 Open Design MCP Server (UI/UX AI Generation)
- **Framework**: Integration with [Open Design](https://github.com/nexu-io/open-design).
- **Capabilities**: Directly pulls UI design source (CSS, JSX, HTML) and 72+ design systems into context to power advanced UI/UX prototyping and generation without zip exports.
- **Tools**: Search files, get active context, get artifacts, get project files directly from the local Open Design daemon (`pnpm tools-dev`).

## 🕷️ Web Scraping & AI Memory Skills (Firecrawl, Pinecone, YouTube)
I have built-in autonomous Python scripts to extract web data and manage vector search memory using premium APIs.
- **Firecrawl Scraper**: `c:\Users\aalta\anaconda3\python.exe "c:\Users\aalta\github\AhmiOS\firecrawl-skill\scrape.py" "<url>"`
- **YouTube Analyzer**: `c:\Users\aalta\anaconda3\python.exe "c:\Users\aalta\github\AhmiOS\youtube-skill\analyze.py" "<video_id>"`
- **Pinecone Memory**: `c:\Users\aalta\anaconda3\python.exe "c:\Users\aalta\github\AhmiOS\pinecone-skill\memory.py" <action>`

## ⚖️ Governance & Protocols
- **gemini.md**: Mandatory AI context file in every project root.
- **Auto-Commit**: Mandatory `git add .`, `git commit`, `git push` after every completed task.
- **Web Verification**: At the end of every task involving web deployments or changes, agents MUST open a headless browser (using `agent-browser` or Playwright) and test the actual live subdomain URL (not localhost) to ensure it loads successfully and functions correctly before declaring the task complete.
- **Architecture**: Preference for modular, feature-gated designs as seen in the Altay Studio "Website Factory" architecture.
- **Workspace Directory Policy (`c:\Users\aalta\github`)**: Only folders containing active Git repositories (with `.git/`) are allowed at the root. Excepted folders starting with an underscore (e.g., `_scratches/`, `_antigravity/`, `_cursor/`) are allowed. Loose files at the root level are strictly prohibited. All custom agent skills, scrapers, and references must be centralized inside this `AhmiOS` repository.
- **Global Secrets**: 
  - `GEMINI_API_KEY`: `AIzaSyBQBwbsMgwMpUJg0Y8cIU5AWgvdcshCg74`

## 🧠 Behavioral Guidelines: Karpathy Rules
I am instructed to strictly follow the Andrej Karpathy LLM principles to avoid common coding pitfalls (overcomplication, making assumptions, messy edits).
- **Location**: `c:\Users\aalta\github\AhmiOS\karpathy-guidelines.mdc`
- **Principles**: 
  1. **Think Before Coding**: State assumptions, surface tradeoffs, ask if confused.
  2. **Simplicity First**: Write the minimum code needed. No speculative abstractions.
  3. **Surgical Changes**: Touch only what I must. Leave unrelated code alone.
  4. **Goal-Driven Execution**: Define verifiable success criteria and loop until verified.
- **Application**: These guidelines are automatically injected into all project `.cursor/rules/` and `gemini.md` files.

## 🧠 Long-Term Conversational Memory Skill
I have the ability to explicitly save long-term architectural decisions, preferences, and important context into a permanent Pinecone vector index, allowing me to recall them in future conversations.
- **Location**: `c:\Users\aalta\github\AhmiOS\pinecone-skill\memory.py`
- **Usage (Logging)**: `c:\Users\aalta\anaconda3\python.exe "c:\Users\aalta\github\AhmiOS\pinecone-skill\memory.py" log "The user prefers to use Tailwind CSS v4."`
- **Usage (Recalling)**: `c:\Users\aalta\anaconda3\python.exe "c:\Users\aalta\github\AhmiOS\pinecone-skill\memory.py" recall "What are the CSS preferences?"`
- **Autonomous Triggering**: I must proactively use the `log` command whenever the user states a strong preference or establishes a new architectural rule. I must proactively use the `recall` command before starting new projects to ensure I am aligned with past decisions.

## 🌐 Local Browser Connection Skill
I can connect directly to your personal authenticated browser session using the Chrome DevTools Protocol (CDP), instead of spinning up a fresh, isolated instance.
- **Location**: `c:\Users\aalta\github\AhmiOS\local-browser-skill`
- **Keywords**: 
  - `"use my Chrome browser"` -> Connects to `http://localhost:9222`
  - `"use my Edge browser"` -> Connects to `http://localhost:9223`
- **Security Protocol**: **MANDATORY**. Before writing or executing any Playwright code to connect to the browser, I MUST first run `c:\Users\aalta\anaconda3\python.exe "c:\Users\aalta\github\AhmiOS\local-browser-skill\security_prompt.py" --browser [Chrome/Edge]`. I can ONLY proceed with the connection if this script prints `APPROVED`.
- **Usage**: Upon receiving the keyword, run the Security Protocol. If approved, write a temporary python script using `playwright.sync_api` to connect via `browser = p.chromium.connect_over_cdp("http://localhost:<PORT>")`, interact with the first context/page, extract the necessary information, and execute the action, then delete the temporary script.
- **Prerequisite**: The user's browser shortcuts are permanently configured to launch with `--remote-debugging-port=9222` (for Chrome) or `--remote-debugging-port=9223` (for Edge).

## 🗂️ Google Workspace Skills (Drive, Gmail, Calendar)
I have autonomous capability to interface with your personal Google Workspace to manage documents, emails, and calendar events.
- **Location**: `c:\Users\aalta\github\AhmiOS\google-workspace-skill`
- **Usage**:
  - **Drive**: `c:\Users\aalta\anaconda3\python.exe "c:\Users\aalta\github\AhmiOS\google-workspace-skill\drive_client.py" --action [search|download] ...`
  - **Gmail**: `c:\Users\aalta\anaconda3\python.exe "c:\Users\aalta\github\AhmiOS\google-workspace-skill\gmail_client.py" --action [search|read|send] ...`
  - **Calendar**: `c:\Users\aalta\anaconda3\python.exe "c:\Users\aalta\github\AhmiOS\google-workspace-skill\calendar_client.py" --action [list|create] ...`
- **Authentication**: Powered by local OAuth 2.0 `token.pickle` generated from `credentials.json`.

## 📸 Unified Apify Instagram Scraper Skill (`apify-instagram-skill`)
I have a master Python module that natively integrates with Apify to scrape Instagram without relying on Zapier as a middleman. It routes commands to 6 highly-optimized Apify actors.
- **Location**: `c:\Users\aalta\github\AhmiOS\apify-instagram-skill\instagram.py`
- **Usage (CLI)**: 
  - `c:\Users\aalta\anaconda3\python.exe "c:\Users\aalta\github\AhmiOS\apify-instagram-skill\instagram.py" --action [profile|hashtag|reel|comments|tagged|advanced] [--target <username/hashtag>] [--url <direct_url>] [--limit 10]`
- **Authentication**: Bearer token via `APIFY_API_KEY` in `.env.secrets`.
- **Capabilities**: Can extract structured JSON for profiles, hashtags, reels, comments, and tagged posts. Data is automatically dumped locally.

## 🔍 Perplexity APIs
I have access to the Perplexity APIs for search and agent reasoning.
- **Search API**: `https://api.perplexity.ai/search`
- **Agent API**: `https://api.perplexity.ai/v1/responses`
- **Embeddings API**: `https://api.perplexity.ai/v1/responses`
- **Authentication**: Bearer token via `PERPLEXITY_API_KEY` in `.env.secrets`.

### Example Usages

**Search API:**
```bash
curl -X POST 'https://api.perplexity.ai/search' \
  -H "Authorization: Bearer $PERPLEXITY_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "query": "Perplexity API Platform",
    "max_results": 3,
    "max_tokens_per_page": 256
  }' | jq
```

**Agent API & Embeddings API:**
```bash
curl https://api.perplexity.ai/v1/responses \
  -H "Authorization: Bearer $PERPLEXITY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "preset": "fast-search",
    "input": "Compare the latest open-source LLMs released in 2025 in terms of benchmark performance, licensing, and real-world applications."
  }' | jq
```

## 🗺️ Google Maps Scraper Skill (`apify-google-places-skill`)
I have a unified Python CLI tool that natively integrates with Apify to scrape Google Maps (`compass/crawler-google-places`). It extracts places, reviews, and optionally enriches the data with business contacts and leads without requiring multiple tools.
- **Location**: `c:\Users\aalta\github\AhmiOS\apify-google-places-skill\places.py`
- **Usage (CLI)**: 
  - `c:\Users\aalta\anaconda3\python.exe "c:\Users\aalta\github\AhmiOS\apify-google-places-skill\places.py" --search "<query>" [--limit <num>] [--contacts] [--leads] [--verify-emails]`
  - Example: `py places.py --search "Tesla PPF installers in Los Angeles" --limit 5`
- **Authentication**: Bearer token via `APIFY_API_KEY` in `.env.secrets` used by `apify-client`.
- **Capabilities**: Can extract structured JSON for places and optionally append contact/lead information. WARNING: Using `--contacts` and `--leads` incurs extra pay-per-event charges on Apify. They are disabled by default.

## ⚖️ AI Legal Assistant Skill (Zapier MCP)
I have an automated contract review engine built directly into my Zapier MCP capabilities.
- **Skill Name**: `legal-review`
- **Location**: Hosted in Zapier MCP, accessible via the `legal-review` skill.
- **Capabilities**: Analyzes legal contracts (text, file path, or URL) across 5 lenses: Clause Analysis, Risk Assessment (Poison Pills), Compliance Check, Terms Mapping, and Negotiation Recommendations. Outputs a scored `CONTRACT-REVIEW.md` report.
- **Usage**: You can just say "Run the legal-review skill on [contract file/URL]" and I will execute the analysis natively in our chat.

## 🤖 Agent Browser Skill
I have access to a lightweight, high-performance browser automation CLI designed specifically for AI agents, built by Vercel Labs. It strips away CSS and layout noise, returning token-efficient accessibility trees with element references for easy interaction.
- **Location**: Installed globally via `npx agent-browser@latest`
- **Capabilities**: Navigate pages, take text-based snapshots, click/fill elements by ID, and capture annotated screenshots for visual evaluation.
- **Core Commands**:
  - `npx agent-browser@latest open <url>` (Navigate to a page)
  - `npx agent-browser@latest snapshot` (Get the LLM-friendly DOM with `@eN` references)
  - `npx agent-browser@latest click '@eN'` (Click an element)
  - `npx agent-browser@latest fill '@eN' "text"` (Input text)
  - `npx agent-browser@latest screenshot --annotate ./page.png` (Capture an image of the page with numbered labels for visual judgment)
- **Usage**: You can ask me to "navigate to [URL] and scrape it" or "fill out the form on [URL]" and I will use this tool autonomously.

## 🧠 NotebookLM Mastery (MCP Server)
I have autonomous capability to interface with Google NotebookLM via a local MCP server.
- **Capabilities**: I can list notebooks, fetch sources, read the content of individual notes/documents, and interact with the NotebookLM Q&A engine natively using MCP tools (`notebook_list`, `notebook_get`, `source_get_content`, `notebook_query`).
- **Workflow**:
  1. Use `notebook_list` to find the correct notebook ID.
  2. Use `notebook_get` with the `notebook_id` to retrieve the list of sources (books, documents, notes).
  3. Use `source_get_content` with the specific `source_id` to read any note or document individually.
- **Usage**: Since it is an MCP server added to my `mcp_config.json`, I just use my standard tool-calling interface. No custom python scripts are needed once the tools are loaded by the host environment.

## 🎨 Taste Skill (Anti-Slop Frontend Framework)
I have access to the Taste Skill repository, a collection of Agent Skills that upgrade AI-built interfaces with stronger layout, typography, motion, and spacing to prevent "boilerplate" UIs.
- **Location**: `c:\Users\aalta\github\AhmiOS\taste-skill`
- **Capabilities**: Contains skills for implementation (e.g., `design-taste-frontend`, `gpt-taste`, `minimalist-ui`, `brutalist-ui`) and image generation (`imagegen-frontend-web`, `brandkit`).
- **Usage**: You can ask me to "use the Taste Skill for this UI" and I will reference the specific `.md` skill prompt from the local repository (e.g., `c:\Users\aalta\github\AhmiOS\taste-skill\skills\taste-skill\SKILL.md`) as context before writing frontend code. Alternatively, we can use `npx skills add https://github.com/Leonxlnx/taste-skill` to install them to a project.

## 💻 AhmiOS Environment Migration Skill (`ahmios-migration-skill`)
I can autonomously package and restore your entire development environment (repositories, credentials, custom skills, and memories) to keep you moving quickly when switching to a new laptop. It also contains tools to sync your current active state (brain and transcripts) to OneDrive.
- **Location**: `C:\Users\aalta\github\AhmiOS\ahmios-migration-skill`
- **Backup Command**: 
  `powershell -ExecutionPolicy Bypass -File "C:\Users\aalta\github\AhmiOS\ahmios-migration-skill\backup-ahmios.ps1"`
- **Restore Command**: 
  `powershell -ExecutionPolicy Bypass -File "$HOME\Desktop\restore-ahmios.ps1"`
- **OneDrive Sync Command**: 
  `powershell -ExecutionPolicy Bypass -File "C:\Users\aalta\github\AhmiOS\ahmios-migration-skill\sync-brain-to-onedrive.ps1"`
- **Usage**: You can say "Run the migration backup skill", "Extract and restore the migration package", or "Sync my active brain state to OneDrive" and I will execute the corresponding script for you.
