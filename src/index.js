import { Router } from '@/libs/router';
import { Component } from '@/libs/core';

import vault from '@/libs/vault';

const router = new Router('history');

const requirePage = require.context('@/pages', false, /\.js$/);

requirePage.keys().forEach(path => {
    // dynamic require pages
    const loadedPage = requirePage(path).default;

    let props = loadedPage; 

    if (!loadedPage.hasOwnProperty('path')) {
        props = {
            path: path.slice(0, -3).slice(1),
            cb: loadedPage,
        }
    }

    router.push(props.path, props.cb);
});

Component.prototype.vault = vault;
Component.prototype.router = router;

router.init();
