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
        }
    });

    component.template = async (h) => {
        return [
            h('h1', null, null, ['Добро пожаловать']),
            menu(h),
        ];
    }

    component.create();
});

/**
 * PRODUCTS LIST PAGE
 */
router.push('/products', () => {
    // Use for filter products
    const queries = router.queries;
    const sort_field = queries.sort_field;
    const sort = queries.sort;
    const search = queries.search;

    const component = new Component({
        app: '#root',
        components: {
            'product-list': () => import(/* webpackChunkName: "product-list" */ '@/components/ProductList')
        },
        /**
         * Update product list sort field and rerender component
         * @param {Event} e html input event
         */
        sortProducts(value, byField = false) {
            // if (this.loaded['product-list']) {
            //     const productList = this.loaded['product-list'];
            //     const fieldName = (!byField) ? 'sort' : 'sort_field';

            //     router.updateQuery(fieldName, value);

            //     productList[fieldName] = value;
            //     productList.update();
            // }
        },
    });

    component.productOptions = {
        search,
        sort,
        sort_field
    };

    component.searchProducts = (function (e) {
        this.productOptions.search = e.target.value;
    }).bind(component);

    component.template = (function (h) {
        return [
            h('h1', null, null, ['Список продуктов']),
            menu(h),
            h('input', {
                value: search || ''
            }, {
                input: debounce(this.searchProducts, 500),
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
            h('div', {id: 'products-list'}, null, [
                h('product-list', {
                    props: this.productOptions
                }, null, [])
            ]),
        ];
    }).bind(component);


    component.create();
});

router.init();