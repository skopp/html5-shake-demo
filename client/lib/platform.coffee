class ShakePlatform extends KDView

  constructor:->

    super
    @bars = []
    @setKeyView()
    @createPlaceholders()
    @on "ThereIsAWinner", (winner)=>
      alert "And the winner is:" + winner.name

  click:->

    @setKeyView()

  keyDown:(event)->

    switch event.which
      when 37, 39 then do @addBar

  createPlaceholders:->
    
    @addBar() for i in [0..9]

  addBar:(data)->
    
    if data
      for bar in @bars
        unless bar.getData()
          bar.setData data
          bar.setName data.name
          return
      
    @addSubView newBar = new ShakeBar {}, data
    @bars.push newBar
    @repositionBars()

  removeBar:(data)->

  repositionBars:->

    amount = @bars.length
    if amount > 10
      areaWidth = @getWidth()
      barWidth = areaWidth / amount
      for bar,i in @bars
        bar.$().css 
          width       : "#{89/amount}%"
          marginRight : "#{10/(amount-1)}%"
