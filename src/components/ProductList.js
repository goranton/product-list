import { Component } from '../libs/core';

export class ProductList extends Component {
    constructor({
        search = '',
        sort = 'asc',
        sort_field = 'name',
        view = 'list',
        items = [],
    } = {}) {
        super({
            app: '#products-list',
            components: {
                'product-item-list': async () => import('@/components/ProductItem'),
            },
        });

        this.search = search;
        this.sort = sort;
        this.sort_field = sort_field;

        this.items = items; 
        this.view = view;
    }

    /**
     * Render virtual node visualization of product list
     * @param {String} search Search query string
     * @param {Function} h render virtual node 
     * @param {*} sort_direction Sort direction type
     * @param {*} sort_field Sort field name
     */
    async renderItems (h) {
        return this.items.map((product, key) => {
            const parent = `product-item_${key}`;

            let tag = 'div';

            switch(this.view) {
                case 'list':
                    tag = 'li';
                    break;
                case 'table':
                    tag = 'tr';
                    break;
            }

            return h(tag, {id: parent}, null, [
                h('product-item-list', {
                    props: { key, product, mode: this.view }
                })
            ]);
        });
    }

    async template(h) {
        const items = await this.renderItems(h);

        if (!items.length) {
            return [h('h1', null, null, ['Ничего не найдено.'])]
        }

        switch (this.view) {
            case 'list':
                return [
                    h('ul', null, null, items),
                ];
            case 'table':
                return [
                    h('table', null, null, [
                        h('tr', null, null, [
                            h('th', null, null, ['Название']),
                            h('th', null, null, ['Изображение']),
                            h('th', null, null, ['Цена']),
                        ]),
                        ...items,
                    ])
                ];
        }

        return [h('div', null, null, items)];
    }
}