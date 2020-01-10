import 'reflect-metadata';
import 'module-alias/register';
import 'ts-node/register';

import {initApp} from '~/init';
import {runApp} from '~/app';

const bootstrap = async () => {
    await initApp();
    await runApp();
};

bootstrap()
    .catch((err) => console.log(err));
