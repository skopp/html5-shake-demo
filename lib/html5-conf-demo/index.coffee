Broker = require 'broker'
Bongo = require 'bongo'

broker = new Broker
    host        : 'zb.koding.com'
    login       : 'html5'
    password    : 'Uo5v18dG08X687C'
    vhost       : 'html5'

scorekeeper = new Bongo                                                                                                                 
    mongo         : 'html5:wCK7qLtQDn3uuPs@alex.mongohq.com:10050/html5demo'
    mq            : broker
    models        : './models'
    root          : __dirname
    queueName     : 'html5'

scorekeeper.connect()