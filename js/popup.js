/**
 * Created by abaddon on 20.11.2014.
 */
/*
 global window, document
 */
(function (w, d) {
    "use strict";
    var FontConverter = function (strategy) {
        this.strategy = strategy;

        this.run = function () {
            return this.strategy.init();
        };
    };

    var FontConverterStrategy = function () {
    };

    FontConverterStrategy.prototype = {
        removeEvents: function () {/*Удаляет обработчик события*/
            this.target.removeEventListener("change");
        },
        createFileXHR: function (formDatas, url) {/*Создание объекта запроса*/
            return new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest(),
                    form = new FormData();

                formDatas.forEach(function (k, v) {
                    form.append(k.name, k.value);
                });

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
        collectionValue: function (form) {/*Соберает все данные из формы в виде объекта*/
            var inputs = form.querySelectorAll("input"), ln = inputs.length, data = [];
            while (ln--) {
                var loc = inputs[ln];
                data.push({
                    name: loc.getAttribute("name"),
                    value: loc.files ? loc.files[0] : loc.value
                });
                if (loc.files) {
                    data.push({
                        name: "Filename",
                        value: loc.value.replace("C:\\fakepath\\", "")
                    });
                }
            }

            return data;
        }
    };

    var FontSquirrelStartegy = function () {
        this.target = d.querySelector("input[type=file]");

        this.config = {
            urls: {
                'classifications': "http://www.fontsquirrel.com/api/classifications",
                'families': "http://www.fontsquirrel.com/api/fontlist/",
                'details': "http://www.fontsquirrel.com/api/familyinfo/",
                'download': "http://www.fontsquirrel.com/fontfacekit/",
                'uplode': "http://www.fontsquirrel.com/uploadify/fontfacegen_uploadify.php",
                'insert': "http://www.fontsquirrel.com/tools/insert"
            }
        };
        this.init = function () {
            //Удаляем все обработчики
            this.removeEvents();
            //добавляем обработчик
            this.addEvent();
        };

        this.addEvent = function () {
            this.target.addEventListener("change", this.fileSelect.bind(this));
        };

        this.fileSelect = function () {
            var form = d.querySelector("form"),
                datas = this.collectionValue(form);

            this.createFileXHR(datas, this.config.urls.uplode).then(function (response) {
                return [{
                    'name': 'original_filename',
                    'value': datas[0].value
                }, {
                    'name': 'path_data',
                    'value': response
                }];
            }, function (error) {
                console.error(error);
            }).then(function (response) {
                return this.createFileXHR(response, this.config.urls.insert);
            }.bind(this), function (error) {
                console.error(error);
            }).then(function (response) {
                var res = JSON.parse(response);
                if (res.message) {//Если конвертация невозможна
                    console.error(res.message);
                } else {//Если все нормально
                    console.log(res);
                }
            });
        };
    };

    FontSquirrelStartegy.prototype = Object.create(FontConverterStrategy.prototype);

    w.onload = function () {
        var converter = new FontConverter(new FontSquirrelStartegy());
        converter.run();
    };

}(window, document));