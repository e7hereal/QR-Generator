let mode = 1; // 1 - Места, 2 - Стрелки, 3 - Контейнеры, 4 - Полки CP

// Проверка на сохраненную тему в localStorage и применение
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
}

function generateQRCodes() {
    const textArea = document.getElementById('qrText');
    const qrcodeList = document.getElementById('qrcodeList');
    const text = textArea.value.trim();
    const progressBar = document.getElementById('progressBar');
    const scrollDownButton = document.getElementById('scrollDown'); // Кнопка промотки вниз

    if (text === '') {
        progressBar.style.display = 'none';
        return;
    }

    qrcodeList.innerHTML = ''; // Очистить список QR-кодов перед генерацией

    let separators;

    if (mode === 4 || mode === 5) {
        // Разделяем по табам и новой строке
        separators = /[\t\n]+/;
    } else if (mode === 6) {
        // Разделяем только по новой строке
        separators = /\n+/;
    } else {
        // Текущие сепараторы для остальных режимов
        separators = /[\s,;|]+/;
    }

    const lines = text.split(separators).filter(part => part.trim() !== '');
    const total = lines.length;

    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    progressFill.style.width = '0%';
    progressText.textContent = '0.00%';
    progressBar.style.display = 'block';
    progressBar.style.opacity = 1;

    setTimeout(() => {
        progressBar.style.opacity = 1;

        setTimeout(() => {
            let processed = 0;

            lines.forEach((line) => {

                const firstPart = line.substring(0, 2);
                const secondPart = line.substring(3);  // Начинаем с третьего символа

                let qrUrl;
                if (mode === 3) {
                    qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(line)}&margin=3&size=250`;
                } else if (mode === 7) {
                    qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(line)}&margin=3&size=130`;
                } else {
                    qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(line)}&margin=3&size=90`;
                }

                const qrDiv = document.createElement('div');
                qrDiv.classList.add('qr-item');

                if (mode === 2 || mode === 5) {
                    const downArrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    downArrow.setAttribute('class', 'down-arrow');
                    downArrow.setAttribute('viewBox', '-12 8 50 50');
                    downArrow.setAttribute('fill', 'none');
                    downArrow.setAttribute('stroke', 'black');
                    downArrow.setAttribute('stroke-width', '2');
                    downArrow.setAttribute('stroke-linecap', 'round');
                    downArrow.setAttribute('stroke-linejoin', 'round');
                    downArrow.innerHTML = `
                        <rect x="12" y="0" width="11" height="40" fill="black"/>
                        <polygon points="1,40 18,70 36,40" fill="black"/>
                    `;
                    qrDiv.appendChild(downArrow);
                    qrDiv.classList.add('has-arrow');
                } else {
                }

                const caption = document.createElement('div');
                caption.classList.add('qr-text');
                caption.setAttribute('data-raw', line); // Сохраняем оригинальный текст
                caption.innerHTML = `<div class="text-polki">${firstPart}</div><div class="text-polki">${secondPart}</div>`;

                if (mode === 3) {
                    qrcodeList.classList.add('container');
                    qrDiv.classList.add('container');
                    caption.classList.add('container')
                    scrollDown.classList.add('container');
                } else if (mode === 7) {
                    qrcodeList.classList.add('lm');
                    qrDiv.classList.add('lm');
                    caption.classList.add('lm')
                } else {
                    qrcodeList.classList.remove('container');
                    qrDiv.classList.remove('container');
                    caption.classList.remove('container')
                    scrollDown.classList.remove('container');
                    caption.classList.remove('lm');
                    qrcodeList.classList.remove('lm');
                }

                const img = document.createElement('img');
                img.src = qrUrl;
                img.alt = `QR-код для: ${line}`;

                if (mode === 7) {
                    img.classList.add('lm');
                } else {
                    img.classList.remove('lm');
                }

                img.onload = () => {
                    processed++;
                    const percentage = (processed / total) * 100;
                    progressFill.style.width = percentage.toFixed(2) + '%';
                    progressText.textContent = percentage.toFixed(2) + '%';

                    if (processed === total) {
                        applySmartBreak();

                        setTimeout(() => {
                            progressBar.style.opacity = 0;
                            setTimeout(() => {
                                progressBar.style.display = 'none';
                            }, 500);
                        }, 500);

                        // Проверим, нужно ли показывать кнопку "Промотать вниз"
                        setTimeout(() => {
                            const scrollHeight = qrcodeList.scrollHeight;
                            const clientHeight = window.innerHeight;

                            if (scrollHeight > clientHeight) {
                                scrollDownButton.style.display = 'block'; // Показываем кнопку
                            }
                        }, 200); // Даем немного времени, чтобы элементы успели загрузиться
                    }
                };
                
                if (mode === 4 || mode === 5) {
                qrDiv.appendChild(caption);
                caption.classList.add('withOutQr');
                qrDiv.classList.add('withOutQr');
                qrcodeList.appendChild(qrDiv);
                } else {
                qrDiv.appendChild(caption);
                qrDiv.appendChild(img);
                caption.classList.remove('withOutQr');
                qrDiv.classList.remove('withOutQr');
                qrcodeList.appendChild(qrDiv);
                }
            });
        }, 0); // Задержка перед стартом загрузки
    }, 10); // Задержка для активации transition: opacity
    updateFontSize();
}

// Очистить все
const buttonClearDiv = document.getElementById('clearDivAndTextArea');

buttonClearDiv.addEventListener('click', function () {
    // Очищаем список QR-кодов
    document.getElementById('qrcodeList').innerHTML = '';
    // Очищаем текстовое поле
    document.getElementById('qrText').value = '';

    // Восстанавливаем значок файла, если textarea пустой
    if (qrTextArea.value.trim() === '') {
        fileIcon.innerHTML = defaultFileIcon;
    }

    checkScrollButton();
});

    // Функция для переключения темы
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('dark-theme'); // Переключаем класс темной темы

    // Сохраняем выбранную тему в localStorage
    if (body.classList.contains('dark-theme')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
}

function toggleMode() {
    mode = (mode === 7) ? 1 : mode + 1;
    localStorage.setItem('mode', mode);

    const modeButton = document.getElementById('modeButton');
    const toggleBtn = document.getElementById('smartBreakToggle');

    if (mode === 1) {
        modeButton.innerText = 'Режим: места';
        smartBreakEnabled = true;
        toggleBtn.classList.add('disabled');
        localStorage.setItem('smartBreak', 'true');
        document.getElementsByClassName('setting-groupTextSplit')[0].style.display = 'none';
        document.getElementsByClassName('setting-groupFontSize')[0].style.display = 'none';
        toggleBtn.classList.add('switch-on');
    } else if (mode === 2) {
        modeButton.innerText = 'Режим: со стрелками';
        smartBreakEnabled = true;
        toggleBtn.classList.add('disabled');
        localStorage.setItem('smartBreak', 'true');
        document.getElementsByClassName('setting-groupTextSplit')[0].style.display = 'none';
        document.getElementsByClassName('setting-groupFontSize')[0].style.display = 'none';
        toggleBtn.classList.add('switch-on');
    } else if (mode === 3) {
        modeButton.innerText = 'Режим: большие QR';
        const saved = localStorage.getItem('smartBreak');
        smartBreakEnabled = saved === null ? true : saved === 'true';
        toggleBtn.classList.remove('disabled');
        document.getElementsByClassName('setting-groupTextSplit')[0].style.display = 'block';
        document.getElementsByClassName('setting-groupFontSize')[0].style.display = 'block';
    } else if (mode === 4) {
        modeButton.innerText = 'Режим: без QR';
        const saved = localStorage.getItem('smartBreak');
        smartBreakEnabled = saved === null ? true : saved === 'true';
        toggleBtn.classList.remove('disabled');
        document.getElementsByClassName('setting-groupTextSplit')[0].style.display = 'block';
        document.getElementsByClassName('setting-groupFontSize')[0].style.display = 'block';
    } else if (mode === 5) {
        modeButton.innerText = 'Режим: без QR со стрелкой';
        const saved = localStorage.getItem('smartBreak');
        smartBreakEnabled = saved === null ? true : saved === 'true';
        toggleBtn.classList.remove('disabled');
        document.getElementsByClassName('setting-groupTextSplit')[0].style.display = 'block';
        document.getElementsByClassName('setting-groupFontSize')[0].style.display = 'block';
    } else if (mode === 6) {
        modeButton.innerText = 'Режим: логин + пароль';
        const saved = localStorage.getItem('smartBreak');
        smartBreakEnabled = saved === null ? true : saved === 'true';
        toggleBtn.classList.remove('disabled');
        document.getElementsByClassName('setting-groupTextSplit')[0].style.display = 'block';
        document.getElementsByClassName('setting-groupFontSize')[0].style.display = 'block';
    }  else if (mode === 7) {
        modeButton.innerText = 'Режим: LM-ки';
        const saved = localStorage.getItem('smartBreak');
        smartBreakEnabled = saved === null ? true : saved === 'false';
        toggleBtn.classList.add('disabled');
        toggleBtn.classList.remove('switch-on');
        document.getElementsByClassName('setting-groupTextSplit')[0].style.display = 'none';
        document.getElementsByClassName('setting-groupFontSize')[0].style.display = 'block';
    }

    // Перегенерируем QR-коды
    generateQRCodes();

    // Применяем умный разрыв
    applySmartBreak();

    // Меняем размер текста
    updateFontSize();

    checkSplitToggle();
}

// Переключатель переноса
let smartBreakEnabled = true; // включён по умолчанию
const toggleBtn = document.getElementById('smartBreakToggle');

document.addEventListener('DOMContentLoaded', function () {
    const savedMode = localStorage.getItem('mode');
    const toggleBtn = document.getElementById('smartBreakToggle');
    checkSplitToggle();

    if (savedMode) {
        mode = parseInt(savedMode, 10);
    }

    if (mode === 1 || mode === 2) {
    smartBreakEnabled = true;
    toggleBtn.classList.add('switch-on');
    toggleBtn.classList.add('disabled');
    document.getElementsByClassName('setting-groupTextSplit')[0].style.display = 'none';
    document.getElementsByClassName('setting-groupFontSize')[0].style.display = 'none';
    localStorage.setItem('smartBreak', 'true');
    checkSplitToggle();
    } else if (mode === 7) {
        smartBreakEnabled = false
        localStorage.setItem('smartBreak', 'false');
        toggleBtn.classList.remove('switch-on');
        toggleBtn.classList.add('disabled');
        checkSplitToggle();
    } else {
        const saved = localStorage.getItem('smartBreak');
        smartBreakEnabled = saved === null ? true : saved === 'true';
        if (smartBreakEnabled) toggleBtn.classList.add('switch-on');
        toggleBtn.classList.remove('disabled');
        checkSplitToggle();
    }

    // Обновить надпись на кнопке режима
    const modeButton = document.getElementById('modeButton');
    if (mode === 1) modeButton.innerText = 'Режим: места';
    else if (mode === 2) modeButton.innerText = 'Режим: со стрелками';
    else if (mode === 3) modeButton.innerText = 'Режим: большие QR';
    else if (mode === 4) modeButton.innerText = 'Режим: без QR';
    else if (mode === 5) modeButton.innerText = 'Режим: без QR со стрелкой';
    else if (mode === 6) modeButton.innerText = 'Режим: логин + пароль';
    else if (mode === 7) modeButton.innerText = 'Режим: LM-ки';
 });

// Устанавливаем переключатель переноса
const saved = localStorage.getItem('smartBreak');
smartBreakEnabled = saved === null ? true : saved === 'true';
if (smartBreakEnabled) {
    const toggleBtn = document.getElementById('smartBreakToggle');
    if (toggleBtn) toggleBtn.classList.add('switch-on');
}

function showDone() {
    const messageElement = document.getElementById('message');
    const qrList = document.getElementById('qrcodeList');
    const qrTextArea = document.getElementById('qrText');

    // Проверяем, есть ли внутри qrcodeList дочерние элементы и если qrTextArea пустое
    if (qrList.children.length === 0 && qrTextArea.value.trim().length === 0) {
        messageElement.textContent = 'И так пусто';
    } else if (qrTextArea.value.trim().length === 0 && qrList.children.length !== 0) {
        messageElement.textContent = 'И так пусто';
    } else {
        messageElement.textContent = 'Готово';
    }

    messageElement.classList.add('show');

    setTimeout(function () {
        messageElement.classList.remove('show');
    }, 1000);
}

// Функция для отображения/скрытия инструкции
function toggleInstruction() {
    const instruction = document.getElementById('instruction');
    
    if (instruction.classList.contains('show')) {
        instruction.classList.remove('show');
        setTimeout(() => {
            instruction.style.display = 'none';
        }, 500); // столько же, сколько в transition
    } else {
        instruction.style.display = 'flex'; // сначала показываем
        // небольшая задержка, чтобы сработал transition
        setTimeout(() => {
            instruction.classList.add('show');
        }, 10);
    }
}        

function showInstructionTab(tab) {
    const general = document.getElementById('generalInstructions');
    const printer = document.getElementById('printerInstructions');

    if (tab === 'general') {
        general.classList.add('active');
        printer.classList.remove('active');
    } else {
        printer.classList.add('active');
        general.classList.remove('active');
    }
}

// Блокировка анимаций при первой загрузке страницы
document.documentElement.classList.add('disable-transitions');

// Убираем блокировку анимаций, когда страница полностью загрузится
window.addEventListener('load', () => {
  document.documentElement.classList.remove('disable-transitions');
});
// Функция для проверки необходимости отображения кнопки прокрутки вниз
function checkScrollButton() {
    const scrollDownButton = document.getElementById('scrollDown');
    if (document.documentElement.scrollHeight > window.innerHeight) {
        // Если высота контента больше высоты окна, показываем кнопку
        scrollDownButton.style.display = 'block';
    } else {
        // Иначе скрываем кнопку
        scrollDownButton.style.display = 'none';
    }
}

// Вызовем функцию для начальной проверки
checkScrollButton();

// Добавляем событие на прокрутку, чтобы проверка выполнялась при изменении прокрутки
window.addEventListener('scroll', checkScrollButton);

// Функция для прокрутки вниз при нажатии на кнопку
document.getElementById('scrollDown').addEventListener('click', () => {
    window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
    });
});

function updateClock() {
        const now = new Date();

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        const formattedTime = `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
        document.getElementById('dateTimeNow').textContent = formattedTime;
    }

    setInterval(updateClock, 1000);
    updateClock(); // Вызываем сразу, чтобы не было задержки на первую отрисовку

document.addEventListener('DOMContentLoaded', function () {
    const menu = document.getElementById('rightMenu');
    const togglePin = document.getElementById('togglePin');

    // Устанавливаем начальное состояние по сохранённому значению
    let isPinned = localStorage.getItem('rightMenu') === 'fixed';
    if (isPinned) {
        menu.classList.add('fixed');
        togglePin.innerHTML = `<span class="menu-icon">&#10003;</span>Закреплено`;
    } else {
        togglePin.innerHTML = `<span class="menu-icon">&#9776;</span>Закрепить`;
    }

    // Обработчик кнопки закрепления
    togglePin.addEventListener('click', function () {
        isPinned = !isPinned;

        if (isPinned) {
            menu.classList.add('fixed');
            togglePin.innerHTML = `<span class="menu-icon">&#10003;</span>Закреплено`;
            localStorage.setItem('rightMenu', 'fixed');
        } else {
            menu.classList.remove('fixed');
            togglePin.innerHTML = `<span class="menu-icon">&#9776;</span>Закрепить`;
            localStorage.removeItem('rightMenu');
        }

        // Сохраняем классы меню (если нужно)
        localStorage.setItem('rightMenuClass', menu.className);
    });
});

// Дефолтный значок файла
const defaultFileIcon = '<p>или перетащите файл сюда: 📂</p>';
const qrTextArea = document.getElementById('qrText');
const fileIcon = document.getElementById('fileIcon');

// Проверка состояния textarea
function checkTextArea() {
    if (qrTextArea.value.trim() !== '') {
        // Если текст есть, скрываем значок файла
        fileIcon.innerHTML = '';
    } else {
        // Если текст пустой, восстанавливаем значок файла
        fileIcon.innerHTML = defaultFileIcon;
    }
}

// Слушаем изменения в textarea
qrTextArea.addEventListener('input', checkTextArea);

// Слушаем загрузку файла через проводник
document.getElementById('fileUpload').addEventListener('change', handleExcelUpload);

function handleExcelUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        const values = rows.flat().filter(cell => cell !== undefined && cell !== null && String(cell).trim() !== '');

        if (values.length === 0) {
            alert("Файл пуст или не содержит данных.");
            return;
        }

        const qrTextArea = document.getElementById('qrText');
        qrTextArea.value = values.join('\n');
        checkTextArea(); // Проверим, если в textarea есть текст, скрыть значок

        generateQRCodes(); // автоматически сгенерировать после загрузки
    };

    reader.readAsArrayBuffer(file);
}

// Вставляем дефолтный значок файла при загрузке страницы или если textarea пустая
checkTextArea();

// Обработчик для изменения текста в textarea
qrTextArea.addEventListener('input', () => {
    if (qrTextArea.value.trim() !== '') {
        // Если текст есть, скрываем значок файла
        fileIcon.innerHTML = '';
    } else {
        // Если текст пустой, восстанавливаем значок файла
        fileIcon.innerHTML = defaultFileIcon;
    }
});

// Обработчики для drag-and-drop событий
qrTextArea.addEventListener('dragover', (e) => {
    e.preventDefault(); // Обязательно для того, чтобы браузер разрешил перетаскивание
    qrTextArea.classList.add('dragover'); // Добавляем стиль увеличения
    fileIcon.classList.add('dragover');
});

qrTextArea.addEventListener('dragleave', () => {
    qrTextArea.classList.remove('dragover'); // Убираем стиль, когда файл уходит
    fileIcon.classList.remove('dragover');
});

qrTextArea.addEventListener('drop', (e) => {
    e.preventDefault(); // Останавливаем стандартное поведение
    qrTextArea.classList.remove('dragover'); // Убираем стиль
    fileIcon.classList.remove('dragover');

    const file = e.dataTransfer.files[0]; // Получаем файл
    if (!file) return;

    // После того как файл был сброшен, убираем значок
    fileIcon.innerHTML = '';

    const reader = new FileReader();

    if (file.name.endsWith('.txt')) {
        reader.onload = function (e) {
            qrTextArea.value = e.target.result; // Загружаем текст в textarea
            generateQRCodes(); // Генерируем QR-коды
        };
        reader.readAsText(file);
    } else if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx') || file.name.endsWith('.csv')) {
        reader.onload = function (e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            const values = rows.flat().filter(cell => cell !== undefined && cell !== null && String(cell).trim() !== '');

            if (values.length === 0) {
                alert("Файл пуст или не содержит данных.");
                return;
            }

            qrTextArea.value = values.join('\n'); // Загрузка данных в textarea
            generateQRCodes(); // Генерация QR-кодов
        };
        reader.readAsArrayBuffer(file);
    } else {
        alert("Поддерживаются только .txt, .xls, .xlsx файлы.");
    }
});

// Инициализация по умолчанию
document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('smartBreak');
    smartBreakEnabled = saved === null ? true : saved === 'true';
    if (smartBreakEnabled) toggleBtn.classList.add('switch-on');
});

// Клик
toggleBtn.addEventListener('click', () => {
    // Если кнопка заблокирована (режим 1 или 2)
    if (toggleBtn.classList.contains('disabled')) {
        return; // ничего не делаем
    }

    smartBreakEnabled = !smartBreakEnabled;
    toggleBtn.classList.toggle('switch-on', smartBreakEnabled);
    localStorage.setItem('smartBreak', smartBreakEnabled ? 'true' : 'false');
    applySmartBreak();
    updateFontSize();
    checkSplitToggle();
});

// Drag-перетаскивание
let isDragging = false;
let startX = 0;

toggleBtn.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;

    // Включаем прослушивание событий для перемещения мыши
    document.addEventListener('mousemove', onMouseMove);
});

document.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;

    // Убираем прослушивание события мыши
    document.removeEventListener('mousemove', onMouseMove);

    const deltaX = e.clientX - startX;
    if (Math.abs(deltaX) > 10) {
        smartBreakEnabled = deltaX > 0;
        toggleBtn.classList.toggle('switch-on', smartBreakEnabled);
        localStorage.setItem('smartBreak', smartBreakEnabled);
        applySmartBreak();
    }
});

function onMouseMove(e) {
    if (!isDragging) return;

    // Перемещаем кнопку в зависимости от изменения координат
    const deltaX = e.clientX - startX;
    if (Math.abs(deltaX) > 10) {
        smartBreakEnabled = deltaX > 0;
        toggleBtn.classList.toggle('switch-on', smartBreakEnabled);
        localStorage.setItem('smartBreak', smartBreakEnabled);
        applySmartBreak();
    }
}

toggleBtn.addEventListener('touchstart', (e) => {
    isDragging = true;
    startX = e.touches[0].clientX;

    // Добавляем прослушиватель для мобильных устройств
    document.addEventListener('touchmove', onTouchMove);
});

document.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    isDragging = false;
    document.removeEventListener('touchmove', onTouchMove);

    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - startX;
    if (Math.abs(deltaX) > 10) {
        smartBreakEnabled = deltaX > 0;
        toggleBtn.classList.toggle('switch-on', smartBreakEnabled);
        localStorage.setItem('smartBreak', smartBreakEnabled);
        applySmartBreak();
    }
});

function onTouchMove(e) {
    if (!isDragging) return;

    const deltaX = e.touches[0].clientX - startX;
    if (Math.abs(deltaX) > 10) {
        smartBreakEnabled = deltaX > 0;
        toggleBtn.classList.toggle('switch-on', smartBreakEnabled);
        localStorage.setItem('smartBreak', smartBreakEnabled);
        applySmartBreak();
    }
}

window.addEventListener('load', () => {
    if (qrTextArea.value.trim() !== '') {
        generateQRCodes(); // уже с правильным mode
    }
});

function applySmartBreak() {
    const qrItems = document.querySelectorAll('#qrcodeList .qr-item .qr-text');

    qrItems.forEach((qrTextEl) => {
    const rawText = qrTextEl.getAttribute('data-raw');
    if (!rawText) return;

    const parts = splitText(rawText);

    if (!smartBreakEnabled) {
        qrTextEl.innerHTML = `<div class="text-polki">${rawText}</div>`;
    } else {
        if (mode === 3) {
        qrTextEl.innerHTML = `
            <div class="text-polki container">${parts[0]}</div>
            <div class="text-polki container">${parts[1]}</div>
        `;
        } else if (mode === 7) {
            qrTextEl.innerHTML = `
            <div class="text-polki lm">${parts[0]}</div>
            <div class="text-polki lm">${parts[1]}</div>`
        } else {
            qrTextEl.innerHTML = `
            <div class="text-polki">${parts[0]}</div>
            <div class="text-polki">${parts[1]}</div>
        `;
        }
    }
});
updateFontSize();
}

// Функция для разделения текста на две части
function splitText(text) {
    if (text.length < splitPosition) {
        return [text, ''];
    }

    const firstPart = text.substring(0, splitPosition - 1); // например, до 3-го символа
    const secondPart = text.substring(splitPosition); // начиная после splitPosition (пропускаем 1 символ)

    return [firstPart, secondPart];
}

document.getElementById("qrText").addEventListener("keydown", function(e) {
    if (e.key === "Tab") {
        e.preventDefault(); // Отменяем стандартное поведение для клавиши Tab
        const start = this.selectionStart;
        const end = this.selectionEnd;

        // Вставляем символ табуляции \t в текущее положение курсора
        this.value = this.value.substring(0, start) + "\t" + this.value.substring(end);

        // Перемещаем курсор в конец вставленного символа табуляции
        this.selectionStart = this.selectionEnd = start + 1; // 1 символ табуляции
    }
});

// Ползунок переноса строки
let splitPosition = parseInt(localStorage.getItem('splitPosition')) || 3;

const splitSlider = document.getElementById('splitSlider');
const splitValue = document.getElementById('splitValue');

splitSlider.value = splitPosition;
splitValue.textContent = splitPosition;

splitSlider.addEventListener('input', () => {
    splitPosition = parseInt(splitSlider.value);
    splitValue.textContent = splitPosition;
    localStorage.setItem('splitPosition', splitPosition);
    applySmartBreak(); // Обновим подписи
});

// Настройка размера текста
let fontSize = parseInt(localStorage.getItem('fontSize')) || 26;

const fontSizeSlider = document.getElementById('fontSizeSlider');
const fontSizeValue = document.getElementById('fontSizeValue');

fontSizeSlider.value = fontSize;
fontSizeValue.textContent = fontSize;

fontSizeSlider.addEventListener('input', () => {
  fontSize = parseInt(fontSizeSlider.value);
  fontSizeValue.textContent = fontSize;
  localStorage.setItem('fontSize', fontSize);
  updateFontSize();
});

function updateFontSize() {
  if (mode === 1) {
    fontSize = 26;
    splitPosition = 3;  // автоматический перенос для режима 1
  } else if (mode === 2) {
    fontSize = 21;
    splitPosition = 3;  // автоматический перенос для режима 2
  }

  // Обновляем слайдер и отображение splitPosition
  splitSlider.value = splitPosition;
  splitValue.textContent = splitPosition;

  // Сохраняем в localStorage, чтобы при перезагрузке остались значения
  localStorage.setItem('splitPosition', splitPosition);
  localStorage.setItem('fontSize', fontSize);

  // Обновляем слайдер и отображение fontSize
  fontSizeSlider.value = fontSize;
  fontSizeValue.textContent = fontSize;

  // Применяем размер шрифта к элементам
  const textElements = document.querySelectorAll('.text-polki, .qr-text');
  textElements.forEach(el => {
    el.style.fontSize = fontSize + 'px';
  });
}

// При загрузке страницы сразу применяем сохранённый размер:
updateFontSize();

// Пример инициализации после загрузки
window.addEventListener('DOMContentLoaded', () => {
  // ...восстановить mode из localStorage, если есть
  mode = parseInt(localStorage.getItem('mode')) || 1;

  updateFontSize();
  generateQRCodes();
});

let textarea = document.getElementById('qrText');

fileIcon.addEventListener('mouseenter', () => {
  textarea.classList.add('hover-like');
});
fileIcon.addEventListener('mouseleave', () => {
  textarea.classList.remove('hover-like');
});

fileIcon.addEventListener('mousedown', () => {
  textarea.classList.add('focus-like');
});
fileIcon.addEventListener('mouseup', () => {
  textarea.classList.remove('focus-like');
});
fileIcon.addEventListener('mouseout', () => {
  textarea.classList.remove('focus-like');
});

// Добавляем фокус при клике на иконку
fileIcon.addEventListener('click', () => {
textarea.style.caretColor = '#000';
  textarea.focus();
});

function checkSplitToggle() {
    const elem = document.getElementsByClassName('setting-groupTextSplit')[0];
    if (!elem) return;

    // Если режим 1 или 2 — всегда скрываем
    if (mode === 1 || mode === 2 || mode === 7) {
        elem.style.display = 'none';
        return;
    }

    // В остальных режимах показываем/скрываем в зависимости от smartBreakEnabled
    if (smartBreakEnabled) {
        elem.style.display = 'block';
    } else {
        elem.style.display = 'none';
    }
}

// Вызови функцию там, где меняется режим или smartBreakEnabled
checkSplitToggle();
