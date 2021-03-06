let lastNodeIndex = 0;

export class VNode {
    constructor(
        parentDom,
        child,
        parentKey
    ) {
        this.parentDom = parentDom;
        this.child = child;
        this.key = lastNodeIndex;
        this.parentKey = parentKey;

        lastNodeIndex++;
    }

    /**
     * Build new dom node by virtual
     */
    visializate() {
        let element;

        element = document.createElement(this.child.tag);

        if (this.child.attributes) {
            const attributes = this.child.attributes;
            Object.keys(attributes).forEach(key => {
                element.setAttribute(key, attributes[key]);
            });
        }

        if (this.child.events) {
            const events = this.child.events;
            Object.keys(events).forEach(key => {
                element.addEventListener(key, events[key]);
            });
        }

        return element;
    }
}


export function virtualSelect(h, defaultValue, clb, options) {
    return h('select', null, {
        change: clb,
    }, options.map(({value, title}) => {
        return h('option', { 
            value,
            ...(defaultValue === value ? {selected: true} : {})
        }, null, [title]);
    }))
}


export function menuVirtualNode(h, router) {
    return h('ul', {class: 'menu'}, null, [
        h('li', null, {
            click: () => router.goto('/'),
        }, ['Главная']),
        h('li', null, {
            click: () => router.goto('/products'),
        }, ['Продукты'])
    ]);
}
