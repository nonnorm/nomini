+++
template = "base.html"
+++

<section class="hero">

# Nomini
*The tiny, reactive, server-driven framework*

</section>

<section>

## Uhh... what is Nomini?
Nomini is *not*  your average JavaScript framework. Honestly, it’s barely a framework at all—and that’s the point. Nomini is just a tiny (~2kb) collection of useful attributes and helper functions that allow you to embrace writing JavaScript like the good old days, with a few modern conveniences layered on top.
### Features:
- `nm-data`: The heart of Nomini. Create a reactive data scope, similar to Alpine's `x-data`.
- `nm-bind`: Take any property of any element, including classes and event listeners, and bind it to a reactive variable.

___(With these two attributes, you can build almost anything! Still, there are a few more that punch well above their weight.)___

- `nm-ref`: Hold a reference to an element in your data scope.
- `nm-form`: Automatically wire an entire form's inputs to reactive variables.
- `nm-use`: A tiny templating system that takes advantage of `nm-data` scopes.

</section>

<section>

## Installation
**Nomini is a single file** designed to be downloaded and vendored into your project (placed into a static directory).

That means you never have to worry about dependency updates, you can add new features as you please, or you can remove filthy code that you don't use.

If you prefer a CDN, just paste this line of code into your `<head>`.
```html
<script defer src="https://cdn.jsdelivr.net/gh/nonnorm/nomini@0.3.0/dist/nomini.min.js"></script>
```

### Flavors
Nomini comes in 3 different flavors, all tiny but progressively more powerful:
- **Core (<900 bytes)**: Tiny library similar to Alpine.js, but way smaller.
    - Includes `nm-data`, `nm-bind`, `nm-ref`, standard helpers.
- **AJAX (1.5kb)**: Alpine with the power of partial page swaps á la htmx.
    - Includes above, fetch helpers, and reactive fetch variables.
- **Full (1.8kb)**: Syntactical sugar to bring Nomini closer to more advanced libraries.
    - Includes above, `nm-form`, `nm-use`, and CSS transition support for fetch
- Your own?: Use the [custom bundler script](https://github.com/nonnorm/nomini/blob/main/scripts/devour.sh) to customize your own tiny copy of Nomini.

</section>

<section>

## Credits
This project would not have existed without the inspiration of many other projects made by many talented developers. Thank you to:
1. [Carson Gross](https://github.com/1cg) for his work on [htmx](https://github.com/bigskysoftware/htmx) v4, by which the multipurpose fetch helper was inspired, and [fixi](https://github.com/bigskysoftware/fixi), which was a benchmark for this library's minimalism.
2. [Katrina Scialdone](https://github.com/kgscialdone) for their work on [Ajaxial](https://github.com/kgscialdone/ajaxial)—a spiritual precursor to fixi—and [Facet](https://github.com/kgscialdone/facet), which provided inspiration for the `nm-use` templating system.
3. [Delaney Gillilan](https://github.com/delaneyj) for his work on [datastar](https://github.com/starfederation/datastar), which was a useful feature benchmark and inspiration for some of the helper functions.
4. [Aiden Bai](https://github.com/aidenybai) for his work on [dababy](https://github.com/aidenybai/dababy), from which this project was directly forked for its innovative idea of JS property binding.

</section>
