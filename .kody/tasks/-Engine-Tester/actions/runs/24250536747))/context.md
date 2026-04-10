
### autofix (2026-04-10T16:16:13)
Based on my investigation, the issue is a **pre-existing failure in Payload CMS's postgres adapter infrastructure**. When `getPayload()` initializes, it uses drizzle-kit to introspect the database schema. The introspection query:

```sql
SELECT conname AS primary_key
FROM   pg_constraint join pg_class on (pg_class.oid = conrelid)
WHERE  contype = 'p' 
AND    connamespace = $1::regnamespace  
AND    pg_class.relname = $2;
```

...is executed with `params: []` (empty) instead of the expected schem
...(truncated)
