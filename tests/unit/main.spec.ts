import Axios from 'axios';
import createSocketClient from 'socket.io-client';
import Chance from 'chance';
import Crypto from 'crypto';

describe('API testing', () => {

    const axios = Axios.create({
        baseURL: 'http://127.0.0.1:62180/',
    });
    const chance = new Chance();

    const userData = new Array(5).map(() => {
        const password1 = Crypto.createHash('MD5').update(chance.string({length: 16,})).digest().toString();
        const password2 = Crypto.createHash('MD5').update(chance.string({length: 16,})).digest().toString();

        return {
            name: chance.string({length: 8, alpha: true}),
            password: password1,
            passwordConfirmed: chance.bool() ? password1 : password2,
            nickname: chance.name(),
        };
    });

    it('UserEntity registration', async (done) => {
        for (let i in userData) {
            const response = await axios.put('/api/v1/user/register', userData[i]);

            expect(response.data.error).toBeNull();
        }

        done();
    });
});

describe('WebSocket testing', () => {
    it('Establish connection to server', async (done) => {
        jest.setTimeout(5000);

        const client = createSocketClient('http://localhost:62180', {path: '/ws'});

        client.connect();

        const promise = new Promise((resolve) => {
            client.on('connect', () => {
                resolve(true);
            })
        });

        const timer = new Promise((resolve) => {
            setTimeout(() => {
                resolve(false);
            }, 3000);
        });

        const result = await Promise.race([promise, timer]);
        client.close();

        expect(result).toBeTruthy();

        done();
    });

});

