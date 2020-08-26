const vault = localStorage;

class LocalVault {
    setItem(key, value) {
        if (typeof value !== 'string') {
            value = JSON.stringify(value);
        }

        localStorage.setItem(key, value);
    }

    getItem(key, decode = true) {
        const value = localStorage.getItem(key);
        return decode ? JSON.parse(value) : value;
    }

    clear() {
        localStorage.clear();
    }
}

export default new LocalVault();