# Nomini

A minimal implementation of data binding, intended for use in SSR apps.

## Quote Generator Example

```html
<div data="{ quotes: ['LES GO', 'LESS GO', 'LESSS GO'], currentQuote: 'LES GO' }">
  <button bind="{
    onclick: () => {
      currentQuote = quotes[Math.floor(Math.random() * quotes.length)];
    },
    textContent: currentQuote
  }"></button>
</div>
```

## Features

### Data

Add the `data` attribute to an element to get started. The value of the attribute should be an object literal. Anything under that element will be able to access the data as global variables when binding. Note that elements will only be able to access data from their closest data-containing parent, and nested data-containing elements will not merge. 

**Example:**

```html
<div data="{ name: 'Jeff' }">
  <!-- content here -->
</div>
```

### Bind

Add the `bind` attribute to an element to bind properties, basically anything you can access in JavaScript like `innerHTML`, `onclick`, `id`, etc. This will attach it to the element reactively, so whenever the data changes it will be re-bound.

**Example:**

```html
<div data="{ name: 'Jeff' }">
  <p bind="{ textContent: name }"><!-- Jeff --></p>
</div>
```
