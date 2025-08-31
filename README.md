# Nomini

Nomini is the smallest htmx/datastar replacement. Bind local state and make AJAX requests directly in your HTML, with the best features of both Alpine.js and htmx, while being under 2kb.

## Features

### Data

Add the `nm-data` attribute to any element to create a lightweight reactive scope. The syntax is exactly like a JavaScript object, but without the curly braces. It's not JSON, any JS code is allowed! Use the `this` keyword to refer to the current element. Data declared in this scope will be accessible as a global variable to child `nm-bind` objects **unless** they are inside of another `nm-data`.

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
  <p nm-bind="textContent: fullName"></p>
</div>
```

### Bind

Add the `nm-bind` attribute to an element to bind any property of that element. Some notable ones are `textContent`, `hidden`, `innerHTML`, and `ariaExpanded`. Note that while almost all HTML attributes have a JS property equivalent, you won't be able to bind to custom attributes. Consider using `data-` attributes instead, which are accessible through the `dataset` property. As with `nm-data`, you can use `this` to get the current element. Binds will be run once upon initialization, and any binds that read from a property of `nm-data` will be automatically re-run whenever their dependencies change. All binds **must** be a closure. Property accesses will only be tracked if they're in synchronous code (no `setTimeout` or `then`).


```html
<div nm-data="name: 'Jeff'">
  <p nm-bind="textContent: () => name"><!-- Jeff --></p>
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

### Event Handlers

Instead of binding to `onclick` or using the onclick attribute, use `nm-on`: `preventDefault` is called automatically. Optionally, the closure can take the event as a property. Property accesses in event listeners will **not** be tracked.


```html
<div nm-data="counter: 0">
  <p nm-bind="textContent: () => counter"></p>
  <button nm-on="click: () => counter += 1">Increment</button>
</div>
```

### Class Bindings

Use `nm-class` to conditionally toggle classes based on reactive data:
```html
<div nm-data="isActive: true">
  <button nm-class="active: () => isActive">Click me</button>
</div>
```

### Forms

For convenience, the `nm-form` attribute will automatically add the value of any input elements with a name to the nearest reactive scope. It's a one-way reactive bind, so while new input by the user will be reflected, changes to the data will not be.

```html
<form nm-data nm-form>
  <input name="username" placeholder="Username">
  <input type="checkbox" name="agree">
  <p nm-bind="textContent: () => `${username} ${agree ? 'did' : 'did not'} agree`"></p>
</form>
```

### References

Assign a DOM element to a reactive property using nm-ref:
```html
<div nm-data>
  <dialog nm-ref="dialogRef">Hi :D</p>
  <button nm-on="click: dialogRef.showModal">Open Dialog</button>
</div>
```

### Partial Page Swaps
Nomini supports htmx-style partial page swaps. Use `$fetch` to request any HTTP method, or sugar functions `$get` and `$post`. Paramaters will be encoded using form-urlencoded syntax, and will automatically be inserted into the URL or the body depending on the method. By default, all user-defined signals in the data scope are included in the request, but this can be overriden with the second parameter.

Every fragment returned by the server is required to have an `id` to indicate where it should go in the page, and can optionally have an `nm-swap` attribute to determine the swap strategy. The following swap strategies are available: `outerHTML` (default), `innerHTML`, `beforebegin`, `afterbegin`, `beforeend`, `afterend`.

```html
<div nm-data="text: ''">
  <input nm-on="input: () => text = this.value">
  <button nm-on="click: () => $post('/submit', { text, code: 123 })">Submit</button>
  <p id="output"></div>
</div>

<!-- Server returns: -->
<p id="output">Lorem ipsum dolor sit amit</p>
```

### Magic Events
Nomini has a couple of events that will automatically fire when certain conditions are met. The benefit of using events over signals is that events can bubble and escape their current scope, while signals cannot.

- `nmerror`: Fires when a request fails either because of a network error or status code. The event bubbles outside the scope, making it easier to handle globally. Check the `detail` property for an `err` message and a `url`.
- `nminit`: Fires when an element with nm-data is initialized.

```html
<div nm-data nm-on="nminit: () => console.log('Initialized!'), nmerror: (e) => alert(e.detail.err)">
  <a href="/page" nm-on="click: () => $get(this.href)">Load Page (progressively enhanced even if JS is disabled)</button>
</div>
```

### Magic Properties
For convenience, Nomini includes some magic properties in each `nm-data` scope to watch the status of your request. The `nmFetching` attribute is a reactive boolean that indicates whether a request is in progress.
```html
<div nm-data>
  <button nm-bind="onclick: () => $get('/page')">Submit</button>
  <p nm-bind="hidden: () => nmFetching">Loading...</p>
</div>
```
