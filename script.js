let zoom = 1;
const ZOOM_SPEED = 0.1;

function parseMarkdown(markdown) {
    console.log("Parsing markdown:", markdown);
    const lines = markdown.split('\n');
    const root = { content: lines[0].replace('# ', ''), children: [] };
    let currentLevel1 = null;
    let currentLevel2 = null;

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('## ')) {
            currentLevel1 = { content: line.replace('## ', ''), children: [] };
            root.children.push(currentLevel1);
        } else if (line.startsWith('### ') && currentLevel1) {
            currentLevel2 = { content: line.replace('### ', ''), children: [] };
            currentLevel1.children.push(currentLevel2);
        } else if (line.startsWith('#### ') && currentLevel2) {
            currentLevel2.children.push({ content: line.replace('#### ', '') });
        }
    }

    console.log("Parsed data:", root);
    return root;
}

function createNode(content, level, id = '') {
    const node = document.createElement('div');
    node.className = `node level-${level}`;
    node.textContent = content;
    if (id) node.id = id;
    return node;
}

function renderMindmap(data) {
    console.log("Rendering mindmap with data:", data);
    const container = document.getElementById('mindmap-container');
    container.innerHTML = '';

    const rootNode = createNode(data.content, 0, 'root');
    container.appendChild(rootNode);

    data.children.forEach((level1, index) => {
        if (index >= 6) return; // Limit to 6 level 1 nodes

        const level1Node = createNode(level1.content, 1, `level-1-${index + 1}`);
        container.appendChild(level1Node);

        const level2Container = document.createElement('div');
        level2Container.className = 'level-2-container';
        level1Node.appendChild(level2Container);

        level1.children.forEach((level2, level2Index) => {
            if (level2Index >= 3) return; // Limit to 3 level 2 nodes

            const level2Node = createNode(level2.content, 2);
            level2Container.appendChild(level2Node);

            const level3Container = document.createElement('div');
            level3Container.className = 'level-3-container';
            level2Node.appendChild(level3Container);

            level2.children.forEach((level3, level3Index) => {
                if (level3Index >= 3) return; // Limit to 3 level 3 nodes

                const level3Node = createNode(level3.content, 3);
                level3Container.appendChild(level3Node);
            });
        });

        level1Node.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleChildren(level1Node);
        });
    });

    rootNode.addEventListener('click', toggleLevel1Nodes);
    console.log("Mindmap rendered");
}

function toggleChildren(node) {
    console.log("Toggling children for node:", node);
    const children = node.querySelector(`.level-${parseInt(node.className.split('-')[1]) + 1}-container`);
    if (children) {
        children.style.display = children.style.display === 'none' ? 'grid' : 'none';
    }
}

function toggleLevel1Nodes() {
    console.log("Toggling level 1 nodes");
    const level1Nodes = document.querySelectorAll('.level-1');
    level1Nodes.forEach(node => {
        node.style.display = node.style.display === 'none' ? 'grid' : 'none';
        const level2Container = node.querySelector('.level-2-container');
        if (level2Container) {
            level2Container.style.display = 'none';
        }
    });
}

function setupZoom() {
    const container = document.getElementById('mindmap-container');
    container.addEventListener('wheel', function(e) {
        if(e.ctrlKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -1 : 1;
            zoom += delta * ZOOM_SPEED;
            zoom = Math.min(Math.max(.125, zoom), 4);
            container.style.transform = `scale(${zoom})`;
        }
    });
}

function generatePNG() {
    const container = document.getElementById('mindmap-container');
    
    // Store current visibility and zoom state
    const visibilityStates = new Map();
    container.querySelectorAll('.level-1, .level-2-container, .level-3-container').forEach(node => {
        visibilityStates.set(node, node.style.display);
        node.style.display = 'grid';
    });
    const currentZoom = container.style.transform;
    container.style.transform = 'scale(1)';

    html2canvas(container).then(canvas => {
        const image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        const link = document.createElement('a');
        link.download = 'mindmap.png';
        link.href = image;
        link.click();

        // Restore original visibility and zoom state
        visibilityStates.forEach((display, node) => {
            node.style.display = display;
        });
        container.style.transform = currentZoom;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");
    const renderButton = document.getElementById('render-button');
    const generatePngButton = document.getElementById('generate-png');

    if (renderButton) {
        renderButton.addEventListener('click', () => {
            console.log("Render button clicked");
            const markdown = document.getElementById('input-area').value;
            const data = parseMarkdown(markdown);
            renderMindmap(data);
            setupZoom();
        });
    } else {
        console.error("Render button not found");
    }

    if (generatePngButton) {
        generatePngButton.addEventListener('click', generatePNG);
    } else {
        console.error("Generate PNG button not found");
    }
});

console.log("Script loaded");
