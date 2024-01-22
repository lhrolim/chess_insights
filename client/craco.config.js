const CracoAlias = require('craco-alias')
var path = require( 'path' );
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

module.exports = {
  webpack:{
    devtool:'eval-source-map',
  },
  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: 'options',
        baseUrl: './',
        aliases :{
          '@api': path.resolve(__dirname, 'src/api/'),
          '@components': path.resolve(__dirname, 'src/components/'),
          '@hooks': path.resolve(__dirname, 'src/hooks/'),
          '@pages': path.resolve(__dirname, 'src/pages/'),
          '@ctypes': path.resolve(__dirname, 'src/types/'),
          '@utils': path.resolve(__dirname, 'src/utils/'),
        }
      },
    },{
      plugin:  new NodePolyfillPlugin()
    }
   
  ],
}