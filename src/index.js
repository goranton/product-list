import { Router } from '@/libs/router';
import { Component } from '@/libs/core';


import homePage from '@/pages/home';
import productList from '@/pages/productList';

const router = new Router('history');

router.push('/', homePage);
router.push('/products', productList);

Component.prototype.router = router;

router.init();
