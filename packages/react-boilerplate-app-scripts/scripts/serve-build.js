'use strict';

const util = require('react-boilerplate-app-utils');
const scriptsPackagename = util.scriptsPackagename;
const serve = require('new-serve');
const fs = require('fs-extra');
const chalk = require('chalk');
const paths = require(util.pathResolve('config/paths.js', scriptsPackagename));
const cwdPackageJsonConfig = util.getDefaultCwdPackageJsonConfig(
  scriptsPackagename
);

var dir = util.getTopBuildFolderPath(
  paths.appBuild,
  cwdPackageJsonConfig.basename
);
if (!fs.existsSync(dir)) {
  console.log(chalk.red(`The dir "${dir}" doesn't exist!'`));
  process.exit();
}
let mockConfig = false;
if (cwdPackageJsonConfig.mock) {
  mockConfig = JSON.stringify(cwdPackageJsonConfig.mock);
}
let proxy = false;
if (cwdPackageJsonConfig.proxy) {
  proxy = JSON.stringify(cwdPackageJsonConfig.proxy);
}
serve(dir, {
  open: true,
  single: true,
  basename: cwdPackageJsonConfig.basename || null,
  mockDir: paths.appPublic,
  mockConfig,
  proxy,
});
