var postcss = require('postcss');

function extractUrls(text) {
    let match;
    const urls = [];
    const regex = /url\((\s*)(['"]?)(.+?):([^/].*?)\2(\s*)\)/g;

    while ((match = regex.exec(text)) !== null) {
        urls.push({
            source: match[0],
            before: match[1],
            quote: match[2],
            namespace: match[3],
            filePath: match[4],
            after: match[5]
        });
    }
    return urls;
}

function getNamespacePath(opts, name) {
    return opts.namespacePaths instanceof Function ? opts.namespacePaths(name) : opts.namespaces[name];
}

function translateUrl(opts, url) {
    const q = url.quote;
    const ns = getNamespacePath(opts, url.namespace);
    return `url(${q}${ns}/${url.filePath}${q})`;
}

module.exports = postcss.plugin('postcss-url-namespaces', function(opts) {
    opts = opts || {};
    return function(root) {
        root.walkDecls(function(decl) {
            if (decl.value && decl.value.indexOf('url(') > -1) {
                const urls = extractUrls(decl.value);
                for (var url of urls) {
                    decl.value = decl.value.replace(url.source, translateUrl(opts, url));
                }
            }
        });
    };
});
