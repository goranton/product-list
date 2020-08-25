export function getQueryParamsFromUrl(url) {
    const [_, query = null] = url.split('?');
    return query;
}

export function queryParamsToMap(queryParams) {
    if (typeof queryParams !== 'string') {
        return {};
    }

    return queryParams.match(/(\w+=\w+)/gm).reduce((acc, group) => {
        const [key, value] = group.split('=');
        
        acc[key] = value;

        return acc;
    }, {});
}
