/* eslint-disable import/no-extraneous-dependencies */

const path = require('path')
const webpack = require('webpack')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin')

const babelOpts = {
  test: /\.js?$/,
  exclude: /node_modules/,
  use: [
    'babel-loader',
  ],
}

const cssOpts = {
  test: /\.css$/,
  use : [
    MiniCssExtractPlugin.loader,
    'css-loader',
  ]
}

const svgOpts = {
  test: /\.svg$/,
  exclude: /node_modules/,
  use: [
    'raw-loader',
  ],
}

const pluginList = [
  new MiniCssExtractPlugin({
    filename: "[name].css",
    chunkFilename: "[id].css"
  }),
  new HtmlWebpackPlugin({
    template: 'src/index.ejs',
    inject: false,
    title: 'title',
    appMountId: '',
    devServer: '',
  }),
  // new CompressionPlugin,
]

const stats = {
  chunks: false,
  modules: false,
  children: false,
  colors: true,
}

module.exports = {
  entry: './src/index',
  resolve: {
    extensions: ['.js'],
    alias:
    {
      'three-examples': path.join(__dirname, './node_modules/three/examples/jsm'),
      'react': 'preact/compat',
      'react-dom': 'preact/compat',
    },
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'public'),
  },
  mode: 'development',
  module: {
    rules: [
      babelOpts,
      cssOpts,
      svgOpts,
    ],
  },
  plugins: pluginList,
  devServer: {
    contentBase: path.resolve(__dirname, 'public'),
    publicPath: '/',
    stats,
    historyApiFallback: true,
  },
  // devtool: "source-map",
  stats,
}
