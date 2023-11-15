# Proto-Ozma: FFXIV Adventuring Foray Scheduling Discord Bot
Proto-Ozma is a bot designed for scheduling and organzing various FFXIV adventuring foray content. Currently it is built for the Baldesion Arsenal as well as Delubrum Reginae (Savage).

## How to use
1. Clone the repo
2. Install MariaDB if you don't already have a MariaDB database to access: https://mariadb.org/
3. Run the commands in ``proto-ozma.sql`` in MariaDB
4. Configure ``examplecofig.jsonc`` for your bot and server and rename it to ``config.json``
5. In the root directory add a ``blacklist`` and ``ozmablack`` file
6. In ``./functions/TimeFunctions`` add a ``exblacklist`` file
7. In the root directory, run ``npm i``
8. Run ``npm run dev``!

If using Docker, a Dockerfile is provided so you can skip steps 7 and 8.