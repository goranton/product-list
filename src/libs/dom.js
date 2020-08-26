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