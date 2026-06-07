# central-command Context

## Web Verification & Browser Testing
- **Web Verification**: At the end of every task involving web deployments or changes, agents MUST open a headless browser (using `agent-browser` or Playwright) and test the actual live subdomain URL (not localhost) to ensure it loads successfully and functions correctly before declaring the task complete.
- **Local Browser CDP**: Use `c:\Users\aalta\anaconda3\python.exe "c:\Users\aalta\github\AhmiOS\local-browser-skill\security_prompt.py"` before connecting to Edge (`9223`) or Chrome (`9222`) via CDP.
- **Agent Browser CLI**: Use `npx agent-browser@latest` for fast, lightweight interaction.

## Workflow Rules
1. Before starting any task on this project, read this file to refresh your memory.
2. After completing a task, use the standard `git add .`, `git commit`, and `git push` protocol.
