module.exports = function (content) {;
  return `
    module.exports = (function () {
      console.log('wuuuut?');
      var styleTag = document.createElement('style');
      styleTag.type = 'text/css';
      styleTag.appendChild(document.createTextNode(${JSON.stringify(content)}));
      document.querySelector('head').appendChild(styleTag);
    })()
  `
}
