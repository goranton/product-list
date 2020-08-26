import { Component } from '@/libs/core';
import { menuVirtualNode as menu } from '@/libs/dom';

export default function (router) {
    const component = new Component({ app: '#root' });

    component.template = async (h) => {
        return [
            h('h1', null, null, ['Добро пожаловать']),
            menu(h, router),
        ];
    }

    component.create();

    return component;
}