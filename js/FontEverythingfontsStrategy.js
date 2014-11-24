/**
 * Created by abaddon on 23.11.2014.
 */
/*global w, d, ch, console*/
var FontEverythingfontsStrategy = function () {
    "use strict";
    var that = this;
    this.init = function () {
        this.urls = {
            "generate": "http://everythingfonts.com/font-face"
        };
        this.addEvents();
    };

    this.convertFont = function (e) {
        var file = that.target.files.length ? that.target.files[0] : null,
            agreement = that.agreement.checked ? "yes" : false;
        e.preventDefault();
        if (that.checkMimeType(file)) {
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
                    if (response.type === "text/html") {
                        that.showNotification("Данный шрифт не подлежит конвертации!", "error");
                    } else {
                        ch.downloads.download({
                            url: w.URL.createObjectURL(response),
                            filename: file.name + ".zip"
                        });
                    }
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
            that.showNotification("Вы не загрузили исходный шрифт, или загрузили неправильный формат!", "agreement");
        }
    };
};
FontEverythingfontsStrategy.prototype = Object.create(FontConverterStrategy.prototype);