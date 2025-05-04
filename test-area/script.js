const circle = document.getElementById('circle');
const button = document.getElementById('myButton');
const test = document.getElementById('test');
const instructions = document.getElementById('extrainstructions');
let interval;

let turn = 1;
let maxTest = 5;
let total_trials = {};

let pressCount = 0;
let lastPressTime = null;
let touches = {};
let buttonPressed = false;
let position = 0;
let maxPosition = 1050;

for (let i = 1; i <= maxTest; i++) {
    total_trials[i] = [];
}

function downloadCSV(total_trials) {
    const csvRows = [];
    csvRows.push(['true_pixels_per_second', 'user_pixels_per_second', 'error_margin']);

    for (let i = 1; i <= maxTest; i++) {
        if (total_trials[i].length >= 3) { 
            const realPixelsPerSecond = total_trials[i][0];
            const userPixelsPerSecond = total_trials[i][1];
            const errorMargin = total_trials[i][2];
            csvRows.push([realPixelsPerSecond, userPixelsPerSecond, errorMargin]);
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

function startTrial() {
    const durationSeconds = Math.floor(Math.random() * (60 - 2 + 1)) + 2;
    const durationMs = durationSeconds * 1000;
    const realPixelsPerSecond = maxPosition / durationSeconds;

    total_trials[turn].push(realPixelsPerSecond);

    startMovingCircle(durationMs);

    buttonPressed = true;
}

function startMovingCircle(durationMs) {
    position = 0;
    circle.style.left = `${position}px`;
    
    interval = setInterval(() => {
        if (position < maxPosition) {
            position++;
            circle.style.left = `${position}px`;
        }
    }, durationMs / maxPosition);
    
}


document.addEventListener('keydown', function (event) {
    if (event.code === 'ArrowRight' && pressCount < 2 && buttonPressed) {
        console.log(`Right Arrow clicked: ${pressCount}`);
        const currentTime = new Date().getTime();

        if (lastPressTime !== null) {
            let timeDifference = currentTime - lastPressTime;
            touches[`(${pressCount - 1},${pressCount})`] = timeDifference;
        }

        lastPressTime = currentTime;
        pressCount++;
    }

    if (pressCount === 2) {
        console.log(touches);
        const timeDifferences = Object.values(touches);
        const total = timeDifferences.reduce((acc, curr) => acc + curr, 0);
        const mean = total / timeDifferences.length;

        
        const userPixelsPerSecond = maxPosition / (mean/10);

        total_trials[turn].push(userPixelsPerSecond); 
        
        const error = total_trials[turn][0] - total_trials[turn][1];
        total_trials[turn].push(error); 

        console.log(`The real pixels per second were ${total_trials[turn][0]}, but the user got ${total_trials[turn][1]}, they have a ${Math.abs(total_trials[turn][2])} difference.`);

        
        touches = {};
        pressCount = 0;
        lastPressTime = null;
        turn++;

        clearInterval(interval);
        circle.style.left = '0px';

        
        if (turn <= maxTest) {
            test.textContent = `Prueba ${turn}/${maxTest}`;
            instructions.textContent = "";
            startTrial();
        }

        
        if (turn > maxTest) {
            downloadCSV(total_trials);
            button.disabled = true;
            window.location.href = 'final.html';
        }
    }
});

button.addEventListener('click', () => {
    startTrial(); 
});
