const http = require('http');
const express = require('express');
const { Server: SocketServer } = require('socket.io');
const termkit = require('terminal-kit');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs').promises; // Use fs.promises for async operations
const cors = require('cors');
const chokidar = require('chokidar');

const app = express();
app.use(cors());

app.get('/files', async (req, res) => {
    try {
        const fileTree = await generateFileTree(`${process.cwd()}/user`); // Restrict to /user directory
        return res.json({ tree: fileTree });
    } catch (error) {
        return res.status(500).json({ error: error.message });

    }
});

app.get('/files/content', async(req,res)=>{
    try {
        const path = req.query.path;
        const content = await fs.readFile(`./user${path}`,'utf-8');
        return res.json({content})
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }

})

const server = http.createServer(app);

const io = new SocketServer({
    cors: '*',
});

io.attach(server);

chokidar.watch(`./user`).on('all',(event,path)=>{
    io.emit('file:refresh',path);
    console.log(event,path);
});

const term = termkit.terminal;

term.clear();
term.green("Welcome to the Terminal Interface!\n");

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('file:change',async ({path,content})=>{
        await fs.writeFile(`./user${path}`,content)
    })

    let baseDir = path.resolve(`${process.cwd()}/user`); // Set the base directory
    let cwd = baseDir; // Initialize cwd to be /user
    io.emit('terminal:data', `${cwd}> `);

    function handleUserInput() {
        term.inputField({ history: [], autoComplete: [] }, (error, input) => {
            if (input) {
                executeCommand(input);
                handleUserInput(); // Restart input handling
            }
        });
    }

    handleUserInput();

    // Function to execute commands and handle 'cd' separately
    const executeCommand = (command) => {
        const parts = command.trim().split(' ');

        if (parts[0] === 'cd') {
            // Handle 'cd' command manually and restrict directory traversal
            let newDir = parts[1] ? path.resolve(cwd, parts[1]) : baseDir;
            if (newDir.startsWith(baseDir)) {
                // Change directory only if it's within the baseDir
                fs.access(newDir)
                    .then(() => {
                        cwd = newDir;
                        socket.emit('terminal:data', `${cwd}> `);
                    })
                    .catch(() => {
                        socket.emit('terminal:data', `Error: Directory does not exist\n${cwd}> `);
                    });
            } else {
                // Prevent navigating outside the base directory
                socket.emit('terminal:data', `Error: Access outside /user directory is restricted\n${cwd}> `);
            }
        } else {
            // Execute other commands in the current directory
            exec(command, { cwd }, (err, stdout, stderr) => {
                if (err) {
                    socket.emit('terminal:data', `Error: ${stderr}\n${cwd}> `);
                    term.red(`Error: ${stderr}\n`);
                } else {
                    socket.emit('terminal:data', `${stdout}\n${cwd}> `);
                    term.green(`Output: ${stdout}\nCWD: ${cwd}\n`);
                }
            });
        }
    };

    socket.on('terminal:write', (data) => {
        term.yellow(`Client input: ${data}\n`);
        executeCommand(data);
    });
});

server.listen(8000, () => {
    console.log("🐳 Docker Server is running on port 8000");
});

// Corrected generateFileTree function
async function generateFileTree(directory) {
    const tree = {};

    async function buildTree(currentDir, currentTree) {
        const files = await fs.readdir(currentDir); // Get files in the current directory

        for (const file of files) {
            const filePath = path.join(currentDir, file);
            const stat = await fs.stat(filePath);

            if (stat.isDirectory()) {
                currentTree[file] = {}; // Create a subtree for directories
                await buildTree(filePath, currentTree[file]); // Recursively build the subtree
            } else {
                currentTree[file] = null; // Mark files as null (or some other value)
            }
        }
    }

    await buildTree(directory, tree);
    return tree;
}
