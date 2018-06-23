'use strict';

const fs = require('fs-extra');
const path = require('path');
const util = require('react-boilerplate-app-utils');
const commander = require('commander');
const chalk = require('chalk');
const Basic = require('./Basic');

class Use extends Basic {
  constructor() {
    super();
    this.run();
  }

  commandSetting() {
    let program = new commander.Command(this.packageJson.name)
      .version(this.packageJson.version)
      .arguments('<feature-name>')
      .usage(`${chalk.green('<feature-name>')}`)
      .option('-l, --list', 'lists the feature lists.')
      .action(name => {
        this.featureName = name;
      })
      .parse(process.argv);
    this.program = program;
    if (program.list) {
      console.log();
      console.log(' ' + chalk.cyan('less'));
      console.log(' ' + chalk.cyan('sass'));
      console.log(' ' + chalk.cyan('typescript'));
      console.log();
      process.exit();
    }
    if (!this.featureName) {
      let useYarn = util.shouldUseYarn();
      let displayedCommand = 'npm run';
      if (useYarn) {
        displayedCommand = 'yarn';
      }
      console.error('Please specify the feature name:');
      console.log(
        `  ${chalk.cyan(displayedCommand)} use ${chalk.green('<feature-name>')}`
      );
      console.log();
      console.log('For example:');
      console.log(
        `  ${chalk.cyan(displayedCommand)} use ${chalk.green('less')}`
      );
      console.log();
      console.log(
        `use ${chalk.cyan(
          displayedCommand + ' use -- -l '
        )} to see the feature lists.`
      );
      console.log();
      process.exit();
    }
  }
  /**
   * 获取需要安装的包
   * @param { string } type 模板名称
   * @param { object } pacakageJson 当前输入目录的pacakge.json对象
   * @return { array }
   *  [
   *    dependencies,
   *    devDependencies,
   *  ]
   */
  getDependencies(type, packageJson) {
    let dependencies = [];
    let devDependencies = [];
    switch (type) {
      case 'less':
        dependencies = [];
        devDependencies = ['less', 'less-loader'];
        break;
      case 'sass':
        dependencies = [];
        devDependencies = ['node-sass', 'sass-loader'];
        break;
      case 'typescript':
        dependencies = [];
        devDependencies = [
          'typescript',
          'ts-loader',
          '@types/react',
          '@types/react-dom',
        ];
        //标记typescript开启，wepack配置会读取这个信息
        packageJson[util.scriptsPackagename].typescript = true;
        break;
      default:
        console.log();
        console.log(chalk.red('unknown feature name'));
        console.log();
        console.log(
          `use ${chalk.cyan(
            this.program.name() + ' use -l '
          )} to see the feature lists.`
        );
        process.exit(1);
        break;
    }
    return [dependencies, devDependencies];
  }
  /**
   * 保存新增的包信息到package.json
   * @param { object } packageJson 原项目的package.json对象
   * @param { array } dependencies
   * @param { array } devDependencies
   */
  writeNewPackageJson(packageJson, dependencies, devDependencies) {
    dependencies.forEach(v => {
      v = v.replace(/@.*/, '');
      let version = util.getVersionOfPackage(v);
      packageJson.dependencies[v] = '^' + version;
    });
    devDependencies.forEach(v => {
      v = v.replace(/@.*/, '');
      let version = util.getVersionOfPackage(v);
      packageJson.devDependencies[v] = '^' + version;
    });
    fs.writeFileSync(
      path.resolve(process.cwd(), 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
  }

  run() {
    let packageJson = util.getCwdPackageJson();
    let dependencies = this.getDependencies(this.featureName, packageJson);
    let allDependencies = [].concat(dependencies[0]).concat(dependencies[1]);
    if (!packageJson.devDependencies) {
      packageJson.devDependencies = {};
    }
    if (!packageJson.dependencies) {
      packageJson.dependencies = {};
    }
    util
      .installPackages(allDependencies)
      .then(() => {
        this.writeNewPackageJson(packageJson, dependencies[0], dependencies[1]);
        console.log();
        console.log(chalk.cyan('Restart the dev server,then it will work.'));
      })
      .catch(function(e) {
        console.error(e);
        process.exit(1);
      });
  }
}
module.exports = function() {
  new Use();
};
