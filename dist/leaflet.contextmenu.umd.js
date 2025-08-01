/*! LeafletContextMenu v1.6.0 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('leaflet')) :
    typeof define === 'function' && define.amd ? define(['leaflet'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.LeafletContextMenu = factory(global.L));
})(this, (function (L) { 'use strict';

    /**
     * LeafletContextMenu - Modern ES class-based context menu for Leaflet
     * Leaflet.contextmenu, a context menu for Leaflet.
     * (c) 2015, Adam Ratcliffe, GeoSmart Maps Limited
     * @author MrRedBeard, Adam Ratcliffe
     * @license MIT
     */


    let LeafletContextMenu$1 = class LeafletContextMenu extends L.Handler
    {

        static BASE_CLS = 'leaflet-contextmenu';

        constructor(map)
        {
            super(map);
            this._items = [];
            this._visible = false;
            this._container = this._createContainer(map);
            this._createItems();
        }

        addHooks()
        {
            const container = this._map.getContainer();
            //container.addEventListener('mouseleave', this._hide);
            L.DomEvent.on(container, 'mouseleave', () => this._hide());
            
            //document.addEventListener('keydown', this._onKeyDown);
            L.DomEvent.on(container, 'keydown', () => this._onKeyDown);

            this._map.on('contextmenu', this._show, this);
            this._map.on('mousedown zoomstart', this._hide, this);
        }

        removeHooks()
        {
            const container = this._map.getContainer();
            container.removeEventListener('mouseleave', this._hide);
            document.removeEventListener('keydown', this._onKeyDown);
            this._map.off('contextmenu', this._show, this);
            this._map.off('mousedown zoomstart', this._hide, this);
        }

        showAt(latlng, data = {})
        {
            const point = latlng instanceof L.LatLng ? this._map.latLngToContainerPoint(latlng) : latlng;
            this._showAtPoint(point, data);
        }

        hide()
        {
            this._hide();
        }

        addItem(options)
        {
            return this.insertItem(options);
        }

        insertItem(options, index = this._items.length)
        {
            const item = this._createItem(this._container, options, index);
            this._items.push(item);
            this._sizeChanged = true;
            return item.el;
        }

        removeItem(indexOrEl)
        {
            const el = typeof indexOrEl === 'number' ? this._container.children[indexOrEl] : indexOrEl;
            if (el)
            {
                const id = L.Util.stamp(el);
                const idx = this._items.findIndex(item => item.id === id);
                if (idx !== -1)
                {
                    this._container.removeChild(this._items[idx].el);
                    this._items.splice(idx, 1);
                }
            }
        }

        removeAllItems()
        {
            while (this._items.length)
            {
                this.removeItem(this._items[0].el);
            }
        }

        hideAllItems()
        {
            var item, i, l;

            for (i = 0, l = this._items.length; i < l; i++)
            {
                item = this._items[i];
                item.el.style.display = 'none';
            }
        }

        showAllItems()
        {
            var item, i, l;

            for (i = 0, l = this._items.length; i < l; i++)
            {
                item = this._items[i];
                item.el.style.display = '';
            }
        }

        setDisabled(item, disabled)
        {
            var container = this._container,
            itemCls = L.Map.ContextMenu.BASE_CLS + '-item';

            if (!isNaN(item))
            {
                item = container.children[item];
            }

            if (item && L.DomUtil.hasClass(item, itemCls))
            {
                if (disabled)
                {
                    L.DomUtil.addClass(item, itemCls + '-disabled');
                    this._map.fire('contextmenu.disableitem', 
                    {
                        contextmenu: this,
                        el: item
                    });
                }
                else 
                {
                    L.DomUtil.removeClass(item, itemCls + '-disabled');
                    this._map.fire('contextmenu.enableitem',
                    {
                        contextmenu: this,
                        el: item
                    });
                }
            }
        }

        isVisible()
        {
            return this._visible;
        }

        _createContainer(map)
        {
            const container = L.DomUtil.create('div', LeafletContextMenu.BASE_CLS, map._container);
            container.style.zIndex = 10000;
            container.style.position = 'absolute';
            container.style.display = 'none';
            container.addEventListener('click', L.DomEvent.stop);
            container.addEventListener('contextmenu', L.DomEvent.stop);
            return container;
        }

        _createItems()
        {
            const items = this._map.options.contextmenuItems || [];
            items.forEach(item =>
            {
                this._items.push(this._createItem(this._container, item));
            });
        }

        _createItem(container, options, index)
        {
            if (Array.isArray(options.submenu))
            {
                return this._createSubmenu(container, options, index);
            }

            if (options.separator)
            {
                return this._createSeparator(container, index);
            }

            const el = this._insertElementAt('a', `${LeafletContextMenu.BASE_CLS}-item`, container, index);
            el.innerHTML = `${options.icon ? `<img src="${options.icon}" class='${LeafletContextMenu.BASE_CLS}-icon'/>` : ''}${options.text}`;
            el.href = '#';

            const callback = this._createEventHandler(el, options.callback, options.context);
            el.addEventListener('click', callback);

            return {
                id: L.Util.stamp(el),
                el,
                callback
            };
        }

        _createSubmenu(container, options, index)
        {
            //const wrapper = this._insertElementAt('div', `${LeafletContextMenu.BASE_CLS}-item`, container, index);
            const wrapper = this._insertElementAt('div', `${LeafletContextMenu.BASE_CLS}-item has-submenu`, container, index);
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

        _getIcon(options)
        {
            return L.Browser.retina && options.retinaIcon || options.icon;
        }

        _getIconCls(options)
        {
            return L.Browser.retina && options.retinaIconCls || options.iconCls;
        }

        _createSeparator(container, index)
        {
            const el = this._insertElementAt('div', `${LeafletContextMenu.BASE_CLS}-separator`, container, index);
            return { id: L.Util.stamp(el), el };
        }

        _insertElementAt(tag, className, container, index)
        {
            const el = document.createElement(tag);
            el.className = className;
            const refEl = container.children[index];
            if (refEl) container.insertBefore(el, refEl);
            else container.appendChild(el);
            return el;
        }

        _getElementSize (el)
        {
            var size = this._size,
                initialDisplay = el.style.display;

            if (!size || this._sizeChanged)
            {
                size = {};

                el.style.left = '-999999px';
                el.style.right = 'auto';
                el.style.display = 'block';

                size.x = el.offsetWidth;
                size.y = el.offsetHeight;

                el.style.left = 'auto';
                el.style.display = initialDisplay;

                this._sizeChanged = false;
            }

            return size;
        }

        _createEventHandler(el, callback, context)
        {
            return (e) =>
            {
                e.preventDefault();
                if (callback) callback.call(context || this._map, e);
                this._hide();
            };
        }

        _show(e)
        {
            this._showAtPoint(e.containerPoint, e);
        }

        _showAtPoint(point, data)
        {
            this._showLocation = { containerPoint: point, relatedTarget: data.relatedTarget };
            this._setPosition(point);
            this._container.style.display = 'block';
            this._visible = true;
        }

        _hide()
        {
            if (this._container)
            {
                this._container.style.display = 'none';
                this._visible = false;
            }        
        }

        _setPosition(point)
        {
            const mapSize = this._map.getSize();
            const containerSize = this._container.getBoundingClientRect();

            this._container.style.left = `${Math.min(point.x, mapSize.x - containerSize.width)}px`;
            this._container.style.top = `${Math.min(point.y, mapSize.y - containerSize.height)}px`;
        }

        _onKeyDown(e)
        {
            if (e.key === 'Escape') this._hide();
        }

        _onItemMouseOver(e)
        {
            L.DomUtil.addClass(e.target || e.srcElement, 'over');
        }

        _onItemMouseOut(e)
        {
            L.DomUtil.removeClass(e.target || e.srcElement, 'over');
        }

        bindContextMenuToLayer(layer, items, { inherit = true } = {})
        {
            layer.on('contextmenu', (e) =>
            {
                const map = layer._map;
                if (!map.contextmenu) return;

                if (!inherit) map.contextmenu.hideAllItems();

                const inserted = items.map(opt => map.contextmenu.insertItem(opt));
                map.once('contextmenu.hide', () =>
                {
                    inserted.forEach(el => map.contextmenu.removeItem(el));
                    if (!inherit) map.contextmenu.showAllItems();
                });

                const point = map.mouseEventToContainerPoint(e.originalEvent);
                map.contextmenu.showAt(point, { relatedTarget: layer });
            });
        }

        unbindContextMenu()
        {
            layer.off('contextmenu');
        }
    };

    window.LeafletContextMenu = LeafletContextMenu;

    return LeafletContextMenu$1;

}));
//# sourceMappingURL=leaflet.contextmenu.umd.js.map
