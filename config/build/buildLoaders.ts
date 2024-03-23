import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { ModuleOptions } from 'webpack';
import { BuildOptions } from './types/types';
import ReactRefreshTypeScript from 'react-refresh-typescript';
import { buildBabelLoader } from './babel/buildBabelLoader';

export function buildLoaders(options: BuildOptions): ModuleOptions['rules'] {
    const isDev = options.mode === 'development';

    const cssLoaderWithModules = {
        loader: 'css-loader',
        options: {
            modules: {
                localIdentName: isDev ? '[path][name]__[local]' : '[hash:base64:8]',
            },
        },
    };

    const assetLoader = {
        test: /\.(png|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
    };

    const svgrLoader = {
        test: /\.svg$/i,
        use: [
            {
                loader: '@svgr/webpack',
                options: {
                    icon: true,
                    svgoConfig: {
                        plugins: [
                            {
                                name: 'convertColors',
                                params: {
                                    currentColor: true,
                                },
                            },
                        ],
                    },
                },
            },
        ],
    };

    const scssLoader = {
        // Порядок имеет значение
        test: /\.s[ac]ss$/i,
        use: [
            // Creates 'style' nodes from JS strings
            isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
            // Translates CSS into CommonJS
            cssLoaderWithModules,
            // Compiles Sass/Scss to CSS
            'sass-loader',
        ],
    };

    const tsLoader = {
        // ts-loader умеет работать с JSX
        // если бы мы не использовали ts: нужен был бы babel-loader
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
            {
                loader: 'ts-loader',
                options: {
                    transpileOnly: true,
                    getCustomTransformers: () => ({
                        before: [isDev && ReactRefreshTypeScript()].filter(Boolean),
                    }),
                },
            },
        ],
    };

    const babelLoader = buildBabelLoader(options);

    return [
        assetLoader,
        scssLoader,
        // tsLoader,
        babelLoader,
        svgrLoader,
    ];
}
