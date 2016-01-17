# bit-bundler-browserpack
JavaScript bit-bundler bundler provider. This bundler provider uses [browser-pack](https://github.com/substack/browser-pack) to create the bundles.

### Options

- **`umd`** { string } - String name for the `UMD` module to be exported. `UMD` is a configuration that allows bundles to run in node.js, requirejs, and traditional script tags. If running in the browser, provide this setting for maximum compatibility. The name you provide is exported so that other modules can consume the bundle. [This is some literature on it](https://github.com/umdjs/umd).
- **`printInfo`** { boolean } (false) - Flag to print out to console basic information about the modules in each generated bundle.
- **`filePathAsId`** { boolean } (false) - Flag to tell the bundler that modules in the bundles should use the full path as ids instead of the numeric ids.

All options that `browser-pack` takes can be forwarded to the internal instance in a configuration object with `browserPack` as the key.  E.g.

``` javascript
{
  umd: 'mysweetmodule',
  browserPack: {
    raw: true
  }
}
```

However, this should not really be needed for the general case as all options are automatically computed for you by this module.

### License

Licensed under MIT
