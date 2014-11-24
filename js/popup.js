/**
 * Created by abaddon on 20.11.2014.
 */
/*
 global w, d, ch
 */
(function (FontConverterStrategy, FontSquirrelStrategy, FontEverythingfontsStrategy, FontFont2webStrategy) {
    "use strict";
    var FontConverter = function (strategy) {
        this.strategy = strategy;

        this.run = function () {
            return this.strategy.run();
        };
    };

    w.onload = function () {
        var converter = d.querySelector("#convertor-select");
        //По дефолту
        var fontsquirrel = new FontConverter(new FontSquirrelStrategy()), everythingfonts = null, font2web = null;
        fontsquirrel.run();

        converter.addEventListener("change", function () {
            var val = this.value;
            switch (val) {
                case "fontsquirrel":
                    fontsquirrel.strategy.clearForm();
                    fontsquirrel.strategy.addEvents();
                    if (everythingfonts) {
                        everythingfonts.strategy.removeEvents();
                    }
                    if (font2web) {
                        font2web.strategy.removeEvents();
                    }
                    break;
                case "everythingfonts":
                    fontsquirrel.strategy.clearForm();
                    fontsquirrel.strategy.removeEvents();
                    if (font2web) {
                        font2web.strategy.removeEvents();
                    }
                    if (!everythingfonts) {
                        everythingfonts = new FontConverter(new FontEverythingfontsStrategy());
                        everythingfonts.run();
                    } else {
                        everythingfonts.strategy.addEvents();
                    }
                    break;
                case "font2web":
                    fontsquirrel.strategy.clearForm();
                    fontsquirrel.strategy.removeEvents();
                    if (everythingfonts) {
                        everythingfonts.strategy.removeEvents();
                    }
                    if (!font2web) {
                        font2web = new FontConverter(new FontFont2webStrategy());
                        font2web.run();
                    } else {
                        font2web.strategy.addEvents();
                    }
                    break;
            }
        }, false);
    };

}(FontConverterStrategy, FontSquirrelStrategy, FontEverythingfontsStrategy, FontFont2webStrategy));