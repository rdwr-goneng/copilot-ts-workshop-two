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
Using Playwright MCP - explore the web app already running on localhost port 3001, check how we can improve the existing tests and write your suggested improvement plan.
Then implement just ONE improvement or new test, run all tests, fix until all pass reliably.
To run tests - navigate into the /frontend folder, and run using this command: "npx playwright test --reporter=line"
Assume frontend server is already running on port localhost 3001!
```

NOTE: In non-VS Code IDEs, we can still achieve the same with the MCP and use as a prompt instead of using the chat mode