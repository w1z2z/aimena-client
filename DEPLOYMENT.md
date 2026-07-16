# Деплой frontend (Aimena Client)

Полная документация простым языком (схемы, webhook, env, FAQ):

→ репозиторий API, файл  
[`docs/architecture/deployment.md`](https://github.com/w1z2z/aimena-server/blob/staging/docs/architecture/deployment.md)

## Кратко про этот репо

1. Пушишь в `staging`.
2. GitHub Actions собирает образ `ghcr.io/w1z2z/aimena-client:staging`.
3. В образ вшиваются:
   - `NEXT_PUBLIC_API_URL=https://api-staging.aimena.ru/api/v1`
   - `NEXT_PUBLIC_APP_URL=https://staging.aimena.ru`
4. Actions дергает Dokploy webhook → контейнер обновляется сам.
5. В Deployments видно текст коммита (не `NEW CHANGES`).

## Что нужно один раз

| Где | Что |
|-----|-----|
| GitHub Secret | `DOKPLOY_DEPLOY_HOOK` = webhook URL фронта из Dokploy |
| Dokploy | Provider = Docker Image, образ `.../aimena-client:staging`, порт `3000` |
| Dokploy Registry | `ghcr.io` + username `w1z2z` + PAT `read:packages` |

Workflow: `.github/workflows/docker.yml`  
Только md/docs — билд не запускается.
