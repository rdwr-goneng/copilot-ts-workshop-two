# Playwright MCP + Chatmode to test the app

# Claude Sonnet 4

Installing the MCP and Chatmode:
- Go to https://promptboost.dev/ and search for "Playwright"
- Install the MCP
- Get the custom Chatmode and install it

Alternatively we can:
- Go to MCP Gallery and find the Playwright MCP:
https://code.visualstudio.com/mcp
- Go to awesome-copilot to find the prompt: https://github.com/github/awesome-copilot


Review the chatmode Playwright prompt:
- Note the **tooling**
- Note the **model**
- Note the **instructions**


Then use Playwright-Tester mode (with Sonnet 4):
```
Explore the web app, check how we can improve the existing tests, document them, run the tests, fix until all pass reliably.
To run them - navigate into the /frontend folder, and run using this command: "npx playwright test --reporter=line"
Assume frontend server is already running!
```

NOTE: In non-VS Code IDEs, we can still achieve the same with the MCP and use as a prompt instead of using the chat mode