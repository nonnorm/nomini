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

Any object-like attribute will have `this` bound to the element with the attribute. Often, the keys of the object can have **modifiers**, which will be separated by the main key with dots. If a key has modifiers, it must be wrapped in quotes to be parsed correctly.

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
`nm-bind` binds any property of an element to a JavaScript expression, whether static or reactive from an `nm-data`. You can access reactive data declared in an [`nm-data`](#nm-data), along with any built-in [helpers](#helpers) at any point. Multiple binds can be toggled by providing multiple key/value pairs. All values in a bind are **required** to be an arrow function. If something isn't working, check that it's in an arrow function. The function will be called once upon initialization and again whenever any reactive data that it depends on changes. 

`nm-bind` does not allow binding to arbitrary attributes, but nearly every meaningful attribute has a JS property equivalent. If you want to retrieve custom data, that should be stored in `data-*` attributes and can be accessed through the [`$dataset` helper](#dataset).

```html
<p nm-bind="textContent: () => 'Lorem '.repeat(12)"></p>
```
<p nm-bind="textContent: () => 'Lorem '.repeat(12)"></p>

Of course, its greatest strength is when combined with `nm-data`.
```html
<div nm-data="text: ''">
    <input nm-bind="oninput: () => text = this.value">
    <p nm-bind="textContent: () => text"></p>
</div>
```
<div nm-data="text: ''">
    <input nm-bind="oninput: () => text = this.value">
    <p nm-bind="textContent: () => text"></p>
</div>

#### Event Listeners
`nm-bind` additionally gives you access to inline event listeners, bound like they would be with the built-in `on*` properties. However, it supports all DOM events, including user-emitted ones or [library-emitted ones](#events). Multiple events can be listened to by providing multiple key/value pairs. The callback can take an event parameter, and it will not be called until the event is triggered.

```html
<button nm-bind="onclick: () => alert('OW!')">Click Me!</button>
```
<button nm-bind="onclick: () => alert('OW!')">Click Me!</button>

##### Inline Event Modifiers
Nomini additionally supports some additional syntax sugar for common event handling patterns. Postfix the event name with one or more of these modifiers to change the behavior:
- **`.prevent`**: Calls `e.preventDefault`.
- **`.stop`**: Calls `e.stopPropagation`.
- **`.debounce<ms>`**: Debounces the event by the number of milliseconds listed.
- **`.once`**: Removes the event listener after it's called once.
- **`.window`**: Adds the event listener to the window instead of the current element.

```html
<button nm-bind="'onclick.once': () => alert('After viewed, this message will self-destruct.')">
    Click Me!
</button>
```
<button nm-bind="'onclick.once': () => alert('After viewed, this message will self-destruct.')">
    Click Me!
</button>

```html
<button nm-bind="'onclick.debounce250': () => alert('Stop bothering me.')">
    Click Me!
</button>
```
<button nm-bind="'onclick.debounce250': () => alert('Stop bothering me.')">
    Click Me!
</button>

```html
<section nm-bind="'onresize.window.debounce10': () => {
    this.style.height = window.innerHeight / 3 + 'px';
    this.style.width = window.innerWidth / 3 + 'px';
}">
    1/3th scale window (resize me)<br>
    (Yes, this could also be done with vw and vh properties)
</section>
```
<section nm-bind="'onresize.window.debounce10': () => {
    this.style.height = window.innerHeight / 3 + 'px';
    this.style.width = window.innerWidth / 3 + 'px';
}">
    1/3th scale window (resize me)<br>
    (Yes, this could also be done with vw and vh properties)
</section>

#### Nested Binds
You can bind to properties one level deep by separating the levels by dots in your key. Remember to quote the key.

```html
<section nm-bind="'style.backgroundColor': () => 'lightgreen'">
    Words words words
</section>
```
<section nm-bind="'style.backgroundColor': () => 'lightgreen'">
    Words words words
</section>

#### Class Support
You can also bind to classes using the nested bind support. Bind to a class using the `class.<classname>` property, where the bind function is expected to return a boolean.

```html
<button nm-data="red: false" nm-bind="{
    'class.demo-red': () => red,
    onclick: () => red = !red
}">
    I'm angry
</button>
```
<button nm-data="red: false" nm-bind="{
    'class.demo-red': () => red,
    onclick: () => red = !red
}">
    I'm angry
</button>

#### Async Support
To support async functions, all binds are automatically awaited if required.

**Caution**: Be careful when using async functions. Any property accesses after an `await` will very likely not be reactive. Async function support is provided for the cases where it's useful, but it can be the source of many hard-to-find bugs.

### nm-ref
Grab a reference to the current element and put it into the `$refs` object.
```html
<dialog nm-ref="dialog">
    <button nm-bind="onclick: () => $refs.dialog.close()">×</button>
    You can open dialogs!
</dialog>
<button nm-bind="onclick: () => $refs.dialog.showModal()">Click Me!</button>
```

<dialog nm-ref="dialog">
    <button nm-bind="onclick: () => $refs.dialog.close()">×</button>
    You can open dialogs!
</dialog>
<button nm-bind="onclick: () => $refs.dialog.showModal()">Click Me!</button>

### nm-form
Purely a convenience helper, it synchronizes all form inputs with the reactive scope by name. It works on a container containing inputs with a `name` or on inputs themselves. It's equivalent to putting an `nm-bind` event listener on all of the form elements. Additionally, it will disable any submit buttons if a request is in progress.

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

Nomini will automatically encode all reactive data, `data-*` attributes from the scope, and provided data into the request. During the fetch, the reactive `_nmFetching` will be set to true. The [`fetcherr`](#fetcherr) event will automatically be dispatched on a non-2xx status code or a network error.

#### Response Format
Nomini supports two types of responses: oneshot and streaming. Every chunk sent to the server, whether as a oneshot or streaming response, is expected to contain one or more complete HTML fragments with a top-level `id`. Optionally, the `nm-swap` attribute is used to determine how the content gets swapped in. Options are: `outer` (default), `inner`, `before`, `prepend`, `append`, `after`. `outer` will replace the element with the corresponding ID with the new element, all others will discard the new wrapper element and replace the children of the existing element with the children of the wrapper.

Example server response:
```html
    <div id="swap-target">
        <!-- content goes here -->
    </div>
    <table id="table" nm-swap="beforeend">
        <tr>
            <!-- content goes here -->
        </tr>
    </table>
```

### $nmData
Used internally to collect all computed values, primitives, arrays, and other encodable user data for `$fetch`. Not likely to be needed by users.

### $dispatch
Dispatch an event on the current element. Can be listened to higher up on the tree by [`nm-bind`](#nm-bind).
```js
$dispatch("my-event")
// Second attribute describes 'detail' property of the event
$dispatch("scary", { run: "away" })
// Third attribute is the general options property
$dispatch("help-me", { so: "alone" }, { bubbles: false })
```

### $watch
Takes a callback, will run it once on initialization and once whenever its dependent variables change.
```html
<input name="text" nm-data nm-form nm-bind="oninit: () => $watch(() => console.log(text))">
```
<input name="text" nm-data nm-form nm-bind="oninit: () => $watch(() => console.log(text))">

### $persist
Hydrates a variable with data from localStorage and reactively links it to localStorage.
```js
// Call this in 'oninit', assuming 'text' is a variable in the data
$persist('text')
// Can also provide a custom localStorage key
$persist('text', 'myText101')
```

---

## Events
### init
Dispatched on any element as it's initialized by Nomini. Does **not** bubble.

```html
<p nm-bind="{ 'oninit.debounce2000': () => $get('/refresh') }"></p>
```

### destroy
Dispatched on any element when it's about to be swapped out by Nomini. Does **not** bubble.

```html
<p nm-bind="{ 'oninit.debounce2000': () => $get('/refresh') }"></p>
```

### fetcherr
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
