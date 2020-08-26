import { Component } from '../libs/core';

export class ProductList extends Component {
    constructor({product = {}, mode = 'list', key = ''} = {}) {
        super({
            app: `#product-item_${key}`,
        })

        this.product = product;
        this.mode = mode;
    }

    async template(h) {
        const {name, image, price} = this.product;
        const imageNode = h('img', {
            src: image,
            style: 'width: 200px'
        }, null, []);

        switch(this.mode) {
            case 'list':
                return [
                    h('h1', null, null, [name]),
                    imageNode,
                    h('div', null, null, [price.toString()]),
                ];
            case 'table':
                return [
                    h('td', null, null, [name]),
                    h('td', null, null, [imageNode]),
                    h('td', null, null, [price.toString()]),
                ];
            case 'grid':
                return [
                    h('h1', null, null, [name]),
                    imageNode,
                    h('div', null, null, [price.toString()])
                ]
        }

        return [];
    }
}