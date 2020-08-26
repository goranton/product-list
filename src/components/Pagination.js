import { Component } from '@/libs/core';
import '@/components/Pagination.scss';

export class Pagination extends Component {
    constructor({
        app,
        cb,
    }) {
        super({app});
        this.cb = cb;
        this.step = 3;
        this.last = 1;
    }

    paginationItem(h, value) {
        return h('li', {
            class: `pagination__item ${+value === this.props.paginate.current_page ? 'active' : ''}`,
        }, {
            click: () => this.cb(value),
        }, [value.toString()]);
    }

    async template(h) {
        if (this.props) {
            const { current_page: current } = this.props.paginate;
            const total = this.props.pageCount();


            let start = current - this.step;
            let finish = current + this.step + 1;

            if (start <= 0) {
                start = 1;
            }

            if (finish >= total) {
                finish = total;
            }

            const items =  Array.from({length: finish - start + 1}).map((_, index) => {
                return start + index;
            }).map(value => this.paginationItem(h, value));

            return [
                h('ul', {class: 'pagination'}, null, items),
            ];
        }

        return [];
    }
}
