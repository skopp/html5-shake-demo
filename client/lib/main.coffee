do ->

  log "app started"
  # register this in framework
  KD.registerSingleton "windowController", new KDWindowController
  mainController = new ShakeController
