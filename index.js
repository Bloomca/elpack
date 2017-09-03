const webpack = require('webpack');

function adjustEntries(configuration) {
  return adjustEntryWithPolyfill(configuration.entry);
}

function adjustEntryWithHMR(configuration, entry) {
  if (configuration.hmr === true) {
     
  }
}

function adjustEntryWithPolyfill(entry) {
  if (typeof entry === 'string') {
    return [
      'babel-polyfill',
      entry,
    ];
  }

  if (Array.isArray(entry)) {
    const hasPolyfill = entry.includes('babel-polyfill');

    if (hasPolyfill) {
      return entry;
    } else {
      return ['babel-polyfill'].concat(entry);
  }

  if (typeof entry === 'object') {
    return Object.keys(entry).reduce(function adjustEntries(entries, key) {
      entries[key] = adjustEntryWithPolyfill(entry[key]);
      return entries;
    }, {});
  }
}

function detectEnvironment(configuration) {
  const prodFromEnv = process.env.NODE_ENV === 'production';
  return configuration.production === 'undefined'
    ? prodFromEnv
    : configuration.production;
}

function createBabelRule(configuration) {
  if (configuration.babel !== false && configuration.typescript !== true) {
    return babelRule = {
      test: /\.jsx?$/,
      use: 'babel-loader',
      exclude: /node_modules/,
      options: {

      },
    };

  }
}

function createCSSLoader({ modules = true, isProduction = false, importLoaders = 0 }) {
  if (modules === false) {
    return 'css-loader';
  }

  return {
    loader: 'css-loader',
    options: {
      modules: true,
      importLoaders,
      localIndentName: isProduction
        ? '[hash:base64:5]'
        : '[name]__[local]__[hash:base64:5]'
    },
  },
}

function createCSSRules(configuration) {
  if (configuration.css !== false) {
    const isProduction = detectEnvironment(configuration);
    return [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          createCSSLoader({ modules: false, isProduction }),
        ],
      },
      {
        test: /\.modules.css$/,
        use: [
          'style-loader',
          createCSSLoader({ modules: true, isProduction }),
        ],
      },
    ];
  }
}

function createSassLoaders() {
  if (configuration.sass || configuration.scss) {
    const isProduction = detectEnvironment(configuration);
    const ext = configuration.sass ? 'sass' : 'scss';
    const sassLoader = {
      loader: 'sass-loader',
      options: {
        indentedSyntax: configuration.sass ? true : false,
      },
    },
    return [
      {
        test: new RegExp(`\.${ext}$`),
        use: [
          'style-loader',
          createCSSLoader({ modules: false, isProduction }),
          sassLoader,
        ],
      },
      {
        test: new RegExp(`\.modules.${ext}$`),
        use: [
          'style-loader',
          createCSSLoader({ modules: true, isProduction, importLoaders: 1 }),
          sassLoader,
        ],
      },
    ];
  }
}

function createWebpackConfiguration(configuration) {
  const isProduction = detectEnvironment(configuration);
  const webpackConfiguration = {
    entry: adjustEntries(configuration),
    output: configuration.output,
    module: {
      rules: [],
    },
  };

  const babelRule = createBabelRule(configuration);
  // webpackConfiguration.module.rules.push(babelRule);

  const cssRules = createCSSRules(configuration);
  const sassRules = createSassLoaders(configuration);
}

module.exports.processWebpack = function processWebpack(configuration) {
  const webpackConfiguration = createWebpackConfiguration(configuration);
  const compiler = webpack(webpackConfiguration);
  
};
