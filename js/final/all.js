/**
 * Created by abaddon on 22.11.2014.
 * description - base app object
 */
/*global w, d, ch, console*/
var FontConverterStrategy = function () {
};

FontConverterStrategy.prototype = {
    run: function () {
        this.target = d.querySelector("input[type=file]");//Источник
        this.preloder = d.querySelector("#preloder");//прелодер
        this.finalBlock = d.querySelector("#finalBlock");
        this.agreement = this.finalBlock.querySelector("#agreement");
        this.generate = d.querySelector("form#generate");
        this.download = this.generate.querySelector("button");

        this.init();
    },
    /*
     * Регистрирует события для конвертации фрифта
     */
    addEvents: function () {
        this.download.addEventListener("click", this.convertFont, false);
        this.finalBlock.style.display = "block";
    },
    /*
     * Убирает обработчик с кнопки
     */
    removeEvents: function () {
        this.download.removeEventListener("click", this.convertFont, false);
        this.finalBlock.style.display = "none";
    },
    /*
     * Делает ajax запрос
     */
    createXHR: function (formDatas, url, blob) {/*Создание объекта запроса*/
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest(),
                form = new FormData();

            formDatas.forEach(function (k, v) {
                form.append(k.name, k.value);
            });

            if (blob) {
                xhr.responseType = 'blob';
            }

            xhr.onload = function () {
                if (this.readyState === 4 && this.status === 200) {
                    resolve(this.response);
                }
            };
            xhr.onabort = function () {
                reject(Error("Network Abort"));
            };
            xhr.onerror = function () {
                reject(Error("Network Error"));
            };
            xhr.open('POST', url, true);
            xhr.send(form);
        });
    },
    /*
     * Формирует объект для запроса
     */
    collectionValue: function (form) {/*Соберает все данные из формы в виде объекта*/
        var inputs = form.querySelectorAll("input"), ln = inputs.length, data = [];
        while (ln--) {
            var loc = inputs[ln];
            if (loc.files) {
                if (this.checkMimeType(loc.files[0])) {
                    data.push({
                        name: loc.getAttribute("name"),
                        value: loc.files[0]
                    });
                    data.push({
                        name: "Filename",
                        value: loc.value.replace("C:\\fakepath\\", "")
                    });
                } else {
                    return false;
                }
            } else {
                data.push({
                    name: loc.getAttribute("name"),
                    value: loc.value
                });
            }
        }
        return data;
    },
    /*
     * Управляет состоянием прелодера
     */
    loderState: function (state) {
        state ? this.preloder.style.display = "block" : this.preloder.style.display = "none";
    },
    /*
     * Показывае сообщения
     */
    showNotification: function (message, name) {
        var config = {
            type: "basic",
            title: "",
            message: message,
            iconUrl: "../img/icon_128.png"
        };
        ch.notifications.getAll(function (notifications) {
            if (notifications[name]) {
                ch.notifications.clear(name, function () {
                    ch.notifications.create(name, config, function () {
                    });
                });
            } else {
                ch.notifications.create(name, config, function () {
                });
            }
        });
    },
    /*
     * Проверка загружаемого файла на тип
     */
    checkMimeType: function (file) {
        if (file) {
            var name = file.name.split(".");
            if (name[1].toLowerCase() === "ttf") {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
        return false;
    },
    /*
     * Очистка полей
     */
    clearForm: function () {
        this.target.value = "";
        this.agreement.checked = false;
    }
};;/**
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
FontEverythingfontsStrategy.prototype = Object.create(FontConverterStrategy.prototype);;/**
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

FontFont2webStrategy.prototype = Object.create(FontConverterStrategy.prototype);;/**
 * Created by abaddon on 22.11.2014.
 */
/*global document, window, chrome, console*/
var d = document, ch = chrome, w = window, FontSquirrelStrategy = function () {
    "use strict";
    var that = this;
    this.urls = {
        'uplode': "http://www.fontsquirrel.com/uploadify/fontfacegen_uploadify.php",
        'insert': "http://www.fontsquirrel.com/tools/insert",
        'generate': "http://www.fontsquirrel.com/tools/generate",
        'progress': "http://www.fontsquirrel.com/tools/progress/",
        'download': "http://www.fontsquirrel.com/tools/download"
    };
    this.init = function () {
        //добавляем обработчик
        this.addEvents();
    };

    this.addEvents = function () {
        this.target.addEventListener("change", this.fileSelect, false);
        this.download.addEventListener("click", this.convertFont, false);
    };

    this.removeEvents = function () {
        this.target.removeEventListener("change", this.fileSelect, false);
        this.download.removeEventListener("click", this.convertFont, false);
    };

    this.finalStep = function (info) {
        this.finalBlock.style.display = "block";
        this.uplodeOpt = info;
    };

    this.getConvertOptions = function () {
        var inputs = this.generate.querySelectorAll("input"), ln = inputs.length, datas = [];
        while (ln--) {
            var loc = inputs[ln], type = loc.getAttribute("type"), value, name = loc.getAttribute("name");
            if (type === "checkbox") {
                value = loc.checked;
                if (!value) {
                    this.showNotification("Вы не согласились с условием использования!", "agreement");
                    this.loderState(false);
                    return false;
                } else {
                    value = "Y";
                }
            } else {
                value = loc.value;
            }

            if (name === "id" || name === "dirname[]") {
                if (!this.uplodeOpt) {
                    this.showNotification("Вы не загрузили исходный шрифт!", "agreement");
                    this.loderState(false);
                    return false;
                } else {
                    value = this.uplodeOpt.id;
                }
            }

            datas.push({
                'name': name,
                'value': value
            });
        }
        return datas;
    };

    this.getProgress = function (back) {
        var xhr = null;
        w.setTimeout(function () {
            xhr = new XMLHttpRequest();
            xhr.onload = function () {
                if (this.readyState === 4 && this.status === 200) {
                    var res = JSON.parse(this.response);
                    if ((res.progress * 1) !== 100) {
                        that.getProgress(back);
                    } else {
                        xhr = null;
                        back();
                    }
                }
            };
            xhr.open('POST', this.urls.progress + this.uplodeOpt.id, true);
            xhr.send();
        }.bind(this), 4000);
    };

    this.convertFont = function (e) {
        that.loderState(true);
        var datas = that.getConvertOptions();
        if (datas) {
            that.createXHR(datas, that.urls.generate).then(function (response) {
                that.getProgress(function () {
                    that.createXHR(datas, that.urls.download, true).then(function (response) {
                        that.loderState(false);
                        that.clearForm();
                        that.uplodeOpt = null;
                        ch.downloads.download({
                            url: w.URL.createObjectURL(response),
                            filename: "webfont.zip"
                        });
                    });
                });
            }, function (error) {
                that.showNotification(error, "error");
            })
        }
        e.preventDefault();
    };

    this.fileSelect = function () {
        var form = d.querySelector("form#uplode"),
            datas = that.collectionValue(form);

        if (datas) {
            that.loderState(true);
            that.createXHR(datas, that.urls.uplode).then(function (response) {
                return [
                    {
                        'name': 'original_filename',
                        'value': datas[0].value
                    },
                    {
                        'name': 'path_data',
                        'value': response
                    }
                ];
            }, function (error) {
                that.showNotification(error, "error");
                that.loderState(false);
            }).then(function (response) {
                return that.createXHR(response, that.urls.insert);
            }, function (error) {
                that.showNotification(error, "error");
                that.loderState(false);
            }).then(function (response) {
                var res = JSON.parse(response);
                if (res.message) {//Если конвертация невозможна
                    that.showNotification(res.message, "error");
                } else {//Если все нормально
                    that.finalStep(res);
                }
                that.loderState(false);
            });
        } else {
            that.showNotification("Данный шрифт не подлежит конвертации!", "error");
        }
    };
};

FontSquirrelStrategy.prototype = Object.create(FontConverterStrategy.prototype);;/**
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