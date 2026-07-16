# HabitChart Frontend

HabitChart is a local-first habit tracker built around a GitHub-style contribution chart. Users can create habits, mark daily completion, archive old habits, inspect streaks and completion rates, and enable browser reminders without creating an account.

## Stack

- React
- Vite
- Vitest
- IndexedDB
- Browser Notifications
- PWA service worker
- Docker and Nginx

## Local Development

Use Node `22.12.0` or newer.

```bash
npm install
npm run dev
```

The app runs on `http://localhost:3001`.

## Tests

```bash
npm test
```

## Production Build

```bash
npm run build
```

## Docker

```bash
docker-compose up --build
```

The container serves the app on `http://localhost:3001`.

## Data And Privacy

Habit data, settings, reminders, and metrics are stored locally in the browser. The current frontend does not require email, login, or personal profile data. Backup and restore are available through JSON export/import.

## License

This project is licensed under the GNU General Public License. See `LICENSE` for details.
