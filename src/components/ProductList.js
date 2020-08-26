import productService from '@/services/product.service';
import { Component } from '../libs/core';

export class ProductList extends Component {
    constructor({
        search = '',
        sort = 'asc',
        sort_field = 'name',
    } = {}) {
        super({
            app: '#products-list',
        });

        this.search = search;
        this.sort = sort;
        this.sort_field = sort_field;
    }

    /**
     * Render virtal dom visualization of product
     * @param {Function} h render virtual node
     * @param {String} mode vision mode
     * @param {Object} product Product instance 
     */
    productItem(h, mode, {name, image, price, index: id}) {
        // todo: Make more view presentations
        switch (mode) {
            default:
                return h('li', {class: 'product-list__item'}, null, [
                    h('h2', null, {
                        click: () => {
                            
                        }
                    }, [name]),
                    h('img', {src: image, style: 'width: 200px;'}, null, []),
                    h('p', null, null, [price.toString()]),
                ]);
        }
    };

    /**
     * Render virtual node visualization of product list
     * @param {String} search Search query string
     * @param {Function} h render virtual node 
     * @param {*} sort_direction Sort direction type
     * @param {*} sort_field Sort field name
     */
    async renderItems (search, h, sort_direction, sort_field) {
        try {
            const {data, ...paginate} = await productService.list({search, sort_direction, sort_field});
            return data.map((product, index) => this.productItem(h, 'list', {index, ...product}));
        } catch (e) {
            if (e.response.status === 404) {
                return [h('h1', null, null, ['ничего не найдено'])];
            }

            alert('Что-то пошло не так. Пожалуйста попробуйте позже.')
        }
    }

    async template(h) {
        return [h('ul', null, null, await this.renderItems(this.search, h, this.sort, this.sort_field))];
    }
}