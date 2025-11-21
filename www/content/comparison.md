+++
title = "Comparison"
+++
<div class="table-wrapper">

| | Nomini | HTMX v4 | Alpine | Datastar |
|-|-|-|-|-|
| **Bundle Size (.min.gz)** | 🟢 ~1.8kb | 🟡 ~11.2kb | 🟡 ~15.3kb | 🟡 ~14.4kb |
| **Main Purpose** | Lightweight reactivity and partial page updates | Easy partial page updates | Full-featured reactivity system | Full-featured streaming page updates and reactivity |
| **Reactivity Model** | Proxy | 🔴 N/A | Proxy | Signals |
| **Data Scoping** | 🟡 `nm-data`, no inheritance | 🔴 N/A | 🟢 Global scope with overrides | 🟢 Global scope with overrides |
| **Event Handling** | 🟢 `nm-on` with modifiers | 🟢 `hx-on`/`hx-trigger` with many modifiers | 🟢 `x-on` with modifiers | 🟢 `data-on` with modifiers |
| **Templating** | 🟡 `template` + `nm-use` (simple) | 🔴 None | 🟢 `x-for`/`x-teleport` | 🟡 Rocket (pro only) |
| **Morphing** | 🔴 None | 🟡 Simple id-based (Idiomorph WIP) | 🔴 Only with `alpine-morph` | 🟢 Idiomorph built-in |
| **AJAX** | 🟢 `$fetch` | 🟢 `hx-get` | 🔴 Only with `alpine-ajax` | 🟢 `@get` |
| **Streaming Support** | 🟢 By HTML Chunk | 🟢 By HTML Chunk or SSE | 🔴 N/A | 🟢 By custom SSE format |
| **Server Requirements** | 🟢 Produce HTML | 🟢 Produce HTML | 🟡 Produce HTML and JSON | 🟡 Produce custom SSE format (or HTML) |
| **Learning Curve** | 🟢 Low | 🟢 Very Low | 🟡 Medium | 🟡 Medium–High |
| **Locality of Behavior** | 🟢 Excellent | 🟢 Excellent | 🟢 Excellent | 🟢 Excellent |
| **CSP Compatability** | 🔴 None | 🟢 Good | 🟡 Possible | 🔴 None |

</div>
