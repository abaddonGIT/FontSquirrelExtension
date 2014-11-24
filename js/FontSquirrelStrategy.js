/**
 * Created by abaddon on 22.11.2014.
 */
/*global document, window, chrome, console*/
var d = document, ch = chrome, w = window, FontSquirrelStrategy = function () {
    var that = this;
    this.urls = {
        'uplode': "http://www.fontsquirrel.com/uploadify/fontfacegen_uploadify.php",
        'insert': "http://www.fontsquirrel.com/tools/insert",
        'generate': "http://www.fontsquirrel.com/tools/generate",
        'progress': "http://www.fontsquirrel.com/tools/progress/",
        'download': "http://www.fontsquirrel.com/tools/download"
    };
    this.init = function () {
        this.generate = d.querySelector("form#generate");
        this.download = this.generate.querySelector("button");
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
    };
};

FontSquirrelStrategy.prototype = Object.create(FontConverterStrategy.prototype);