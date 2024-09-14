import { Terminal as Xterminal } from 'xterm';
import { useEffect, useRef } from 'react';
import 'xterm/css/xterm.css';
import socket from '../../utils/socket';

const Terminal = () => {
    const terminalRef = useRef();
    const isRendered = useRef(false);
    const commandBuffer = useRef(''); // Buffer to hold the command until 'Enter' is pressed

    useEffect(() => {
        if (isRendered.current) return;

        isRendered.current = true;

        const term = new Xterminal({
            rows: 20,
        });
        term.open(terminalRef.current);

        term.onData(data => {
            // Detect when the user presses 'Enter'
            if (data === '\r') {
                socket.emit('terminal:write', commandBuffer.current); // Send the full command
                commandBuffer.current = ''; // Reset the buffer after sending
            } else if (data === '\u007F') {
                // Handle backspace
                if (commandBuffer.current.length > 0) {
                    commandBuffer.current = commandBuffer.current.slice(0, -1);
                    term.write('\b \b'); // Erase the last character from the terminal display
                }
            } else {
                commandBuffer.current += data; // Append to the command buffer
                term.write(data); // Display the character in the terminal
            }
        });

        socket.on('terminal:data', (data) => {
            term.write('\r\n');
            term.write(data);
        });
    }, []);

    return (
        <div ref={terminalRef} id='Terminal'></div>
    );
};

export default Terminal;