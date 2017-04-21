var webpack = require('webpack');
var path = require('path');
var utils = require('./utils');
var getVendors = require('./getVendors');

module.exports = function (packagePath) {
  return function (entries) {
    return getVendors(entries, packagePath)
      .then(function (vendors) {
        var webpackConfig = {
          context: '/',
          entry: { vendors: vendors },
          output: {
            path: path.resolve(packagePath),
            filename: 'dll.js',
            library: 'dll_bundle'
          },
          plugins: [
            new webpack.DllPlugin({
              path: path.resolve(packagePath, 'manifest.json'),
              name: 'dll_bundle'
            }),
            new webpack.optimize.UglifyJsPlugin({minimize: true, mangle: false})
          ],
          resolve: {
            modules: [path.resolve(packagePath, 'node_modules')]
          },
          resolveLoader: {
            alias: {
              'custom-css-loader': require.resolve('./customCssLoader')
            }
          },
          module: {
            loaders: [{
              test: /\.json$/,
              use: 'json-loader'
            }, {
              test: /\.css$/,
              use: 'custom-css-loader'
            }]
          }
        };

        var vendorsCompiler = webpack(webpackConfig);

        return new Promise(function (resolve, reject) {
          vendorsCompiler.run(function (err) {
            if (err) {
              return reject(err);
            }

            resolve();
          });
        })
          .then(function () {
            return utils.readFile(path.resolve(packagePath, 'manifest.json'));
          })
          .then(function (manifestJson) {
            var manifest = JSON.parse(manifestJson);

            manifest.content = utils.cleanManifestContent(manifest, entries, packagePath);
            manifest.externals = utils.createExternals(manifest);

            return utils.writeFile(path.resolve(packagePath, 'manifest.json'), JSON.stringify(manifest, null, 2));
          })
          .catch((err) => {
            console.log(err);
          })
      });
  }
}
