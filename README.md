# Elpack

Elpack stands for the "elegant webpack", and the reason of this repository is to try to find a way to write more elegant webpack configuarion. I really like the power of the webpack, all possibilities which it brings to a bundling of applications, but I honestly hate all complications it brings to the user. Let's start with the simple situation -- we want to transpile our modern JS code to ES5, process styles and other files (like images in different formats). In order to do that, our setup will look like that:

```js
const path = require('path');
const webpack = require('webpack');

module.exports = {
	entry: './src/index.js',
	output: {
		filename: '[hash].js',
		path: path.resolve('__dirname', 'dist'),
		publicPath: '/',
	},
	module: {
		rules: [
			{
				test: /\.jsx?$/,
        use: ['babel-loader'],
        exclude: /node_modules/,
			},
			{
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.sass$/,
        use: [
          'style-loader',
          'css-loader?modules&localIdentName=[name]__[local]___[hash:base64:5]',
          {
            loader: 'sass-loader',
            options: {
              indentedSyntax: true,
            },
          },
        ],
      },
      {
        test: /\.svg$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
          },
        },
      },
		]
	},
	plugins: process.env.NODE_ENV === 'production'
		? [
			  new webpack.DefinePlugin({
					__DEV__: false,
					'process.env': {
						NODE_ENV: JSON.stringify('production'),
					},
				}),
    		new webpack.optimize.UglifyJsPlugin(),
		] : [],
};
```

This is a very basic setup, which is good only for demonstrating how the webpack works internally -- for development we are missing dev server and hot reloading, and for production we don't have styles extraction, and some additional plugins.

There are several problems here. First of all, I had to look it up, despite doing it several times in the last couple of months. Also, there are couple of things, which I personally repeat again and again:
- babel setup. I always transpile `.js/.jsx` files with `babel-loader`
- css setup is almost always the same for me, as well as sass/less/postCSS -- the single difference here is a usage of CSS modules, but a simple convention can be used here as well
- in case of using the react.js, we need to add several common things to several places (more on this later)

And one of the biggest problem for me is that I have to literally look up every plugin and see how to add it, which packages it depends on and then, after installation, I have to start it just to check that it works.

## Why not create-react-app

Before proceeding with a discussion about possible simplified interface, let's talk about alternatives first. Of course, I am not the first one who noticed that webpack has incredibly annoying setup part, and people were constantly trying to solve this problem. Initially it gave birth to the so-called "boilterplates" -- repositories, which you clone and continue to develop your own application, but with all code written for you. This is an interesting approach and is a good strategy for an organisation, for instance, where similar structure of projects has a lot of advantages, but in no way the best thing for the common setups.
Another important thing is official starter packages, like [create-react-app](https://github.com/facebookincubator/create-react-app). While I appreciate all efforts and best practices which are put there, but it is tailored for react applications, and also you can not really affect the way project looks like, you can only [eject](https://github.com/facebookincubator/create-react-app#converting-to-a-custom-setup), which will put all bloated setup into your project, so you need to deal with it again. But I have to admit, that it is a very successful strategy, and number of people using for different purposes (like teaching and quick proof-of-concepts projects building) prooves it.
So, my main concern is that I would like to see better API, but for the common purpose. It means that it will be possible to use it with any JS framework (or without any), any css preprocessor, and extend with our own custom configuration. I agree, though, that in really complicated scenarious we would have to eject anyway, otherwise we will have to reimplement all API, which does not make a lot sense.

## How it might look like

So, the setup above, from my point of view, should look like the following:

```js
module.exports = {
	entry: './src/index.js',
	output: './dist/client.js',
	sass: true,
};
```

So, there is any babel setup? Well, to be honest, webpack is used with babel 99% of the time, so what is the point to write this thing again and again? Same for presets -- [preset-env](https://github.com/babel/babel-preset-env) is enough almost all the time (for the applications, not for the libraries), so why should we describe it in a special file?

The next will be to get several real-world webpack configuration (but for the mid-size projects only, I don't want to rewrite all possible APIs) and rewrite them in a more understandable way.
