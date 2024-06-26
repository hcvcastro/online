/* global describe it cy require beforeEach */

var helper = require('../../common/helper');
var { insertImage, deleteImage, assertImageSize } = require('../../common/desktop_helper');
var desktopHelper = require('../../common/desktop_helper');

describe(['tagdesktop'], 'Image Operation Tests', function() {

	beforeEach(function() {
		helper.setupAndLoadDocument('calc/image_operation.ods');
		desktopHelper.switchUIToNotebookbar();
	});

	it('Insert/Delete Image',function() {
		insertImage('calc');

		//make sure that image is in focus
		cy.cGet('#document-container svg g').should('exist');

		deleteImage();
	});

	it.skip('Resize image when keep ratio option enabled and disabled', function() {
		insertImage('calc');
		//when Keep ratio is unchecked
		assertImageSize(248, 63);

		helper.waitUntilIdle('.ui-expander-label');

		cy.cGet().contains('.ui-expander-label', 'Position and Size')
			.click();

		helper.waitUntilIdle('#selectwidth input');

		cy.cGet('#selectwidth input').clear({force:true})
			.type('3{enter}', {force:true});

		helper.waitUntilIdle('#selectheight input');

		cy.cGet('#selectheight input').clear({force:true})
			.type('2{enter}', {force:true});

		assertImageSize(139, 93);

		//Keep ratio checked
		cy.cGet('#ratio input').check();

		helper.waitUntilIdle('#selectheight input');

		cy.cGet('#selectheight input').clear({force:true})
			.type('5{enter}', {force:true});

		assertImageSize(347, 232);
	});
});
