class ShakeBar extends KDView

  viewAppended:->
    
    @setClass "bar"
    @addSubView @name = new KDView
      tagName  : "h2"
    @addSubView @inner = new KDView
    @inner.setRandomBG()
    @setName @getData()?.name

    # interval = setInterval =>
    #   @grow()
    #   if @parent.getHeight() - 20 < @getHeight()
    #     @parent.emit "ThereIsAWinner", @getData()
    # , 5000

    @parent.on "ThereIsAWinner", =>
      clearInterval interval

  setName:(name)->

    @setClass "named" if name
    @name.updatePartial name or "empty"

  grow:->
    if @inner.getHeight() < @getHeight()
      @inner.setHeight @inner.getHeight() + @utils.getRandomNumber 50

  shrink:->