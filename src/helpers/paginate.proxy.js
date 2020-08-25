import { getQueryParamsFromUrl, queryParamsToMap } from '../helpers/url.helpers';

export default (cls, methods = []) => new Proxy(new cls(), {
    /**
     * 
     * @param {Function} handler class method
     * @param {Object} target target class
     * @param {String} query list of query params as string 
     */
    async callAndPaginate(handler, target, query, args) {
        const [data, paginate] = await handler.apply(
            target,
            query ? [
                queryParamsToMap(
                    getQueryParamsFromUrl(query)
                )
            ] : args || []
        );
        return this.generateResult(data, paginate, handler, target);
    },
    /**
     * 
     * @param {*} data chunk of data from server
     * @param {Object} paginate paginate object from server
     * @param {Function} handler class method
     * @param {Object} target target instance
     */
    generateResult(data, paginate, handler, target) {
        return {
            paginate,
            data,
            pageCount() {
                if (paginate.next_page_url === false || paginate.total_count <= data.length) {
                    return paginate.current_page;
                }

                return Math.ceil(paginate.total_count / data.length);
            },
            next: async () => {
                if (paginate.next_page_url) {
                    return await this.callAndPaginate(handler, target, paginate.next_page_url);
                }
            },
            prev: async () => {
                if (paginate.previous_page_url) {
                    return await this.callAndPaginate(handler, target, paginate.previous_page_url);
                }
            }
        };
    },
    /**
     * 
     * @param {*} target 
     * @param {*} handler 
     */
    get(target, handler) {
        if (!(handler in target)) {
            return null;
        }

        const targetHandler = target[handler];

        if (typeof targetHandler === 'function') {
            return async (...args) => {
                if (!methods.includes(handler)) {
                    return targetHandler.apply(target, args);
                }

                return this.callAndPaginate(targetHandler, target, undefined, args);
            };
        }

        return targetHandler;
    }
});
