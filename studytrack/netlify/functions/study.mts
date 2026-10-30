import type { Context, Config } from '@netlify/functions';
import { and, eq } from 'drizzle-orm';
import { connect } from '../../db/index.js';
import { records } from '../../db/schema.js';
export default async (req: Request, context: Context) => {
  const headers = { 'Cache-Control': 'no-store' };
  const reply = (body: unknown, status = 200) => Response.json(body, { status, headers });
  if (!['GET','POST','DELETE'].includes(req.method)) return reply({error:'Method not allowed'},405);
  let owner = context.cookies.get('studytrack');
  if (req.method !== 'GET') {
    if (req.headers.get('origin') !== new URL(req.url).origin || !owner) return reply({error:'Please refresh the page and try again.'},403);
  }
  if (!owner || !/^[0-9a-f-]{36}$/.test(owner)) {
    owner = crypto.randomUUID();
    context.cookies.set({name:'studytrack',value:owner,httpOnly:true,secure:new URL(req.url).protocol==='https:',sameSite:'Lax',path:'/',maxAge:31536000});
  }
  try {
    const db = connect();
    if (req.method === 'GET') {
      const rows = await db.select({id:records.id,kind:records.kind,title:records.title,status:records.status,due:records.due,minutes:records.minutes,createdAt:records.createdAt}).from(records).where(eq(records.owner,owner));
      return reply(rows);
    }
    if (Number(req.headers.get('content-length')) > 8000) return reply({error:'Request too large'},413);
    const data = await req.json();
    if (typeof data.id !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(data.id)) return reply({error:'Invalid record'},400);
    const match = and(eq(records.owner,owner),eq(records.id,data.id));
    if (req.method === 'DELETE') { await db.delete(records).where(match); return reply({ok:true}); }
    if (!['task','problem','session'].includes(data.kind) || typeof data.title !== 'string' || !data.title.trim() || data.title.length>180 || !['todo','progress','done'].includes(data.status)) return reply({error:'Please check the record details.'},400);
    const due = data.due || '';
    if (typeof due !== 'string' || (due && (!/^\d{4}-\d{2}-\d{2}$/.test(due) || !Number.isFinite(Date.parse(due))))) return reply({error:'Invalid date'},400);
    const minutes = data.minutes ?? 0;
    if (!Number.isInteger(minutes) || minutes < 0 || minutes > 180) return reply({error:'Invalid session length'},400);
    const values = {kind:data.kind,title:data.title.trim(),status:data.status,due,minutes};
    await db.insert(records).values({owner,id:data.id,...values}).onConflictDoUpdate({target:[records.owner,records.id],set:values});
    return reply({ok:true});
  } catch { return reply({error:'Progress could not be saved. Please try again.'},503); }
};
export const config: Config = { path: '/api/study' };
