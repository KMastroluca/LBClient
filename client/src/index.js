import Framework from '../lib/framework';

document.addEventListener('DOMContentLoaded', () => {
    const framework = new Framework();

    // Example XML markup received from the server
    const xmlMarkup = `
        <App>
            <NestedComponent></NestedComponent>
        </App>
    `;

    const view = framework.renderView(xmlMarkup);
    document.body.appendChild(view);
});