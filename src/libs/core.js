import { VNode } from '@/libs/dom';

export class Component {
    constructor ({
        app,
        data = {},
        components = {},
    } = data) {
        this.app = document.querySelector(app);
        this.data = data;

        this.components = components;
        this.loadedComponents = {};
        this.vNodes = [];

        this.childs = [];

        if (this.app) {
            this.flush();
        }
    }

    /**
     * Generate virtual node tree and render component
     */
    async create() {
        this.vNodes = await this.generateVNodeTree();
        await this.render();
        // render queue
        this.childs.forEach(async (child) => await child());
    }

    destroy() {
        delete this;
    }

    /**
     * Return virtual nodes
     */
    async template() {
        throw new Error('must be implement.');
    }

    /**
     * Generate virtual node tree by template
     */
    async generateVNodeTree() {
        if (typeof this.template === 'object') {
            return this.template;
        }

        return await this.template.call(this, this.h.bind(this));
    }

    /**
     * Load component and bind reactive props
     * @param {String} name component name
     * @param {Object} props list of component properties
     */
    async loadComponent(name, props = {}) {
        if (!this.components.hasOwnProperty(name)) return;
        
        if (this.loadedComponents.hasOwnProperty(name)) {
            return this.loadedComponents[name];
        }

        const component = await this.components[name]();
        const componentClass = component[Object.keys(component)[0]];

        const loaded = this.loadedComponents[name] = new componentClass(props);
        this.bindComponentAndProps(props, loaded);

        loaded.create();

        return loaded;
    }

    /**
     * Make component reactive properties
     * @param {Object} props list of properties
     * @param {Object} component component instance 
     */
    bindComponentAndProps(props, component) {
        Object.keys(props).forEach(key => {
            Object.defineProperty(props, key, {
                get: () => component[key],
                set: (value) => {
                    component[key] = value;
                    component.update();
                    return true;
                } 
            });
        });
    }

    /**
     * Create virtual node.
     * @param {String} tag name of tag
     * @param {Object} attributes list of element attributes
     * @param {Object} events list of element events
     * @param {Array} child List of element childs 
     */
    async h(tag, attributes, events, child) {
        const componentKeys = Object.keys(this.components);

        if (componentKeys.includes(tag)) {
            this.childs.push(async () => await this.loadComponent(tag, attributes && attributes.props));
        }

        return new VNode(this.app, {tag, attributes, events, child});
    }

    /**
     * Remove parent childrens.
     */
    flush() {
        while (this.app.firstChild) {
            this.app.removeChild(this.app.lastChild);
        }
        this.app.innerHtml = '';
    }

    /**
     * Remove parent childrens and rerender
     */
    update() {
        this.flush();
        this.create();
    }

    /**
     * Generate dom tree by virtual nodes
     * @param {Node} parent Parent dom element
     * @param {Array} nodes Virtual nodes
     */
    async render(parent, nodes = this.vNodes) {
        nodes.forEach(async (vNode) => {
            let element;
            vNode = await vNode;
            
            if (!parent) {
                parent = vNode.parentDom;
            }

            if (typeof vNode === 'string') {
                element = document.createTextNode(vNode);
            } else {
                element = vNode.visializate();

                if (vNode.child.child) {
                    this.render(element, vNode.child.child);
                }
            }

            parent.appendChild(element);
        });
    }
}
