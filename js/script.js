// Проверка на сохраненную тему в localStorage и применение
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
}

// Блокировка анимаций при первой загрузке страницы
document.documentElement.classList.add('disable-transitions');
document.body.classList.add('disable-transitions');
const textAreaWithOutTransition = document.getElementById('qrText');
textAreaWithOutTransition.classList.add('disable-transitions');

// Убираем блокировку анимаций, когда страница полностью загрузится
window.addEventListener('load', () => {
  document.documentElement.classList.remove('disable-transitions');
  document.body.classList.remove('disable-transitions');
  textAreaWithOutTransition.classList.remove('disable-transitions');
});

let mode = 1; // 1 - Места, 2 - Стрелки, 3 - Контейнеры, 4 - Полки CP

let useApiGeneration = true;

function toggleGenerationMode() {
  useApiGeneration = !useApiGeneration;
  document.getElementById('toggleGenerationMode').innerHTML =
    'Режим генерации: ' + (useApiGeneration ? 'API' : 'JS') + '*';
    generateQRCodes();
}

function generateQRCodes() {
    const textArea = document.getElementById('qrText');
    const qrcodeList = document.getElementById('qrcodeList');
    const text = textArea.value.trim();
    const progressBar = document.getElementById('progressBar');
    const scrollDownButton = document.getElementById('scrollDown');

    if (text === '') {
        progressBar.style.display = 'none';
        return;
    }

    qrcodeList.innerHTML = '';

    let separators;
    if (mode === 4 || mode === 5) {
        separators = /[\t\n]+/;
    } else if (mode === 6) {
        separators = /\n+/;
    } else {
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

    let processed = 0;
    const startTime = performance.now();

    function handleProgress() {
        processed++;
        const percentage = (processed / total) * 100;
        progressFill.style.width = percentage.toFixed(2) + '%';
        progressText.textContent = percentage.toFixed(2) + '%';

        if (processed === total) {
            const endTime = performance.now();
            const duration = (endTime - startTime).toFixed(2);
            const modeUsed = useApiGeneration ? 'API' : 'JS';

            console.log(`✅ Генерация в режиме ${modeUsed} завершена за ${duration} мс (${(duration / 1000).toFixed(2)} секунд)`);

            console.log(`📦 Всего сгенерировано QR-элементов: ${document.querySelectorAll('.qr-item').length}`);

            applySmartBreak();

            setTimeout(() => {
                progressBar.style.opacity = 0;
                setTimeout(() => {
                    progressBar.style.display = 'none';
                }, 500);
            }, 500);

            setTimeout(() => {
                const scrollHeight = qrcodeList.scrollHeight;
                const clientHeight = window.innerHeight;

                if (scrollHeight > clientHeight) {
                    scrollDownButton.style.display = 'block';
                }
            }, 200);
        }
    }

    let index = 0;
    const batchSize = 5;

    function processBatch() {
        const end = Math.min(index + batchSize, total);

        for (; index < end; index++) {
            const line = lines[index];
            const firstPart = line.substring(0, 2);
            const secondPart = line.substring(3);
            let qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(line)}&margin=3&size=94`;
            if (mode === 3) qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(line)}&margin=3&size=250`;
            if (mode === 7) qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(line)}&margin=3&size=130`;

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
                    <rect x="12" y="0" width="11" height="40"/>
                    <polygon points="1,40 18,70 36,40"/>
                `;
                qrDiv.appendChild(downArrow);
                qrDiv.classList.add('has-arrow');
            } else if (mode === 5) {
                const downArrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                downArrow.setAttribute('class', 'down-arrow large');
                downArrow.setAttribute('viewBox', '-12 8 50 50');
                downArrow.setAttribute('fill', 'none');
                downArrow.setAttribute('stroke', 'black');
                downArrow.setAttribute('stroke-width', '2');
                downArrow.setAttribute('stroke-linecap', 'round');
                downArrow.setAttribute('stroke-linejoin', 'round');
                downArrow.innerHTML = `
                    <rect x="12" y="0" width="11" height="40"/>
                    <polygon points="1,40 18,70 36,40"/>
                `;
                qrDiv.appendChild(downArrow);
                qrDiv.classList.add('has-arrow');
            }

            const caption = document.createElement('div');
            caption.classList.add('qr-text');
            caption.setAttribute('data-raw', line);
            caption.innerHTML = `<div class="text-polki">${firstPart}</div><div class="text-polki">${secondPart}</div>`;

            if (mode === 3) {
                qrcodeList.classList.add('container');
                qrDiv.classList.add('container');
                caption.classList.add('container');
                scrollDownButton.classList.add('container');
            } else if (mode === 7) {
                qrcodeList.classList.add('lm');
                qrDiv.classList.add('lm');
                caption.classList.add('lm');
                qrcodeList.classList.remove('container');
                qrDiv.classList.remove('container');
                caption.classList.remove('container');
                scrollDownButton.classList.remove('container');
            } else {
                qrcodeList.classList.remove('container', 'lm');
                qrDiv.classList.remove('container', 'lm');
                caption.classList.remove('container', 'lm');
                scrollDownButton.classList.remove('container');
            }

            if (mode === 4 || mode === 5) {
                qrDiv.appendChild(caption);
                caption.classList.add('withOutQr');
                qrDiv.classList.add('withOutQr');
                qrcodeList.appendChild(qrDiv);
                handleProgress();
                continue;
            }

            qrDiv.appendChild(caption);

            if (useApiGeneration) {
                const img = document.createElement('img');
                img.src = qrUrl;
                img.alt = `QR-код для: ${line}`;
                if (mode === 3) img.classList.add('container');
                else if (mode === 7) img.classList.add('lm');
                img.onload = () => handleProgress();
                qrDiv.appendChild(img);
            } else {
                const qrContainer = document.createElement('div');
                qrContainer.classList.add('qrcode-js');
                if (mode === 3) qrContainer.classList.add('container');
                else if (mode === 7) qrContainer.classList.add('lm');

                qrDiv.appendChild(qrContainer);

                let size = 76;
                if (mode === 3) size = 190;
                else if (mode === 7) size = 100;

                new QRCode(qrContainer, {
                    text: line,
                    width: size,
                    height: size,
                    margin: 1
                });

                setTimeout(() => handleProgress(), 0);
            }

            caption.classList.remove('withOutQr');
            qrDiv.classList.remove('withOutQr');
            qrcodeList.appendChild(qrDiv);
        }

        if (index < total) {
            requestAnimationFrame(processBatch);
        }
    }

    requestAnimationFrame(processBatch);

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

function toggleModeMenu() {
  document.getElementById('modeMenu').classList.toggle('hidden');
}

function selectMode(value) {
  mode = parseInt(value, 10);
  localStorage.setItem('mode', mode);
  document.getElementById('modeMenu').classList.add('hidden');

  const toggleBtn = document.getElementById('smartBreakToggle');
  const notShowTextSplit = document.getElementsByClassName('setting-groupTextSplit')[0];
  const notShowTextFontSize = document.getElementsByClassName('setting-groupFontSize')[0];
  const modeButton = document.getElementById('modeButton');

  switch (mode) {
    case 1:
      modeButton.innerText = 'Режим: места';
      smartBreakEnabled = true;
      toggleBtn.classList.add('disabled');
      toggleBtn.classList.add('switch-on');
      notShowTextSplit.classList.add('hidden');
      notShowTextFontSize.classList.add('hidden');
      localStorage.setItem('smartBreak', 'true');
      break;
    case 2:
      modeButton.innerText = 'Режим: места со стрелками';
      smartBreakEnabled = true;
      toggleBtn.classList.add('disabled');
      toggleBtn.classList.add('switch-on');
      notShowTextSplit.classList.add('hidden');
      notShowTextFontSize.classList.add('hidden');
      localStorage.setItem('smartBreak', 'true');
      break;
    case 3:
      modeButton.innerText = 'Режим: большие QR';
      smartBreakEnabled = localStorage.getItem('smartBreak') !== 'false';
      toggleBtn.classList.remove('disabled');
      notShowTextSplit.classList.remove('hidden');
      notShowTextFontSize.classList.remove('hidden');
      break;
    case 4:
      modeButton.innerText = 'Режим: без QR';
      smartBreakEnabled = localStorage.getItem('smartBreak') !== 'false';
      notShowTextSplit.classList.remove('hidden');
      notShowTextFontSize.classList.remove('hidden');
      toggleBtn.classList.remove('disabled');
      break;
    case 5:
      modeButton.innerText = 'Режим: без QR со стрелкой';
      smartBreakEnabled = localStorage.getItem('smartBreak') !== 'false';
      notShowTextSplit.classList.remove('hidden');
      notShowTextFontSize.classList.remove('hidden');
      toggleBtn.classList.remove('disabled');
      break;
    case 6:
      modeButton.innerText = 'Режим: логин + пароль';
      smartBreakEnabled = localStorage.getItem('smartBreak') !== 'false';
      notShowTextSplit.classList.remove('hidden');
      notShowTextFontSize.classList.remove('hidden');
      toggleBtn.classList.remove('disabled');
      break;
    case 7:
      modeButton.innerText = 'Режим: LM-ки';
      smartBreakEnabled = false;
      notShowTextFontSize.classList.remove('hidden');
      toggleBtn.classList.add('disabled');
      toggleBtn.classList.remove('switch-on');
      localStorage.setItem('smartBreak', 'false');
      break;
  }

  updateSwitchText();
  generateQRCodes();
  applySmartBreak();
  updateFontSize();
  checkSplitToggle();
}


// Переключатель переноса
let smartBreakEnabled = true; // включён по умолчанию
const toggleBtn = document.getElementById('smartBreakToggle');

document.addEventListener('DOMContentLoaded', function () {
    const savedMode = localStorage.getItem('mode');
    const toggleBtn = document.getElementById('smartBreakToggle');
    const notShowTextFontSize = document.getElementsByClassName('setting-groupFontSize')[0];
    const notShowTextSplit = document.getElementsByClassName('setting-groupTextSplit')[0];

    updateSwitchText();

    checkSplitToggle();


    if (savedMode) {
        mode = parseInt(savedMode, 10);
    }

    if (mode === 1 || mode === 2) {
    smartBreakEnabled = true;
    toggleBtn.classList.add('switch-on');
    toggleBtn.classList.add('disabled');
    notShowTextSplit.classList.add('hidden');
    notShowTextFontSize.classList.add('hidden');
    localStorage.setItem('smartBreak', 'true');
    checkSplitToggle();

    } else if (mode === 7) {
        smartBreakEnabled = false
        localStorage.setItem('smartBreak', 'false');
        toggleBtn.classList.remove('switch-on');
        toggleBtn.classList.add('disabled');
        notShowTextSplit.classList.add('hidden');
        notShowTextFontSize.classList.remove('hidden');
        checkSplitToggle();
    } else {
        const saved = localStorage.getItem('smartBreak');
        smartBreakEnabled = saved === null ? true : saved === 'true';
        if (smartBreakEnabled) toggleBtn.classList.add('switch-on');
        toggleBtn.classList.remove('disabled');
        notShowTextSplit.classList.remove('hidden');
        notShowTextFontSize.classList.remove('hidden');
        checkSplitToggle();
    }

    // Обновить надпись на кнопке режима
    const modeButton = document.getElementById('modeButton');
    if (mode === 1) modeButton.innerText = 'Режим: места';
    else if (mode === 2) modeButton.innerText = 'Режим: места со стрелками';
    else if (mode === 3) modeButton.innerText = 'Режим: большие QR';
    else if (mode === 4) modeButton.innerText = 'Режим: без QR';
    else if (mode === 5) modeButton.innerText = 'Режим: без QR со стрелкой';
    else if (mode === 6) modeButton.innerText = 'Режим: логин + пароль';
    else if (mode === 7) modeButton.innerText = 'Режим: LM-ки';

    updateSwitchText();

 });

// Устанавливаем переключатель переноса
const saved = localStorage.getItem('smartBreak');
smartBreakEnabled = saved === null ? true : saved === 'true';
if (smartBreakEnabled) {
    const toggleBtn = document.getElementById('smartBreakToggle');
    if (toggleBtn) toggleBtn.classList.add('switch-on');
}



// Вспывающее окно по кнопке
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

// Время
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
    const notSaveTextArea = document.getElementById('qrText');
    
    if (notSaveTextArea) {
        notSaveTextArea.value = '';
    }

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

const SWITCH_THRESHOLD = 6; // Порог переключения в пикселях

// Клик
toggleBtn.addEventListener('click', () => {
    if (toggleBtn.classList.contains('disabled')) return;

    smartBreakEnabled = !smartBreakEnabled;
    toggleBtn.classList.toggle('switch-on', smartBreakEnabled);
    localStorage.setItem('smartBreak', smartBreakEnabled ? 'true' : 'false');

    updateSwitchText();

    applySmartBreak();
    updateFontSize();
    checkSplitToggle();
});

function updateSwitchText() {
  const toggleBtn = document.getElementById('smartBreakToggle');
  if (!toggleBtn) return;

  const switchText = toggleBtn.querySelector('.switch-text');
  if (!switchText) return;

  switchText.textContent = smartBreakEnabled ? 'ON' : 'OFF';
}

// Drag-перетаскивание
let isDragging = false;
let startX = 0;

toggleBtn.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;

    document.addEventListener('mousemove', onMouseMove);
});

document.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;

    document.removeEventListener('mousemove', onMouseMove);
    // НЕ переключаем состояние здесь!
});

function onMouseMove(e) {
    if (!isDragging) return;

    const deltaX = e.clientX - startX;
    if (Math.abs(deltaX) > SWITCH_THRESHOLD) {
        const newState = deltaX > 0;
        if (newState !== smartBreakEnabled) {
            smartBreakEnabled = newState;
            toggleBtn.classList.toggle('switch-on', smartBreakEnabled);
            localStorage.setItem('smartBreak', smartBreakEnabled ? 'true' : 'false');
            updateSwitchText();
            applySmartBreak();
            checkSplitToggle();
        }
    }
}

toggleBtn.addEventListener('touchstart', (e) => {
    isDragging = true;
    startX = e.touches[0].clientX;

    document.addEventListener('touchmove', onTouchMove);
});

document.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    isDragging = false;

    document.removeEventListener('touchmove', onTouchMove);
    // НЕ переключаем состояние здесь!
});

function onTouchMove(e) {
    if (!isDragging) return;

    const deltaX = e.touches[0].clientX - startX;
    if (Math.abs(deltaX) > SWITCH_THRESHOLD) {
        const newState = deltaX > 0;
        if (newState !== smartBreakEnabled) {
            smartBreakEnabled = newState;
            toggleBtn.classList.toggle('switch-on', smartBreakEnabled);
            localStorage.setItem('smartBreak', smartBreakEnabled ? 'true' : 'false');
            updateSwitchText();
            applySmartBreak();
            checkSplitToggle();
        }
    }
}

window.addEventListener('load', () => {
    if (qrTextArea.value.trim() !== '') {
        generateQRCodes(); // уже с правильным mode
    }
});

// Применение переноса
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
updateSwitchText();
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

// tab в textarea
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

// Ползунок размера текста
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

// Изменение размера текста
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

// Инициализация после загрузки
window.addEventListener('DOMContentLoaded', () => {
  // ...восстановить mode из localStorage, если есть
  mode = parseInt(localStorage.getItem('mode')) || 1;

  updateFontSize();
  generateQRCodes();
});

// Динамический textarea с drag n drop
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

// Проверка на setting-groupTextSplit, убираем, если выключен
function checkSplitToggle() {
    const elemTextSplit = document.getElementsByClassName('setting-groupTextSplit')[0];
    if (!elemTextSplit) return;

    let wasHidden = elemTextSplit.classList.contains('hidden');

    if (mode === 1 || mode === 2 || mode === 7) {
        elemTextSplit.classList.add('hidden');
    } else {
        if (smartBreakEnabled) {
            elemTextSplit.classList.remove('hidden');
        } else {
            elemTextSplit.classList.add('hidden');
        }
    }

    // Если состояние изменилось, применяем перенос заново
    if (wasHidden !== elemTextSplit.classList.contains('hidden')) {
        applySmartBreak();
    }
}

document.addEventListener('click', function (e) {
  const menu = document.getElementById('modeMenu');
  const button = document.getElementById('modeButton');
  if (!menu.contains(e.target) && e.target !== button) {
    menu.classList.add('hidden');
  }
});

/*

const canvas = document.getElementById('snow-canvas');
const ctx = canvas.getContext('2d');
let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

const snowflakes = [];
let isSnowing = false;
let animationFrameId;
let lastTime = performance.now();

const createSnowflake = () => ({
  x: Math.random() * width,
  y: -5,
  radius: Math.random() * 2 + 1,
  speed: Math.random() * 1 + 0.5,
  opacity: Math.random() * 0.5 + 0.3,
  settled: false,
  settleTime: 0,
});

const drawSnowflake = (s) => {
  const { x, y, radius: r, opacity } = s;
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.arc(0, 0, r / 2, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
  ctx.fill();

  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    const angle = (Math.PI / 3) * i;
    const xEnd = Math.cos(angle) * r * 1.5;
    const yEnd = Math.sin(angle) * r * 1.5;
    ctx.lineTo(xEnd, yEnd);
    ctx.stroke();
  }
  ctx.restore();
};

const updateSnowflake = (s, delta) => {
  if (!s.settled) {
    s.y += s.speed * delta;
    const elements = document.querySelectorAll('#allCentr, .box, #qrcodeList, button');
    for (const el of elements) {
      const rect = el.getBoundingClientRect();
      if (s.y >= rect.top && s.y <= rect.bottom && s.x >= rect.left && s.x <= rect.right) {
        s.settled = true;
        s.settleTime = Date.now();
        s.y = rect.top + Math.random() * 5;
        break;
      }
    }
    if (s.y > height) {
      s.settled = true;
      s.settleTime = Date.now();
    }
  } else {
    const age = Date.now() - s.settleTime;
    if (age > 3000) {
      s.opacity -= 0.01 * delta;
      if (s.opacity <= 0) return false;
    }
  }
  return true;
};

const animate = () => {
  const now = performance.now();
  const delta = (now - lastTime) / 16.67;
  lastTime = now;

  ctx.clearRect(0, 0, width, height);

  if (isSnowing && Math.random() < 0.7) {
    snowflakes.push(createSnowflake());
  }

  for (let i = snowflakes.length - 1; i >= 0; i--) {
    const s = snowflakes[i];
    drawSnowflake(s);
    if (!updateSnowflake(s, delta)) snowflakes.splice(i, 1);
  }

  if (isSnowing || snowflakes.length > 0) {
    animationFrameId = requestAnimationFrame(animate);
  }
};

const toggleButton = document.getElementById('toggleSnow');

// Восстанавливаем состояние из localStorage
const savedState = localStorage.getItem('isSnowing');
if (savedState === 'true') {
  isSnowing = true;
  toggleButton.textContent = 'Выключить Новогоднюю версию';
  lastTime = performance.now();
  animate();
} else {
  toggleButton.textContent = 'Новогодняя версия';
}

toggleButton.addEventListener('click', () => {
  isSnowing = !isSnowing;

  // Сохраняем состояние в localStorage
  localStorage.setItem('isSnowing', isSnowing);

  if (isSnowing) {
    lastTime = performance.now();
    animate();
    toggleButton.textContent = 'Выключить Новогоднюю версию';
  } else {
    toggleButton.textContent = 'Новогодняя версия';
  }
});

window.addEventListener('resize', () => {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
});

*/
