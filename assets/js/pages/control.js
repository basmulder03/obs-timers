import { publishCommand } from "../core/storage.js";

const params = new URLSearchParams(window.location.search);
const cmd = String(params.get("cmd") || "").trim().toLowerCase();
const target = String(params.get("target") || "default").trim() || "default";
const syncToken = String(params.get("syncToken") || Date.now());

const status = document.getElementById("status");

try {
  const payload = publishCommand(target, cmd, syncToken);
  status.textContent = `Command sent: ${payload.cmd} -> ${payload.target}`;
} catch (error) {
  status.textContent = `Invalid command: ${error.message}`;
}
