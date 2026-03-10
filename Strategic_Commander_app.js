document.addEventListener('DOMContentLoaded', () => {
    const gridElement = document.getElementById('grid');
    const statusBox = document.getElementById('status');
    const COLS = 40;
    const ROWS = 25;

    let currentTool = 'wall'; // wall, start, end, erase
    let startNode = { x: 5, y: 12 };
    let endNode = { x: 35, y: 12 };
    let gridData = [];
    let isDrawing = false;

    // Initialize Web Worker
    const pathWorker = new Worker('js/worker.js');

    // Setup Grid Array and DOM
    function initGrid() {
        gridElement.style.gridTemplateColumns = `repeat(${COLS}, 25px)`;
        gridElement.style.gridTemplateRows = `repeat(${ROWS}, 25px)`;
        gridElement.innerHTML = '';
        gridData = [];

        for (let y = 0; y < ROWS; y++) {
            let row = [];
            for (let x = 0; x < COLS; x++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.x = x;
                cell.dataset.y = y;

                // Set default start/end UI
                if (x === startNode.x && y === startNode.y) cell.classList.add('start');
                if (x === endNode.x && y === endNode.y) cell.classList.add('end');

                // Mouse events for drawing on grid
                cell.addEventListener('mousedown', (e) => handleCellClick(e, x, y));
                cell.addEventListener('mouseenter', (e) => {
                    if (isDrawing) handleCellClick(e, x, y);
                });

                gridElement.appendChild(cell);
                row.push({ x, y, isWall: false });
            }
            gridData.push(row);
        }
    }

    gridElement.addEventListener('mousedown', () => isDrawing = true);
    document.addEventListener('mouseup', () => isDrawing = false);

    function handleCellClick(e, x, y) {
        if (x === startNode.x && y === startNode.y) return;
        if (x === endNode.x && y === endNode.y) return;

        const cellIndex = y * COLS + x;
        const cellDom = gridElement.children[cellIndex];

        if (currentTool === 'wall') {
            gridData[y][x].isWall = true;
            cellDom.classList.add('wall');
            cellDom.classList.remove('visited', 'path');
        } else if (currentTool === 'erase') {
            gridData[y][x].isWall = false;
            cellDom.classList.remove('wall', 'visited', 'path');
        } else if (currentTool === 'start') {
            // Remove old start
            gridElement.children[startNode.y * COLS + startNode.x].classList.remove('start');
            startNode = { x, y };
            gridData[y][x].isWall = false; // start can't be a wall
            cellDom.classList.remove('wall');
            cellDom.classList.add('start');
        } else if (currentTool === 'end') {
            // Remove old end
            gridElement.children[endNode.y * COLS + endNode.x].classList.remove('end');
            endNode = { x, y };
            gridData[y][x].isWall = false;
            cellDom.classList.remove('wall');
            cellDom.classList.add('end');
        }
    }

    // Tool Selection Logic
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentTool = e.target.dataset.tool;
        });
    });

    // Clear Path Visuals
    function clearVisualPath() {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('path', 'visited');
        });
    }

    document.getElementById('btn-clear-path').addEventListener('click', clearVisualPath);

    document.getElementById('btn-clear-board').addEventListener('click', () => {
        startNode = { x: 5, y: 12 };
        endNode = { x: 35, y: 12 };
        initGrid();
        statusBox.textContent = 'Map reset.';
    });

    // Initiate Web Worker Calculation
    document.getElementById('btn-find-path').addEventListener('click', () => {
        clearVisualPath();
        statusBox.textContent = 'Calculating path...';
        statusBox.style.color = '#eab308'; // yellow

        // Send data to background thread
        pathWorker.postMessage({
            grid: gridData,
            start: startNode,
            end: endNode,
            cols: COLS,
            rows: ROWS
        });
    });

    // Receive data back from Web Worker
    pathWorker.onmessage = function(e) {
        const { path, visited, success, time } = e.data;

        if (!success) {
            statusBox.textContent = 'Target Unreachable! No path exists.';
            statusBox.style.color = '#ef4444'; // red
            return;
        }

        statusBox.textContent = `Path found in ${time}ms! Dist: ${path.length} steps.`;
        statusBox.style.color = '#4ade80'; // green

        // Animate Visited Nodes
        visited.forEach((node, index) => {
            setTimeout(() => {
                const cellDom = gridElement.children[node.y * COLS + node.x];
                if (!cellDom.classList.contains('start') && !cellDom.classList.contains('end')) {
                    cellDom.classList.add('visited');
                }
            }, index * 2); // 2ms delay per node for cool animation
        });

        // Animate Final Path after visited nodes finish
        const pathDelay = visited.length * 2;
        path.forEach((node, index) => {
            setTimeout(() => {
                const cellDom = gridElement.children[node.y * COLS + node.x];
                if (!cellDom.classList.contains('start') && !cellDom.classList.contains('end')) {
                    cellDom.classList.add('path');
                }
            }, pathDelay + (index * 15));
        });
    };

    initGrid();
});