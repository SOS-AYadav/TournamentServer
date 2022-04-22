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

module.exports = {
    generateKey,
    shufflePlayersId,
};
