/**
 * Simulated File System & Explorer Tree
 */
window.FileSystem = {
    files: [
        { name: "main.c", type: "c", content: "#include <stdio.h>\n#include <omp.h>\n\nint main() {\n    #pragma omp parallel\n    {\n        printf(\"Hello from thread %d\\n\", omp_get_thread_num());\n    }\n    return 0;\n}" },
        { name: "matrix_mult.c", type: "c", content: "/* MPI Matrix Multiplication */\n#include <mpi.h>\n#include <stdio.h>\n\nint main(int argc, char** argv) {\n    MPI_Init(&argc, &argv);\n    // Implementation here\n    MPI_Finalize();\n    return 0;\n}" },
        { name: "kernel.cu", type: "cuda", content: "__global__ void vecAdd(float *A, float *B, float *C, int N) {\n    int i = blockDim.x * blockIdx.x + threadIdx.x;\n    if (i < N) C[i] = A[i] + B[i];\n}" },
        { name: "Makefile", type: "make", content: "CC=mpicc\nCFLAGS=-O3 -fopenmp\n\nall: main\n\nmain: main.c\n\t$(CC) $(CFLAGS) -o main main.c" }
    ],
    activeFileIndex: 0,

    init() {
        const tree = document.getElementById('file-tree');
        tree.innerHTML = '<div class="folder">▼ src/</div>';

        this.files.forEach((file, index) => {
            const el = document.createElement('div');
            el.className = `file ${index === 0 ? 'active' : ''}`;
            el.innerHTML = `📄 ${file.name}`;
            el.onclick = () => this.loadFile(index);
            tree.appendChild(el);
        });

        this.loadFile(0);
    },

    loadFile(index) {
        this.activeFileIndex = index;

        // Update tree UI
        document.querySelectorAll('.file').forEach((el, i) => {
            el.classList.toggle('active', i === index);
        });

        // Update Editor Tabs
        const tabs = document.getElementById('editor-tabs');
        tabs.innerHTML = `<div class="tab active">📄 ${this.files[index].name}</div>`;

        // Update Status Bar
        document.getElementById('file-type').textContent = this.files[index].name.split('.').pop().toUpperCase();

        // Load Content into Editor
        window.CodeEditor.setContent(this.files[index].content);
    }
};

document.addEventListener('DOMContentLoaded', () => window.FileSystem.init());