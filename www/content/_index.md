+++
template = "base.html"
+++

<section class="hero">

# Nomini
_The tiny, reactive, server-driven framework_

</section>

<section>

## Uhh... what is Nomini?
Nomini is _not_  your average JavaScript framework. Honestly, it’s barely a framework at all—and that’s the point. Nomini is just a tiny (~2kb) collection of useful attributes and helper functions that allow you to embrace writing JavaScript like the good old days, with a few modern conveniences layered on top.
### Features:
- `nm-data`: The heart of Nomini. Create a reactive data scope, similar to Alpine's `x-data`.
- `nm-bind`: Take any property of any element and bind it to a reactive variable.
- `nm-on`: Listen to any event to modify your reactive variables. A more powerful version of `onclick`.

___(With these three attributes, you can build almost anything! Still, there are a few more that punch well above their weight.)___

- `nm-class`: Like `nm-bind`, but for classes.
- `nm-ref`: Hold a reference to an element in your data scope.
- `nm-form`: Automatically wire an entire form's inputs to reactive variables.
- `nm-use`: A tiny templating system that takes advantage of `nm-data` scopes.

</section>

<section>

## Installation
__Nomini is a single file__ designed to be downloaded and vendored into your project (placed into a static directory).

That means you never have to worry about dependency updates, you can add new features as you please, or you can remove filthy code that you don't use.

If you prefer a CDN, just paste this line of code into your `<head>`.
```html
<script defer src="https://cdn.jsdelivr.net/gh/nonnorm/nomini@0.1.0/nomini.min.js"></script>
```

</section>
