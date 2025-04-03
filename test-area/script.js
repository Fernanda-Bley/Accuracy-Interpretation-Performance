let position = 50; 
const circle = document.querySelector('circle'); 
const button = document.getElementById('myButton'); 
const test = document.getElementById('test');
const instructions = document.getElementById('extrainstructions');
let interval; 
const note_durations_ms = [
    750,      // One and a half note
    2000,     // Whole note
    1500,     // Three quarters note
    1000,     // Half note
    750,      // Three eighth note
    500,      // Quarter note
    375,      // Three sixteenth note
    250,      // Eighth note
    187.5,    // Three thirty-second note
    125      // Sixteenth note
];
let turn = 1; 
let maxTest = 5;
let total_trials = {
};

for (let i = 1; i <= maxTest; i++) {
    total_trials[i] = []; 
}

let wait;
let buttonPressed = false;


// Created by BlackBox "How do I make a CSV from my object total_trials"

function downloadCSV(total_trials) {
    console.log("Starting trials");
    const csvRows = [];
    csvRows.push(['true_milisecond', 'user_miliseconds', 'error_margin']);

    for (let i = 1; i < maxTest; i++) {
        if (total_trials[i].length >= 3) {
            csvRows.push([total_trials[i][0], total_trials[i][1], total_trials[i][2]]);
        }
    }

    const csvString = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'trial_results.csv');
    a.click();
    URL.revokeObjectURL(url);
}

button.addEventListener('click', () => {
    clearInterval(interval);
    let wait = note_durations_ms[Math.floor(Math.random() * note_durations_ms.length)];
    total_trials[turn].push(wait)
    

    // Reset position to the starting point if it has reached the end
    if (position >= 600) {
        position = 50;
    }
    console.log(`Advancing at ${wait}ms`)

    // Circle Moves
    interval = setInterval(() => {
        if (position < 600) { 
            position += 100; 
            circle.setAttribute('cx', position);
        } else {
            buttonPressed = true;
            instructions.textContent = "Click the right arrow 6 times at the frequency you think the red dot moved.";
            clearInterval(interval);
        }
    }, wait);
    
    
});

let lastPressTime = null;
let pressCount = 0;
let touches = {};

document.addEventListener('keydown', function(event) {
    if (event.code === 'ArrowRight' && pressCount < 6 && buttonPressed) {
        console.log(`Right Arrow clicked: ${pressCount}`);
        const currentTime = new Date().getTime(); // Get current time in milliseconds

        if (lastPressTime !== null) {
            let timeDifference = currentTime - lastPressTime; // Calculate time difference
            touches[`(${pressCount - 1},${pressCount})`] = timeDifference; // Store in the object
        }

        lastPressTime = currentTime;
        pressCount++;
    }
    if (pressCount === 6) {
        console.log(touches); 
        const timeDifferences = Object.values(touches); 
        const total = timeDifferences.reduce((acc, curr) => acc + curr, 0);
        const mean = total / timeDifferences.length;
        total_trials[turn].push(mean); 
        const error = total_trials[turn][0] - total_trials[turn][1]
        total_trials[turn].push(error);
        console.log(`The time was ${total_trials[turn][0]} but the person got ${total_trials[turn][1]}, they have a ${Math.abs(total_trials[turn][2])} difference.`);

        // restarting values
        touches = {};
        pressCount = 0;
        lastPressTime = null;
        turn++;
        test.textContent = `Trial ${turn}/${maxTest}`;
        instructions.textContent = "";
        circle.setAttribute('cx', 50);
        buttonPressed = false;

        // After last round
        if (turn === maxTest) {
            downloadCSV(total_trials);
            button.disabled = true;
            window.location.href = 'final.html';
        }
    }
});

