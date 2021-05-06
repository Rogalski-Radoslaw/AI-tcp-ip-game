const mainSection = document.body.querySelector('section#main');

const findButton = (name) => document.body.querySelector(`nav button[name="${name}"]`);

const buttons = {
    start: findButton('start'),
    rematch: findButton('rematch'),
    pause: findButton('pause'),
    toggleRestart: () => {
        buttons.start.disabled = !buttons.start.disabled;
        buttons.rematch.disabled = !buttons.rematch.disabled;
    },
    togglePause: () => {
        buttons.pause.disabled = !buttons.pause.disabled;
    }
};

const game = {
    started: false,
    paused: false,
    pauseRequested: false,
    start: () => {
        game.started = true;
        buildGameBoard();
        drawn.length = 0;
        drawTarget();
        timer.startT1();
        buttons.togglePause();
    },
    pause: () => {
        game.paused = !game.paused;
        buttons.pause.textContent = (game.paused) ? 'odpauzuj' : 'zapauzuj';
        mainSection.classList.toggle('paused');
    },
    requestPause: () => {
        if (game.started) {
            game.pauseRequested = !game.pauseRequested;
            if (!game.paused) {
                buttons.pause.textContent = (game.pauseRequested) ? 'anuluj' : 'zapauzuj';
            } else {
                game.pause();
                drawTarget();
            }
        }
    },
    finish: () => {
        game.started = false;
        clearInterval(timer.t1);
        buttons.togglePause();
        buttons.toggleRestart();
    }
};

const countdown = () => {
    buttons.toggleRestart();
    player.clearPoints();
    output('time', 0);
    const flashes = ['ready', 'steady', 'go'];
    for (let i = 0; i < flashes.length; i++) {
        setTimeout(() => {
            const f = flashes[i];
            mainSection.innerHTML = `<h1>${f}</h1>`;
            const c = mainSection.classList;
            (i === 0 && !c.replace('datagram', f)) ? c.add(f) : c.replace(flashes[i - 1], f);
            if (i === flashes.length - 1)
                setTimeout(game.start, 1500);
        }, 2000 * i);
    }
};

const player = {
    name: null,
    score: 0,
    setName: (name) => {
        if (name !== '' && name !== null && name.length <= 8) {
            output('name', player.name = name);
            return true;
        } else {
            return false;
        }
    },
    addPoints: (value) => {
        if ((player.score + value) >= 0)
            player.score += value;
        output('score', player.score);
    },
    clearPoints: () => {
        output('score', player.score = 0);
    }
};

let target;
const drawn = [];
const drawTarget = () => {
    clearInterval(timer.t2);
    if (!game.pauseRequested) {
        const r = Math.floor(Math.random() * fields.length);
        if (!drawn.includes(fields[r]) && target !== fields[r]) {
            drawn.push(target = fields[r]);
            output('target', target.value);
            timer.startT2();
        } else if (drawn.length < fields.length) {
            drawTarget();
        } else {
            game.finish();
        }
    } else {
        timer.t2 = null;
        game.pause();
    }
};

const timer = {
    t1: null,
    t2: null,
    startT1: () => {
        let seconds = 1;
        timer.t1 = setInterval(() => {
            if (timer.t2 !== null)
                output('time', seconds++);
        }, 1000);
    },
    startT2: () => {
        let remaining = 5000;
        timer.t2 = setInterval(() => {
            if (remaining <= 0) {
                player.addPoints(-1);
                drawn.pop();
                drawTarget();
            }
            remaining -= 10;
            document.body.querySelector('aside hr').style.width = remaining / 5000 * 100 + '%';
        }, 10);
    }
};

const fields = [
    { area: '2 / 2 / 3 / 18', value: "Source port" },
    { area: '2 / 18 / 3 / 34', value: "Destination port" },
    { area: '3 / 2 / 4 / 34', value: "Sequence number" },
    { area: '4 / 2 / 5 / 34', value: "Ack number" },
    { area: '5 / 2 / 6 / 6', value: "Data offset" },
    { area: '5 / 6 / 6 / 12', value: "Reserved" },
    { area: '5 / 12 / 6 / 18', value: "Flags" },
    { area: '5 / 18 / 6 / 34', value: "Window size" },
    { area: '6 / 2 / 7 / 18', value: "Header and Data checksum" },
    { area: '6 / 18 / 7 / 34', value: "Urgent pointer" },
    { area: '7 / 2 / 8 / 34', value: "Options" }
];

const buildGameBoard = () => {
    mainSection.innerHTML = '';
    mainSection.classList.replace('go', 'datagram');
    for (let i = -1; i < 38; i++) {
        const cell = document.createElement('div');
        cell.classList.add('leading');
        cell.textContent = (i === -1) ? 'Bit #' : i;
        if (i < 32) {
            cell.style.gridRowStart = 1;
            cell.style.gridColumnStart = i + 2;
        } else {
            cell.style.gridRowStart = i - 30;
            cell.style.gridColumnStart = 1;
            cell.textContent = ['0', '32', '64', '96', '128', '160'][i - 32];
        }
        mainSection.appendChild(cell);
    }
    for (let i = 0; i < fields.length; i++) {
        const cell = document.createElement('div');
        cell.style.gridArea = fields[i].area;
        cell.addEventListener('click', (e) => {
            if (game.started && !game.paused && !e.target.textContent) {
                if (e.target.style.gridArea === target.area) {
                    player.addPoints(1);
                    e.target.textContent = target.value;
                } else {
                    player.addPoints(-1);
                    drawn.pop();
                }
                drawTarget();
            }
        });
        mainSection.appendChild(cell);
    }
};

const output = (name, value) => {
    document.body.querySelector(`output[name="${name}"]`).textContent = value;
};

const init = () => {
    buttons.start.addEventListener('click', () => {
        if (player.setName(prompt('podaj nazwe gracza (max 8 znakow):'))) {
            if (buttons.rematch.disabled)
                buttons.rematch.disabled = false;
            countdown();
        }
    });
    buttons.rematch.addEventListener('click', countdown);
    buttons.pause.addEventListener('click', game.requestPause);
};

window.addEventListener('load', init);