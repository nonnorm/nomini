+++
title = "Documentation"
+++

## Introduction
Nomini is a JavaScript framework that serves one very specific purpose: make it easier to write JavaScript in your HTML. It is not the first library to [consider](https://htmx.org/essays/locality-of-behavior) [these](https://unplannedobsolescence.com/blog/behavior-belongs-in-html/) [principles](https://daverupert.com/2021/10/html-with-superpowers/). However, it does have one core tenet that many other libraries don't: __minimalism__. Nomini does not provide a lot—and that's on purpose. It exists to fill in the small gaps where HTML falls short (but hopefully won't [some day](https://alexanderpetros.com/triptych/)): partial page swaps, custom event handling, and automatic state synchronization. And it fits all of this into an easy-to-understand 2kb package.

---

## Attributes
### nm-on
`nm-on` simply gives you access to one or more inline event listeners.
```html
<button nm-on="click: () => alert('OW!')">Click Me!</button>
```

#### Inline Event Modifiers
Coming Soon...

### nm-data
WIP

#### Local Properties

#### Computed Properties

### nm-bind
WIP

#### Async Support

### nm-class
WIP

### nm-form
WIP

### nm-ref
WIP

---

## Helpers
### $fetch/$get/$post
WIP

### $debounce
WIP (may be removed after inline event modifiers)

---

## Events
### nminit
WIP

### nmerror
WIP

---

## Magic Properties
### _nmFetching
WIP
