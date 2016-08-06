import fs from 'fs';
import path from 'path';
import commander from 'commander';
import colors from 'colors/safe';
import thinkit from 'thinkit';
/**
 * global think variable
 * @type {Object}
 */
global.think = Object.create(thinkit);
colors.enabled = true;
let {sep} = path;
let cwd = process.cwd();
let templatePath = path.dirname(__dirname) + sep + 'template';
let projectRootPath = cwd; //project root path

let createProject = () => {
  think.APP_PATH = getProjectAppPath();
  mkdir(think.APP_PATH)
  mkdir(think.APP_PATH + '/www/pages');
  mkdir(think.APP_PATH + '/build/');
  mkdir(think.APP_PATH + '/dist/');
  mkdir(think.APP_PATH + '/rebuild/');
  mkdir(think.APP_PATH + '/release/');
  mkdir(think.APP_PATH + '/docs/');

}

/**
 * copy file
 * @param  {String} source []
 * @param  {String} target []
 * @return {}        []
 */
let copyFile = (source, target, replace, showWarning) => {

  if(showWarning === undefined){
    showWarning = true;
  }

  if(think.isBoolean(replace)){
    showWarning = replace;
    replace = '';
  }

  //if target file is exist, ignore it
  if(think.isFile(target)){
    if(showWarning){
      log(colors => {
        return colors.yellow('exist') + ' : ' + path.normalize(target);
      });
    }
    return;
  }

  mkdir(path.dirname(target));

  if (commander.spa) {
    source = 'project-avalon-spa' + source
  }

  //if source file is not exist
  if(!think.isFile(templatePath + think.sep + source)){
    return;
  }

  let content = fs.readFileSync(templatePath + think.sep + source, 'utf8');
  //replace content 
  if(think.isObject(replace)){
    for(let key in replace){
      /*eslint-disable no-constant-condition*/
      while(1){ 
        let content1 = content.replace(key, replace[key]);
        if(content1 === content){
          content = content1;
          break;
        }
        content = content1;
      }
    }
  }

  fs.writeFileSync(target, content);
  log(colors => {
    return colors.cyan('create') + ' : ' + path.relative(cwd, target);
  });
};
/**
 * get version
 * @return {String} []
 */
let getVersion = () => {
  let filepath = path.resolve(__dirname, '../package.json');
  let version = JSON.parse(fs.readFileSync(filepath)).version;
  return version;
};

/**
 * mkdir
 * @param  {String} dir []
 * @return {}     []
 */
let mkdir = dir => {
  if(think.isDir(dir)){
    return;
  }
  // console.log(dir)
  think.mkdir(dir);
  log(colors => {
    return colors.cyan('create') + ' : ' + path.relative(cwd, dir);
  });
};

think.log = (msg, type, showTime) => {
  let dateTime = colors.gray(`[${think.datetime()}] `);
  if (think.isFunction(msg)) {
    msg = msg(colors);
  }
  console.log(msg); 
}
/**
 * log
 * @param  {Function} fn []
 * @return {}      []
 */
let log = fn => {
  think.log(colors => {
    return '  ' + fn(colors);
  }, '', null); 
};

/**
 * get app root path
 * @return {} []
 */
let getProjectAppPath = () => {
  let path = projectRootPath + think.sep;
  // path += commander.es || commander.ts ? 'src' : 'app';
  return path;
};
/**
 * get app name
 * @return {} []
 */
let getAppName = () => {
  let filepath = path.normalize(cwd + '/' + projectRootPath).replace(/\\/g, '');
  let matched = filepath.match(/([^\/]+)\/?$/);
  return matched[1];
};


/**
 * display thinkjs version
 * @return {} []
 */
let displayVersion = () => {
  let version = getVersion();

  let chars = [
  '.______      ___   ____    __    ____  ___',
  '|   _  \\    /   \\  \\   \\  /  \\  /   / /   \\',
  '|  |_)  |  /  ^  \\  \\   \\/    \\/   / /  ^  \\',
  '|   ___/  /  /_\\  \\  \\            / /  /_\\  \\',
  '|  |     /  _____  \\  \\    /\\    / /  _____  \\',
  '| _|    /__/     \\__\\  \\__/  \\__/ /__/     \\__\\',
  '                                         '                                       
  ].join('\n');
  console.log('\n v' + version + '\n');
  console.log(chars);
};

commander.usage('[command] <options ...>');
commander.option('-v --version', 'output the version number', () => {
  displayVersion();
});
commander.option('-V', 'output the version number', () => {
  displayVersion();
});
commander.option('-s, --spa', 'use es for project, used in `new` command');

//create project
commander.command('new <projectPath>').description('create project').action(projectPath => {
  projectRootPath = path.resolve(projectRootPath, projectPath);
  console.log(commander.spa)
  createProject();
});

commander.parse(process.argv);  