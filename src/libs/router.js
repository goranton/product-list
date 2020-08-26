import {queryParamsToMap} from '@/helpers/url.helpers';

export class Router { 
    constructor(mode) {
        this.routes = [];
        this.mode = mode;
        this.root = '/';
        this.queries = {};
        this.last = null;

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

        this.last.destroy();
        this.init();
    }

    init() {
        this.last = this.current().cb.apply({}, [this]);
    }
};