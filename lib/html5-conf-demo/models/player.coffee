{Model} = require 'bongo'

module.exports = class Player extends Model
    @share()
    @set
        feedable        : yes
        sharedMethods   :
            static      : ['participate','all']
            instance    : ['shake']
        schema          :
            name        : String
            score       : Number
            date        : Date
    
    @participate =(name, callback)->
        player = new @ {
            name,
            score: 0
            date: new Date
        }
        player.save (err)->
            callback err, player
    
    shake:(playerId, amount, callback)->
        Player.update {_id: playerId}, $inc:{score:amount}, (err)->
            callback null