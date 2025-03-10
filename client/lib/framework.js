class Context {
    constructor() {
        this.globalState = this.createReactiveState({});
        this.componentState = new Map();
        this.renderTree = new Map();
    }

    createReactiveState(initialState) {
        const self = this;
        return new Proxy(initialState, {
            set(target, key, value) {
                target[key] = value;
                self.updateComponents();
                return true;
            }
        });
    }

    setGlobalState(key, value) {
        this.globalState[key] = value;
    }

    getGlobalState(key) {
        return this.globalState[key];
    }

    setComponentState(uuid, state) {
        this.componentState.set(uuid, this.createReactiveState(state));
    }

    getComponentState(uuid) {
        return this.componentState.get(uuid);
    }

    addToRenderTree(uuid, componentName) {
        this.renderTree.set(uuid, componentName);
    }

    getRenderTree() {
        return this.renderTree;
    }

    updateComponents() {
        this.renderTree.forEach((componentName, uuid) => {
            const componentElement = document.querySelector(`[data-uuid="${uuid}"]`);
            if (componentElement) {
                import(`../src/components/${componentName}.component`).then(module => {
                    const component = module.default;
                    const renderedComponent = component(this, uuid);
                    componentElement.replaceWith(renderedComponent);
                });
            }
        });
    }
}

class Framework {
    constructor() {
        this.parser = new DOMParser();
        this.context = new Context();
    }

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    renderView(xmlMarkup) {
        const xmlDoc = this.parser.parseFromString(xmlMarkup, 'text/xml');
        const rootElement = document.createElement('div');

        this.renderElement(xmlDoc.documentElement, rootElement);

        return rootElement;
    }

    renderElement(xmlNode, parentElement) {
        if (xmlNode.nodeType === 1) { // Element node
            const componentName = xmlNode.nodeName;
            const componentElement = document.createElement('div');
            componentElement.setAttribute('data-component', componentName);

            const uuid = this.generateUUID();
            componentElement.setAttribute('data-uuid', uuid);
            this.context.addToRenderTree(uuid, componentName);

            import(`../src/components/${componentName}.component`).then(module => {
                const component = module.default;
                const renderedComponent = component(this.context, uuid);
                componentElement.replaceWith(renderedComponent);

                // Render child nodes
                Array.from(xmlNode.childNodes).forEach(childNode => {
                    this.renderElement(childNode, renderedComponent);
                });
            });

            parentElement.appendChild(componentElement);
        } else if (xmlNode.nodeType === 3) { // Text node
            parentElement.appendChild(document.createTextNode(xmlNode.nodeValue));
        }
    }
}

export default Framework;
export { Context };

import Framework from '../lib/framework';

document.addEventListener('DOMContentLoaded', () => {
    const framework = new Framework();

    // Example XML markup received from the server
    const xmlMarkup = `
        <App>
            <NestedComponent data-text="{text}"></NestedComponent>
        </App>
    `;

    const view = framework.renderView(xmlMarkup);
    document.body.appendChild(view);
});