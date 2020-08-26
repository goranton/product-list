import { debounce } from 'debounce';
import { Component } from '@/libs/core';
import { Router } from '@/libs/router';
import { virtualSelect } from '@/libs/dom';
import productService from '@/services/product.service';


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
    const {
        search = '',
        sort = 'asc',
        sort_field = 'name',
        view,
    } = router.queries;
    
    const component = new Component({
        app: '#root',
        components: {
            'product-list': () => import(/* webpackChunkName: "product-list" */ '@/components/ProductList')
        },
        mounted() {
            this.freshProducts();
        }
    });

    component.productOptions = {
        search,
        sort,
        sort_field,
    };

    component.products = {
        items: [],
        view,
    }

    component.freshProducts = (async function () {
        try {
            const { search, sort: sort_direction, sort_field} = this.productOptions;
            const {data, ...paginate} = await productService.list({
                search, 
                sort_direction, 
                sort_field
            });
            this.products.items = data;
        } catch (e) {
            if (e.response && e.response.status === 404) {
                this.products.items = [];
            }
        }
    }).bind(component);

    component.changeViewMode = (function (e) {
        this.products.view = e.target.value;
        router.updateQuery('view', e.target.value);
    }).bind(component);

    /**
     * Filter products list
     * @param {Event} e input event
     */
    component.searchProducts = (function (e) {
        this.productOptions.search = e.target.value;
        router.updateQuery('search', e.target.value);
        this.freshProducts();
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
        this.freshProducts();
    }).bind(component);

    component.template = (function (h) {
        const sortDirectionNode = virtualSelect(h, this.productOptions.sort, debounce((e) => this.sortProducts(e.target.value, false), 500), [
            { value: 'asc', title: 'По возрастанию' },
            { value: 'desc', title: 'По убыванию' },
        ]);
        const sortFieldNode = virtualSelect(h, this.productOptions.sort_field, debounce((e) => this.sortProducts(e.target.value, true), 500), [
            { value: 'name', title: 'имя' },
            { value: 'price', title: 'цена' },
        ]);
        const changeViewNode = virtualSelect(h, this.products.view, debounce(this.changeViewMode, 500), [
            { value: 'list', title: 'список' },
            { value: 'table', title: 'таблица' },
            { value: 'grid', title: 'сетка' },
        ]);
        

        return [
            h('h1', null, null, ['Список продуктов']),
            menu(h),
            h('input', {
                value: this.productOptions.search || ''
            }, {
                input: debounce(this.searchProducts, 500),
            }, []),
            sortDirectionNode,
            sortFieldNode,
            changeViewNode,
            h('div', {id: 'products-list'}, null, [
                h('product-list', {
                    props: this.products
                }, null, [])
            ]),
        ];
    }).bind(component);


    component.create();

    return component;
});

router.init();