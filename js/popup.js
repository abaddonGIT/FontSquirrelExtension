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
            return this.strategy.run();
        };
    };

    var FontConverterStrategy = function () {
    };

    FontConverterStrategy.prototype = {
        run: function () {
            this.target = d.querySelector("input[type=file]");//Источник
            this.preloder = d.querySelector("#preloder");//прелодер
            this.finalBlock = d.querySelector("#finalBlock");

            this.init();
        },
        removeEvents: function () {/*Удаляет обработчик события*/
            this.target.removeEventListener("change");
        },
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
        },
        loderState: function (state) {
            state ? this.preloder.style.display = "block" : this.preloder.style.display = "none";
        }
    };

    var FontSquirrelStartegy = function () {
        var that = this;
        this.config = {
            urls: {
                'uplode': "http://www.fontsquirrel.com/uploadify/fontfacegen_uploadify.php",
                'insert': "http://www.fontsquirrel.com/tools/insert",
                'generate': "http://www.fontsquirrel.com/tools/generate",
                'progress': "http://www.fontsquirrel.com/tools/progress/",
                'download': "http://www.fontsquirrel.com/tools/download"
            }
        };
        this.init = function () {
            this.generate = d.querySelector("form#generate");
            this.download = this.generate.querySelector("button");
            //Удаляем все обработчики
            this.removeEvents();
            //добавляем обработчик
            this.addEvent();
        };

        this.addEvent = function () {
            this.target.addEventListener("change", this.fileSelect.bind(this));
            this.download.addEventListener("click", this.convertFont.bind(this));
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
                        alert("Вы не согласились с условием использования!");
                        break;
                    } else {
                        value = "Y";
                    }
                } else {
                    value = loc.value;
                }

                if (name === "id" || name === "dirname[]") {
                    if (!this.uplodeOpt) {
                        alert("Вы не загрузили исходный шрифт!");
                        break;
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
                xhr.open('POST', this.config.urls.progress + this.uplodeOpt.id, true);
                xhr.send();
            }.bind(this), 4000);
        };

        this.convertFont = function (e) {
            var datas = this.getConvertOptions();
            this.loderState(true);
            this.createXHR(datas, this.config.urls.generate).then(function (response) {
                this.getProgress(function () {
                    that.createXHR(datas, that.config.urls.download, true).then(function (response) {
                        that.loderState(false);
                        chrome.downloads.download({
                            url: w.URL.createObjectURL(response),
                            filename: "font.zip"
                        });
                    });
                });
            }.bind(this), function (error) {
                console.error(error);
            })
            e.preventDefault();
        };

        this.fileSelect = function () {
            var form = d.querySelector("form#uplode"),
                datas = this.collectionValue(form);

            this.loderState(true);
            this.createXHR(datas, this.config.urls.uplode).then(function (response) {
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
                console.error(error);
            }).then(function (response) {
                return this.createXHR(response, this.config.urls.insert);
            }.bind(this), function (error) {
                console.error(error);
            }).then(function (response) {
                var res = JSON.parse(response);
                if (res.message) {//Если конвертация невозможна
                    console.error(res.message);
                } else {//Если все нормально
                    this.loderState(false);
                    this.finalStep(res);
                }
            }.bind(this));
        };
    };

    FontSquirrelStartegy.prototype = Object.create(FontConverterStrategy.prototype);

    w.onload = function () {
        var converter = new FontConverter(new FontSquirrelStartegy());
        converter.run();
    };

}(window, document));