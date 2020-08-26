import { Component } from '@/libs/core';

export class Pagination extends Component {
    constructor({
        props: {app, cb}
    }) {
        super({app});
        this.cb = cb;
        this.step = 3;
        this.last = 1;
    }

    paginationItem(h, value) {
        return h('li', null, {
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

            return Array.from({length: finish - start}).map((_, index) => {
                return start + index;
            }).map(value => this.paginationItem(h, value));
        }

        return [];
    }
}
