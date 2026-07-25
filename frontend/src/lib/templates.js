export const TEMPLATES = {
  python: `# Write your Python here\nname = input()\nprint(f"Hello, {name}!")\n`,
  c: `#include <stdio.h>\n\nint main() {\n    char name[100];\n    scanf("%s", name);\n    printf("Hello, %s!\\n", name);\n    return 0;\n}\n`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    string name;\n    cin >> name;\n    cout << "Hello, " << name << "!" << endl;\n    return 0;\n}\n`,
  java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String name = sc.nextLine();\n        System.out.println("Hello, " + name + "!");\n    }\n}\n`,
  javascript: `// Write your JavaScript here\nconst readline = require("readline").createInterface({ input: process.stdin });\nreadline.on("line", (name) => {\n  console.log(\`Hello, \${name}!\`);\n  readline.close();\n});\n`,
};

export const WEB_TEMPLATE = {
  html: `<h1>Hello, Web!</h1>\n<button id="btn">Click me</button>`,
  css: `body {\n  font-family: sans-serif;\n  text-align: center;\n  padding-top: 60px;\n  color: #0369A1;\n}\nbutton {\n  padding: 8px 16px;\n  border-radius: 8px;\n  border: none;\n  background: #38BDF8;\n  color: white;\n  cursor: pointer;\n}`,
  js: `document.getElementById("btn").addEventListener("click", () => {\n  alert("Hello from JavaScript!");\n});`,
};

export const SAMPLE_INPUT = {
  python: "World",
  c: "World",
  cpp: "World",
  java: "World",
  javascript: "World",
};
