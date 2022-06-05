const generateKey = (size) => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('');

    const random_data = [];
    while (size--) {
        random_data.push(chars[(Math.random() * chars.length) | 0]);
    }
    return random_data.join('');
};

const shufflePlayersId = (playersId) => {
    for (let i = playersId.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [playersId[i], playersId[j]] = [playersId[j], playersId[i]];
    }
};

const calculateWinner = (gridValues) => {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (const line of lines) {
        const [a, b, c] = line;
        if (
            gridValues[a] !== '#' &&
            gridValues[a] === gridValues[b] &&
            gridValues[a] === gridValues[c]
        ) {
            return true;
        }
    }
    return false;
};

module.exports = {
    generateKey,
    shufflePlayersId,
    calculateWinner,
};
