const book = document.getElementById('book');
const totalSheets = 40;
let currentSheetIndex = 0;
let currentSettings = {
	fontSize: 18,
	lineHeight: 1.5
};

let pageFontSizes = [];
let pageLineHeights = [];

const cta = document.querySelector('.cta-container');
const bookContainer = document.querySelector('.book-container');
const closeAction = document.querySelector('.close-action-wrapper');
const bottomControl = document.getElementById('bottomControl');
const currentPageSpan = document.getElementById('currentPageNum');

const icons = {
	next: `<svg viewBox="0 0 24 24"><path d="M8.59,16.59L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.59Z"/></svg>`,
	prev: `<svg viewBox="0 0 24 24"><path d="M15.41,16.59L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.59Z"/></svg>`,
	audio: `<svg viewBox="0 0 24 24"><path d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18.01,19.86 21,16.28 21,12C21,7.72 18.01,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16.03C15.5,15.29 16.5,13.77 16.5,12M3,9V15H7L12,20V4L7,9H3Z"/></svg>`
};

function loadSettings() {
	pageFontSizes = new Array(totalSheets);
	pageLineHeights = new Array(totalSheets);

	const savedFontSizes = localStorage.getItem('story_fontSizes');
	const savedLineHeights = localStorage.getItem('story_lineHeights');
	const savedCurFont = localStorage.getItem('story_currentFontSize');
	const savedCurLine = localStorage.getItem('story_currentLineHeight');

	if (savedFontSizes) {
		try {
			const parsed = JSON.parse(savedFontSizes);
			for (let i = 0; i < totalSheets; i++) {
				if (parsed[i] != null) pageFontSizes[i] = parseFloat(parsed[i]);
			}
		} catch (e) {}
	}
	if (savedLineHeights) {
		try {
			const parsed = JSON.parse(savedLineHeights);
			for (let i = 0; i < totalSheets; i++) {
				if (parsed[i] != null) pageLineHeights[i] = parseFloat(parsed[i]);
			}
		} catch (e) {}
	}
	if (savedCurFont) currentSettings.fontSize = parseFloat(savedCurFont);
	if (savedCurLine) currentSettings.lineHeight = parseFloat(savedCurLine);
}

function saveSettings() {
	localStorage.setItem('story_fontSizes', JSON.stringify(pageFontSizes));
	localStorage.setItem('story_lineHeights', JSON.stringify(pageLineHeights));
	localStorage.setItem('story_currentFontSize', currentSettings.fontSize);
	localStorage.setItem('story_currentLineHeight', currentSettings.lineHeight);
}

function isOverflowing(poemPage) {
	if (poemPage.scrollHeight > poemPage.clientHeight) return true;
	const paras = poemPage.querySelectorAll('p');
	for (let p of paras) {
		if (p.scrollWidth > p.clientWidth) return true;
	}
	return false;
}

function fitCurrentPage() {
	if (currentSheetIndex < 1 || currentSheetIndex >= totalSheets) return;

	const poemPage = document.querySelector(`#sheet-${currentSheetIndex} .back .poem-page`);
	if (!poemPage) return;

	const pElements = poemPage.querySelectorAll('p');
	if (!pElements.length) return;

	let fontSize = pageFontSizes[currentSheetIndex] !== undefined ? pageFontSizes[currentSheetIndex] : currentSettings.fontSize;
	let lineHeight = pageLineHeights[currentSheetIndex] !== undefined ? pageLineHeights[currentSheetIndex] : currentSettings.lineHeight;

	pElements.forEach(p => {
		p.style.fontSize = fontSize + 'px';
		p.style.lineHeight = lineHeight;
	});

	while (isOverflowing(poemPage) && fontSize > 8) {
		fontSize -= 0.5;
		pElements.forEach(p => p.style.fontSize = fontSize + 'px');
	}

	pageFontSizes[currentSheetIndex] = fontSize;
	pageLineHeights[currentSheetIndex] = lineHeight;

	currentSettings.fontSize = fontSize;
	currentSettings.lineHeight = lineHeight;

	saveSettings();
}

function initBook() {
	loadSettings();

	const gs = bookData.globalSettings || {
		headerFontSize: "20px",
		headerColor: "#000",
		textFontSize: "16px",
		textColor: "#000",
		lineHeight: "1.4",
		enableAudio: true
	};

	currentSettings.fontSize = parseInt(gs.textFontSize) || 18;
	currentSettings.lineHeight = parseFloat(gs.lineHeight) || 1.5;

	for (let i = 0; i < totalSheets; i++) {
		const sheet = document.createElement('div');
		sheet.classList.add('sheet');
		sheet.id = `sheet-${i}`;
		sheet.style.zIndex = totalSheets - i;
		sheet.style.setProperty('--tz', `-${i * 2.6}px`);

		const front = document.createElement('div');
		front.classList.add('sheet-face', 'front');
		const back = document.createElement('div');
		back.classList.add('sheet-face', 'back');

		const btnPrev = i > 0 ? `<button class="nav-btn-round" onclick="goPrev(event)">${icons.prev}</button>` : '';
		const btnNext = i < totalSheets - 1 ? `<button class="nav-btn-round" onclick="goNext(event)">${icons.next}</button>` : '';
		const navHTML = `<div class="page-nav">${btnPrev}${btnNext}</div>`;

		if (i === 0) {
			front.classList.add('cover-front');
			front.innerHTML = `<img src="cover.jpg" class="cover-front-image" alt="Cover">`;
			back.classList.add('cover-inside');
			back.innerHTML = navHTML;
		} else {
			const poemIndex = i - 1;
			const poem = bookData.poems[poemIndex];

			if (i === 1) {
				front.innerHTML = `<div class="title-page"><h2>The fairy tale begins</h2></div>`;
			} else {
				const realImgIdx = i - 1;
				front.innerHTML = `
					<div class="image-placeholder">
						<img src="image/image${realImgIdx}.webp" 
							onerror="this.onerror=null; this.parentElement.style.backgroundColor='#FFA500'; this.parentElement.style.color='#FFFBF0'; this.parentElement.style.fontSize='1.5rem'; this.parentElement.style.display='flex'; this.parentElement.style.alignItems='center'; this.parentElement.style.justifyContent='center'; this.parentElement.innerHTML='Mimi-Book Img ${realImgIdx}';" 
							alt="Image ${realImgIdx}">
					</div>
				`;
			}

			if (poem) {
				const hStyle = `font-size: ${gs.headerFontSize}; color: ${gs.headerColor}; text-align: center;`;
				const localStyles = poem.styles || {};
				const pStyle = `
					font-size: ${gs.textFontSize};
					line-height: ${gs.lineHeight};
					color: ${localStyles.color || gs.textColor};
					text-align: center;
				`;

				let btnAudio = '';
				if (gs.enableAudio && poem.audio) {
					btnAudio = `<button class="nav-btn-round" onclick="playAudio(${i})">${icons.audio}</button>`;
				}

				const backNavHTML = `<div class="page-nav">${btnPrev}${btnAudio}${btnNext}</div>`;

				back.innerHTML = `
					<div class="poem-page" data-page="${i}">
						<h3 style="${hStyle}">${poem.title}</h3>
						<p style="${pStyle}">${poem.content}</p>
					</div>
					${backNavHTML}
				`;

			} else {
				back.innerHTML = `<div class="page-number-big">${i * 2}</div>${navHTML}`;
			}
		}

		sheet.appendChild(front);
		sheet.appendChild(back);
		book.appendChild(sheet);
	}

	const backCover = document.createElement('div');
	backCover.classList.add('hard-cover-back');
	book.appendChild(backCover);
}

initBook();

let isAnimating = false;

function openBook() {
	if (isAnimating) return;
	isAnimating = true;

	cta.classList.add('hidden');
	bookContainer.classList.add('open');

	setTimeout(() => {
		flipSheet(0);
		setTimeout(() => {
			closeAction.classList.add('active');
			bottomControl.classList.add('visible');
			updatePageCounter();
			fitCurrentPage();
			isAnimating = false;
			updateKbHintPosition();
		}, 800);
	}, 600);
}

function closeBook() {
	if (isAnimating) return;
	isAnimating = true;

	stopCurrentAudio();

	const sheets = document.querySelectorAll('.sheet');
	sheets.forEach(s => s.classList.remove('flipped'));

	closeAction.classList.remove('active');
	bottomControl.classList.remove('visible');
	
	updateKbHintPosition();

	currentSheetIndex = 0;
	setTimeout(() => {
		bookContainer.classList.remove('open');
		setTimeout(() => {
			cta.classList.remove('hidden');
			isAnimating = false;
		}, 1000);
	}, 800);
}

function updatePageCounter() {
	if (currentPageSpan) currentPageSpan.innerText = currentSheetIndex + 1;
}

function goNext(event) {
	stopCurrentAudio();
	
	if (event) event.stopPropagation();
	if (currentSheetIndex < totalSheets - 1) {
		currentSheetIndex++;
		flipSheet(currentSheetIndex);
		setTimeout(() => {
			fitCurrentPage();
			updatePageCounter();
		}, 400);
	}
}

function goPrev(event) {
	stopCurrentAudio();

	if (event) event.stopPropagation();
	if (currentSheetIndex > 0) {
		unflipSheet(currentSheetIndex);
		currentSheetIndex--;
		setTimeout(() => {
			fitCurrentPage();
			updatePageCounter();
		}, 400);
	}
}

function flipSheet(index) {
	const sheet = document.getElementById(`sheet-${index}`);
	if(!sheet) return;
	sheet.classList.add('flipped');
	sheet.style.zIndex = 100 + index;
}

function unflipSheet(index) {
	const sheet = document.getElementById(`sheet-${index}`);
	if(!sheet) return;
	sheet.classList.remove('flipped');
	setTimeout(() => {
		sheet.style.zIndex = totalSheets - index;
	}, 500);
}

let currentAudioPlayer = null;

const audioIcons = {
	play: `<svg viewBox="0 0 24 24"><path d="M8,5.14V19.14L19,12.14L8,5.14Z"/></svg>`,
	pause: `<svg viewBox="0 0 24 24"><path d="M14,19H18V5H14M6,19H10V5H6V19Z"/></svg>`
};

function formatTime(seconds) {
	if (isNaN(seconds) || !isFinite(seconds)) return "00:00";
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateAudioTimeDisplay() {
	const timeSpan = document.getElementById('audioTime');
	if (!timeSpan) return;
	if (currentAudioPlayer && currentAudioPlayer.duration) {
		const current = formatTime(currentAudioPlayer.currentTime);
		const total = formatTime(currentAudioPlayer.duration);
		timeSpan.textContent = `${current} / ${total}`;
	} else {
		timeSpan.textContent = "00:00 / 00:00";
	}
}

function updateAudioButton(isPlaying) {
	const btn = document.querySelector('.audio-btn-main');
	if (!btn) return;
	if (isPlaying) {
		btn.innerHTML = `${audioIcons.pause} Pause`;
		btn.classList.add('playing');
	} else {
		btn.innerHTML = `${audioIcons.play} Listen`;
		btn.classList.remove('playing');
	}
}

function onAudioLoadedMetadata(event) {
	const audio = event.target;
	if (audio !== currentAudioPlayer) return;
	const sliderContainer = document.querySelector('.audio-progress-container');
	const slider = document.getElementById('ttsProgress');
	if (!sliderContainer || !slider) return;
	sliderContainer.classList.add('active');
	slider.max = audio.duration;
	slider.step = 0.01;
	updateAudioTimeDisplay();
	updateKbHintPosition();
}

function onAudioDurationChange(event) {
	const audio = event.target;
	if (audio !== currentAudioPlayer) return;
	const slider = document.getElementById('ttsProgress');
	if (slider) {
		slider.max = audio.duration;
	}
	updateAudioTimeDisplay();
}

function onAudioTimeUpdate(event) {
	const audio = event.target;
	if (audio !== currentAudioPlayer) return;
	const slider = document.getElementById('ttsProgress');
	if (!slider || !audio.duration) return;

	slider.max = audio.duration;
	slider.value = audio.currentTime;

	const pct = (audio.currentTime / audio.duration) * 100;
	slider.style.backgroundSize = pct + '% 100%';
	updateAudioTimeDisplay();
}

function onAudioPlay(event) {
	if (event.target !== currentAudioPlayer) return;
	updateAudioButton(true);
}

function onAudioPause(event) {
	if (event.target !== currentAudioPlayer) return;
	updateAudioButton(false);
}

function onAudioEnded(event) {
	if (event.target !== currentAudioPlayer) return;
	updateAudioButton(false);
	const slider = document.getElementById('ttsProgress');
	if (slider) {
		slider.value = 0;
		slider.style.backgroundSize = '0% 100%';
	}
	updateAudioTimeDisplay();
	const sliderContainer = document.querySelector('.audio-progress-container');
	if (sliderContainer) sliderContainer.classList.remove('active');
	updateKbHintPosition();

	currentAudioPlayer = null;
	updateStopButtonVisibility();
}

function waitForAnimation(element) {
	return new Promise((resolve) => {
		if (!element) return resolve();
		
		const onFinish = () => {
			element.removeEventListener('transitionend', onFinish);
			element.removeEventListener('animationend', onFinish);
			resolve();
		};
		
		element.addEventListener('transitionend', onFinish);
		element.addEventListener('animationend', onFinish);
		
		setTimeout(resolve, 500);
	});
}

async function playAudio(pageIndex) {
	const poem = bookData.poems[pageIndex - 1];
	if (!poem || !poem.audio) {
		showNoAudioModal();
		return;
	}

	const audioPath = `audio/audio${pageIndex}.m4a`;
	const sliderContainer = document.querySelector('.audio-progress-container');
	const slider = document.getElementById('ttsProgress');

	if (currentAudioPlayer && currentAudioPlayer.src.includes(audioPath)) {
		sliderContainer.classList.add('active');
		if (currentAudioPlayer.paused) {
			await currentAudioPlayer.play();
		} else {
			currentAudioPlayer.pause();
		}
		return;
	}

	await stopAndHideCurrentAudio();

	const newAudio = new Audio(audioPath);
	currentAudioPlayer = newAudio;

	updateAudioTimeDisplay();
	if (slider) {
		slider.value = 0;
		slider.style.backgroundSize = '0% 100%';
	}
	if (sliderContainer) sliderContainer.classList.remove('active');

	newAudio.addEventListener('loadedmetadata', onAudioLoadedMetadata);
	newAudio.addEventListener('durationchange', onAudioDurationChange);
	newAudio.addEventListener('timeupdate', onAudioTimeUpdate);
	newAudio.addEventListener('play', onAudioPlay);
	newAudio.addEventListener('pause', onAudioPause);
	newAudio.addEventListener('ended', onAudioEnded);

	await showStopButton();

	try {
		await newAudio.play();
	} catch (error) {
		console.error('Audio play error:', error);
		await hideStopButton();
		showNoAudioModal();
		currentAudioPlayer = null;
	}
}

function stopCurrentAudio() {
	if (currentAudioPlayer) {
		currentAudioPlayer.pause();
		currentAudioPlayer.currentTime = 0;
	}
	const slider = document.getElementById('ttsProgress');
	if (slider) {
		slider.value = 0;
		slider.style.backgroundSize = '0% 100%';
	}
	const sliderContainer = document.querySelector('.audio-progress-container');
	if (sliderContainer) sliderContainer.classList.remove('active');
	updateAudioTimeDisplay();
	updateAudioButton(false);
	updateKbHintPosition();

	currentAudioPlayer = null;
	updateStopButtonVisibility();
}

function playCurrentAudio() {
	if (currentSheetIndex === 0 || currentSheetIndex === totalSheets - 1) {
		showAudioModal();
		return;
	}
	playAudio(currentSheetIndex);
}

function seekTTS(value) {
	if (currentAudioPlayer) {
		currentAudioPlayer.currentTime = value;
		updateAudioTimeDisplay();
	}
}

function addStopButton() {
	const bottomCtrl = document.getElementById('bottomControl');
	if (!bottomCtrl || bottomCtrl.querySelector('.audio-stop-btn')) return;

	const stopBtn = document.createElement('button');
	stopBtn.className = 'audio-stop-btn';
	stopBtn.innerHTML = `<svg viewBox="0 0 24 24" width="32" height="32" style="fill:currentColor"><path d="M4,4H20V20H4V4Z"/></svg> Stop`;
	
	stopBtn.addEventListener('click', (e) => {
		e.stopPropagation();
		stopCurrentAudio();
	});

	const audioBtn = bottomCtrl.querySelector('.audio-btn-main');
	if (audioBtn) {
		audioBtn.insertAdjacentElement('afterend', stopBtn);
	}
}

function waitForTransition(element) {
	return new Promise(resolve => {
		if (!element) return resolve();
		const onTransitionEnd = (e) => {
			if (e.target === element) {
				element.removeEventListener('transitionend', onTransitionEnd);
				resolve();
			}
		};
		element.addEventListener('transitionend', onTransitionEnd);
		setTimeout(resolve, 500);
	});
}

async function showStopButton() {
	const stopBtn = document.querySelector('.audio-stop-btn');
	if (!stopBtn) return;
	if (stopBtn.classList.contains('visible')) return;
	
	stopBtn.classList.add('visible');
	await waitForAnimation(stopBtn);
}

async function hideStopButton() {
	const stopBtn = document.querySelector('.audio-stop-btn');
	if (!stopBtn) return;
	if (!stopBtn.classList.contains('visible')) return;
	stopBtn.classList.remove('visible');
	await waitForAnimation(stopBtn);
}

async function stopAndHideCurrentAudio() {
	if (!currentAudioPlayer) return;

	currentAudioPlayer.pause();
	currentAudioPlayer.currentTime = 0;

	await hideStopButton();

	const slider = document.getElementById('ttsProgress');
	if (slider) {
		slider.value = 0;
		slider.style.backgroundSize = '0% 100%';
	}
	const sliderContainer = document.querySelector('.audio-progress-container');
	if (sliderContainer) sliderContainer.classList.remove('active');
	updateAudioTimeDisplay();
	updateAudioButton(false);

	currentAudioPlayer = null;
}

async function onAudioEnded(event) {
	if (event.target !== currentAudioPlayer) return;
	updateAudioButton(false);
	const slider = document.getElementById('ttsProgress');
	if (slider) {
		slider.value = 0;
		slider.style.backgroundSize = '0% 100%';
	}
	updateAudioTimeDisplay();
	const sliderContainer = document.querySelector('.audio-progress-container');
	if (sliderContainer) sliderContainer.classList.remove('active');
	updateKbHintPosition();
	await hideStopButton();
	currentAudioPlayer = null;
}

function updateStopButtonVisibility() {
	const stopBtn = document.querySelector('.audio-stop-btn');
	if (currentAudioPlayer) {
		stopBtn.classList.add('visible');
	} else {
		stopBtn.classList.remove('visible');
	}
}

window.addEventListener('load', addStopButton);

function showNoAudioModal() {
	const old = document.getElementById('audio-modal');
	if(old) old.remove();

	const modal = document.createElement('div');
	modal.id = 'audio-modal';
	modal.innerHTML = `
		<div class="audio-modal-content">
			<p>Unfortunately, there is no voiceover for this verse yet.</p>
			<button onclick="this.parentElement.parentElement.remove()">OK</button>
		</div>
	`;
	document.body.appendChild(modal);
}

function showAudioModal() {
	const modal = document.createElement('div');
	modal.id = 'audio-modal';
	modal.innerHTML = `
		<div class="audio-modal-content">
			<p>This page is not being announced.</p>
			<button onclick="this.parentElement.parentElement.remove()">OK</button>
		</div>
	`;
	document.body.appendChild(modal);
}

let bookmarks = JSON.parse(localStorage.getItem('story_bookmarks')) || [];
let currentFocusIndex = -1;

function togglePanel(type = null) {
	const panel = document.getElementById('side-panel');
	const overlay = document.getElementById('panel-overlay');
	const content = document.getElementById('panel-content');

	if (!type || (panel.classList.contains('active') && panel.dataset.type === type)) {
		panel.classList.remove('active');
		overlay.style.display = 'none';
		currentFocusIndex = -1;
		return;
	}

	panel.dataset.type = type;
	renderPanelContent(type, content);
	panel.classList.add('active');
	overlay.style.display = 'block';
	
	currentFocusIndex = -1;
}

function renderPanelContent(type, container) {
	let html = '';
	const bookmarkIconSvg = `<svg class="panel-bookmark-icon" viewBox="0 0 24 24"><path d="M17,3H7A2,2 0 0,0 5,5V21L12,18L19,21V5C19,3.89 18.1,3 17,3Z"/></svg>`;
	
	switch (type) {
		case 'toc':
			html = '<h2>Contents</h2>';
			bookData.poems.forEach((p, idx) => {
				const pageNum = (idx + 1) * 2;
				html += `<div class="panel-item" onclick="jumpToPage(${pageNum})">${idx + 1}. ${p.title.replace(/<br>/g, ' ')}</div>`;
			});
			break;

		case 'bookmarks':
			html = '<h2>Your bookmarks</h2>';
			if (bookmarks.length === 0) {
				html += '<p>There are no bookmarks yet</p>';
			} else {
				bookmarks.sort((a, b) => a - b).forEach(page => {
					html += `
						<div class="panel-item" onclick="jumpToPage(${page})" style="display:flex; justify-content:space-between; align-items:center;">
							<span>${bookmarkIconSvg} Page ${page}</span>
							<button class="delete-bookmark-btn" onclick="removeBookmark(event, ${page})" title="Delete">
								<svg viewBox="0 0 24 24"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19V4M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/></svg>
							</button>
						</div>`;
				});
			}
			if (currentSheetIndex > 0) {
				html += `<button class="nav-btn" style="margin-top:20px; width:100%" onclick="addBookmark(${currentSheetIndex})">Add the current one</button>`;
			}
			break;

		case 'settings':
			const availableColors = ['#000', '#555', '#1e3a5f', '#8b4513'];
			const activeColor = currentSettings.textColor || '#000';

			let colorDotsHtml = '';
			availableColors.forEach(color => {
				const isActive = (color === activeColor) ? 'active-color' : '';
				colorDotsHtml += `<div class="color-dot ${isActive}" style="background:${color}" onclick="updateTextColor('${color}')"></div>`;
			});

			html = `<h2>Settings</h2>
							<div class="setting-group">
								<label>Text size: <span id="fs-val">${currentSettings.fontSize}</span>px</label>
								<input type="range" min="14" max="24" value="${currentSettings.fontSize}"
									oninput="updateFontSize(this.value); document.getElementById('fs-val').innerText=this.value">
							</div>
							<div class="setting-group">
								<label>Interval: <span id="lh-val">${currentSettings.lineHeight}</span></label>
								<input type="range" min="1" max="2.0" step="0.1" value="${currentSettings.lineHeight}"
									oninput="updateLineHeight(this.value); document.getElementById('lh-val').innerText=this.value">
							</div>
							<div class="setting-group">
								<label>Text color</label>
								<div style="display:flex; gap:10px; margin-top:10px">
									${colorDotsHtml}
								</div>
							</div>`;
			break;

		case 'search':
			html = `<h2>Search</h2>
							<input type="text" class="search-input" placeholder="Enter the word..." oninput="doSearch(this.value)">
							<div id="search-results"></div>`;
			break;
	}
	container.innerHTML = html;
}

function updateFontSize(size) {
	const newSize = parseFloat(size);
	if (isNaN(newSize)) return;
	if (currentSheetIndex < 1 || currentSheetIndex >= totalSheets) return;

	const poemPage = document.querySelector(`#sheet-${currentSheetIndex} .back .poem-page`);
	if (!poemPage) return;

	const pElements = poemPage.querySelectorAll('p');
	if (!pElements.length) return;

	const oldSize = currentSettings.fontSize;
	pElements.forEach(p => p.style.fontSize = newSize + 'px');

	if (isOverflowing(poemPage)) {
		pElements.forEach(p => p.style.fontSize = oldSize + 'px');
		const fsVal = document.getElementById('fs-val');
		if (fsVal) fsVal.innerText = oldSize;
		const rangeInput = document.querySelector('input[type="range"][oninput*="updateFontSize"]');
		if (rangeInput) rangeInput.value = oldSize;
	} else {
		currentSettings.fontSize = newSize;
		pageFontSizes[currentSheetIndex] = newSize;
		saveSettings();
	}
}

function updateLineHeight(val) {
	const newLH = parseFloat(val);
	if (isNaN(newLH)) return;
	if (currentSheetIndex < 1 || currentSheetIndex >= totalSheets) return;

	const poemPage = document.querySelector(`#sheet-${currentSheetIndex} .back .poem-page`);
	if (!poemPage) return;

	const pElements = poemPage.querySelectorAll('p');
	if (!pElements.length) return;

	const oldLH = currentSettings.lineHeight;
	pElements.forEach(p => p.style.lineHeight = newLH);

	if (isOverflowing(poemPage)) {
		pElements.forEach(p => p.style.lineHeight = oldLH);
		const lhVal = document.getElementById('lh-val');
		if (lhVal) lhVal.innerText = oldLH.toFixed(1);
		const rangeInput = document.querySelector('input[type="range"][oninput*="updateLineHeight"]');
		if (rangeInput) rangeInput.value = oldLH;
	} else {
		currentSettings.lineHeight = newLH;
		pageLineHeights[currentSheetIndex] = newLH;
		saveSettings();
	}
}

function updateTextColor(color) {
	document.querySelectorAll('.poem-page p, .poem-page h3').forEach(el => {
		el.style.color = color;
	});

	currentSettings.textColor = color;
	saveSettings();

	document.querySelectorAll('.color-dot').forEach(dot => {
		if (dot.getAttribute('onclick').includes(color)) {
			dot.classList.add('active-color');
		} else {
			dot.classList.remove('active-color');
		}
	});
}

function jumpToPage(targetPage) {
	if (!bookContainer.classList.contains('open')) {
		openBook();
		setTimeout(() => processJumpToPage(targetPage), 800);
	} else {
		processJumpToPage(targetPage);
	}
	togglePanel();
}

function processJumpToPage(targetPage) {
	const targetSheetIndex = targetPage / 2; 
	if (targetSheetIndex < 0 || targetSheetIndex >= totalSheets) return;
	if (targetSheetIndex === currentSheetIndex) return;

	const diff = targetSheetIndex - currentSheetIndex;
	const absDiff = Math.abs(diff);
	for (let i = 0; i < absDiff; i++) {
		setTimeout(() => {
			if (diff > 0) {
				goNext();
			} else {
				goPrev();
			}
		}, i * 150);
	}
}

function addBookmark(sheetIndex) {
	if (sheetIndex <= 0) return;
	const pageNum = sheetIndex * 2; 
	
	if (!bookmarks.includes(pageNum)) {
		bookmarks.push(pageNum);
		localStorage.setItem('story_bookmarks', JSON.stringify(bookmarks));
		togglePanel('bookmarks');
	}
}

function removeBookmark(event, page) {
	event.stopPropagation();
	bookmarks = bookmarks.filter(item => item !== page);
	localStorage.setItem('story_bookmarks', JSON.stringify(bookmarks));
	renderPanelContent('bookmarks', document.getElementById('panel-content'));
}

function doSearch(query) {
	const results = document.getElementById('search-results');
	if (query.length < 2) { results.innerHTML = ''; return; }

	let found = bookData.poems
		.map((p, i) => p.content.toLowerCase().includes(query.toLowerCase()) ? i + 1 : null)
		.filter(v => v !== null);

	results.innerHTML = found.map(idx =>
		`<div class="panel-item" onclick="jumpToPage(${(idx + 1) * 2})">Found on page ${(idx + 1) * 2}</div>`
	).join('');
}

function toggleKeyboardModal() {
	const modal = document.getElementById('kb-modal-overlay');
	if (modal) {
		modal.classList.toggle('active');
	}
}

document.addEventListener('keydown', function (event) {
	if (event.ctrlKey && (event.key === '+' || event.key === '-' || event.key === '=' || event.keyCode === 107 || event.keyCode === 109)) {
		event.preventDefault();
		return;
	}

	if (event.code === 'Digit5') {
		const panel = document.getElementById('side-panel');
		if (panel && panel.classList.contains('active')) {
			togglePanel();
		}
		toggleKeyboardModal();
		return;
	}

	const kbModal = document.getElementById('kb-modal-overlay');
	const isKbModalActive = kbModal && (kbModal.classList.contains('active') || kbModal.style.display === 'flex');
	
	if (isKbModalActive) {
		if (event.key === 'Escape') {
			toggleKeyboardModal();
			return;
		}
		
		if (['Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(event.code)) {
			toggleKeyboardModal();
		} else {
			event.preventDefault();
			event.stopPropagation();
			return;
		}
	}

	const panel = document.getElementById('side-panel');
	const isPanelActive = panel && panel.classList.contains('active');

	if (event.code === 'Digit1') { togglePanel('toc'); return; }
	if (event.code === 'Digit2') { togglePanel('bookmarks'); return; }
	if (event.code === 'Digit3') { togglePanel('search'); return; }
	if (event.code === 'Digit4') { togglePanel('settings'); return; }
	
	const audioModal = document.querySelector('.swal2-container') || document.getElementById('audio-modal'); 
	const isAudioModalActive = !!audioModal;

	if (isAudioModalActive) {
		if (event.key === 'Escape' || event.key === 'Enter') {
			if (window.Swal) Swal.close(); 
			else if (audioModal) audioModal.remove(); 
		}
		event.preventDefault();
		return;
	}

	if (isPanelActive) {
		const focusableItems = panel.querySelectorAll('.panel-item, input[type="range"], .color-dot, .nav-btn, .search-input, .delete-bookmark-btn');

		if (event.key === 'Escape') {
			togglePanel();
			return;
		}

		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			
			if (typeof currentFocusIndex !== 'undefined' && currentFocusIndex >= 0 && focusableItems[currentFocusIndex]) {
				focusableItems[currentFocusIndex].classList.remove('keyboard-focus');
			}

			if (event.key === 'ArrowDown') {
				currentFocusIndex = (currentFocusIndex + 1) % focusableItems.length;
			} else {
				currentFocusIndex = (currentFocusIndex - 1 + focusableItems.length) % focusableItems.length;
			}

			const nextItem = focusableItems[currentFocusIndex];
			nextItem.classList.add('keyboard-focus');
			nextItem.scrollIntoView({ block: 'nearest' });
			
			if (nextItem.tagName === 'INPUT') {
				nextItem.focus();
			} else {
				document.activeElement.blur();
			}
			return;
		}

		if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
			const activeEl = focusableItems[currentFocusIndex];
			
			if (activeEl && activeEl.classList.contains('color-dot')) {
				event.preventDefault();
				activeEl.classList.remove('keyboard-focus');
				
				if (event.key === 'ArrowRight') {
					currentFocusIndex = (currentFocusIndex + 1) % focusableItems.length;
				} else {
					currentFocusIndex = (currentFocusIndex - 1 + focusableItems.length) % focusableItems.length;
				}
				
				focusableItems[currentFocusIndex].classList.add('keyboard-focus');
				return;
			}

			if (activeEl && activeEl.tagName === 'INPUT' && activeEl.type === 'range') {
				return; 
			}
		}

		if (event.key === 'Enter') {
			const activeEl = focusableItems[currentFocusIndex];
			if (activeEl) {
				event.preventDefault();
				activeEl.click();
				return;
			}
		}

		if (event.target.tagName === 'INPUT' && !['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(event.key)) {
			return;
		}

		if (event.code === 'Space' || event.key.includes('Arrow')) {
			event.preventDefault();
			return;
		}
	}

	if (event.target.tagName === 'INPUT') return;

	const isOpen = bookContainer.classList.contains('open');

	switch (event.code) {
		case 'Space':
			event.preventDefault();
			if (typeof isAnimating !== 'undefined' && isAnimating) break;
			if (!isOpen) openBook();
			else closeBook();
			break;

		case 'ArrowRight':
			if (isOpen) goNext(event);
			break;

		case 'ArrowLeft':
			if (isOpen) goPrev(event);
			break;

		case 'ArrowUp':
			if (isOpen) {
				event.preventDefault();
				if (typeof playCurrentAudio === 'function') playCurrentAudio();
			}
			break;

		case 'ArrowDown':
			if (isOpen) {
				event.preventDefault();
				if (typeof stopCurrentAudio === 'function') stopCurrentAudio();
			}
			break;

		case 'Escape':
			if (isOpen) closeBook();
			break;
	}
});

document.querySelectorAll('.menu-btn, .nav-btn-main, .audio-btn-main').forEach(btn => {
	btn.addEventListener('click', function() {
		this.blur();
	});
});

document.addEventListener('wheel', function (event) {
	if (event.ctrlKey) {
		event.preventDefault();
	}
}, { passive: false });

document.addEventListener('contextmenu', function(event) {
	event.preventDefault();
}, false);

document.addEventListener('keydown', function(event) {
	if (event.key === 'F12' || event.keyCode === 123) {
		event.preventDefault();
		return false;
	}

	if (event.ctrlKey && event.shiftKey && (event.key === 'I' || event.key === 'J' || event.keyCode === 73 || event.keyCode === 74)) {
		event.preventDefault();
		return false;
	}

	if (event.ctrlKey && (event.key === 'u' || event.key === 'U' || event.keyCode === 85)) {
		event.preventDefault();
		return false;
	}
	
	if (event.ctrlKey && (event.key === 's' || event.key === 'S' || event.keyCode === 83)) {
		event.preventDefault();
		return false;
	}
}, false);

document.addEventListener('keydown', function(event) {
	if (event.key === 'Escape') {
		const panel = document.getElementById('side-panel');
		if (panel && panel.classList.contains('active')) {
			togglePanel();
		}
	}
});

function createParticles(count = 180) {
	const container = document.getElementById('particles-container');
	if (!container) return;

	const centerX = window.innerWidth / 2;
	const centerY = window.innerHeight / 2;

	for (let i = 0; i < count; i++) {
		const particle = document.createElement('div');
		particle.className = 'particle';
		
		const size = Math.random() * 5 + 3;
		particle.style.width = `${size}px`;
		particle.style.height = `${size}px`;

		const startOffsetX = (Math.random() - 0.5) * 60;
		const startOffsetY = (Math.random() - 0.5) * 60;
		
		particle.style.left = `${centerX + startOffsetX}px`;
		particle.style.top = `${centerY + startOffsetY}px`;

		const duration = Math.random() * 6 + 6; 
		const destinationX = (Math.random() - 0.5) * 800;
		const destinationY = (Math.random() - 0.5) * 800;
		const delay = Math.random() * 8;

		particle.animate([
			{ transform: `translate(0, 0) scale(0)`, opacity: 0 },
			{ opacity: 1, offset: 0.1 }, 
			{ opacity: 0.7, offset: 0.8 },
			{ transform: `translate(${destinationX}px, ${destinationY}px) scale(1.1)`, opacity: 0 }
		], {
			duration: duration * 1000,
			delay: delay * -1000,
			iterations: Infinity,
			easing: 'ease-out'
		});

		container.appendChild(particle);
	}
}

window.addEventListener('load', () => createParticles(150));

const openBtn = document.querySelector('.cta-btn');
if (openBtn) {
	openBtn.addEventListener('click', function() {
		if (book) book.classList.add('open');
		this.blur();
	});
}

function updateKbHintPosition() {
	const trigger = document.querySelector('.kb-hint-trigger');
	const bottomCtrl = document.getElementById('bottomControl');
	if (!trigger || !bottomCtrl) return;

	const isVisible = bottomCtrl.classList.contains('visible');
	if (!isVisible) {
		trigger.style.bottom = '20px';
	} else {
		const ctrlHeight = bottomCtrl.offsetHeight;
		trigger.style.bottom = (ctrlHeight + 10) + 'px';
	}
}

if (bottomControl) {
	const resizeObserver = new ResizeObserver(() => {
		updateKbHintPosition();
	});
	resizeObserver.observe(bottomControl);
}

window.addEventListener('load', updateKbHintPosition);
window.addEventListener('resize', updateKbHintPosition);
