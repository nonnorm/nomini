# Dababy

Data binding so simple even DaBaby could do it, now made reactive!

## Installation

Put this script tag between the `<head>` tags of your webpage.

```html
<script src="https://unpkg.com/dababy"></script>
```

## Dababy Quote Generator Example

```html
<div data="{ quotes: ['LES GO', 'LESS GO', 'LESSS GO'], currentQuote: 'LES GO' }">
  <button bind="{
    onclick: () => {
      data.currentQuote = data.quotes[Math.floor(Math.random() * data.quotes.length)];
    },
    textContent: data.currentQuote
  }"></button>
</div>
```

## Features

### Data

Add the `data` attribute to an element to get started. The value of the attribute should be an object literal. Anything under that element will be able to access the data as global variables when binding.

**Example:**

```html
<div data="{ name: 'Dababy' }">
  <!-- content here -->
</div>
```

### Bind

Add the `bind` attribute to an element to bind properties, basically anything you can access in JavaScript like `innerHTML`, `onclick`, `style`, `id`, etc. This will attach it to the element

**Example:**

```html
<div data="{ name: 'Dababy' }">
  <p bind="{ innerHTML: data.name }"><!-- Dababy --></p>
</div>
```

---

© 2021 Aiden Bai
