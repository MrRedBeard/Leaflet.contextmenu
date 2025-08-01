# 📋 Submenu Integration Plan for LeafletContextMenu

## ✅ Goals

* Enable **1-level deep submenus** in the LeafletContextMenu system.
* Display submenus **on hover**.
* **Parent submenu items are not clickable**, only display a submenu.

---

## 🧩 Menu Structure Format

```js
{
  text: 'Group Title',
  submenu: [
    { text: 'Child 1', callback: () => ... },
    { text: 'Child 2', callback: () => ... }
  ]
}
```

---

## 🧠 Code Changes

### 1. In `_createItem()`

Add this conditional:

```js
if (Array.isArray(options.submenu))
{
    return this._createSubmenu(container, options, index);
}
```

### 2. New Method: `_createSubmenu()`

```js
_createSubmenu(container, options, index)
{
    const wrapper = this._insertElementAt('div', `${LeafletContextMenu.BASE_CLS}-item`, container, index);
    wrapper.textContent = options.text;

    const submenuEl = document.createElement('div');
    submenuEl.className = `${LeafletContextMenu.BASE_CLS}-submenu`;

    options.submenu.forEach(subOpt =>
    {
        const subItem = this._createItem(submenuEl, subOpt);
        this._items.push(subItem); // track
    });

    wrapper.appendChild(submenuEl);

    return {
        id: L.Util.stamp(wrapper),
        el: wrapper,
        submenu: submenuEl
    };
}
```

---

## 🎨 Required CSS (already included)

```css
.leaflet-contextmenu-submenu {
  display: none;
  position: absolute;
  left: 100%;
  top: 0;
  background-color: white;
  border: 1px solid #ddd;
  z-index: 10001;
}

.leaflet-contextmenu-item:hover > .leaflet-contextmenu-submenu {
  display: block;
}
```

---

## ✅ Example Context Menu Setup

```js
map.options.contextmenuItems = [
  {
    text: 'Add Shape',
    callback: () => console.log('Add Shape')
  },
  {
    text: 'Connections',
    submenu: [
      { text: 'Add Connection', callback: () => console.log('Add') },
      { text: 'Remove Connection', callback: () => console.log('Remove') }
    ]
  }
];
```

---

## 🧼 Optional Enhancements

* Prevent recursion (no nested submenus inside submenus).
* Support `disabled: true` on top-level submenu parent.
* Add arrow indicator with CSS (`::after` content).



❌ No submenu disabled-state styling (disabled: true on a submenu parent).

❌ Could isolate submenu hover zones slightly better for margin/padding clarity.

Support disabled: true on submenu headers?

Make submenu positioning smarter if viewport clipped?