# SECURITY-SETUP (HRAVO HERO)

He document hi kan thahtak hmang hman security fixes-te chu i setup thei nan a ni.

## 1. Supabase SQL run rawh (5 minute)

1. https://supabase.com/dashboard ah sign in rawh
2. I project open rawh -> **SQL Editor** -> **New query**
3. `supabase/rls-setup.sql` file content paste a **Run** rawh (chumi RLS enable a siam) - a tlo hmasa ber a run loh chuan
4. `supabase/security-hardening.sql` file content paste a **Run** rawh

He SQL hian a ti ang:
- Admin password bcrypt hash-ah store a siam a, DB chhung chauh a awm (client bundle ah a lang lo)
- Staff/customer login chu server-side RPC (security definer function) hmangin a verify ang
- **`staff_profiles.password` column chu public anon key hmanga read theih loh** a siam (a vang chuan mi hrang hrang staff password te hi anon key hmanga extract thei tawh lo ang)

## 2. Admin password siang rawh (SQL run hnu liam piah ber)

SQL Editor ah:
```sql
SELECT public.set_admin_password('I-Password-Thar-Sang-Tak');
```
(10 character a tlem loh a ngai.) Chu chuan `.env.local` leh Vercel env var ah `NEXT_PUBLIC_ADMIN_PASSWORD` hi **delete** rawh.

> Code hi RPC-first a ni: SQL run loh chuan env password fallback a hmang ang (app a that zel); SQL run a, env var delete a nih chuan server-side check chauh a hmang ang.

## 3. Cloudinary API secret ROTATE rawh (IMPORTANT)

Secret chu git history ah a awm tawh (commit mek). Rotate rawh:
1. Cloudinary Dashboard -> **Settings -> Access Keys**
2. Old API key pair **disable** rawh, **thar API key/secret generate** rawh
3. Thar secret hi `.env.local` (local) leh **Vercel -> Project -> Settings -> Environment Variables** (CLOUDINARY_API_SECRET / CLOUDINARY_API_KEY) ah dah rawh
4. Redeploy rawh

## 4. Vercel env vars

Production build hman nan Vercel project Settings -> Environment Variables ah hian i dah ngai a ni:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (rotate hnuah thar value)
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_ADMIN_PASSWORD` - **security-hardening.sql run + password siang hnuah DELETE rawh**

## 5. Code-side fixes kan siam tawh

- Hardcoded Supabase URL/key fallback-te source atanga paih (8 file)
- Hardcoded admin passwords (`Hravo@123`, `hravo123`, `hravo@123`) leh customer universal passwords (`1234`, `honda123`) paih
- `/api/upload` - env var missing chuan fail fast; secret source ah a awm lo
- Security headers (`next.config.js` + `vercel.json`): X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy

## 6. Hriat tur hun lui (limitations)

- App hi static export + anon key + localStorage auth architecture a ni a, chuvangin **financial tables** (transactions, loans, etc.) te hi anon-writable a ni zel a ni. A dik zual nan Supabase Auth (phone OTP) + authenticated-only RLS policies hi a zir chhuak ber a ni - a tul chuan ka hnenah hrilh rawh.
- localStorage auth flag (`honda_admin_auth`) hi browser devtools hmangin anyone set thei a ni. Server-side data protection chu SQL (RLS/RPC) nena a zo vang vak an ni lo - SQL run hi a tul ber.
