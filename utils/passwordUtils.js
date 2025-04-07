const crypto = require('crypto');
const { promisify } = require('util');
const pbkdf2 = promisify(crypto.pbkdf2);

async function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = await pbkdf2(password, salt, 1000, 64, 'sha512');
    return {
        salt,
        hash: hash.toString('hex')
    };
}

async function verifyPassword(password, hash, salt) {
    const hashVerify = await pbkdf2(password, salt, 1000, 64, 'sha512');
    return hash === hashVerify.toString('hex');
}

module.exports = { hashPassword, verifyPassword };