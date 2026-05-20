class SOCEngine {
    constructor() {
        this.initNavigation();
        this.populateNodes();
    }

    initNavigation() {
        const navBtns = document.querySelectorAll('.nav-btn[data-target]');
        const modules = document.querySelectorAll('.module');

        navBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                navBtns.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');

                const target = e.currentTarget.getAttribute('data-target');
                modules.forEach(m => m.classList.remove('active'));
                document.getElementById(target).classList.add('active');
            });
        });
    }

    populateNodes() {
        // CDAC locations derived from PDF
        const nodes = [
            { name: "Pune (HO)", status: "online" },
            { name: "Kolkata", status: "active" }, // Highlighted regional node
            { name: "New Delhi", status: "online" },
            { name: "Bengaluru", status: "online" },
            { name: "Hyderabad", status: "online" },
            { name: "Thiruvananthapuram", status: "online" }
        ];

        const list = document.getElementById('regional-nodes');
        list.className = 'node-list';
        nodes.forEach(node => {
            const li = document.createElement('li');
            li.textContent = `${node.name} Node`;
            if (node.status === 'active') {
                li.classList.add('active-node');
                li.style.color = 'var(--cdac-green-light)';
            }
            list.appendChild(li);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.socGrid = new SOCEngine();
});