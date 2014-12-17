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
            if (name[1].toLowerCase() === "ttf" || name[1].toLowerCase() === "otf") {
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
};