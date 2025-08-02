# Leaflet.contextmenu

LeafletContextMenu - Modern ES class-based context menu for Leaflet

* Added support for submenus 
* Rebuilt the build system using Vite and Rollup
* Refactored overall code
* Added additional support for font based icons with emphasis on [https://github.com/Kitchen-JS/KitchenJSFontIcons](https://github.com/Kitchen-JS/KitchenJSFontIcons)
* Removed support for ie

## Support
| Leaflet Version             | Status              | Notes                                                                  |
| --------------------------- | ------------------- | ---------------------------------------------------------------------- |
| **1.0.0 – 1.9.x**           | Fully supported   | Tested and stable                                                      |
| **1.9.x** 				  | Fully supported   | No breaking API changes                                                |
| **2.0+  (future)**          | Probable support | //Review: Replace usage of L with explicit imports from the Leaflet package: import { Marker } from 'leaflet' and To have global access to variables of a module-script, assign them to the window object (Not recommended) https://github.com/Leaflet/Leaflet/blob/main/CHANGELOG.md  |

## ToDo
* option disabled needs to be revisited

## Usage

The context menu is implemented as a map interaction handler.  To use the plugin include the script and enable using the map `contextmenu` option.

```JavaScript
L.map('map', {
    contextmenu: true,
    contextmenuItems: [
        {
            text: 'Show Coordinates',
            callback: showCoordinates
        },
        {
            text: 'Center Map Here',
            iconCls: 'kfi-map-fuel',
            callback: centerMap
        },
        '-', // Spacer here
        {
            text: 'Connections',
            submenu: [
                {
                    text: 'Add Connection',
                    iconCls: 'kfi-magnify-alt',
                    callback: () => console.log('Add')
                },
                {
                    text: 'Remove Connection',
                    iconCls: 'kfi-math-plus',
                    callback: () => console.log('Remove')
                }
            ]
        },
        '-', // Another Spacer
        {
            text: 'Zoom In',
            icon: 'images/zoom-in.png',
            callback: zoomIn
        },
        {
            text: 'Zoom Out',
            icon: 'images/zoom-out.png',
            callback: zoomOut
        }
    ]
});
```

### As a module
```JS
import L from 'leaflet';
// import LeafletContextMenu from './LeafletContextMenu.js';
import 'leaflet-contextmenu';
import 'leaflet-contextmenu/dist/leaflet.contextmenu.css';
L.Map.addInitHook('addHandler', 'contextmenu', LeafletContextMenu);
```

### Shape Specific Contextmenu
```JavaScript
const marker1 = L.marker(new L.LatLng(-36.852668, 174.762675)).addTo(map);

map.contextmenu.bindContextMenuToLayer(marker1, [
	{
      separator: true
	},
	{
		text: 'Marker item',
		callback: (e) => alert('Marker 1 right-clicked')
	}
], { inherit: true });

const marker2 = L.marker(new L.LatLng(-36.86, 174.77)).addTo(map);

map.contextmenu.bindContextMenuToLayer(marker2, [
	{
		text: 'Zoom out',
		icon: 'images/zoom-out.png',
		callback: zoomOut
	}
], { inherit: false });
```

### Separators
```JavaScript
{
	separator: true
}
```
or
```JavaScript
'-'
```


---

### All Options
#### Map Context Menu Options

| Option | Type | Default | Description
| --- | --- | --- | ---
| contextmenu | Bool | `false` | Enables the context menu.
| contextmenuItems | Array | `[]` | Specification for the context menu items. See following options for individual menu items. A separator may also be added with a dash character `'-'`.

#### Menu Item Options

| Option | Type | Default | Description
| --- | --- | --- | ---
| text | String | `undefined` | The label to use for the menu item (required).
| icon | String | `undefined` | Url for a 16x16px icon to display to the left of the label.
| retinaIcon | String | `undefined` | Url for a retina-sized version (32x32px) icon to display to the left of the label.
| iconCls | String | `undefined` | A CSS class which sets the background image for the icon (exclusive of the `icon` option).
| retinaIconCls | String | `undefined` | A CSS class which sets the background image for a retina version of the icon (exclusive of the `retinaIcon` option).
| callback | Function | `undefined` | A callback function to be invoked when the menu item is clicked. The callback is passed an object with properties identifying the location the menu was opened at: `latlng`, `layerPoint` and `containerPoint`.
| context | Object | The map | The scope the callback will be executed in.
| disabled | Bool | `false` | If `true` the menu item will initially be in a disabled state and will not respond to click events.
| separator | Bool | `undefined` | If `true` a separator will be created instead of a menu item.

### Methods

A reference to the map's context menu can be obtained through the map variable e.g. `map.contextmenu`.

````javascript
showAt(L.Point/L.LatLng, [data])
````
Opens the map's context menu at the specified point. `data` is an optional hash of key/value pairs that will be included on the map's `contextmenu.show` event.

````javascript
hide()
````
Hides the map's context menu if showing.

````javascript
addItem(options)
````
Adds a new menu item to the context menu.

````javascript
insertItem(options, index)
````
Adds a new menu item to the context menu at the specified index. If the index is invalid the menu item will be appended to the menu.

````javascript
removeItem(HTMLElement/index)
````
Removes a menu item.

````javascript
removeAllItems()
````
Removes all menu items.

````javascript
setDisabled(HTMLElement/index, disabled)
````
Set's the disabled state of a menu item.

````javascript
isVisible()
````
Returns `true` if the context menu is currently visible.

### Mixin Methods
The following methods are available on supported layer types when using the context menu mixin.

````javascript
bindContextMenu(contextMenuOptions)
````
Binds a context menu to the feature the method is called on.

````javascript
unbindContextMenu()
````
Unbinds the context menu previously bound to the feature with the bindContextMenu() method.

### GeoJSON Data

To use the context menu with GeoJSON data it's necessary to use one of the GeoJSON layer's [pointToLayer](http://leafletjs.com/reference-1.0.3.html#geojson-pointtolayer) or [onEachFeature](http://leafletjs.com/reference-1.0.3.html#geojson-oneachfeature) methods.

#### Point Data

````javascript
var jsonLayer = L.geoJson(jsonData, {
	pointToLayer: function (data, latLng) {
	    var marker = new L.Marker(latLng, {
	        contextmenu: true,
	        contextmenuItems: [{
	            text: 'Marker item'
	        }]
        });
	    return marker;
	}
 }).addTo(map);
 ````

#### Other Types

````javascript
var jsonLayer = L.geoJson(jsonData, {
	onEachFeature: function (feature, layer) {
        layer.bindContextMenu({
            contextmenu: true,
	        contextmenuItems: [{
	            text: 'Marker item'
	        }]
        });
	}
 }).addTo(map);
````

### Events

The following events are triggered on the map:

#### contextmenu.show

Fired when the context menu is shown. If the context menu was shown in response to a map `contextmenu` event the event object will extend [MouseEvent](http://leafletjs.com/reference.html#mouse-event).

| Property | Type | Description
| --- | --- | ---
| contextmenu | Map.ContextMenu | The context menu.
| relatedTarget | L.Marker/L.Path/undefined | If the context menu was opened for a map feature this property will contain a reference to that feature.

#### contextmenu.hide

Fired when the context menu is hidden.

| Property | Type | Description
| --- | --- | ---
| contextmenu | Map.ContextMenu | The context menu.

#### contextmenu.select

Fired when a context menu item is selected.

| Property | Type | Description
| --- | --- | ---
| contextmenu | Map.ContextMenu | The context menu.
| el | HTMLElement | The context menu item element that was selected.

#### contextmenu.additem

Fired when a menu item is added to the context menu.

| Property | Type | Description
| --- | --- | ---
| contextmenu | Map.ContextMenu | The context menu.
| el | HTMLElement | The context menu item element.
| index | Number | The index at which the menu item was added.

#### contextmenu.removeitem

Fired when a menu item is removed from the context menu.

| Property | Type | Description
| --- | --- | ---
| contextmenu | Map.ContextMenu | The context menu.
| el | HTMLElement | The context menu item element.

#### contextmenu.enableitem

Fired when a menu item is enabled.

| Property | Type | Description
| --- | --- | ---
| contextmenu | Map.ContextMenu | The context menu.
| el | HTMLElement | The context menu item element.

#### contextmenu.disableitem

Fired when a menu item is disabled.

| Property | Type | Description
| --- | --- | ---
| contextmenu | Map.ContextMenu | The context menu.
| el | HTMLElement | The context menu item element.

## Development

Edit files in `src/`. To build the files in `dist/`, run:

````shell
npm install
npm run build
````

## Credit
[https://github.com/aratcliffe/Leaflet.contextmenu](https://github.com/aratcliffe/Leaflet.contextmenu)

## License
This software is released under the [MIT licence](https://opensource.org/license/mit). 

Font Based Icons are from [https://github.com/Kitchen-JS/KitchenJSFontIcons/tree/main](https://github.com/Kitchen-JS/KitchenJSFontIcons/tree/main)

Icons used in the example are from [https://glyphicons.com/](https://glyphicons.com/).
