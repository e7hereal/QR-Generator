let mode = 1; // 1 - Места, 2 - Стрелки, 3 - Контейнеры

// Проверка на сохраненную тему в localStorage и применение
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
}

// Функция для генерации QR-кодов
function generateQRCodes() {
    const textArea = document.getElementById('qrText');
    const qrcodeList = document.getElementById('qrcodeList');
    const text = textArea.value.trim();
    const progressBar = document.getElementById('progressBar');
    const scrollDownButton = document.getElementById('scrollDown'); // Кнопка промотки вниз

    qrcodeList.innerHTML = ''; // Очистить список QR-кодов перед генерацией

    if (text) {
        const separators = /[\s,;|]+/;
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
                    let firstPart = '';
                    let secondPart = '';

                    if (mode !== 3) {
                        firstPart = line.substring(0, 2);
                        secondPart = line.substring(3);  // Начинаем с третьего символа
                    } else {
                        // В режиме 3 не делаем разделения
                        firstPart = line;
                        secondPart = ''; // Нет второй части в режиме 3
                    }

                    if (mode === 3) {qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(line)}&margin=3&size=250`
                    } else {
                        qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(line)}&margin=3&size=90`
                    }

                    const qrDiv = document.createElement('div');
                    qrDiv.classList.add('qr-item');

                    if (mode === 2) {
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
                    }

                    if (mode === 3) {
                        qrcodeList.classList.add('container');
                        qrDiv.classList.add('container');
                        scrollDown.classList.add('container');
                    } else {
                        qrcodeList.classList.remove('container');
                        qrDiv.classList.remove('container');
                        scrollDown.classList.remove('container');
                    }

                    const caption = document.createElement('div');
                    caption.classList.add('qr-text');
                    // Если в режиме 3, выводим всю строку как одну часть
                    if (mode === 3) {
                        caption.innerHTML = `<div id="textPolki" class="text-polki container">${line}</div>`;
                    } else {
                        caption.innerHTML = `<div id="textPolki" class="text-polki">${firstPart}</div><div class="text-polki">${secondPart}</div>`;
                    }

                    const img = document.createElement('img');
                    img.src = qrUrl;
                    img.alt = `QR-код для: ${line}`;

                    img.onload = () => {
                        processed++;
                        const percentage = (processed / total) * 100;
                        progressFill.style.width = percentage.toFixed(2) + '%';
                        progressText.textContent = percentage.toFixed(2) + '%';

                        if (processed === total) {
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

                    qrDiv.appendChild(caption);
                    qrDiv.appendChild(img);

                    qrcodeList.appendChild(qrDiv);
                });
            }, 400); // Задержка перед стартом загрузки
        }, 10); // Задержка для активации transition: opacity
    } else {
        alert('Пожалуйста, введите текст в поле!');
    }
}

// Очистить все
const buttonClearDiv = document.getElementById('clearDivAndTextArea');
buttonClearDiv.addEventListener('click', function () {
document.getElementById('qrcodeList').innerHTML = '';
document.getElementById('qrText').value = '';
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
    mode = (mode === 3) ? 1 : mode + 1; // Переключаем режим от 1 до 3, затем возвращаемся к 1

    const modeButton = document.getElementById('modeButton');
    if (mode === 1) {
        modeButton.innerText = 'Режим: места';
    } else if (mode === 2) {
        modeButton.innerText = 'Режим: со стрелками';
    } else if (mode === 3) {
        modeButton.innerText = 'Режим: контейнера';
    }

    generateQRCodes(); // Перегенерируем QR-коды с новым режимом
}

function showDone() {
    const messageElement = document.getElementById('message');
    const qrList = document.getElementById('qrcodeList');

    // Проверяем, есть ли внутри qrcodeList дочерние элементы
    if (qrList.children.length === 0) {
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

// Для телефонов
document.addEventListener('DOMContentLoaded', function () {
    const menu = document.getElementById('rightMenu');

    // Обработчик касания на меню
    menu.addEventListener('touchstart', function (e) {
        e.preventDefault(); // предотвращаем возможный "двойной клик"
        menu.classList.toggle('fixed'); // переключаем состояние меню
    });
});
