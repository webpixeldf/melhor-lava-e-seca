import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
fs.mkdirSync(path.join(process.cwd(),'.temp'),{recursive:true});
fs.mkdirSync('auditoria-seo-2026-09-05',{recursive:true});
const root=fs.mkdtempSync(path.join(process.cwd(),'.temp/seo-gate-'));
for(const folder of ['scripts','src/content/blog','src/content/drafts'])fs.mkdirSync(path.join(root,folder),{recursive:true});
const script=path.join(root,'scripts/publish-reviewed-post.mjs');fs.copyFileSync('scripts/publish-reviewed-post.mjs',script);
const draft=path.join(root,'src/content/drafts/fixture.md'),target=path.join(root,'src/content/blog/fixture.md');
const source='https://example.com/manual';let count=0;
function fixture(status='approved',refs=true){fs.writeFileSync(draft,`---\ntitle: Teste editorial\ndescription: Conferência de publicação\nstatus: ${status}\nreviewer: Responsável de teste\nreviewed: "2026-09-01T12:00:00Z"\nsources: ${refs?'["'+source+'"]':'[]'}\n---\n\nTexto de teste. [Manual](${source})\n`);}
function run(args,expected){const r=spawnSync(process.execPath,[script,'--slug','fixture',...args],{encoding:'utf8'});assert.equal(r.status,expected,r.stderr);count++;}
fixture('draft');run(['--check'],1);assert.equal(fs.existsSync(target),false);
fixture('approved',false);run(['--check'],1);
fixture();run(['--check'],0);assert.equal(fs.existsSync(target),false);
run([],0);assert.equal(fs.existsSync(target),true);
fixture();run([],1);
fs.writeFileSync(target,'---\ntitle: Antigo\ndate: "2025-01-01T12:00:00Z"\n---\nOriginal');run(['--replace'],0);assert.match(fs.readFileSync(target,'utf8'),/2025-01-01T12:00:00Z/);
fs.writeFileSync(target,'---\nstatus: retired\ndate: "2025-01-01T12:00:00Z"\n---\nRetirado');fixture();run(['--replace'],1);
const invalid=spawnSync(process.execPath,[script,'--slug','../fixture','--check'],{encoding:'utf8'});assert.equal(invalid.status,1);count++;
const middleware=await import('data:text/javascript;base64,'+Buffer.from(fs.readFileSync('functions/_middleware.js','utf8')).toString('base64'));
let assetRequests=0;
for(const pathname of ['/404','/404/','/404.html']){const r=await middleware.onRequest({request:new Request('https://melhorlavaeseca.com'+pathname),next:()=>new Response('ok'),env:{ASSETS:{fetch:()=>{assetRequests++;return new Response('<h1>404</h1>',{status:404,headers:{'Content-Type':'text/html'}});}}}});assert.equal(r.status,404);assert.equal(r.headers.get('X-Robots-Tag'),'noindex, follow');assert.match(await r.text(),/404/);count++;}
const normal=await middleware.onRequest({request:new Request('https://melhorlavaeseca.com/blog/'),next:()=>new Response('artigos')});assert.equal(normal.status,200);assert.equal(assetRequests,3);count++;
console.log(`${count} verificações passaram: publicação revisada, substituição explícita, datas, retirada, caminho inválido e tratamento 404.`);
fs.writeFileSync('auditoria-seo-2026-09-05/validacao-publicacao.json',JSON.stringify({testedAt:new Date().toISOString(),checks:count,passed:true},null,2));
