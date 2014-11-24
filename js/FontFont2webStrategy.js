/**
 * Created by abaddon on 24.11.2014.
 */
/*global w, d, ch, console*/
var FontFont2webStrategy = function () {
    "use strict";
    var that = this;

    this.urls = {
        "generate": "http://www.font2web.com/convert.php"
    };

    this.init = function () {
        //добавляем обработчик
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
                        "name": "MAX_FILE_SIZE",
                        "value": 999999
                    },
                    {
                        "name": "permission",
                        "value": agreement
                    },
                    {
                        "name": "userfile",
                        "value": file
                    },
                    {
                        "name": "x",
                        "value": 125
                    },
                    {
                        "name": "y",
                        "value": 41
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

FontFont2webStrategy.prototype = Object.create(FontConverterStrategy.prototype);