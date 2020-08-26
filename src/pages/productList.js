import {debounce} from 'debounce';

import { virtualSelect } from '@/libs/dom';
import { Component } from '@/libs/core';
import { menuVirtualNode as menu } from '@/libs/dom';
import productService from '@/services/product.service';

class ProductList extends Component {
    constructor() {
        super({
            app: '#root',
            components: {
                'product-list': () => import('@/components/ProductList'),
                'pagination': () => import('@/components/Pagination'),
            },
            mounted() {this.getProducts()},
        });

        this.productOptions = this.router.queries;
        this.products = {
            items: [],
            view: this.router.queries.view || 'list',
        };
        this.pagination = {
            props: {
                app: '#pagination',
                cb: (v) => {
                    this.changePage(+v);
                    this.getProducts();
                },
            }
        };
    }

    /**
     * Send request to server for fetch products
     */
    async getProducts() {
        try {
            const { search, sort: sort_direction, sort_field, page} = this.productOptions;
            const {data, ...pagination} = await productService.list({
                search, 
                sort_direction, 
                sort_field,
                page,
            });

            this.pagination.props = pagination;
            this.products.items = data;
        } catch (e) {
            if (e.response && e.response.status === 404) {
                this.products.items = [];
            }
        }
    }

    changePage(page) {
        this.productOptions.page = page;
        this.router.updateQuery('page', page);
    }

    /**
     * Update view mode
     * @param {Event} e change event instance
     */
    changeViewMode(e) {
        this.products.view = e.target.value;
        this.router.updateQuery('view', e.target.value);
    }

    /**
     * Filter products by query string
     * @param {Event} e input event instance
     */
    searchProducts(e) {
        this.productOptions.search = e.target.value;
        this.router.updateQuery('search', e.target.value);
        this.changePage(1);
        this.getProducts();
    }

    /**
     * Sort products
     * @param {String} value sort type
     * @param {Boolean} byField sort by field
     */
    sortProducts(value, byField = false) {
        const fieldName = (!byField) ? 'sort' : 'sort_field';
        this.productOptions[fieldName] = value;
        this.router.updateQuery(fieldName, value);
        this.getProducts();
    }

    async template(h) {
        const sortDirectionNode = virtualSelect(h, this.productOptions.sort, debounce((e) => this.sortProducts(e.target.value, false), 500), [
            { value: 'asc', title: 'По возрастанию' },
            { value: 'desc', title: 'По убыванию' },
        ]);
        const sortFieldNode = virtualSelect(h, this.productOptions.sort_field, debounce((e) => this.sortProducts(e.target.value, true), 500), [
            { value: 'name', title: 'имя' },
            { value: 'price', title: 'цена' },
        ]);
        const changeViewNode = virtualSelect(h, this.products.view, debounce(this.changeViewMode.bind(this), 500), [
            { value: 'list', title: 'список' },
            { value: 'table', title: 'таблица' },
            { value: 'grid', title: 'сетка' },
        ]);

        return [
            h('h1', null, null, ['Список продуктов']),
            menu(h, this.router),
            h('input', {
                value: this.productOptions.search || ''
            }, {
                input: debounce(this.searchProducts.bind(this), 500),
            }, []),
            sortDirectionNode,
            sortFieldNode,
            changeViewNode,
            h('div', {id: 'pagination'}, null, [
                h('pagination', {
                    props: this.pagination,
                })
            ]),
            h('div', {id: 'products-list'}, null, [
                h('product-list', {
                    props: this.products
                }, null, [])
            ]),
        ];
    }
}


export default function () {
    const component = new ProductList();
    component.create();
    return component;
}