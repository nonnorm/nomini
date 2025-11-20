+++
title = "Documentation"
+++

## Introduction
Nomini is a JavaScript framework that serves one very specific purpose: make it easier to write JavaScript in your HTML. It is not the first library to [consider](https://htmx.org/essays/locality-of-behavior) [these](https://unplannedobsolescence.com/blog/behavior-belongs-in-html/) [principles](https://daverupert.com/2021/10/html-with-superpowers/). However, it does have one core tenet that many other libraries don't: __minimalism__. Nomini does not provide a lot—and that's on purpose. It exists to fill in the small gaps where HTML falls short (but hopefully won't [some day](https://alexanderpetros.com/triptych/)): partial page swaps, custom event handling, and automatic state synchronization. And it fits all of this into an easy-to-understand 2kb package.

---

## Attributes
Nomini attributes generally are **object-like**, meaning the value is a JavaScript object with key-value pairs, **optionally** including the curly braces:

```
nm-bind="textContent: () => name"
```
or:
```
nm-bind="{ textContent: () => name }"
```

Any object-like attribute will have `this` bound to the element with the attribute.

### nm-on
`nm-on` simply gives you access to one or more inline event listeners. It supports all DOM events, not just the ones with built-in `on*` properties, including user-emitted ones or library-emitted ones. As with all the other `nm-` methods, you can access reactive data declared in an [`nm-data`](#nm-data), along with any built-in [helpers](#helpers). Multiple events can be listened to by providing multiple key/value pairs.

```html
<button nm-on="click: () => alert('OW!')">Click Me!</button>
```
<button nm-on="click: () => alert('OW!')">Click Me!</button>

#### Inline Event Modifiers
Nomini additionally supports some additional syntax sugar for common event handling patterns. Postfix the event name with one or more of these modifiers to change the behavior:
- **`.prevent`**: Calls `e.preventDefault`.
- **`.stop`**: Calls `e.stopPropagation`.
- **`.debounce<ms>`**: Debounces the event by the number of milliseconds listed.
- **`.once`**: Removes the event listener after it's called once.

Because object keys can’t contain dots without quoting, you must wrap modified event names in string literals.

```html
<button nm-on="'click.once': () => alert('After viewed, this message will self-destruct.')">
    Click Me!
</button>
```
<button nm-on="'click.once': () => alert('After viewed, this message will self-destruct.')">
    Click Me!
</button>

```html
<button nm-on="'click.debounce200': () => alert('Stop bothering me.')">
    Click Me!
</button>
```
<button nm-on="'click.debounce200': () => alert('Stop bothering me.')">
    Click Me!
</button>

### nm-data
`nm-data` allows you to declare a scope of reactive JavaScript data. It will be globally accessible from `nm-` attributes in this scope only. Scopes are not inherited. If your data is not reactive and it's a simple type, consider using `data-*` attributes and the [`$dataset`](#dataset) function instead.

```html
<div nm-data="name: 'Jeff'">
  <!-- content here -->
</div>
```

#### Local Properties
Any key in an `nm-data` that starts with an underscore will **never** be sent to the server automatically. This is only relevant if working with helpers like `$get` inside of a scope.

```html
<div nm-data="_saved: false">
  <!-- content here -->
</div>
```

#### Computed Properties
Nomini has no special syntax for computed properties, but because the data scope is a standard object, you can write a member function to compute the property. Note that in member functions `this` refers to the data scope, not the element.

```html
<div nm-data="first: 'Pac', last: 'Man', full() { return `${this.first} ${this.last}` }">
    <p nm-bind="textContent: () => full()"></p>
</div>
```

### nm-bind
`nm-bind` binds any property of an element to a JavaScript expression, whether static or reactive from an `nm-data`. All values in a bind are **required** to be an arrow function. This does not allow binding to arbitrary attributes, but nearly every meaningful attribute has a JS property equivalent. Multiple binds can be toggled by providing multiple key/value pairs.

```html
<p nm-bind="textContent: () => 'Lorem '.repeat(12)"></p>
```
<p nm-bind="textContent: () => 'Lorem '.repeat(12)"></p>

Of course, its greatest strength is when it's combined with `nm-data`.
```html
<div nm-data="text: ''">
    <input nm-on="input: () => text = this.value">
    <p nm-bind="textContent: () => text"></p>
</div>
```
<div nm-data="text: ''">
    <input nm-on="input: () => text = this.value">
    <p nm-bind="textContent: () => text"></p>
</div>

#### Async Support
To support async functions, all binds are automatically awaited if required.

**Caution**: Be careful when using async functions. Any property accesses after an `await` will very likely not be reactive. Async function support is provided for the cases where it's useful, but it can be the source of many hard-to-find bugs.

### nm-class
Similar to `nm-bind`, it conditionally toggles classes reactively. Multiple classes can be toggled by providing multiple key/value pairs.

```html
<div nm-data="red: false">
    <button nm-on="click: () => red = !red">Click Me!</button>
    <p nm-class="'demo-red': () => red">Lorem ipsum dolor sit amit</p>
</div>
```
<div nm-data="red: false">
    <button nm-on="click: () => red = !red">Click Me!</button>
    <p nm-class="'demo-red': () => red">Lorem ipsum dolor sit amit</p>
</div>

### nm-ref
Grab a reference to the current element and put it into the `$refs` object.
```html
    <dialog nm-ref="dialog">
        <button nm-on="click: () => $refs.dialog.close()">×</button>
        You can open dialogs!
    </dialog>
    <button nm-on="click: () => $refs.dialog.showModal()">Click Me!</button>
```

<dialog nm-ref="dialog">
    <button nm-on="click: () => $refs.dialog.close()">×</button>
    You can open dialogs!
</dialog>
<button nm-on="click: () => $refs.dialog.showModal()">Click Me!</button>

### nm-form
Purely a convenience helper, it synchronizes all form inputs with the reactive scope by name. It works on a container containing inputs with a `name` or on inputs themselves. It's equivalent to putting an `nm-bind` on all of the form elements. Additionally, it will disable any submit buttons if a request is in progress.

```html
<div nm-data>
    <input name="text" nm-form>
    <p nm-bind="textContent: () => text"></p>
</div>
```
<div nm-data>
    <input name="text" nm-form>
    <p nm-bind="textContent: () => text"></p>
</div>

### nm-use
`nm-use` allows you to grab the contents of a `template` element with a specified `id` and swap it into the current element. It also includes `<slot>` support, so the current contents of the element will be moved into the slot. Props are passed through the inherited `nm-data` scope and its associated `data-*` attributes.

```html
<template id="card">
    <h2 nm-bind="textContent: () => title"></h2>
    <slot></slot>
</template>

<section nm-use="card" nm-data="title: 42">
What is the answer to life, the universe, and everything?
</section>
```

<template id="card">
    <h2 aria-hidden="true" nm-bind="textContent: () => title"></h2>
    <slot></slot>
</template>
<section nm-use="card" nm-data="title: 42">
What is the answer to life, the universe, and everything?
</section>

---

## Helpers
### $dataset
Walks up the element tree and collects all `data-*` attributes in the current `nm-data` scope.

### $fetch/$get/$post
All AJAX in Nomini goes through `$fetch`. Inside any `nm-` attribute (but almost always `nm-on`):

```js
$get("/user")
$post("/save", { id: 1 })
$fetch("/url", "PUT", { foo: 1 })
```

Nomini will automatically encode all reactive data, `data-*` attributes from the scope, and provided data into the request. During the fetch, the reactive `_nmFetching` will be set to true. The [`nmerror`](#nmerror) event will automatically be dispatched on a non-2xx status code or a network error.

#### Response Format
Nomini supports two types of responses: oneshot and streaming. Every chunk sent to the server, whether as a oneshot or streaming response, is expected to contain one or more complete HTML fragments with a top-level `id`. Optionally, the `nm-swap` attribute is used to determine how the content gets swapped in. Options are: `outerHTML` (default), `innerHTML`, `beforebegin`, `afterbegin`, `beforeend`, `afterend`.

Example server response:
```html
    <div id="swap-target">
        <!-- content goes here -->
    </div>
    <tr id="table" nm-swap="beforeend">
        <!-- content goes here -->
    </tr>
```

### $nmData
Used internally to collect all computed values, primitives, arrays, and other encodable user data for `$fetch`. Not likely to be needed by users.

---

## Events
### nminit
Dispatched on any element as it's initialized by Nomini. Does **not** bubble.

```html
<p nm-on="{ 'nminit.debounce2000': () => $get('/refresh') }"></p>
```

### nmerror
Dispatched by `$fetch` when a request fails or returns a non-2xx response code. Bubbles outside the scope so that it can be handled globally. The `detail` property contains an `err` message and a `url`.

---

## Magic Properties
### _nmFetching
Reactive boolean value that is set to `true` whenever a [fetch](#fetch-get-post) is in progress. Can be used to disable buttons or show loading indicators.

```html
<button nm-bind="disabled: () => _nmFetching">Submit</button>
```

### _nmAbort
An [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) that is attached to the current fetch. Call `abort` on it to abort an in-progress fetch.
```js
_nmAbort.abort()
```
