class ShakeController extends KDController

  constructor:(options, data)->

    super
    @players = {}
    @addPlatform()
    @addJoinView()
    @connect()

  connect:->

  allowPlayerToStart:->

  addPlayer:(name)->

    unless @players[name]
      @players[name] = {
        name
        score : 0
      }
      @platform.addBar @players[name]
      @players[name]
    else
      no

  removePlayer:->

  addPlatform:->

    {container} = @getOptions()
    
    @platform = new ShakePlatform
      domId : "platform"
    
    if container
      container.addSubView @platform
    else
      KDView.appendToDOMBody @platform

  addJoinView:->

    KDView.appendToDOMBody joinView = new KDView
      cssClass : "join-view"

    joinView.addSubView joinButton = new KDButtonView
      title    : "Join the game!"
      cssClass : "punch"
      callback : @showJoinModal.bind @

  showJoinModal:->
    controller = @
    {utils}    = @
    modal      = new KDModalViewWithForms
      title                   : "Join to shake :)"
      width                   : 500
      height                  : "auto"
      tabs                    :
        navigable             : yes
        forms                 :
          join                :
            callback          : ({name})=>
              
              if @addPlayer name
                modal.destroy()
                controller.allowPlayerToStart()
              else
                modal.modalTabs.forms["join"].buttons["I wanna shake, take me in!"].hideLoader()
                new KDNotificationView title : 'Name taken, choose another name please!'
            buttons           :
              "I wanna shake, take me in!" :
                type          : "submit"
                loader        :
                  color       : "#ffffff"
                  diameter    : 20
            fields            :
              name            :
                label         : "Your name:"
                name          : "name"
                placeholder   : "type your name to start!"

    modal.modalTabs.forms["join"].inputs.name.$().trigger "focus"
