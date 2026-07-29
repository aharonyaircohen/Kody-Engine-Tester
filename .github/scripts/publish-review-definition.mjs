import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
const root = ".kody-engine/definitions/capabilities/review";
const files = {};

function collect(directory) {
  for (const name of readdirSync(directory)) {
    const file = join(directory, name);
    if (statSync(file).isDirectory()) collect(file);
    else files[relative(root, file)] = readFileSync(file, "utf8");
  }
}

function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
    .join(",")}}`;
}

collect(root);
const bundle = {
  schemaVersion: 1,
  files: Object.fromEntries(
    Object.entries(files)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([file, content]) => [file, content.replace(/\r\n?/g, "\n")]),
  ),
};
const version = `sha256:${createHash("sha256")
  .update(canonicalJson(bundle))
  .digest("hex")}`;
const oidcUrl = new URL(process.env.ACTIONS_ID_TOKEN_REQUEST_URL);
oidcUrl.searchParams.set("audience", "kody-api");
const oidcResponse = await fetch(oidcUrl, {
  headers: {
    Authorization: `Bearer ${process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN}`,
  },
});
if (!oidcResponse.ok) {
  throw new Error(`GitHub OIDC request failed (${oidcResponse.status})`);
}
const { value: token } = await oidcResponse.json();

async function backend(kind, operation, args) {
  const response = await fetch(
    "https://kody-dashboard-aguy.vercel.app/api/kody/engine/backend",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ kind, operation, args }),
    },
  );
  if (!response.ok) {
    throw new Error(`Kody backend request failed (${response.status})`);
  }
  return (await response.json()).result;
}

const tenantId = "aharonyaircohen/Kody-Engine-Tester";
await backend("mutation", "definitions.publish", {
  tenantId,
  kind: "capability",
  slug: "review",
  version,
  bundle,
  source: "store",
  createdAt: new Date().toISOString(),
});
const current = await backend("query", "definitions.getCurrent", {
  tenantId,
  kind: "capability",
  slug: "review",
});
if (current?.version !== version) {
  throw new Error("Published version did not become current");
}
console.log(`KODY_REVIEW_DEFINITION_PUBLISHED ${version}`);
