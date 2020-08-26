import { Component } from '@/libs/core';

export default {
    path: /products\/[0-9]$/gi,
    cb: function () {
        const component = new Component({
            app: '#root',
        });
    
        component.template = (async function (h) {
            const selectProduct = this.vault.getItem('selectProduct');
    
            return [
                h('a', null, {
                    click: () => this.router.goto('/products')
                }, ['Продукты']),
                h('h1', null, null, [selectProduct.name]),
                h('div', null, null, [selectProduct.price.toString()]),
                h('img', {src: selectProduct.image, style: 'width: 300px'}, null, []),
            ];
        }).bind(component);
    
        component.create();
    
        return component;
    },
}
