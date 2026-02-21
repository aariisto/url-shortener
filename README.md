# URL Shortener

## Lancer le projet avec Docker

1. Ouvre un terminal à la racine du projet.
2. Lance tous les services (PostgreSQL, backend, frontend) :

```bash
docker-compose up -d --build
```

- Le frontend sera accessible sur : [http://localhost:3000](http://localhost:3000)
- Le backend (API) sera sur : [http://localhost:3001](http://localhost:3001)

## Lancer les tests backend

Va dans le dossier backend :

```bash
cd backend
npm test -- url.service.spec.ts
```

Tous les tests unitaires et HTTP mockés seront exécutés.
