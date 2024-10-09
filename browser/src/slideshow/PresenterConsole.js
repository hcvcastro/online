/* -*- js-indent-level: 8 -*- */

/*
 * Copyright the Collabora Online contributors.
 *
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*
 * PresenterConsole
 */

/* global SlideShow _ */

class PresenterConsole {
	constructor(map) {
		this._map = map;
		this._firstPresenter = new SlideShow.SlideShowPresenter(map, {
			noHooks: true,
		});
		this._secondPresenter = new SlideShow.SlideShowPresenter(map, {
			noHooks: true,
		});
		this._firstPresenter.addEventCallback(L.bind(this._onEndTransition, this));
		this._map.on('presentationinfo', this._onPresentationInfo, this);
		this._map.on('newpresentinconsole', this._onPresentInConsole, this);
	}

	_generateHtml(title) {
		let sanitizer = document.createElement('div');
		sanitizer.innerText = title;

		let sanitizedTitle = sanitizer.innerHTML;
		return `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>${sanitizedTitle}</title>
			</head>
			<body>
                                <header>
                                </header>
                                <main id="main-content">
                                     <div id="first-presentation"></div>
                                     <div id="second-presentation">
                                         <div id="next-presentation"></div>
                                         <div id='notes'></div>
                                     </div>
                                </main>
                                <footer>
                                </footer>
			</body>
			</html>
			`;
	}

	_onEndTransition(slide) {
		let notes = this._firstPresenter.getNotes(slide);
		let elem = this._proxyPresenter.document.querySelector('#notes');
		if (elem) {
			elem.innerText = notes;
		}
	}

	_onPresentationInfo(content) {
		if (!this._proxyPresenter) return;

		this._firstPresenter.onSlideShowInfo(content, {
			noStart: true,
			noCenter: true,
		});
		this._firstPresenter._slideShowNavigator.enable();

		this._secondPresenter.onSlideShowInfo(content, {
			noStart: true,
			noCenter: true,
		});
		this._secondPresenter._slideShowNavigator.enable();

		let minSlide = Math.min(
			this._firstPresenter._startSlide + 1,
			this._firstPresenter._getSlidesCount() - 1,
		);
		let maxSlide = Math.max(0, this._firstPresenter._getSlidesCount() - 1);

		this._firstPresenter._slideShowNavigator.setMinMaxSlide(0, maxSlide);
		this._secondPresenter._slideShowNavigator.setMinMaxSlide(
			minSlide,
			this._secondPresenter._getSlidesCount(),
		);
		this._map.slideShowPresenter._slideShowNavigator.setMinMaxSlide(
			0,
			maxSlide,
		);
		this._firstPresenter._slideShowNavigator.startPresentation(
			this._firstPresenter._startSlide,
			true,
		);
		this._secondPresenter._slideShowNavigator.startPresentation(minSlide, true);
	}

	_onPresentInConsole(e) {
		this._map.fire('newpresentinwindow', {
			options: { noClick: true, noKeyDown: true },
		});

		let top = screen.height - 500;
		let left = screen.width - 800;
		this._proxyPresenter = window.open(
			'',
			'_blank',
			'popup,width=800,height=500,left=' + left + ',top=' + top,
		);
		if (!this._proxyPresenter) {
			this._firstPresenter._notifyBlockedPresenting();
			return;
		}

		this._map.off('newpresentinconsole', this._onPresentInConsole, this);

		this._proxyPresenter.document.open();
		this._proxyPresenter.document.write(
			this._generateHtml(_('Presenter Console')),
		);
		this._proxyPresenter.document.close();

		this._map.slideShowPresenter._slideShowWindowProxy.addEventListener(
			'unload',
			L.bind(this._onWindowClose, this),
		);
		this._proxyPresenter.addEventListener(
			'unload',
			L.bind(this._onConsoleClose, this),
		);

		this._proxyPresenter.document.body.style.margin = '0';
		this._proxyPresenter.document.body.style.padding = '0';
		this._proxyPresenter.document.body.style.overflow = 'hidden';
		this._proxyPresenter.document.body.style.display = 'flex';
		this._proxyPresenter.document.body.style.flexDirection = 'column';
		this._proxyPresenter.document.body.style.minHeight = '100vh';
		this._proxyPresenter.document.body.style.minWidth = '100vw';

		let elem = this._proxyPresenter.document.querySelector('#main-content');
		elem.style.display = 'flex';
		elem.style.flexDirection = 'row';
		elem.style.flexWrap = 'wrap';
		elem.style.minWidth = '100vh';
		elem.style.minHeight = '100vw';

		elem = this._proxyPresenter.document.querySelector('#first-presentation');
		elem.style.display = 'flex';
		elem.style.flexDirection = 'column';
		elem.style.flex = '1';

		elem = this._proxyPresenter.document.querySelector('#second-presentation');
		elem.style.display = 'flex';
		elem.style.flexDirection = 'column';
		elem.style.flex = '1';

		elem = this._proxyPresenter.document.querySelector('#next-presentation');
		elem.style.height = '50%';

		elem = this._proxyPresenter.document.querySelector('#notes');
		elem.style.height = '50%';

		let content = this._proxyPresenter.document.querySelector(
			'#first-presentation',
		);
		this._firstPresenter._createPresenterHTML(content, null, null, {
			noClick: true,
			render2d: true,
			noStyle: true,
		});
		content.style.width = '100%';
		content.style.height = '100%';

		content = this._proxyPresenter.document.querySelector('#next-presentation');
		this._secondPresenter._createPresenterHTML(content, null, null, {
			noClick: true,
			render2d: true,
			noStyle: true,
		});
		content.style.width = '100%';
		content.style.height = '50%';

		this._proxyPresenter.addEventListener('click', L.bind(this._onClick, this));
		this._proxyPresenter.addEventListener(
			'keydown',
			L.bind(this._onKeyDown, this),
		);
		this._firstPresenter._startSlide = this._secondPresenter._startSlide =
			e && e.startSlideNumber ? e.startSlideNumber : 0;
	}

	_onKeyDown(e) {
		this._firstPresenter.getNavigator().onKeyDown(e);
		this._secondPresenter.getNavigator().onKeyDown(e);
		this._map.slideShowPresenter.getNavigator().onKeyDown(e);
	}

	_onClick(e) {
		this._firstPresenter.getNavigator().onClick(e);
		this._secondPresenter.getNavigator().onClick(e);
		this._map.slideShowPresenter.getNavigator().onClick(e);
	}

	_onWindowClose() {
		if (this._proxyPresenter && !this._proxyPresenter.closed)
			this._proxyPresenter.close();

		this._map.slideShowPresenter._stopFullScreen();
	}

	_onConsoleClose() {
		if (
			this._map.slideShowPresenter._slideShowWindowProxy &&
			!this._map.slideShowPresenter._slideShowWindowProxy.closed
		)
			this._map.slideShowPresenter._slideShowWindowProxy.close();

		this._proxyPresenter.removeEventListener(
			'click',
			L.bind(this._onClick, this),
		);
		this._proxyPresenter.removeEventListener(
			'keydown',
			L.bind(this._onKeyDown, this),
		);
		this._firstPresenter._stopFullScreen();
		this._firstPresenter.getNavigator().quit();
		this._secondPresenter._stopFullScreen();
		this._secondPresenter.getNavigator().quit();
		delete this._proxyPresenter;
		this._map.on('newpresentinconsole', this._onPresentInConsole, this);
	}
}

SlideShow.PresenterConsole = PresenterConsole;
