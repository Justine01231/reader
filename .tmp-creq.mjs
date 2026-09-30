import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { encodeReply } = require("next/dist/compiled/react-server-dom-turbopack/client.js");
const f = new FormData(); f.set("title", "Redirect Probe"); f.set("type", "MANGA"); f.set("status", "ONGOING");
const body = await encodeReply([null, f]);
const res = await fetch("http://localhost:3107/search", { method: "POST", headers: { "Next-Action": process.env.ID, cookie: `session=${process.env.TOK}` }, body });
const t = await res.text();
console.log("code", res.status, "redirect case-insensitive:", /redirect/i.test(t));
console.log("ctx:", JSON.stringify(t.slice(0, 220)));
