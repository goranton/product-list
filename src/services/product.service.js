import api from '../libs/api';
import paginateProxy from '../helpers/paginate.proxy';

const sortFields = ['name', 'price'];
const sortDirections = ['asc', 'desc'];

class ProductService {
    validateParams(params = {}) {
        return Object.keys(params).reduce((acc = {}, key) => {
            let value = params[key];

            if (!value) return;

            switch (key) {
                case 'sort_field': 
                    if (!sortFields.includes(value)) {
                        console.warn('Pass sort value not be allowed');
                        value = sortFields[0];
                    }
                    break;
                case 'sort_direction':
                    if (!sortDirections.includes(value)) {
                        console.warn('Pass sort direction is not allowed.');
                        value = sortDirections[0];
                    }
                    break;
                case 'page':
                    if (!Number.isInteger(value)) {
                        console.warn('Page must be a number.');
                        value = +value;
                    }
                    break;
            }

            acc[key] = value;

            return acc;
        }, {});
    }

    async list({
        search = '',
        sort_field = sortFields[0],
        sort_direction = sortDirections[0],
        page = 1
    } = {}) {
        const { data: { products, ...paginate } } = await api.get('js-test-task/', {
            params: this.validateParams({search, sort_field, sort_direction, page}),
        });

        return [products, paginate];
    }
}

export default paginateProxy(ProductService, ['list']);
