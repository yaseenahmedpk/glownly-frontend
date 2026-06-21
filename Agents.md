# AI Agents Reference

This document provides a reference to AI agents used in the BarberWebApp-frontend project.

## Available Agents

The project uses [Kilo](https://kilo.ai/) as its AI-powered software engineering assistant.

## Project-Specific Guidelines

1. **Context Awareness**: Always inspect related services, stores, and i18n files before making changes.
2. **Conventions**: Follow existing Vue 3 Composition API patterns. Use `ref`/`computed`/`onMounted` and Pinia stores.
3. **Validation**: Prefer `npm run build` to verify changes; do not rely on uncommitted or cached module state during troubleshooting.
4. **Localization**: Add keys to both `src/locales/en.json` and `src/locales/ms.json` before using `$t()` in templates.
5. **API Services**: Place endpoints in `src/services/*Service.js` files and call them from views; never call `axios` directly from a view.
6. **Broadcasting**: Use the shared Echo instance from `src/services/echo.js`; clean up listeners in `onUnmounted`.
7. **No Console Logs**: Remove debug `console.log` statements before completing a task.
8. **Component Imports**: Use the package's documented import style for third-party UI components (e.g., `@vuepic/vue-datepicker`). Do not change the import style without verifying the installed package version supports it.

## Maintenance

Update this document as project workflows or agent capabilities change.
