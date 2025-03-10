const path = require('path');

module.exports = function(source) {
    const componentPath = this.resourcePath;
    const componentName = path.basename(componentPath, '.component');
    
    const styleMatch = source.match(/<style>([\s\S]*?)<\/style>/);
    const markupMatch = source.match(/<markup>([\s\S]*?)<\/markup>/);
    const scriptMatch = source.match(/<script>([\s\S]*?)<\/script>/);

    const style = styleMatch ? styleMatch[1].trim() : '';
    const markup = markupMatch ? markupMatch[1].trim() : '';
    const script = scriptMatch ? scriptMatch[1].trim() : '';

    const result = `
        const style = \`${style}\`;
        const markup = \`${markup}\`;
        ${script}
        const element = document.createElement('div');
        element.innerHTML = markup;
        const styleElement = document.createElement('style');
        styleElement.innerHTML = style;
        document.head.appendChild(styleElement);

        export default function(context, uuid) {
            const componentElement = element.cloneNode(true);
            render(context, uuid, componentElement);
            return componentElement;
        }
    `;

    return result;
};