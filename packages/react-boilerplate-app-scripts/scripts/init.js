'use strict';

const util = require('react-boilerplate-app-utils');
const scriptsPackagename = util.scriptsPackagename;
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const commander = require('commander');
const Basic = require('./basic.js');

class Init extends Basic {
  /**
   * @param { object } program commander对象
   */
  constructor(program, appName) {
    super();
    if (program) {
      this.program = program;
    } else {
      this.program = this.getCommander();
    }
    if (!appName) {
      //避免报错
      appName = 'test';
    }
    this.appName = appName;
    this.boilerplate = this.program.boilerplate;
    this.configJson = this.getConfigJson(this.boilerplate);
    try {
      this.run();
    } catch (e) {
      console.log(e);
      process.exit();
    }
  }

  getCommander() {
    let program = commander
      .option('-b, --boilerplate [boilerplate]', 'boilerplate name')
      .parse(process.argv);
    if (!program.boilerplate) {
      program.boilerplate = 'mvc-react';
    }
    return program;
  }
  //获取当前模板的config.json
  getConfigJson(boilerplate) {
    try {
      let configPath = path.resolve(
        __dirname,
        '../template',
        boilerplate,
        'config.json'
      );
      return fs.readJsonSync(configPath);
    } catch (e) {
      return {};
    }
  }

  /**
   * 检查当前目录是否合法
   * 如果src目录存在将提示并退出程序
   */
  checkCurrentDirIsValid() {
    try {
      if (fs.existsSync(util.resolveCwd('src'))) {
        console.error(chalk.red('The project should not contain src folder!'));
        process.exit();
        return false;
      }
      if (fs.existsSync(util.resolveCwd('test'))) {
        console.error(chalk.red('The project should not contain test folder!'));
        process.exit();
        return false;
      }
      return true;
    } catch (e) {
      console.error(e);
    }
  }
  //获取样板中config.json下的scirpts
  //返回package.json格式的scripts
  getBoilerplateScrpits(scriptsConfig) {
    if (!scriptsConfig) {
      return {};
    }
    let scripts = {};
    for (let k in scriptsConfig) {
      let script = scriptsConfig[k].script;
      scripts[k] = script;
    }
    return scripts;
  }
  writePackageJson() {
    let pacakgeJsonPath = path.resolve(process.cwd(), 'package.json');
    let cwdPackageJson = fs.readJsonSync(pacakgeJsonPath);
    let currentPackageJson = this.packageJson;
    //适配scripts，针对当前项目的package.json中的scripts，去除部分信息
    cwdPackageJson.scripts = {};
    for (let k in currentPackageJson['scripts']) {
      let command = currentPackageJson['scripts'][k];
      let match = command.match(/node.*\.\/bin\/(.*)\.js/);
      if (match && match[1]) {
        cwdPackageJson.scripts[k] = currentPackageJson['scripts'][k].replace(
          match[0],
          match[1]
        );
      } else {
        cwdPackageJson.scripts[k] = currentPackageJson['scripts'][k];
      }
    }
    if (currentPackageJson[scriptsPackagename].dll) {
      if (!cwdPackageJson[scriptsPackagename]) {
        cwdPackageJson[scriptsPackagename] = {};
      }
      cwdPackageJson[scriptsPackagename].dll =
        currentPackageJson[scriptsPackagename].dll;
    } else {
      cwdPackageJson[scriptsPackagename].dll = [];
    }
    cwdPackageJson.babel = currentPackageJson.babel;
    cwdPackageJson.eslintConfig = currentPackageJson.eslintConfig;
    for (let j in this.configJson) {
      let config = this.configJson[j];
      switch (j) {
        case 'scripts':
          if (Object.prototype.toString.apply(config) === '[object Object]') {
            let boilerplateScripts = this.getBoilerplateScrpits(config);
            cwdPackageJson.scripts = Object.assign(
              cwdPackageJson.scripts,
              boilerplateScripts
            );
          } else {
            console.log(
              chalk.red('Config.json scirpts filed should be plain object.')
            );
          }
          break;
        case 'dll':
          if (Object.prototype.toString.apply(config) === '[object Array]') {
            config.forEach(v => {
              let dll = cwdPackageJson[scriptsPackagename].dll;
              if (!~dll.indexOf(v)) {
                cwdPackageJson[scriptsPackagename].dll.push(v);
              }
            });
          } else {
            console.log(chalk.red('Config.json dll filed should be array.'));
          }
          cwdPackageJson[scriptsPackagename].dll.concat(currentPackageJson.dll);
          break;
        default:
        //不做处理
      }
    }
    //整合boilerplate中的config.json，覆盖配置，除了自定义的。
    fs.writeFileSync(pacakgeJsonPath, JSON.stringify(cwdPackageJson, null, 2));
  }

  /**
   * 复制template中的文件夹
   * @param { string } targetDir 目标复制的文件夹名
   * @param { string } partDirName 复制的后创建文件夹名（相对于项目根目录），存放复制文件
   * @return { string } 复制保存后的文件夹路径
   */
  coypTemplateDir(targetDir, partDirName) {
    //template目录下的文件夹路径
    let templateDirPath = path.resolve(__dirname, `../template/${targetDir}`);
    if (!fs.existsSync(templateDirPath)) {
      console.error(chalk.red(templateDirPath + ' is not exist.'));
      process.exit();
    }
    //相对于项目根目录
    let savePath = path.resolve(process.cwd(), partDirName || '');
    fs.copySync(
      path.resolve(__dirname, `../karma.conf.js`),
      path.resolve(savePath, 'karma.conf.js')
    );
    fs.copySync(templateDirPath, savePath, {
      dereference: true,
      filter: function(filePath) {
        /* eslint-disable no-extra-boolean-cast */
        if (!!~filePath.indexOf('dll.app.js')) {
          return false;
        }
        /* eslint-disable no-extra-boolean-cast */
        if (!!~filePath.indexOf('dll.app.js.map')) {
          return false;
        }
        /* eslint-disable no-extra-boolean-cast */
        if (!!~filePath.indexOf('app-manifest.json')) {
          return false;
        }
        /* eslint-disable no-extra-boolean-cast */
        if (!!~filePath.indexOf('dll-compare.json')) {
          return false;
        }
        return true;
      },
    });
    return savePath;
  }

  run() {
    this.checkCurrentDirIsValid();
    let boilerplate = this.program.boilerplate;
    let savePath = this.coypTemplateDir(boilerplate);
    fs.removeSync(path.resolve(savePath, 'config.json'));
    this.writePackageJson();
    this.instruction();
  }

  createCustomInstruction(scriptsConfig, displayedCommand) {
    for (let k in scriptsConfig) {
      let scriptsName = k;
      let description = scriptsConfig[k].description;
      console.log(chalk.cyan(`  ${displayedCommand} ${scriptsName}`));
      console.log(`     ${description}`);
      console.log();
    }
  }

  instruction() {
    let appPath = path.resolve(process.cwd(), '../');
    let appName = this.appName;
    let useYarn = util.shouldUseYarn();
    let displayedCommand = 'npm run';
    if (useYarn) {
      displayedCommand = 'yarn';
    }
    let descriptionScripts = {
      start: {
        description: 'Start the development server.',
      },
      'use <feature-name>': {
        description: 'Use a feature such as less,sass.',
      },
      'cover <file-name>': {
        description:
          'Overwrite the configuration file, such as webpack.config.dev.js.',
      },
      build: {
        description: 'Bundles the app into static files for production.',
      },
      'build-dll': {
        description: 'Bundles bill files into public folder.',
      },
      'serve-build': {
        description: 'Serve the static files in the build folder.',
      },
      test: {
        description: 'Run test units.',
      },
    };
    console.log();
    console.log(chalk.green('Success!'));
    console.log(`Created ${chalk.cyan(appName)} at `);
    console.log(`${appPath}`);
    console.log();
    console.log('Inside that directory, you can run several commands:');
    console.log();
    console.log();
    this.createCustomInstruction(
      Object.assign(descriptionScripts, this.configJson.scripts || {}),
      displayedCommand
    );
  }
}
module.exports = Init;
