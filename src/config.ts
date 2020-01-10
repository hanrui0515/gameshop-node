const config: Application.Configuration = {
    database: {
        mongo: {
            instances: [{
                host: 'localhost',
                port: 27017,
                database: 'game_shop',
            }],
        }
    },
};

export = config;
