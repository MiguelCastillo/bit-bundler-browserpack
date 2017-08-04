var defaultOptions = require("./defaultOptions");
var browserPack = require("browser-pack");
var uniqueId = require("bit-bundler-utils/uniqueId");
var pstream = require("p-stream");
var utils = require("belty");
var path = require("path");


function Bundler(options) {
  if (!(this instanceof Bundler)) {
    return new Bundler(options);
  }

  this._options = utils.merge({}, defaultOptions, options);
}


Bundler.prototype.bundle = function(context, options) {
  if (!context.modules.length) {
    return Promise.resolve();
  }

  var bpOptions = buildOptions(this, options);
  var bpExports = getBrowserPackExports(this, context, bpOptions);
  var bpModules = createBrowserPackModules(this, context);
  bpModules = configureIds(this, bpModules, bpOptions);
  bpModules = configureEntries(this, bpModules, bpExports);
  bpModules = configureSourceMap(this, bpModules, bpOptions);

  var bpBundle = {
    exports: bpExports,
    modules: bpModules
  };

  if (bpOptions.printInfo) {
    this.printInfo(bpBundle);
  }

  return new Promise(function(resolve) {
    var bp = browserPack(buildBrowserPackOptions(bpBundle, bpOptions));
    var deferred = pstream(bp);

    bpBundle.modules.forEach(function(mod) {
      bp.write(mod);
    });

    bp.end();

    return deferred.then(function(content) {
      return resolve(utils.extend({ content: content }, bpBundle));
    });
  });
};


Bundler.prototype.printInfo = function(bpBundle) {
  var bpOptions = buildBrowserPackOptions(bpBundle, buildOptions(this));
  console.log(formatBundleInfo(bpBundle, bpOptions));
};


Bundler.prototype.getId = function(moduleId) {
  return uniqueId.getId(moduleId);
};


Bundler.prototype.setId = function(moduleId, value) {
  uniqueId.setId(moduleId, value);
};


function buildOptions(bundler, options) {
  var bpOptions = utils.merge({}, bundler._options, options);
  return utils.merge(bpOptions, bpOptions.browserPack);
}


function buildBrowserPackOptions(bpBundle, options) {
  var bpOptions = utils.merge({}, options);
  bpOptions.hasExports = bpBundle.exports.length !== 0;
  bpOptions.standaloneModule = bpBundle.exports;

  if (options.umd) {
    bpOptions.standalone = options.umd;
  }

  return bpOptions;
}


function createBrowserPackModules(bundler, context) {
  var excludeMap = utils.arrayToObject(context.exclude);
  var stack = context.modules.slice(0);
  var result = [], processed = {}, i = 0, mod;

  while(stack.length !== i) {
    mod = context.cache[stack[i++].id];

    if (processed.hasOwnProperty(mod.id) || excludeMap.hasOwnProperty(mod.id)) {
      continue;
    }

    processed[mod.id] = mod;
    stack.push.apply(stack, mod.deps);
    result.push(createBrowserPackModule(mod));
  }

  return result;
}


function configureIds(bundler, bpModules, bpOptions) {
  if (!bpOptions.filePathAsId) {
    bpModules.forEach(function(bpModule) {
      bpModule.id = bundler.getId(bpModule.id);

      Object.keys(bpModule.deps).forEach(function(depName) {
        bpModule.deps[depName] = bundler.getId(bpModule.deps[depName]);
      });
    });
  }

  return bpModules;
}


function configureEntries(bundler, bpModules, bpExports) {
  var exports = utils.arrayToObject(bpExports);

  bpModules.forEach(function(mod) {
    mod.entry = exports.hasOwnProperty(mod.id);
  });

  return bpModules;
}


function configureSourceMap(bundler, bpModules, bpOptions) {
  if (bpOptions.sourceMap === false) {
    bpModules.forEach(function(mod) {
      mod.nomap = true;
    });
  }

  return bpModules;
}


function getBrowserPackExports(bundler, context, bpOptions) {
  return context.modules.map(function(mod) {
    if (/^\w/.test(mod.name) && bpOptions.exportNames) {
      bundler.setId(mod.id, mod.name);
    }

    return bundler.getId(mod.id);
  });
}


function createBrowserPackModule(mod) {
  var bpModule = {
    id         : mod.id,
    name       : mod.name,
    path       : mod.path,
    source     : mod.source,
    sourceFile : path.relative(".", mod.path),
    deps       : {}
  };

  var i, length, dep;
  for (i = 0, length = mod.deps.length; i < length; i++) {
    dep = mod.deps[i];
    bpModule.deps[dep.name] = dep.id;
  }

  return bpModule;
}


function formatBundleInfo(bpBundle, options) {
  var output = {};
  var bpModules = bpBundle.modules;

  if (options.standalone) {
    output.standalone = options.standalone;
  }

  output.modules = bpModules.map(function(bpModule) {
    return {
      id: bpModule.id,
      entry: bpModule.entry,
      name: bpModule.name,
      path: bpModule.path,
      deps: JSON.stringify(bpModule.deps)
    };
  });

  return output;
}


module.exports = Bundler;
