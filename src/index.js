import { Router } from '@/libs/router';
import { Component } from '@/libs/core';
import vault from '@/libs/vault';


import homePage from '@/pages/home';
import productList from '@/pages/productList';

const router = new Router('history');

router.push('/', homePage);
router.push('/products', productList);
router.push(/products\/[0-9]$/gi, () => {
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
});

Component.prototype.vault = vault;
Component.prototype.router = router;

router.init();
