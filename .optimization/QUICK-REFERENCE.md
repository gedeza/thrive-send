# Optimization Gatekeeper Quick Reference

## Daily Use Commands

```bash
# Analyze current file
./optimize src/components/Button.tsx

# Check before commit
git add . && ./scripts/optimization-gatekeeper.sh check-commit

# Full project health check
./scripts/optimization-gatekeeper.sh validate-project

# View system status
./scripts/optimization-gatekeeper.sh status
```

## Common Fixes

### N+1 Query Pattern
```typescript
// ❌ Bad
users.forEach(async user => {
  const posts = await db.post.findMany({ where: { userId: user.id } });
});

// ✅ Good  
const userIds = users.map(u => u.id);
const posts = await db.post.findMany({ 
  where: { userId: { in: userIds } },
  include: { user: true }
});
```

### Missing Input Validation
```typescript
// ❌ Bad
export async function POST(req: Request) {
  const data = await req.json();
  return await db.user.create({ data });
}

// ✅ Good
const schema = z.object({
  name: z.string().min(1),
  email: z.string().email()
});

export async function POST(req: Request) {
  const body = await req.json();
  const data = schema.parse(body);
  return await db.user.create({ data });
}
```

## Configuration

Edit `.optimization-gatekeeper.conf` to customize thresholds and behavior.

## Help

- Full documentation: `./scripts/README.md`
- System status: `./scripts/optimization-gatekeeper.sh status`
- Configuration help: `./scripts/optimization-gatekeeper.sh config --help`
