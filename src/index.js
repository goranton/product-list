import { debounce } from 'debounce';
import { Router, Component } from '@/libs/core';

const router = new Router('history');

/**
 * Render menu as virtual node
 * @param {Function} h virtual node create function
 */
const menu = (h) => {
    return h('ul', {class: 'menu'}, null, [
        h('li', null, {
            click: () => router.goto('/'),
        }, ['Главная']),
        h('li', null, {
            click: () => router.goto('/products'),
        }, ['Продукты'])
    ]);
}

/**
 * MAIN PAGE
 */
router.push('/', () => {
    const component = new Component({
        app: '#root',
        data: {
            test: 123,
        },
        async template(h) {
            return [
                h('h1', null, null, ['Добро пожаловать']),
                menu(h),
            ];
        },
        created() {
            this.render();
        }
    });
});

/**
 * PRODUCTS LIST PAGE
 */
router.push('/products', () => {
    const components = {
        'product-list': async () => (await import('@/components/ProductList')).ProductList,
    };

    // Use for filter products
    const queries = router.queries;
    const sort_field = queries.sort_field;
    const sort = queries.sort;
    const search = queries.search;

    new Component({
        app: '#root',
        data: {
            /**
             * Update product list search field and rerender component
             * @param {Event} e html input event
             */
            searchProducts(e) {
                if (this.loaded['product-list']) {
                    const productList = this.loaded['product-list'];
                    const value = e.target.value;

                    router.updateQuery('search', value);

                    productList.search = value;
                    productList.update();
                }
            },
            /**
             * Update product list sort field and rerender component
             * @param {Event} e html input event
             */
            sortProducts(value, byField = false) {
                if (this.loaded['product-list']) {
                    const productList = this.loaded['product-list'];
                    const fieldName = (!byField) ? 'sort' : 'sort_field';

                    router.updateQuery(fieldName, value);

                    productList[fieldName] = value;
                    productList.update();
                }
            },
            /**
             * Includes child components
             * @param {Event} e html input event
             */
            async components() {
                return {
                    'product-list': new (await components['product-list']())({
                        sort_field,
                        sort,
                        search,
                    }),
                }
            },
            loaded: {}
        },
        /**
         * Return template as virtual dom node
         * @param {Function} h function for transform to virtual dom node
         */
        async template(h) {
            return [
                h('h1', null, null, ['Список продуктов']),
                menu(h),
                h('input', {
                    value: search || ''
                }, {
                    input: debounce(this.data.searchProducts.bind(this.data), 500),
                }, []),
                h('select', null, {
                    change: debounce((e) => this.data.sortProducts(e.target.value, false), 500),
                }, [
                    h('option', {
                        value: 'asc',
                        ...(sort === 'asc' ? {selected: true} : {})
                    }, null, ['По возрастанию']),
                    h('option', {
                        value: 'desc',
                        ...(sort === 'desc' ? {selected: true} : {})
                    }, null, ['По убыванию']),
                ]),
                h('select', null, {
                    change: debounce((e) => this.data.sortProducts(e.target.value, true), 500),
                }, [
                    h('option', {
                        value: 'name',
                        ...(sort_field === 'name' ? {selected: true} : {})
                    }, null, ['имя']),
                    h('option', {
                        value: 'price',
                        ...(sort_field === 'price' ? {selected: true} : {})
                    }, null, ['цена']),
                ]),
                h('div', {id: 'products-list'}, null, []),
            ];
        },
        async created() {
            await this.render();

            const components = await this.data.components();
            Object.keys(components).forEach(key => {
                this.data.loaded[key] = components[key].component();
            });
        }
    });
});

router.init();