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

    return component;
});

/**
 * PRODUCTS LIST PAGE
 */
router.push('/products', () => {
    const component = new Component({
        app: '#root',
        components: {
            'product-list': () => import(/* webpackChunkName: "product-list" */ '@/components/ProductList')
        },
    });

    const {
        search = '',
        sort = 'asc',
        sort_field = 'name',
    } = router.queries;

    component.productOptions = {
        search,
        sort,
        sort_field,
    };

    /**
     * Filter products list
     * @param {Event} e input event
     */
    component.searchProducts = (function (e) {
        this.productOptions.search = e.target.value;
        router.updateQuery('search', e.target.value);
    }).bind(component);

    /**
     * Sort products list
     * @param {String} value sort mode
     * @param {Boolean} byField sort by field
     */
    component.sortProducts = (function (value, byField = false) {
        const fieldName = (!byField) ? 'sort' : 'sort_field';
        this.productOptions[fieldName] = value;
        router.updateQuery(fieldName, value);
    }).bind(component);

    component.template = (function (h) {
        return [
            h('h1', null, null, ['Список продуктов']),
            menu(h),
            h('input', {
                value: this.productOptions.search || ''
            }, {
                input: debounce(this.searchProducts, 500),
            }, []),
            h('select', null, {
                change: debounce((e) => this.sortProducts(e.target.value, false), 500),
            }, [
                h('option', {
                    value: 'asc',
                    ...(this.productOptions.sort === 'asc' ? {selected: true} : {})
                }, null, ['По возрастанию']),
                h('option', {
                    value: 'desc',
                    ...(this.productOptions.sort === 'desc' ? {selected: true} : {})
                }, null, ['По убыванию']),
            ]),
            h('select', null, {
                change: debounce((e) => this.sortProducts(e.target.value, true), 500),
            }, [
                h('option', {
                    value: 'name',
                    ...(this.productOptions.sort_field === 'name' ? {selected: true} : {})
                }, null, ['имя']),
                h('option', {
                    value: 'price',
                    ...(this.productOptions.sort_field === 'price' ? {selected: true} : {})
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

    return component;
});

router.init();