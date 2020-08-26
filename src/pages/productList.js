import {debounce} from 'debounce';

import { virtualSelect } from '@/libs/dom';
import { Component } from '@/libs/core';
import { menuVirtualNode as menu } from '@/libs/dom';
import productService from '@/services/product.service';

const paginationComponentData = {
    app: '#pagination',
    cb(v) {
        if (this.productOptions.page === +v || this.loading) {
            return
        }
        this.changePage(+v);
        this.getProducts();
    },
    props: {  
        pageCount() { return 0; },
        paginate: {},
    }
}

const productListComponentData = {
    app: '#products-list',
    error: null,
    props: {
        items: [],
        view: 'list',
    }
}

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

        this.loading = false;

        this.productOptions = this.router.queries;

        this.products = {
            ...productListComponentData,
            props: {
                ...productListComponentData.props,
                view: this.router.queries.view || 'list'
            }
        };

        this.pagination = this.freshPagination();
    }

    freshPagination() {
        return {
            ...paginationComponentData,
            cb: paginationComponentData.cb.bind(this)
        }
    }

    /**
     * Send request to server for fetch products
     */
    async getProducts() {
        this.loading = true;
        try {
            const { search, sort: sort_direction, sort_field, page} = this.productOptions;
            const {data: items , ...pagination} = await productService.list({
                search, 
                sort_direction, 
                sort_field,
                page,
            });

            this.pagination.props = pagination;
            this.products.props = {
                ...this.products.props,
                items,
            };
        } catch (e) {
            if (e.response && e.response.status === 404) {
                this.products.error = e.response.data;
                this.pagination.props = this.freshPagination().props;
            }
        } finally {
            this.loading = false;
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
        this.products.props = {
            ...this.products.props,
            view: e.target.value,
        };
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
        const changeViewNode = virtualSelect(h, this.products.props.view, debounce(this.changeViewMode.bind(this), 500), [
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