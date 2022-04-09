const generateRandomData = (size) => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('');

    const random_data = [];
    while (size--) {
        random_data.push(chars[(Math.random() * chars.length) | 0]);
    }
    return random_data.join('');
};

module.exports = {
    generateRandomData,
};
