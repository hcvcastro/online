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
 * Scroll methods
 */
L.Map.include({
	scroll: function (x, y) {
		if (typeof (x) !== 'number' || typeof (y) !== 'number') {
			return;
		}
		this.panBy(new L.Point(x, y));
	},

	scrollOffset: function () {
		var center = this.project(this.getCenter());
		var centerOffset = center.subtract(this.getSize().divideBy(2));
		var offset = {};
		offset.x = centerOffset.x < 0 ? 0 : Math.round(centerOffset.x);
		offset.y = Math.round(centerOffset.y);
		return offset;
	},

	scrollTop: function (y) {
		var offset = this.scrollOffset();
		window.app.console.debug('scrollTop: ' + y + ' ' + offset.y + ' ' + (y - offset.y));
		this.panBy(new L.Point(0, y - offset.y));
	},

	scrollLeft: function (x) {
		var offset = this.scrollOffset();
		this.panBy(new L.Point(x - offset.x, 0));
	},
});
