# bit-bundler-browserpack
[bit-bundler](https://github.com/MiguelCastillo/bit-bundler) bundler provider to create JavaScript bundles. This bundler provider uses [browser-pack](https://github.com/substack/browser-pack) as the backing bundle generator.

### Options

- **`umd`** { string } - String name for the `UMD` module to be exported. `UMD` is a configuration that allows bundles to run in node.js, requirejs, and traditional script tags. If running in the browser, provide this setting for maximum compatibility. The name you provide is exported so that other modules can consume the bundle. [This is some literature on it](https://github.com/umdjs/umd).
- **`printInfo`** { boolean } (false) - Flag to print out to console basic information about the modules in each generated bundle.
- **`filePathAsId`** { boolean } (false) - Flag to tell the bundler that modules in the bundles should use the full path as ids instead of the numeric ids.

All options that `browser-pack` takes can be forwarded in a `browserPack` configuration object. However, this should not really be needed for the general case as all options are automatically computed for you by this module.

``` javascript
{
  umd: 'mysweetmodule',
  browserPack: {
    raw: true
  }
}
```

### License

Licensed under MIT
