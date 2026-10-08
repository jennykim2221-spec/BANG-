import { readFile, writeFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
const files = await readdir("dist/assets");
const assets = [
  "/",
  "/index.html",
  "/icon.svg",
  "/manifest.webmanifest",
  ...files.map((f) => "/assets/" + f),
];
const fingerprint = createHash("sha256")
  .update(await readFile(new URL(import.meta.url)))
  .update(JSON.stringify(assets))
  .update(await readFile("dist/index.html"))
  .digest("hex")
  .slice(0, 16);
const version =
  JSON.parse(await readFile("package.json", "utf8")).version +
  "-" +
  fingerprint;
const sw = `const CACHE=${JSON.stringify("bang-app-" + version)};
const ASSETS=${JSON.stringify(assets)};
self.addEventListener('install',event=>event.waitUntil((async()=>{try{const cache=await caches.open(CACHE);await cache.addAll(ASSETS);self.skipWaiting();for(const client of await self.clients.matchAll({includeUncontrolled:true}))client.postMessage('CACHE_READY');}catch(error){await caches.delete(CACHE);throw error;}})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{const migrate=(await caches.keys()).some(key=>key.startsWith('bang-app-')&&key!==CACHE);await self.clients.claim();for(const key of await caches.keys())if(key.startsWith('bang-app-')&&key!==CACHE)await caches.delete(key);for(const client of await self.clients.matchAll()){client.postMessage('CACHE_READY');if(migrate&&client.type==='window')void client.navigate('/').catch(()=>{});}})()));
self.addEventListener('message',event=>{if(event.data==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith((async()=>{const cache=await caches.open(CACHE);if(event.request.mode==='navigate'){try{const response=await fetch(event.request,{cache:'no-store'});if(response.ok){await cache.put('/index.html',response.clone());return response;}}catch{}const offline=await cache.match('/index.html');if(offline)return offline;return fetch(event.request);}const path=new URL(event.request.url).pathname;return (ASSETS.includes(path)?await cache.match(event.request,{ignoreVary:true}):undefined)||fetch(event.request);})());});`;
await writeFile("dist/sw.js", sw);
console.log("Offline shell generated:", assets.length, "assets");

