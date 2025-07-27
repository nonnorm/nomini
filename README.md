# Nomini

Nomini is the smallest htmx/datastar replacement. Bind local state and make AJAX requests directly in your HTML, with the best features of both Alpine.js and htmx, while being under 2kb.

## Features

### Data

Add the `nm-data` attribute to any element to create a lightweight reactive scope. The syntax is exactly like a JavaScript object, but without the curly braces. It's not JSON, any JS code is allowed! Use the `this` keyword to refer to the current element. Data declared in this scope will be accessible as a global variable to any child `nm-bind` object that is **not** inside of another `nm-data`.

```html
<div nm-data="name: 'Jeff'">
  <!-- content here -->
</div>
```

#### Computed Properties

Instead of having a special syntax for computed properties, they're declared as getter functions on the data object. They will automatically be reactive, just like normal properties.

**Note**: In getter functions (and any other function that's **not** declared as an arrow function), `this` refers to the reactive data object, **not** the element.

```html
<div nm-data="
  firstName: 'Jeff', lastName: 'Goldblum',
  fullName() { return `${this.firstName} ${this.lastName}` }
">
  <p nm-bind="textContent: name"><!-- Jeff --></p>
</div>
```

### Bind

Add the `nm-bind` attribute to an element to bind any property of that element. Some notable ones are `textContent`, `hidden`, `style`, `innerHTML`, and `className`. Note that while almost all HTML attributes have a JS property equivalent, you won't be able to bind to custom attributes. Consider using `data-` attributes instead, which are accessible through the `dataset` property. As with `nm-data`, you can use `this` to get the current element. Binds will be run once upon initialization, and any binds that read from a property of `nm-data` will be automatically re-run whenever their dependencies change. All binds **must** be a closure. Property accesses will only be tracked if they're in synchronous code (no `setTimeout` or `then`).


```html
<div nm-data="name: 'Jeff'">
  <p nm-bind="textContent: () => name"><!-- Jeff --></p>
</div>
```

#### Event Handlers

To handle an event, simply bind to the `on*` event listener property. This closure, as expected, will be run whenever that event is triggered. Optionally, the closure can take the event as a property. Property accesses in event listeners will **not** be tracked.


```html
<div nm-data="counter: 0">
  <p nm-bind="textContent: () => counter"></p>
  <button nm-bind="onClick: () => counter += 1">Increment</button>
</div>
```

#### Async Binds

To support async functions, any binds will be automatically awaited if required.

**Caution**: Be careful when using async functions. Any property accesses after an `await` will very likely **not** be tracked. Async function support is provided for the cases where it's useful, but it can be the source of many hard-to-find bugs.


```html
<div nm-data>
  <p nm-bind="textContent: someAsyncFunction"></p>
</div>
```

### Partial Page Swaps
Nomini supports htmx-style partial page swaps. Helper functions are provided to make requests and swap them into the DOM. They have this syntax: `method(url, { parameters })`. Paramaters will be encoded using form-urlencoded syntax, and will automatically be inserted into the URL or the body depending on the method.
 
**Note**: Currently, only `get` and `post` helpers are implemented. I recognize the importance of the `PUT`, `PATCH`, and `DELETE` methods, and support for them will be added at a later time. Let me know if this is important to you, and I'll prioritize it!

Every fragment returned by the server is required to have an `id` to indicate where it should go in the page, and can optionally have an `nm-swap` to determine the swap strategy. The following swap strategies are available: `outerHTML` (default), `innerHTML`, `beforebegin`, `afterbegin`, `beforeend`, `afterend`.

```html
<div nm-data="text: ''">
  <input nm-bind="oninput: () => text = this.value">
  <button nm-bind="onclick: () => post('/submit', { text, code: 123 })">Submit</button>
  <p id="output"></div>
</div>

<!-- Server returns: -->
<p id="output">Lorem ipsum dolor sit amit</p>
```

#### Magic Properties
For convenience, Nomini includes some magic properties in each `nm-data` scope to watch the status of your request. The `nmFetching` attribute is a boolean that indicates whether a request is in progress. The `nmError` attribute returns either the last error or null. As with all other properties, these are reactive.
```html
<div nm-data>
  <p nm-bind="hidden: () => !nmError, textContent: () => nmError"></p>
  <button nm-bind="onclick: () => get('/page')">Submit</button>
  <p nm-bind="hidden: () => nmFetching">Loading...</p>
</div>
```
