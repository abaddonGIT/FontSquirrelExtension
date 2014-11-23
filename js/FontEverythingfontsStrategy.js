/**
 * Created by abaddon on 23.11.2014.
 */
/*global w, d, ch, console*/
var FontEverythingfontsStrategy = function () {
    var that = this;
    this.init = function () {
        this.generate = d.querySelector("form#generate");
        this.download = this.generate.querySelector("button");

        this.urls = {
            "generate": "http://everythingfonts.com/font-face"
        };

        this.addEvents();
    };

    this.addEvents = function () {
        this.download.addEventListener("click", this.convertFont, false);
        this.finalBlock.style.display = "block";
    };

    this.removeEvents = function () {
        this.download.removeEventListener("click", this.convertFont, false);
        this.finalBlock.style.display = "none";
    };

    this.convertFont = function (e) {
        var file = that.target.files.length ? that.target.files[0] : null,
            agreement = that.agreement.checked ? "yes" : false;
        e.preventDefault();
        if (file) {
            if (agreement) {
                var datas = [
                    {
                        "name": "ttffile",
                        "value": file
                    },
                    {
                        "name": "permission",
                        "value": agreement
                    }
                ];
                that.loderState(true);
                that.createXHR(datas, that.urls.generate, true).then(function (response) {
                    ch.downloads.download({
                        url: w.URL.createObjectURL(response),
                        filename: file.name + ".zip"
                    });
                    that.clearForm();
                    that.loderState(false);
                }, function (error) {
                    that.showNotification("Ошибка во время исполнения запроса", "error");
                    that.loderState(false);
                });
            } else {
                that.showNotification("Вы не согласились с условием использования!", "agreement");
            }
        } else {
            that.showNotification("Вы не загрузили исходный шрифт!", "agreement");
        }
    };
};
FontEverythingfontsStrategy.prototype = Object.create(FontConverterStrategy.prototype);