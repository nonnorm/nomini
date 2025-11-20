# ![Nomini logo](./www/static/logo.svg)

Nomini is an extremely small (~2kb) library for reactive HTML and partial page updates. It blends the best ideas from Alpine.js, htmx, and Datastar while staying tiny and easy to understand.

Nomini lets you:
- Add lightweight reactive state directly in your HTML
- Bind DOM properties and classes with automatic dependency tracking
- Listen to any event with inline handlers
- Make AJAX requests to replace any part of the page
- Keep everything declarative and local

If you want the power of Alpine + htmx with **an order of magnitude less code**, Nomini is the smallest tool that delivers both.

Full documentation is available at [the website](https://nomini.js.org/docs)

## Why Nomini?
- It's tiny! (8x smaller than Datastar)
- Write plain JavaScript, no special DSLs to learn
- Enhanced `onclick` with modifiers and access to reactive variables
- Built-in AJAX helpers that grab all of the data from the current scope

## What Nomini is *not*
Nomini is deliberately minimal. It **does not** try to be:
- A template language
- A performant virtual DOM
- A full-featured set of helpers for every use case
- A global state management system

Nomini stays small by keeping the mental model simple: **Boring HTML + islands of reactivity + server-driven pages**
