/**
 * Created by abaddon on 20.11.2014.
 */
/*
 global window, document, chrome
 */
(function (w, d, ch, FontConverterStrategy, FontSquirrelStartegy) {
    "use strict";
    var FontConverter = function (strategy) {
        this.strategy = strategy;

        this.run = function () {
            return this.strategy.run();
        };
    };

    w.onload = function () {
        var converter = new FontConverter(new FontSquirrelStartegy());
        converter.run();
    };

}(window, document, chrome, FontConverterStrategy, FontSquirrelStartegy));