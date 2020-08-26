import {queryParamsToMap} from '@/helpers/url.helpers';

export class Router { 
    constructor(mode) {
        this.routes = [];
        this.mode = mode;
        this.root = '/';
        this.queries = {};

        const queries = window.location.search;

        if (queries) {
            this.queries = queryParamsToMap(queries);
        }

    }

    /**
     * Normalize route sigment
     * @param {String} path Sigment of route
     */
    normalizePath(path) {
        return path.replace(/^\//gi, '').toLocaleLowerCase();
    }

    /**
     * Find and return route node
     * @param {String} path Sigment of route
     */
    findRoute(path) {
        return this.routes.find(route => route.path === this.normalizePath(path))
    }
    
    /**
     * Push new route to routes stack
     * @param {String} path Sigment of route
     * @param {String} cb Callback when initalize
     */
    push(path, cb) {
        this.routes.push({path: this.normalizePath(path), cb});
        return this;
    }

    /**
     * Find and return route node by location params
     */
    current() {
        return this.findRoute(this.mode === 'history' ? window.location.pathname : window.location.hash);
    }

    /**
     * Build new query string and push it to state.
     * @param {String} key param key
     * @param {String} value param value
     */
    updateQuery(key, value) {
        this.queries[key] = value;

        const queryToString = Object.keys(this.queries).map((key) => {
            return `${key}=${this.queries[key]}`;
        }).join('&');

        window.history.pushState(null, null, `${this.current().path}?${queryToString}`);
    }

    /**
     * Raise route callback
     * Update hash string or push to state 
     * @param {String} path route sigment
     */
    goto(path) {
        const find = this.findRoute(path);

        if (!this.findRoute) {
            return;
        }

        this.queries = {};

        const sigment = `${this.root}${find.path}`;

        if (this.mode === 'history') {
            window.history.pushState(null, null, sigment);
        } else {
            window.location.hash = `#${this.root}${sigment}`;
        }

        this.init();
    }

    init() {
        this.current().cb.apply({});
    }
};

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

        if (this.app) {
            this.flush();
        }
    }

    /**
     * Generate virtual node tree and render component
     */
    create() {
        this.generateVNodeTree().then((vNodes) => {
            this.vNodes = vNodes;
            this.render();
        });
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
            const component = await this.loadComponent(tag, attributes && attributes.props);
            return (await component.generateVNodeTree())[0]; // return only parent node
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
    render(parent, nodes = this.vNodes) {
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
