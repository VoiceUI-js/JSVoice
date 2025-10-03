Contributing to JSVoice
Thank you for your interest in contributing to JSVoice! We welcome all developers, from first-time contributors to experienced veterans.

🎉 Hacktoberfest Participation
We are participating in Hacktoberfest! We encourage contributions that align with our project's goals.

Any Pull Request (PR) that is merged or labeled hacktoberfest-accepted will count toward your participation goal.

Low-effort PRs (e.g., automated formatting fixes, typo corrections unrelated to documentation, or spam) will be marked as spam or invalid and will not count. Please focus on making meaningful improvements!

🤝 How to Get Started
1. Find a Task
Before writing code, please check the issues to see where your effort is needed:

Beginner-Friendly Tasks: Look for issues labeled good first issue and hacktoberfest. These are small, self-contained tasks perfect for getting familiar with the codebase.

Current Goals: Look at issues labeled enhancement or check the 🚧 Roadmap section in the main README.md for larger features.

Report a Bug: If you find a bug, please 

openanewissue
 and include clear steps to reproduce the problem.

2. Local Setup (Forking is Required)
To start developing and running tests locally, all code contributions must be made by forking the repository and following these steps:

Fork the repository on GitHub.

Clone your fork to your local machine:

git clone [https://github.com/YOUR_USERNAME/JSVoice.git](https://github.com/YOUR_USERNAME/JSVoice.git)
cd JSVoice


Install dependencies (the library uses standard npm packages):

npm install
# or
yarn install


Create a feature branch for your work:

git checkout -b feature/my-awesome-voice-command


3. Development Guidelines
Code Style: We use standard JavaScript conventions. Please run the linter before submitting.

npm run lint


Testing: New functionality (commands, API methods, actions) must include corresponding unit tests.

Run all tests: npm test

Building: Before committing, ensure the build process still works: npm run build

4. Submitting a Pull Request (PR)
Ensure your new feature or fix includes passing tests.

Push your changes to your fork: git push origin feature/my-awesome-voice-command

Open a Pull Request from your branch back to the main branch of the original JSVoice repository.

Fill out the PR template completely. This helps maintainers review your work faster.

Pass CI Checks: Your PR must pass all automated checks (Tests, Linting) powered by GitHub Actions. If a check fails, please resolve the error and push a new commit.

We aim to review PRs within 1-2 days. Thank you for making JSVoice better!

📜 Code of Conduct
Please note that this project is released with a Code of Conduct. By participating in this project, you agree to abide by its terms.