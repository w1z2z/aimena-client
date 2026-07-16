# Деплой frontend (Aimena Client)

Полная схема (бэк + фронт + Dokploy + GHCR):

→ в репозитории API: [`docs/architecture/deployment.md`](https://github.com/w1z2z/aimena-server/blob/staging/docs/architecture/deployment.md)

Кратко для этого репо:

- ветка `staging` → образ `ghcr.io/w1z2z/aimena-client:staging`
- сборка в GitHub Actions (`.github/workflows/docker.yml`)
- `NEXT_PUBLIC_*` задаются в CI build-args
- Dokploy тянет Docker Image, порт `3000`
- после push: дождаться Actions → Deploy в Dokploy
