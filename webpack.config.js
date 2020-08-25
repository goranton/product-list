const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const ROOT_DIR = path.resolve(__dirname);
const SRC_DIR = path.resolve(ROOT_DIR, 'src');
const OUTPUT_DIR = path.resolve(ROOT_DIR, 'output');

module.exports = {
    mode: process.env.node_env || 'production',
    entry: {
        main: path.resolve(SRC_DIR, 'index.js')
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader'
            },
        ]
    },
    output: {
        filename: '[name].bundle.js',
        path: OUTPUT_DIR,
    },
    resolve: {
        extensions: [".js"],
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            hash: true,
            title: 'List of products',
            template: path.resolve(ROOT_DIR, 'index.html'),
        })
    ],
    devServer: {
        historyApiFallback: true
    }
};
