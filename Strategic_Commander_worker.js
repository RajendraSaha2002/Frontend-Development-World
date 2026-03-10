// Heuristic function: Euclidean Distance Formula applied mathematically
function getEuclideanDistance(nodeA, nodeB) {
    const dx = Math.abs(nodeA.x - nodeB.x);
    const dy = Math.abs(nodeA.y - nodeB.y);
    return Math.sqrt(dx * dx + dy * dy); // d = √((x2-x1)² + (y2-y1)²)
}

// Get valid neighbors (allowing 8-way diagonal movement)
function getNeighbors(node, grid, cols, rows) {
    const neighbors = [];
    const dirs = [
        {x: 0, y: -1}, {x: 1, y: 0}, {x: 0, y: 1}, {x: -1, y: 0}, // N, E, S, W
        {x: 1, y: -1}, {x: 1, y: 1}, {x: -1, y: 1}, {x: -1, y: -1} // Diagonals
    ];

    for (let d of dirs) {
        const nx = node.x + d.x;
        const ny = node.y + d.y;

        if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
            if (!grid[ny][nx].isWall) {
                neighbors.push(grid[ny][nx]);
            }
        }
    }
    return neighbors;
}

// Main thread listener
self.onmessage = function(e) {
    const { grid, start, end, cols, rows } = e.data;
    const startTime = performance.now();

    let openSet = [];
    let closedSet = new Set();
    let visitedNodesInOrder = []; // For UI animation

    // Convert basic start/end coords to actual grid references
    const startNode = grid[start.y][start.x];
    const endNode = grid[end.y][end.x];

    startNode.g = 0;
    startNode.h = getEuclideanDistance(startNode, endNode);
    startNode.f = startNode.g + startNode.h;

    openSet.push(startNode);

    while (openSet.length > 0) {
        // Find node in openSet with lowest f cost
        let lowestIndex = 0;
        for (let i = 0; i < openSet.length; i++) {
            if (openSet[i].f < openSet[lowestIndex].f) {
                lowestIndex = i;
            } else if (openSet[i].f === openSet[lowestIndex].f) {
                // Tie breaker using h cost
                if (openSet[i].h < openSet[lowestIndex].h) {
                    lowestIndex = i;
                }
            }
        }

        let currentNode = openSet[lowestIndex];

        // If Target Reached
        if (currentNode.x === endNode.x && currentNode.y === endNode.y) {
            let path = [];
            let temp = currentNode;
            while (temp.parent) {
                path.push({x: temp.x, y: temp.y});
                temp = temp.parent;
            }
            path.reverse();

            self.postMessage({
                success: true,
                path: path,
                visited: visitedNodesInOrder,
                time: (performance.now() - startTime).toFixed(2)
            });
            return;
        }

        // Move current node from open to closed
        openSet.splice(lowestIndex, 1);
        closedSet.add(`${currentNode.x},${currentNode.y}`);
        visitedNodesInOrder.push({x: currentNode.x, y: currentNode.y});

        // Check neighbors
        let neighbors = getNeighbors(currentNode, grid, cols, rows);
        for (let neighbor of neighbors) {
            if (closedSet.has(`${neighbor.x},${neighbor.y}`)) continue;

            // Distance to neighbor is 1 for straight, ~1.414 for diagonal
            const isDiagonal = Math.abs(currentNode.x - neighbor.x) === 1 && Math.abs(currentNode.y - neighbor.y) === 1;
            const stepCost = isDiagonal ? Math.SQRT2 : 1;
            const tentative_g = currentNode.g + stepCost;

            let newPathToNeighbor = false;
            let inOpenSet = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);

            if (!inOpenSet) {
                newPathToNeighbor = true;
                openSet.push(neighbor);
            } else if (tentative_g < neighbor.g) {
                newPathToNeighbor = true;
            }

            if (newPathToNeighbor) {
                neighbor.parent = currentNode;
                neighbor.g = tentative_g;
                neighbor.h = getEuclideanDistance(neighbor, endNode);
                neighbor.f = neighbor.g + neighbor.h;
            }
        }
    }

    // Loop finished without reaching end
    self.postMessage({
        success: false,
        path: [],
        visited: visitedNodesInOrder,
        time: (performance.now() - startTime).toFixed(2)
    });
};