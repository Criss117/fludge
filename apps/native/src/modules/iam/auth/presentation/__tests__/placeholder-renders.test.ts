declare const require: (module: string) => any;
declare const __dirname: string;

const { readFileSync } = require("fs") as {
  readFileSync: (path: string, encoding: string) => string;
};
const { join } = require("path") as { join: (...parts: string[]) => string };

const root = join(__dirname, "..");

function source(screen: string): string {
  const directory = screen === "register-member.screen.tsx"
    ? join(root, "..", "..", "organizations", "presentation", "screens")
    : join(root, "screens");

  return readFileSync(join(directory, screen), "utf8");
}

describe("native translation contracts", () => {
  it("uses distinct form label and placeholder keys", () => {
    const expectations = [
      ["sign-in.screen.tsx", "email", "forms.user.email"],
      ["sign-in.screen.tsx", "password", "forms.user.password"],
      ["sign-up.screen.tsx", "name", "forms.user.name"],
      ["sign-up.screen.tsx", "phone", "forms.user.phone"],
      ["sign-up.screen.tsx", "email", "forms.user.email"],
      ["sign-up.screen.tsx", "password", "forms.user.password"],
      ["register-member.screen.tsx", "email", "forms.user.email"],
      ["register-member.screen.tsx", "password", "forms.user.password"],
      ["register-member.screen.tsx", "phone", "forms.user.phone"],
    ] as const;

    for (const [screen, _field, key] of expectations) {
      const fieldSource = source(screen);
      expect(fieldSource).toContain(`label="${key}.label"`);
      expect(fieldSource).toContain(`placeholder="${key}.placeholder"`);
      expect(fieldSource).not.toContain(
        `label="${key}.label"\n                        placeholder="${key}.label"`
      );
    }
  });

  it("removes the stale inputs namespace from native sources", () => {
    for (const screen of [
      "sign-in.screen.tsx",
      "sign-up.screen.tsx",
      "register-member.screen.tsx",
    ]) {
      expect(source(screen)).not.toContain(["inputs", "."].join(""));
    }
  });
});
