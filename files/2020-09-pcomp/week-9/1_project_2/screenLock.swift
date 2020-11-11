let dnc = DistributedNotificationCenter.default()

lockObserver = dnc.addObserver(forName: .init("com.apple.screenIsLocked"),
                               object: nil, queue: .main) { _ in
    NSLog("Screen Locked")
}

unlockObserver = dnc.addObserver(forName: .init("com.apple.screenIsUnlocked"),
                                 object: nil, queue: .main) { _ in
    NSLog("Screen Unlocked")
}
