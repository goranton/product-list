import { Component } from '../libs/core';

import '@/components/ProductList.scss';

export class ProductList extends Component {
    constructor({app}) {
        super({
            app,
            components: {
                'product-item-list': async () => import('@/components/ProductItem'),
            },
        });

        this.vault.clear();
    }

    /**
     * Render virtual node visualization of product list
     * @param {String} search Search query string
     * @param {Function} h render virtual node 
     * @param {*} sort_direction Sort direction type
     * @param {*} sort_field Sort field name
     */
    async renderItems (h) {
        return this.props.items.map((product, key) => {
            const parent = `product-item_${key}`;

            let tag = 'div';

            switch(this.props.view) {
                case 'list':
                    tag = 'li';
                    break;
                case 'table':
                    tag = 'tr';
                    break;
            }

            return h(tag, {id: parent, class: `products__${this.props.view}-item`}, {
                click: (e) => {
                    this.vault.setItem('selectProduct', product);
                    this.router.goto(`/products/${key}`);
                }
            }, [
                h('product-item-list', {
                    props: { key, product, mode: this.props.view }
                })
            ]);
        });
    }

    async template(h) {
        if (this.error) {
            // error
            return [h('h1', null, null, [this.error])];
        }

        if (!this.props) {
            return []; // loading...
        }

        const items = this.props.items;

        if (items) {
            const children = await this.renderItems(h);
            switch (this.props.view) {
                case 'list':
                    return [
                        h('ul', {class: 'products__list'}, null, children),
                    ];
                case 'table':
                    return [
                        h('table', {class: 'products__table'}, null, [
                            h('tr', null, null, [
                                h('th', null, null, ['Название']),
                                h('th', null, null, ['Изображение']),
                                h('th', null, null, ['Цена']),
                            ]),
                            ...children,
                        ])
                    ];
            }
    
            return [h('div', {class: 'products__grid'}, null, children)];
        }
    }
}