






function testEqualTo(answer, desiredAnswer, testName) {
    if (_.isEqual(answer, desiredAnswer)) {
        logGreen("test " +testName +" succeded")
        verboseLog(answer)
    }
    else {
        logRed("test " +testName +" failed")
        log("desiredAnswer:")
        log(desiredAnswer)
        log("actualAnswer:")
        log(answer)
    }
}

